export function maintenanceAllowed(settings:{enabled:boolean;key:string;owner:string},userId:string|null,key:string|null) {
 return settings.enabled&&Boolean(settings.key)&&Boolean(settings.owner)&&key===settings.key&&(userId===null||userId===settings.owner);
}
