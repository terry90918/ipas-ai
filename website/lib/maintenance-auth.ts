import { createHash, timingSafeEqual } from 'node:crypto';
export function maintenanceAllowed(settings:{enabled:boolean;key:string;owner:string},userId:string|null,key:string|null) {
 if(!settings.enabled||!settings.key||!settings.owner||key===null||(userId!==null&&userId!==settings.owner)) return false;
 return timingSafeEqual(createHash('sha256').update(key).digest(),createHash('sha256').update(settings.key).digest());
}
