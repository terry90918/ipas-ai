import http from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>JSON.parse(readFileSync(`${root}content/${name}.json`,'utf8'));
const mf=new Miniflare(convertV4MiniflareOptions({name:'ipas-d1-local',modules:true,scriptPath:`${root}dist/server/index.js`,compatibilityDate:'2026-10-12',compatibilityFlags:['nodejs_compat','global_fetch_strictly_public'],d1Databases:['DB'],assets:{directory:`${root}dist/client`,binding:'ASSETS'},bindings:{PRIVATE_OWNER_EMAIL:'local-d1-qa@sites.test',PRIVATE_OWNER_ID:'local-d1-qa',IPAS_MIGRATION_ENABLED:'false'}}));
const db=await mf.getD1Database('DB');
const journal=JSON.parse(readFileSync(`${root}drizzle/meta/_journal.json`,'utf8'));
for(const entry of journal.entries) await db.prepare(readFileSync(`${root}drizzle/${entry.tag}.sql`,'utf8')).run();
const exams=read('exams'),questions=read('questions'),explanations=read('explanations'),supplements=read('supplements');
for(const exam of exams) await db.prepare('insert into ipas_exams(id,body) values(?,?)').bind(exam.id,JSON.stringify(exam)).run();
for(let offset=0;offset<questions.length;offset+=50) await db.batch(questions.slice(offset,offset+50).map(q=>db.prepare('insert into ipas_questions(id,exam_id,number,body) values(?,?,?,?)').bind(q.id,q.examId,q.number,JSON.stringify({...q,explanation:explanations[q.id],explanationImages:supplements[q.id]??[]}))));
await db.prepare("update ipas_storage_control set backend='d1',phase='live'").run();
const worker=await mf.getWorker('ipas-d1-local');
const virtualOrigin=new URL(await mf.ready);virtualOrigin.protocol='https:';
const server=http.createServer(async(request,response)=>{
 try {
  if(request.method==='POST'&&request.headers.origin!=='http://127.0.0.1:3403') {response.writeHead(403);response.end();return;}
  const chunks=[];for await(const chunk of request) chunks.push(chunk);
  const headers={...request.headers,'origin':request.method==='POST'?virtualOrigin.origin:request.headers.origin,'x-forwarded-proto':'https','oai-authenticated-user-id':'local-d1-qa','oai-authenticated-user-email':'local-d1-qa@sites.test'};
  if(!request.headers.origin) delete headers.origin;
  const body=chunks.length?Buffer.concat(chunks):undefined;
  const pathname=new URL(request.url,'http://127.0.0.1:3403').pathname;
  if(pathname.startsWith('/_next/')||pathname.startsWith('/assets/')||pathname==='/favicon.svg') {
   const directory=resolve(root,'dist/client');const path=resolve(directory,`.${pathname}`);
   if(!path.startsWith(`${directory}/`)) throw new Error('Invalid asset');
   const data=await readFile(path);const type={'.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'}[extname(path)]??'application/octet-stream';
   response.writeHead(200,{'Content-Type':type});response.end(data);return;
  }
  const result=await worker.fetch(`https://127.0.0.1:3403${request.url}`,{method:request.method,headers,body});
  response.writeHead(result.status,Object.fromEntries(result.headers));response.end(Buffer.from(await result.arrayBuffer()));
 } catch {response.writeHead(503);response.end('Local D1 preview failed');}
});
server.listen(3403,'127.0.0.1',()=>console.log('Isolated Worker + D1 preview: http://127.0.0.1:3403'));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(async()=>{await mf.dispose();process.exit(0);}));
