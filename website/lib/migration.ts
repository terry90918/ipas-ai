import { utcTimestamp } from './timestamp.ts';
import { DatabaseError, rpc } from './database.ts';
import { d1State } from './d1.ts';
import type { Exam, Question } from './types.ts';

export const tables=['ipas_exams','ipas_questions','ipas_sessions','ipas_attempts','ipas_imports'] as const;
export type Table=typeof tables[number];
export type Row=Record<string,unknown>;
export type Snapshot=Record<Table,Row[]>;
export type Control={backend:'supabase'|'d1';paused:number;phase:string;frozen_at:string|null;verified_hash:string|null;verified_at:string|null};
const columns:Record<Table,string[]>={ipas_exams:['id','body'],ipas_questions:['id','exam_id','number','body'],ipas_sessions:['id','owner_id','mode','question_ids','completed','source_key','created_at'],ipas_attempts:['ordinal','session_id','question_id','owner_id','choice','correct','created_at'],ipas_imports:['owner_id','imported_at']};
const order:Record<Table,string>={ipas_exams:'id',ipas_questions:'id',ipas_sessions:'id',ipas_attempts:'ordinal',ipas_imports:'owner_id'};
export function migrationError(code:string):never {throw new DatabaseError(code,code==='MIGRATING'?'資料搬移中，請稍後重試。':'資料搬移尚未通過安全核對。',503);}
export async function control(db:D1Database):Promise<Control> {
 const row=await db.prepare('SELECT backend,paused,phase,frozen_at,verified_hash,verified_at FROM ipas_storage_control WHERE id=1').first<Control>();
 if(!row) migrationError('MIGRATION_STATE');return row;
}
export async function acquireLease(db:D1Database) {
 const id=crypto.randomUUID();
 const row=await db.prepare('INSERT INTO ipas_write_leases(id,backend,expires_at) SELECT ?,backend,? FROM ipas_storage_control WHERE id=1 AND paused=0 RETURNING backend').bind(id,Date.now()+300_000).first<{backend:'supabase'|'d1'}>();
 if(!row) migrationError('MIGRATING');return {id,backend:row.backend};
}
export async function releaseLease(db:D1Database,id:string) {await db.prepare('DELETE FROM ipas_write_leases WHERE id=?').bind(id).run();}
export async function requireQuiet(db:D1Database) {
 const current=await control(db);
 if(!current.paused) migrationError('MIGRATION_STATE');
 const count=await db.prepare('SELECT count(*) AS count FROM ipas_write_leases WHERE expires_at>?').bind(Date.now()).first<{count:number}>();
 if(count?.count) migrationError('BUSY');
}
export async function freeze(db:D1Database) {
 await db.prepare("UPDATE ipas_storage_control SET paused=1,frozen_at=coalesce(frozen_at,?),verified_at=NULL,verified_hash=CASE WHEN backend='supabase' THEN NULL ELSE verified_hash END WHERE id=1").bind(new Date().toISOString()).run();
 return control(db);
}
function normalized(value:unknown):unknown {
 if(Array.isArray(value)) return value.map(normalized);
 if(value&&typeof value==='object') return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,normalized(v)]));
 return value;
}
export function supabaseSnapshot(snapshot:Snapshot):Snapshot {
 return Object.fromEntries(tables.map(table=>[table,snapshot[table].map(raw=>Object.fromEntries(columns[table].map(key=>{
  let value=raw[key];
  if(value===undefined) migrationError('INVALID_SNAPSHOT');
  if(key==='body'||key==='question_ids') value=typeof value==='string'?JSON.parse(value):value;
  if(key==='completed'||key==='correct') {if(![true,false,0,1].includes(value as boolean)) migrationError('INVALID_SNAPSHOT');value=Boolean(value);}
  if(key==='created_at'||key==='imported_at') {if(typeof value!=='string'||!Number.isFinite(Date.parse(value))) migrationError('INVALID_SNAPSHOT');value=utcTimestamp(value);}
  if(key==='ordinal'&&(!Number.isSafeInteger(value)||Number(value)<1)) migrationError('INVALID_SNAPSHOT');
  return [key,normalized(value)];
 }))).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))])) as Snapshot;
}
export async function snapshotHash(snapshot:Snapshot) {
 const data=new TextEncoder().encode(JSON.stringify(normalized(supabaseSnapshot(snapshot))));
 const digest=await crypto.subtle.digest('SHA-256',data);
 return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}
