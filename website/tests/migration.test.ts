import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/d1.ts';

async function migration() {
 const api=await import('../lib/migration.ts').catch(()=>null);
 assert.ok(api,'migration implementation must exist');return api;
}

test('snapshot comparison ignores representation but detects lost choices and ordinals',async t=>{
 const {db}=await setup(t);const api=await migration();
 const a=await api.d1Snapshot(db as unknown as D1Database);
 const b=structuredClone(a);b.ipas_exams[0].body=JSON.parse(b.ipas_exams[0].body as string);
 assert.equal(await api.snapshotHash(a),await api.snapshotHash(b));
 b.ipas_questions.pop();assert.notEqual(await api.snapshotHash(a),await api.snapshotHash(b));
});

test('copy retries preserve IDs, timestamps, ordinals and completed history',async t=>{
 const {db,call}=await setup(t);const api=await migration();
 const id=await call('ipas_start',{p_owner:'alice',p_mode:'practice',p_filters:{}});
 const state=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 await call('ipas_answer',{p_owner:'alice',p_session:id,p_question:state.active!.question_ids[0],p_choice:'B'});
 const snapshot=await api.d1Snapshot(db as unknown as D1Database);
 await db.prepare("update ipas_storage_control set paused=1,phase='copying'").run();
 await api.replaceD1Snapshot(db as unknown as D1Database,snapshot);await api.replaceD1Snapshot(db as unknown as D1Database,snapshot);
 assert.equal(await api.snapshotHash(await api.d1Snapshot(db as unknown as D1Database)),await api.snapshotHash(snapshot));
 assert.deepEqual(await call('ipas_state',{p_owner:'alice'}),state.active ? {...state,stats:{attempts:1,correct:0,practiced:1,wrong:1},active:{...state.active,answers:[{question_id:state.active.question_ids[0],choice:'B',correct:false}]}} : null);
});

test('migration freeze blocks new leases and waits for in-flight writes',async t=>{
 const {db}=await setup(t);const api=await migration();
 const lease=await api.acquireLease(db as unknown as D1Database);
 assert.equal(lease.backend,'supabase');
 await api.freeze(db as unknown as D1Database);
 await assert.rejects(()=>api.acquireLease(db as unknown as D1Database),{code:'MIGRATING'});
 await assert.rejects(()=>api.requireQuiet(db as unknown as D1Database),{code:'BUSY'});
 await api.releaseLease(db as unknown as D1Database,lease.id);
 await api.requireQuiet(db as unknown as D1Database);
});

test('snapshot replacement is refused unless frozen on the Supabase backend',async t=>{
 const {db}=await setup(t);const api=await migration();
 const original=await api.d1Snapshot(db as unknown as D1Database);
 await assert.rejects(()=>api.replaceD1Snapshot(db as unknown as D1Database,original),{code:'MIGRATION_STATE'});
 assert.equal(await api.snapshotHash(await api.d1Snapshot(db as unknown as D1Database)),await api.snapshotHash(original));
});

test('rollback payload includes D1 additions and preserves ordered identity fields',async t=>{
 const {db,call}=await setup(t);const api=await migration();
 const id=await call('ipas_start',{p_owner:'alice',p_mode:'practice',p_filters:{}});
 const state=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 await call('ipas_answer',{p_owner:'alice',p_session:id,p_question:state.active!.question_ids[0],p_choice:'A'});
 const snapshot=await api.d1Snapshot(db as unknown as D1Database);const payload=api.supabaseSnapshot(snapshot);
 assert.equal(payload.ipas_attempts.length,1);assert.equal(payload.ipas_attempts[0].correct,true);
 assert.equal(payload.ipas_sessions[0].id,id);assert.equal(payload.ipas_attempts[0].ordinal,1);
 assert.ok(Array.isArray(payload.ipas_sessions[0].question_ids));
});

test('PostgreSQL microseconds survive snapshot encoding and chronological ordering',async()=>{
 const api=await migration();
 const snapshot={ipas_exams:[],ipas_questions:[],ipas_sessions:[],ipas_attempts:[{ordinal:1,session_id:'s',question_id:'q',owner_id:'a',choice:'A',correct:true,created_at:'2026-10-13T12:00:00.123456+08:00'}],ipas_imports:[]} as import('../lib/migration.ts').Snapshot;
 assert.equal(api.supabaseSnapshot(snapshot).ipas_attempts[0].created_at,'2026-10-13T04:00:00.123456Z');
});

test('live D1 resumes after acknowledged post-cutover writes',async t=>{
 const {db,call}=await setup(t);const api=await migration();
 const original=await api.snapshotHash(await api.d1Snapshot(db as unknown as D1Database));
 await db.prepare("update ipas_storage_control set backend='d1',phase='live',verified_hash=?").bind(original).run();
 await call('ipas_start',{p_owner:'alice',p_mode:'practice',p_filters:{}});
 await api.runMigration(db as unknown as D1Database,'freeze');
 await api.runMigration(db as unknown as D1Database,'resume');
 assert.equal((await api.control(db as unknown as D1Database)).paused,0);
});

test('concurrent maintenance cannot resume while rollback captures and restores data',async t=>{
 const {db,call}=await setup(t);const api=await migration();
 const snapshot=api.supabaseSnapshot(await api.d1Snapshot(db as unknown as D1Database));
 const hash=await api.snapshotHash(snapshot);
 await db.prepare("update ipas_storage_control set backend='d1',phase='live',paused=1,verified_hash=?").bind(hash).run();
 await call('ipas_start',{p_owner:'alice',p_mode:'practice',p_filters:{}});
 const target=api.supabaseSnapshot(await api.d1Snapshot(db as unknown as D1Database));
 const restoredState=await call('ipas_state',{p_owner:'alice'});
 let restored=false;
 let release!:()=>void;let entered!:()=>void;
 const barrier=new Promise<void>(resolve=>{entered=resolve;});const held=new Promise<void>(resolve=>{release=resolve;});
 process.env.SUPABASE_URL='https://database.example';process.env.SUPABASE_SECRET_KEY='synthetic';
 t.mock.method(globalThis,'fetch',async(url:string)=>{
  if(url.endsWith('/rpc/ipas_restore_snapshot')) {entered();await held;restored=true;return new Response(null,{status:204});}
  const table=api.tables.find(name=>url.includes(`/rest/v1/${name}?`));
  return Response.json(table?(restored?target:snapshot)[table]:restoredState);
 });
 const work=api.runMigration(db as unknown as D1Database,'rollback');
 await barrier;
 try {await assert.rejects(()=>api.runMigration(db as unknown as D1Database,'resume'),{code:'BUSY'});} finally {release();await work;}
 await work;
 assert.equal((await api.control(db as unknown as D1Database)).backend,'supabase');
});
