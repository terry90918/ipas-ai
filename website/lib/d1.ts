import { utcTimestamp } from './timestamp.ts';
import { DatabaseError } from './database.ts';
import type { DatabaseState } from './domain.ts';

const latest = 'SELECT question_id,correct,row_number() OVER(PARTITION BY question_id ORDER BY created_at DESC,ordinal DESC) AS rank FROM ipas_attempts WHERE owner_id=?';
const messages: Record<string,string> = {SESSION_NOT_FOUND:'找不到這個練習回合，請重新整理。',QUESTION_NOT_IN_SESSION:'這題不屬於目前的回合。',ANSWER_CONFLICT:'此題已在另一個裝置提交，已同步最新練習進度。',SESSION_COMPLETED:'回合已完成，請重新整理。',CATALOG_NOT_READY:'題庫尚未完成設定。',INVALID_CHOICE:'請選擇有效答案。',NO_QUESTIONS:'目前篩選條件沒有可練習的題目。'};
function failure(code:string): never { throw new DatabaseError(code,messages[code] ?? '同步失敗，請稍後重試。',code==='ANSWER_CONFLICT'?409:['SESSION_NOT_FOUND','QUESTION_NOT_IN_SESSION'].includes(code)?404:['INVALID_CHOICE','NO_QUESTIONS'].includes(code)?400:503); }

export async function d1State(db:D1Database,owner:string):Promise<DatabaseState> {
 const results=await db.batch<Record<string,unknown>>([
  db.prepare('SELECT count(*) AS attempts,coalesce(sum(correct),0) AS correct FROM ipas_attempts WHERE owner_id=?').bind(owner),
  db.prepare(`SELECT count(*) AS practiced,coalesce(sum(correct=0),0) AS wrong FROM (${latest}) WHERE rank=1`).bind(owner),
  db.prepare('SELECT * FROM ipas_sessions WHERE owner_id=? AND mode<>? ORDER BY created_at DESC,id DESC LIMIT 1').bind(owner,'import'),
  db.prepare('SELECT question_id,choice,correct FROM ipas_attempts WHERE owner_id=? AND session_id=(SELECT id FROM ipas_sessions WHERE owner_id=? AND mode<>? ORDER BY created_at DESC,id DESC LIMIT 1) ORDER BY ordinal').bind(owner,owner,'import'),
  db.prepare('SELECT owner_id FROM ipas_imports WHERE owner_id=?').bind(owner),
 ]);
 const totals=results[0].results[0] as {attempts:number;correct:number};
 const unique=results[1].results[0] as {practiced:number;wrong:number};
 const session=results[2].results[0] as {id:string;mode:'practice'|'wrong';completed:number;question_ids:string}|undefined;
 return {stats:{...totals,...unique},legacyImported:results[4].results.length>0,active:session?{id:session.id,mode:session.mode,completed:Boolean(session.completed),question_ids:JSON.parse(session.question_ids),answers:results[3].results.map(row=>({question_id:String(row.question_id),choice:String(row.choice),correct:Boolean(row.correct)}))}:null};
}

async function start(db:D1Database,owner:string,mode:unknown,filters:unknown) {
 if(mode!=='practice'&&mode!=='wrong') failure('INVALID_CHOICE');
 const f=(filters??{}) as Record<string,unknown>;
 const id=crypto.randomUUID();
 const sql=`INSERT INTO ipas_sessions(id,owner_id,mode,question_ids) SELECT ?,?,?,json_group_array(id) FROM (SELECT q.id FROM ipas_questions q JOIN ipas_exams e ON e.id=q.exam_id LEFT JOIN (SELECT question_id,count(*) AS practiced FROM ipas_attempts WHERE owner_id=? GROUP BY question_id) h ON h.question_id=q.id LEFT JOIN (${latest}) l ON l.question_id=q.id AND l.rank=1 WHERE (? IS NULL OR json_extract(e.body,'$.level')=?) AND (? IS NULL OR json_extract(e.body,'$.subject')=?) AND (? IS NULL OR json_extract(e.body,'$.year')=?) AND (? IS NULL OR json_extract(e.body,'$.session')=?) AND (?='practice' OR l.correct=0) ORDER BY coalesce(h.practiced,0),random() LIMIT 5) HAVING count(*)>0 ON CONFLICT DO NOTHING RETURNING id`;
 const params=[id,owner,mode,owner,owner,...['level','subject','year','session'].flatMap(key=>[f[key]??null,f[key]??null]),mode];
 const created=await db.prepare(sql).bind(...params).first<{id:string}>();
 if(created) return created.id;
 const existing=await db.prepare('SELECT id FROM ipas_sessions WHERE owner_id=? AND completed=0').bind(owner).first<{id:string}>();
 if(existing) return existing.id;
 failure('NO_QUESTIONS');
}

