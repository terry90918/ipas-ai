import { getChatGPTUser } from '../../chatgpt-auth';
import { exams, questions } from '../../../lib/catalog';
import { buildState, parseAction, sameOrigin } from '../../../lib/domain';
import type { DatabaseState } from '../../../lib/domain';
import { DatabaseError } from '../../../lib/database';
import { practiceRpc as rpc } from '../../../lib/storage';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const responseHeaders={'Cache-Control':'private, no-store','Content-Type':'application/json'};
async function state(userId: string, displayName: string) { return buildState(displayName,exams,questions,await rpc<DatabaseState>('ipas_state',{p_owner:userId})); }
function failure(error: unknown): Response {
 if(error instanceof DatabaseError) return Response.json({error:error.message,code:error.code},{status:error.status,headers:responseHeaders});
 return Response.json({error:'練習服務暫時無法使用，請稍後重試。'},{status:503,headers:responseHeaders});
}
export async function GET() {
 const user=await getChatGPTUser();
 if(!user) return Response.json({error:'請先登入，再開始練習。'},{status:401,headers:responseHeaders});
 try { return Response.json(await state(user.userId,user.displayName),{headers:responseHeaders}); } catch(error) { return failure(error); }
}
export async function POST(request: Request) {
 const user=await getChatGPTUser();
 if(!user) return Response.json({error:'請先登入，再開始練習。'},{status:401,headers:responseHeaders});
 if(!sameOrigin(request) || !request.headers.get('content-type')?.startsWith('application/json')) return Response.json({error:'無效的請求來源。'},{status:403,headers:responseHeaders});
 const body=await request.text();
 if(body.length>8192) return Response.json({error:'請求內容過大。'},{status:413,headers:responseHeaders});
 let action;
 try { action=parseAction(JSON.parse(body)); } catch { return Response.json({error:'無效的練習操作。'},{status:400,headers:responseHeaders}); }
 try {
  if(action.action==='start') await rpc('ipas_start',{p_owner:user.userId,p_mode:action.mode,p_filters:action.filters});
  if(action.action==='answer') await rpc('ipas_answer',{p_owner:user.userId,p_session:action.sessionId,p_question:action.questionId,p_choice:action.choice});
  if(action.action==='import') {
   if(!process.env.LEGACY_PRACTICE_JSON) throw new DatabaseError('CONFIG','舊練習紀錄尚未設定。',503);
   const legacy=JSON.parse(process.env.LEGACY_PRACTICE_JSON) as {sessions:{id:string;date:string;source:string;questions:{number:number;user_answer:string}[]}[]};
   const records=legacy.sessions.map(session=>({sourceKey:session.id,date:session.date,questions:session.questions.map(item=>{
    const exam=exams.find(exam=>exam.source===session.source);
    if(!exam) throw new Error('歷史紀錄來源不存在');
    return {id:`${exam.id}-q${item.number}`,choice:item.user_answer};
   })}));
   await rpc('ipas_import',{p_owner:user.userId,p_records:records});
  }
  return Response.json(await state(user.userId,user.displayName),{headers:responseHeaders});
 } catch(error) {
  if(error instanceof DatabaseError && error.code==='ANSWER_CONFLICT') {
   try { return Response.json({error:error.message,state:await state(user.userId,user.displayName)},{status:409,headers:responseHeaders}); } catch(refreshError) { return failure(refreshError); }
  }
  return failure(error);
 }
}
