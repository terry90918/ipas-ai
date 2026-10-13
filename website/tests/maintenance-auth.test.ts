import test from 'node:test';
import assert from 'node:assert/strict';

test('maintenance requires enabled mode and exact secret, rejecting other signed-in owners',async()=>{
 const guard=await import('../lib/maintenance-auth.ts').catch(()=>null);
 assert.ok(guard,'maintenance authorization must exist');
 const settings={enabled:true,key:'synthetic-secret',owner:'alice'};
 assert.equal(guard.maintenanceAllowed(settings,'alice','synthetic-secret'),true);
 assert.equal(guard.maintenanceAllowed(settings,null,'synthetic-secret'),true);
 assert.equal(guard.maintenanceAllowed(settings,'bob','synthetic-secret'),false);
 assert.equal(guard.maintenanceAllowed(settings,'alice','wrong'),false);
 assert.equal(guard.maintenanceAllowed({...settings,enabled:false},'alice','synthetic-secret'),false);
 assert.equal(guard.maintenanceAllowed({...settings,key:''},null,''),false);
 assert.equal(guard.maintenanceAllowed({...settings,owner:''},null,'synthetic-secret'),false);
});
