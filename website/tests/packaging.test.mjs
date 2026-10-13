import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function fixture(t) {
 const root=mkdtempSync(join(tmpdir(),'ipas-package-test-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 for(const path of ['.openai','.open-next/assets','node_modules/wrangler/bin','drizzle/meta']) mkdirSync(join(root,path),{recursive:true});
 writeFileSync(join(root,'.openai/hosting.json'),JSON.stringify({project_id:'test',d1:'DB'}));
 writeFileSync(join(root,'node_modules/wrangler/bin/wrangler.js'),"const fs=require('node:fs');fs.writeFileSync('dist/server/worker.js','export default {};');");
 return root;
}
const packager=fileURLToPath(new URL('../scripts/package-next.mjs',import.meta.url));
test('the deployment output contains the exact D1 migration journal and SQL',t=>{
 const root=fixture(t);
 const journal=JSON.stringify({entries:[{tag:'0000_test'}]});
 writeFileSync(join(root,'drizzle/meta/_journal.json'),journal);writeFileSync(join(root,'drizzle/0000_test.sql'),'CREATE TABLE test(id TEXT);');
 const result=spawnSync(process.execPath,[packager],{cwd:root,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 assert.equal(readFileSync(join(root,'dist/.openai/drizzle/meta/_journal.json'),'utf8'),journal);
 assert.equal(readFileSync(join(root,'dist/.openai/drizzle/0000_test.sql'),'utf8'),'CREATE TABLE test(id TEXT);');
 assert.equal(existsSync(join(root,'dist/server/index.js')),true);
});
test('D1-enabled artifacts cannot be packaged without a migration journal',t=>{
 const root=fixture(t);const result=spawnSync(process.execPath,[packager],{cwd:root,encoding:'utf8'});
 assert.notEqual(result.status,0);
});
