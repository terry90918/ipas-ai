import http from 'node:http';
const server=http.createServer((request,response)=>{
 const isRest=request.url?.startsWith('/rest/v1/');
 const headers={...request.headers};
 for(const name of Object.keys(headers)) if(name.startsWith('oai-authenticated-user-')) delete headers[name];
 if(!isRest) {
  if(request.method==='POST' && headers.origin!=='http://127.0.0.1:3303') {response.writeHead(403);response.end();return;}
  headers['oai-authenticated-user-id']='local-qa';
  headers['oai-authenticated-user-email']='local-qa@sites.test';
 }
 const target=http.request({hostname:'127.0.0.1',port:isRest?55474:3302,path:isRest?request.url.slice('/rest/v1'.length):request.url,method:request.method,headers},upstream=>{
  response.writeHead(upstream.statusCode ?? 502,upstream.headers);
  upstream.pipe(response);
 });
 target.on('error',()=>{response.writeHead(502);response.end('Local preview backend unavailable');});
 request.pipe(target);
});
server.listen(3303,'127.0.0.1',()=>console.log('Local QA identity, local Postgres only: http://127.0.0.1:3303'));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
