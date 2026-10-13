export function utcTimestamp(value:string):string {
 if(/^\d{4}-\d{2}-\d{2}$/.test(value)) value+='T00:00:00.000000Z';
 const match=/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
 if(!match||!Number.isFinite(Date.parse(value))) throw new Error('Invalid timestamp');
 const seconds=new Date(`${match[1]}${match[3]}`).toISOString().slice(0,19);
 return `${seconds}.${(match[2]??'').padEnd(6,'0')}Z`;
}