export async function d1Snapshot(db:D1Database):Promise<Snapshot> {
 const results=await db.batch<Row>(tables.map(table=>db.prepare(`SELECT ${columns[table].join(',')} FROM ${table} ORDER BY ${order[table]}`)));
 return Object.fromEntries(tables.map((table,index)=>[table,results[index].results])) as Snapshot;
}
function supabaseHeaders() {
 const key=process.env.SUPABASE_SECRET_KEY;
 if(!key||!process.env.SUPABASE_URL) migrationError('CONFIG');
 return {apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${key}`})};
}
export async function supabaseTableSnapshot():Promise<Snapshot> {
 const snapshot={} as Snapshot;
 for(const table of tables) {
  snapshot[table]=[];
  for(let offset=0;;offset+=200) {
   const response=await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?select=*&order=${order[table]}.asc&offset=${offset}&limit=200`,{headers:supabaseHeaders(),cache:'no-store',signal:AbortSignal.timeout(15000)});
   if(!response.ok) migrationError('SOURCE_READ');
   const rows=await response.json() as Row[];
   if(!Array.isArray(rows)||rows.length>200) migrationError('SOURCE_READ');
   snapshot[table].push(...rows);if(rows.length<200) break;
  }
 }
 return snapshot;
}
function encoded(table:Table,row:Row) {
 return columns[table].map(key=>key==='body'||key==='question_ids'?JSON.stringify(row[key]):key==='correct'||key==='completed'?Number(row[key]):row[key]);
}
export async function replaceD1Snapshot(db:D1Database,snapshot:Snapshot) {
 await requireQuiet(db);
 const current=await control(db);
 if(current.backend!=='supabase'||!['copying','prepared','verified'].includes(current.phase)) migrationError('MIGRATION_STATE');
 const clean=supabaseSnapshot(snapshot);
 await db.prepare("UPDATE ipas_storage_control SET phase='copying',verified_hash=NULL,verified_at=NULL WHERE id=1").run();
 await db.batch(['ipas_attempts','ipas_imports','ipas_sessions','ipas_questions','ipas_exams'].map(table=>db.prepare(`DELETE FROM ${table}`)));
 for(const table of tables) for(let offset=0;offset<clean[table].length;offset+=50) {
  const names=columns[table];const sql=`INSERT INTO ${table}(${names.join(',')}) VALUES(${names.map(()=>'?').join(',')})`;
  await db.batch(clean[table].slice(offset,offset+50).map(row=>db.prepare(sql).bind(...encoded(table,row))));
 }
 if(await snapshotHash(clean)!==await snapshotHash(await d1Snapshot(db))) migrationError('SNAPSHOT_MISMATCH');
}
async function compareStates(db:D1Database,source:Snapshot) {
 const owners=new Set([...source.ipas_sessions,...source.ipas_attempts,...source.ipas_imports].map(row=>String(row.owner_id)));
 for(const owner of owners) {
  const before=await rpc('ipas_state',{p_owner:owner});const after=await d1State(db,owner);
  const standard=(raw:unknown)=>{
   const state=structuredClone(raw) as {active:{answers:Row[]}|null};
   if(state.active) state.active.answers.sort((a,b)=>String(a.question_id).localeCompare(String(b.question_id)));
   return JSON.stringify(normalized(state));
  };
  if(standard(before)!==standard(after)) migrationError('STATE_MISMATCH');
 }
}
export async function verifyMigration(db:D1Database) {
 await requireQuiet(db);const current=await control(db);
 if(current.backend!=='supabase'||!['copying','verified'].includes(current.phase)) migrationError('MIGRATION_STATE');
 const source=await supabaseTableSnapshot();const hash=await snapshotHash(source);
 if(hash!==await snapshotHash(await d1Snapshot(db))) migrationError('SNAPSHOT_MISMATCH');
 await compareStates(db,source);
 if(hash!==await snapshotHash(await supabaseTableSnapshot())) migrationError('SOURCE_CHANGED');
 await db.prepare("UPDATE ipas_storage_control SET phase='verified',verified_hash=?,verified_at=? WHERE id=1").bind(hash,new Date().toISOString()).run();
 return migrationStatus(db);
}
export async function migrationStatus(db:D1Database) {
 const state=await control(db);const snapshot=await d1Snapshot(db);
 const leases=await db.prepare('SELECT count(*) AS count FROM ipas_write_leases WHERE expires_at>?').bind(Date.now()).first<{count:number}>();
 return {...state,counts:Object.fromEntries(tables.map(table=>[table,snapshot[table].length])),hash:await snapshotHash(snapshot),inFlight:leases?.count??0};
}
async function performMigration(db:D1Database,action:string,catalog?:{exams:Exam[];questions:Question[]}) {
 if(action==='status') return migrationStatus(db);
 if(action==='freeze') {await freeze(db);return migrationStatus(db);}
 await requireQuiet(db);const current=await control(db);
 if(action==='copy') {
  const source=await supabaseTableSnapshot();
  if(!catalog||source.ipas_exams.length!==catalog.exams.length||source.ipas_questions.length!==catalog.questions.length) migrationError('CATALOG_MISMATCH');
  for(const [rows,items] of [[source.ipas_exams,catalog.exams],[source.ipas_questions,catalog.questions]] as const) {
   const expected=new Map(items.map(item=>[item.id,JSON.stringify(normalized(item))]));
   for(const row of rows) if(expected.get(String(row.id))!==JSON.stringify(normalized(typeof row.body==='string'?JSON.parse(row.body):row.body))) migrationError('CATALOG_MISMATCH');
  }
  await replaceD1Snapshot(db,source);return migrationStatus(db);
 }
 if(action==='verify') return verifyMigration(db);
 if(action==='activate') {
  if(current.backend!=='supabase'||current.phase!=='verified'||!current.frozen_at||Date.now()-Date.parse(current.frozen_at)<30_000) migrationError('MIGRATION_STATE');
  await verifyMigration(db);
  await db.prepare("UPDATE ipas_storage_control SET backend='d1',phase='live' WHERE id=1 AND paused=1").run();
 } else if(action==='resume') {
  if(current.backend==='d1'&&current.phase!=='live') migrationError('MIGRATION_STATE');
  if(current.backend==='supabase'&&!['prepared','restored'].includes(current.phase)) migrationError('MIGRATION_STATE');
  await db.prepare('UPDATE ipas_storage_control SET paused=0,frozen_at=NULL WHERE id=1').run();
 } else if(action==='abort') {
  if(current.backend!=='supabase') migrationError('MIGRATION_STATE');
  await db.prepare("UPDATE ipas_storage_control SET phase='prepared',verified_hash=NULL,verified_at=NULL WHERE id=1").run();
 } else if(action==='rollback') {
  if(current.backend!=='d1'||!current.verified_hash) migrationError('MIGRATION_STATE');
  const before=await supabaseTableSnapshot();
  const target=await d1Snapshot(db);
  const sourceHash=await snapshotHash(before);const targetHash=await snapshotHash(target);
  if(sourceHash!==current.verified_hash&&sourceHash!==targetHash) migrationError('SOURCE_CHANGED');
  if(sourceHash!==targetHash) await rpc('ipas_restore_snapshot',{p_snapshot:supabaseSnapshot(target),p_before:before});
  const restored=await supabaseTableSnapshot();
  if(await snapshotHash(restored)!==await snapshotHash(target)) migrationError('SNAPSHOT_MISMATCH');
  await compareStates(db,restored);
  await db.prepare("UPDATE ipas_storage_control SET backend='supabase',phase='restored' WHERE id=1").run();
 } else migrationError('INVALID_ACTION');
 return migrationStatus(db);
}

export async function runMigration(db:D1Database,action:string,catalog?:{exams:Exam[];questions:Question[]}) {
 if(action==='status') return migrationStatus(db);
 const token=crypto.randomUUID();
 const locked=await db.prepare('INSERT INTO ipas_maintenance_lock(id,token,created_at) VALUES(1,?,?) ON CONFLICT DO NOTHING RETURNING token').bind(token,new Date().toISOString()).first();
 if(!locked) migrationError('BUSY');
 try {return await performMigration(db,action,catalog);}
 finally {await db.prepare('DELETE FROM ipas_maintenance_lock WHERE id=1 AND token=?').bind(token).run();}
}
