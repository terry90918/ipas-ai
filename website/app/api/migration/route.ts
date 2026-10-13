import { getChatGPTUser } from '../../chatgpt-auth';
import { sameOrigin } from '../../../lib/domain';
import { exams, questions } from '../../../lib/catalog';
import { maintenanceAllowed } from '../../../lib/maintenance-auth';
import { DatabaseError } from '../../../lib/database';
import { getDatabase } from '../../../lib/storage';
import { runMigration } from '../../../lib/migration';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
export async function POST(request:Request) {
 const user=await getChatGPTUser();
 if(!maintenanceAllowed({enabled:process.env.IPAS_MIGRATION_ENABLED==='true',key:process.env.IPAS_MIGRATION_KEY??'',owner:process.env.PRIVATE_OWNER_ID??''},user?.userId??null,request.headers.get('x-ipas-migration-key'))) return Response.json({error:'無權執行資料維護。'},{status:403,headers});
 if((user&&!sameOrigin(request))||!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({error:'無效的維護請求。'},{status:403,headers});
 const body=await request.text();
 if(body.length>1024) return Response.json({error:'請求內容過大。'},{status:413,headers});
 let action;
 try {const input=JSON.parse(body);if(Object.keys(input).length!==1||!['status','freeze','copy','verify','activate','resume','abort','rollback'].includes(input.action)) throw new Error();action=input.action as string;} catch {return Response.json({error:'無效的維護操作。'},{status:400,headers});}
 try {return Response.json(await runMigration(getDatabase(),action,{exams,questions}),{headers});}
 catch(error) {return Response.json({error:error instanceof DatabaseError?error.message:'資料維護未完成。',code:error instanceof DatabaseError?error.code:'MIGRATION_FAILED'},{status:error instanceof DatabaseError?error.status:503,headers});}
}
