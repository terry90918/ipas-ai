import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDatabase } from './helpers/d1.ts';

test('all migrations execute through the native D1 exec interface',async t=>{
 const db=await createDatabase(t);
 const journal=JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
 for(const entry of journal.entries) {
  const sql=readFileSync(new URL(`../drizzle/${entry.tag}.sql`,import.meta.url),'utf8');
  for(const statement of sql.split(';').map(value=>value.trim()).filter(Boolean)) await assert.doesNotReject(()=>db.exec(statement),`Native migration failed: ${entry.tag}`);
 }
 const control=await db.prepare('SELECT backend FROM ipas_storage_control WHERE id=1').first();
 assert.equal(control?.backend,'supabase');
});
