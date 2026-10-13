import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
export async function createDatabase(t: import('node:test').TestContext) {
 const mf = new Miniflare(convertV4MiniflareOptions({name:'test',modules:true,script:'export default {fetch(){return new Response("test")}}',d1Databases:['DB'],compatibilityDate:'2026-10-12'}));
 t.after(() => mf.dispose());
 const db = await mf.getD1Database('DB');
 return db;
}

export async function setup(t: import('node:test').TestContext) {
 const adapter = await import('../../lib/d1.ts').catch(() => null);
 assert.ok(adapter, 'D1 adapter must exist');
 const db=await createDatabase(t);
 const journal = JSON.parse(readFileSync(new URL('../../drizzle/meta/_journal.json',import.meta.url),'utf8'));
 for(const entry of journal.entries) await db.prepare(readFileSync(new URL(`../../drizzle/${entry.tag}.sql`,import.meta.url),'utf8')).run();
 await db.prepare('insert into ipas_exams(id,body) values(?,?)').bind('exam',JSON.stringify({id:'exam',level:'初級',year:115,session:1,subject:'AI',questionCount:6})).run();
 for(let n=1;n<=6;n++) await db.prepare('insert into ipas_questions(id,exam_id,number,body) values(?,?,?,?)').bind(`q${n}`,'exam',n,JSON.stringify({id:`q${n}`,answer:'A'})).run();
 return {db,call:(name:string,args:Record<string,unknown>)=>adapter.d1Call(db as unknown as D1Database,name,args)};
}
