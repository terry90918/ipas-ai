export class DatabaseError extends Error {
 readonly code: string;
 readonly status: number;
 constructor(code: string, message: string, status: number) { super(message); this.code=code; this.status=status; }
}
export async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
 const url=process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_SECRET_KEY;
 if(!url || !key) throw new DatabaseError('CONFIG','雲端資料庫尚未設定，練習紀錄暫時無法同步。',503);
 let response: Response;
 try { response=await fetch(`${url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,...(key.startsWith('sb_secret_') ? {} : {Authorization:`Bearer ${key}`}),'Content-Type':'application/json'},body:JSON.stringify(args),cache:'no-store',signal:AbortSignal.timeout(15000)}); }
 catch { throw new DatabaseError('NETWORK','同步未完成，請稍後重試。',503); }
 if(!response.ok) {
  const detail=await response.json().catch(()=>({})) as {message?: unknown};
  const message=typeof detail.message === 'string' ? detail.message : 'DATABASE';
  const messages:Record<string,string>={NO_QUESTIONS:'目前篩選條件沒有可練習的題目。',INVALID_CHOICE:'請選擇有效答案。',SESSION_NOT_FOUND:'找不到這個練習回合，請重新整理。',QUESTION_NOT_IN_SESSION:'這題不屬於目前的回合。',ANSWER_CONFLICT:'此題已在另一個裝置提交，已載入保存的答案。',SESSION_COMPLETED:'回合已完成，請重新整理。',CATALOG_NOT_READY:'題庫尚未完成設定。'};
  const code=Object.hasOwn(messages,message) ? message : 'DATABASE';
  throw new DatabaseError(code,messages[code] ?? '同步失敗，請稍後重試。',code==='ANSWER_CONFLICT' ? 409 : ['SESSION_NOT_FOUND','QUESTION_NOT_IN_SESSION'].includes(code) ? 404 : code==='NO_QUESTIONS' || code==='INVALID_CHOICE' ? 400 : 503);
 }
 const body=await response.text();
 return (body ? JSON.parse(body) : null) as T;
}
