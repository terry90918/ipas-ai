import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/d1.ts';


test('D1 isolates owners and only returns acknowledged answers',async t=>{
 const {call}=await setup(t);
 const id=await call('ipas_start',{p_owner:'alice',p_mode:'practice',p_filters:{}}) as string;
 const before=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 assert.equal(before.active!.id,id); assert.equal(before.active!.question_ids.length,5); assert.equal(before.stats.attempts,0);
 const q=before.active!.question_ids[0];
 await assert.rejects(()=>call('ipas_answer',{p_owner:'bob',p_session:id,p_question:q,p_choice:'A'}),{code:'SESSION_NOT_FOUND'});
 await call('ipas_answer',{p_owner:'alice',p_session:id,p_question:q,p_choice:'A'});
 const after=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 assert.equal(after.stats.attempts,1); assert.equal(after.stats.correct,1); assert.equal(after.active!.answers[0].choice,'A');
 assert.equal((await call('ipas_state',{p_owner:'bob'}) as import('../lib/domain.ts').DatabaseState).active,null);
});

test('D1 concurrent starts and duplicate saves produce one round and one attempt',async t=>{
 const {call}=await setup(t);
 const args={p_owner:'alice',p_mode:'practice',p_filters:{}};
 const rounds=await Promise.all(Array.from({length:4},()=>call('ipas_start',args)));
 assert.equal(new Set(rounds).size,1);
 const state=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 const answer={p_owner:'alice',p_session:rounds[0],p_question:state.active!.question_ids[0],p_choice:'B'};
 await Promise.all(Array.from({length:4},()=>call('ipas_answer',answer)));
 assert.equal((await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState).stats.attempts,1);
 await assert.rejects(()=>call('ipas_answer',{...answer,p_choice:'A'}),{code:'ANSWER_CONFLICT',status:409});
});

test('D1 completes the final answer atomically and filters wrong-answer review',async t=>{
 const {call}=await setup(t);
 await call('ipas_start',{p_owner:'alice',p_mode:'practice',p_filters:{}});
 const state=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 for(const q of state.active!.question_ids) await call('ipas_answer',{p_owner:'alice',p_session:state.active!.id,p_question:q,p_choice:'B'});
 const completed=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 assert.equal(completed.active!.completed,true);assert.equal(completed.stats.wrong,5);
 await assert.rejects(()=>call('ipas_start',{p_owner:'alice',p_mode:'wrong',p_filters:{subject:'missing'}}),{code:'NO_QUESTIONS'});
 await call('ipas_start',{p_owner:'alice',p_mode:'wrong',p_filters:{subject:'AI'}});
 const review=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 assert.equal(review.active!.mode,'wrong');assert.equal(review.active!.question_ids.length,5);
 for(const q of review.active!.question_ids) await call('ipas_answer',{p_owner:'alice',p_session:review.active!.id,p_question:q,p_choice:'A'});
 assert.equal((await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState).stats.wrong,0);
});

test('D1 import is idempotent and an invalid batch leaves no partial history',async t=>{
 const {call,db}=await setup(t);
 const records=[{sourceKey:'old',date:'2025-01-01T00:00:00.000Z',questions:[{id:'q1',choice:'A'},{id:'q2',choice:'B'}]}];
 await Promise.all([call('ipas_import',{p_owner:'alice',p_records:records}),call('ipas_import',{p_owner:'alice',p_records:records})]);
 const state=await call('ipas_state',{p_owner:'alice'}) as import('../lib/domain.ts').DatabaseState;
 assert.equal(state.stats.attempts,2);assert.equal(state.legacyImported,true);assert.equal(state.active,null);
 await assert.rejects(()=>call('ipas_import',{p_owner:'bob',p_records:[...records,{sourceKey:'invalid',date:'2025-01-01T00:00:00.000Z',questions:[{id:'missing',choice:'A'}]}]}),{code:'CATALOG_NOT_READY'});
 assert.equal((await call('ipas_state',{p_owner:'bob'}) as import('../lib/domain.ts').DatabaseState).legacyImported,false);
 const id=await call('ipas_start',{p_owner:'bob',p_mode:'practice',p_filters:{}}) as string;
 const s=await call('ipas_state',{p_owner:'bob'}) as import('../lib/domain.ts').DatabaseState;
 const insert='insert into ipas_attempts(session_id,question_id,owner_id,choice,correct,created_at) values(?,?,?,?,?,?)';
 await assert.rejects(()=>db.batch([
  db.prepare(insert).bind(id,s.active!.question_ids[0],'bob','A',1,'2026-01-01T00:00:00.000Z'),
  db.prepare(insert).bind(id,s.active!.question_ids[1],'alice','A',1,'2026-01-01T00:00:00.000Z'),
 ]));
 assert.equal((await call('ipas_state',{p_owner:'bob'}) as import('../lib/domain.ts').DatabaseState).stats.attempts,0);
});
