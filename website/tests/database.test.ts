import test from 'node:test';
import assert from 'node:assert/strict';
import {rpc,DatabaseError} from '../lib/database.ts';
function configured() { process.env.SUPABASE_URL='https://database.example';process.env.SUPABASE_SECRET_KEY='synthetic-test-key'; }
test('successful void RPC is accepted as a saved answer',async t=>{
 configured();t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:204}));
 assert.equal(await rpc('ipas_answer',{}),null);
});
test('unknown database messages are not exposed to callers',async t=>{
 configured();t.mock.method(globalThis,'fetch',async()=>Response.json({message:'private database diagnostic'}, {status:500}));
 await assert.rejects(()=>rpc('ipas_state',{}),error=>error instanceof DatabaseError && error.code==='DATABASE' && !error.message.includes('private'));
});
test('JSON state remains intact and missing configuration is explicit',async t=>{
 configured();t.mock.method(globalThis,'fetch',async()=>Response.json({stats:{attempts:1}}));
 assert.deepEqual(await rpc('ipas_state',{}),{stats:{attempts:1}});
 delete process.env.SUPABASE_SECRET_KEY;
 await assert.rejects(()=>rpc('ipas_state',{}),error=>error instanceof DatabaseError && error.status===503 && error.code==='CONFIG');
});
test('modern Supabase secret keys use apikey without pretending to be JWTs',async t=>{
 configured();process.env.SUPABASE_SECRET_KEY='sb_secret_synthetic_test';let sent: Headers | null=null;
 t.mock.method(globalThis,'fetch',async (_url: string,init:RequestInit)=>{sent=new Headers(init.headers);return Response.json({ok:true});});
 await rpc('ipas_state',{});
 assert.equal(sent!.get('apikey'),'sb_secret_synthetic_test');
 assert.equal(sent!.get('authorization'),null);
});
