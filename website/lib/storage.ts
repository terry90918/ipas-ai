import { getCloudflareContext } from '@opennextjs/cloudflare';
import { rpc, DatabaseError } from './database.ts';
import { d1Call } from './d1.ts';
import { control, acquireLease, releaseLease } from './migration.ts';

declare global { interface CloudflareEnv { DB:D1Database; } }
export function getDatabase():D1Database {
 try {const db=getCloudflareContext().env.DB;if(db) return db;} catch {}
 throw new DatabaseError('CONFIG','資料庫尚未完成設定。',503);
}
export async function practiceRpc<T>(name:string,args:Record<string,unknown>):Promise<T> {
 const db=getDatabase();
 if(name==='ipas_state') {
  const current=await control(db);
  return (current.backend==='d1'?await d1Call(db,name,args):await rpc(name,args)) as T;
 }
 const lease=await acquireLease(db);
 try {return (lease.backend==='d1'?await d1Call(db,name,args):await rpc(name,args)) as T;}
 finally {await releaseLease(db,lease.id);}
}
