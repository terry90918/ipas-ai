import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAction, projectQuestion, buildState } from '../lib/domain.ts';
const question = { id: 'q1', examId: 'e1', number: 1, stem: 'test', options: {A:'a',B:'b',C:'c',D:'d'}, answer: 'A', pages: [1], images: [], explanation: {reasoning:'Reason',options:{A:'a',B:'b',C:'c',D:'d'},concept:'c',pitfalls:'p',sources:[]} };
test('public question does not expose answer or explanation', () => {
 const visible = projectQuestion(question);
 assert.equal('answer' in visible,false);
 assert.equal('explanation' in visible,false);
 assert.deepEqual(visible.options,question.options);
});
test('reject malformed actions and owner injection', () => {
 for(const input of [null,{}, {action:'answer',sessionId:'s',questionId:'q',choice:'E'}, {action:'start',mode:'wrong',filters:{year:'115'}}, {action:'import',userId:'another'}]) assert.throws(()=>parseAction(input));
 assert.deepEqual(parseAction({action:'start',mode:'practice',filters:{level:'初級',year:115}}),{action:'start',mode:'practice',filters:{level:'初級',year:115}});
});
test('reveals only already saved answers and keeps incomplete round',()=>{
 const raw={stats:{attempts:1,correct:1,practiced:1,wrong:0},legacyImported:false,active:{id:'s',mode:'practice' as const,completed:false,question_ids:['q1'],answers:[{question_id:'q1',choice:'A',correct:true}]}};
 const state=buildState('user',[],[question],raw);
 assert.equal(state.active?.items[0].grade?.answer,'A');
 assert.equal(state.active?.items[0].grade?.explanation.reasoning,'Reason');
 assert.equal('answer' in state.active!.items[0].question,false);
 const unsubmitted=buildState('user',[],[question],{...raw,active:{...raw.active,answers:[]}});
 assert.equal(unsubmitted.active?.items[0].grade,null);
});
test('same-origin validation uses the incoming host through the Next adapter',async()=>{
 const {sameOrigin}=await import('../lib/domain.ts');
 assert.equal(sameOrigin(new Request('http://localhost:3002/api/practice',{headers:{host:'127.0.0.1:3303',origin:'http://127.0.0.1:3303'}})),true);
 assert.equal(sameOrigin(new Request('https://site.example/api/practice',{headers:{host:'site.example',origin:'https://evil.example'}})),false);
 assert.equal(sameOrigin(new Request('https://site.example/api/practice',{headers:{host:'site.example',origin:'http://site.example'}})),false);
 assert.equal(sameOrigin(new Request('https://site.example/api/practice')),false);
});