async function answer(db:D1Database,owner:string,args:Record<string,unknown>) {
 if(!['A','B','C','D'].includes(String(args.p_choice))) failure('INVALID_CHOICE');
 await db.prepare("INSERT INTO ipas_attempts(session_id,question_id,owner_id,choice,correct,created_at) VALUES(?,?,?,?,coalesce((SELECT json_extract(body,'$.answer')=? FROM ipas_questions WHERE id=?),0),?)").bind(args.p_session,args.p_question,owner,args.p_choice,args.p_choice,args.p_question,utcTimestamp(new Date().toISOString())).run();
 return null;
}

type LegacyRecord={sourceKey:string;date:string;questions:{id:string;choice:string}[]};
async function importLegacy(db:D1Database,owner:string,raw:unknown) {
 if(!Array.isArray(raw)||raw.length>100) failure('INVALID_CHOICE');
 const records=raw as LegacyRecord[];
 const keys=new Set<string>();
 const entries=records.map(entry=>{
  if(!entry||typeof entry.sourceKey!=='string'||!entry.sourceKey||keys.has(entry.sourceKey)||!Number.isFinite(Date.parse(entry.date))||!Array.isArray(entry.questions)||entry.questions.length<1||entry.questions.length>50||new Set(entry.questions.map(q=>q.id)).size!==entry.questions.length) failure('INVALID_CHOICE');
  keys.add(entry.sourceKey);
  for(const q of entry.questions) if(typeof q.id!=='string'||!['A','B','C','D'].includes(q.choice)) failure('INVALID_CHOICE');
  return {...entry,id:crypto.randomUUID(),date:utcTimestamp(entry.date)};
 });
 const data=JSON.stringify(entries);
 await db.batch([
  db.prepare("INSERT INTO ipas_sessions(id,owner_id,mode,question_ids,completed,source_key,created_at) SELECT json_extract(e.value,'$.id'),?,'import',(SELECT json_group_array(json_extract(q.value,'$.id')) FROM json_each(e.value,'$.questions') q),1,json_extract(e.value,'$.sourceKey'),json_extract(e.value,'$.date') FROM json_each(?) e WHERE NOT EXISTS(SELECT 1 FROM ipas_imports WHERE owner_id=?) ON CONFLICT DO NOTHING").bind(owner,data,owner),
  db.prepare("INSERT INTO ipas_attempts(session_id,question_id,owner_id,choice,correct,created_at) SELECT s.id,json_extract(q.value,'$.id'),?,json_extract(q.value,'$.choice'),coalesce(json_extract(bank.body,'$.answer')=json_extract(q.value,'$.choice'),0),json_extract(e.value,'$.date') FROM json_each(?) e JOIN json_each(e.value,'$.questions') q JOIN ipas_sessions s ON s.owner_id=? AND s.source_key=json_extract(e.value,'$.sourceKey') LEFT JOIN ipas_questions bank ON bank.id=json_extract(q.value,'$.id') WHERE NOT EXISTS(SELECT 1 FROM ipas_imports WHERE owner_id=?)").bind(owner,data,owner,owner),
  db.prepare('INSERT INTO ipas_imports(owner_id,imported_at) VALUES(?,?) ON CONFLICT DO NOTHING').bind(owner,utcTimestamp(new Date().toISOString())),
 ]);
 return null;
}

export async function d1Call(db:D1Database,name:string,args:Record<string,unknown>):Promise<unknown> {
 const owner=args.p_owner;
 if(typeof owner!=='string'||!owner.trim()) failure('INVALID_CHOICE');
 try {
  if(name==='ipas_state') return await d1State(db,owner);
  if(name==='ipas_start') return await start(db,owner,args.p_mode,args.p_filters);
  if(name==='ipas_answer') return await answer(db,owner,args);
  if(name==='ipas_import') return await importLegacy(db,owner,args.p_records);
  failure('INVALID_CHOICE');
 } catch(error) {
  if(error instanceof DatabaseError) throw error;
  const message=error instanceof Error?error.message:'';
  const code=Object.keys(messages).find(key=>message.includes(key));
  failure(code??'DATABASE');
 }
}
