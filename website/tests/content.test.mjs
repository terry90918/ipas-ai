import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContent } from '../scripts/content-validation.mjs';
const question={id:'q',examId:'e',number:1,stem:'題目',options:{A:'a',B:'b',C:'c',D:'d'},answer:'A',pages:[1],images:['/assets/q.webp']};
const explanation={reasoning:'這是一段充分說明推理與判斷依據的解析。'.repeat(8),options:Object.fromEntries(['A','B','C','D'].map(letter=>[letter,`${letter}選項的技術假設與題目條件不一致，因此需要依定義判斷。`])),concept:'概念定義必須區分必要条件與充分条件。',pitfalls:'不要把相關性直接當成因果關係。',sources:[{title:'官方文件',url:'https://example.org/docs'}]};
const exams=[{id:'e',questionCount:1}];
test('rejects missing questions and explanations instead of publishing partial content',()=>{
 assert.throws(()=>validateContent(exams,[],{}),/題數/);
 assert.throws(()=>validateContent(exams,[question],{}),/解析/);
});
test('rejects incomplete option reasoning and accepts complete entries',()=>{
 assert.throws(()=>validateContent(exams,[question],{q:{...explanation,options:{A:'只有答案'}}}),/選項/);
 assert.doesNotThrow(()=>validateContent(exams,[question],{q:explanation}));
});

test('rejects punctuation-only choices while preserving actual mathematical content',()=>{
 for(const value of [';', '； 。 （）', '...']) assert.throws(()=>validateContent(exams,[{...question,options:{...question.options,B:value}}],{q:explanation}),/題目或答案/);
 assert.doesNotThrow(()=>validateContent(exams,[{...question,options:{...question.options,B:'π/2'}}],{q:explanation}));
 assert.doesNotThrow(()=>validateContent(exams,[{...question,options:{...question.options,B:'[]；'}}],{q:explanation}));
});

test('rejects unqualified correct markers on a non-official option even with an unrelated caveat',()=>{
 for(const marker of ['正確；', '正確的最佳選項；']) {
  const entry={...explanation,options:{...explanation.options,B:`${marker}這一段說明把不符合官方答案的選項當成無條件正確。`},caveat:'模型效果仍依實作而異，這個提醒不代表改變公告答案。'};
  assert.throws(()=>validateContent(exams,[question],{q:entry}),/公告答案/);
 }
});

test('preserves explicit technical alternatives and references to方案A or B',()=>{
 const entry={...explanation,reasoning:'方案A與方案B各有成本限制，須根據題目條件選擇；案例中的字母用於方案識別，而不是宣告本題公告答案改變。'.repeat(2),options:{...explanation.options,B:'技術上在附加條件下可成立，但官方單選為A；此替代方案需額外資料與驗證，不能直接視為題設最佳。'},caveat:'附加條件成立時存在替代作法，保留原公告答案。'};
 assert.doesNotThrow(()=>validateContent(exams,[question],{q:entry}));
});

test('source transaction fixture distinguishes maximum cardinality from an A superset',async()=>{
 const {readFileSync}=await import('node:fs');
 const rows=[['A','B','E'],['C','D'],['B','D','E'],['A','B','E'],['B','C','E'],['A','D'],['A'],['A','D']];
 const count=items=>rows.filter(row=>items.every(item=>row.includes(item))).length;
 assert.deepEqual([count(['A']),count(['B','E']),count(['A','D']),count(['A','B','E'])],[5,4,2,2]);
 const labels=['A','B','C','D','E'];
 const frequent=[];
 for(let mask=1;mask<1<<labels.length;mask++) {
  const items=labels.filter((_,index)=>mask&(1<<index));
  if(count(items)>=3)frequent.push(items);
 }
 const largest=Math.max(...frequent.map(items=>items.length));
 assert.deepEqual(frequent.filter(items=>items.length===largest),[['B','E']]);
 const maximal=frequent.filter(items=>!frequent.some(other=>other.length>items.length&&items.every(item=>other.includes(item))));
 assert.deepEqual(maximal,[['A'],['D'],['B','E']]);
 assert.equal(['B','E'].includes('A'),false);
 const questions=JSON.parse(readFileSync(new URL('../content/questions.json',import.meta.url),'utf8'));
 const id='intermediate-115-1-2-q19';
 const question=questions.find(q=>q.id===id);
 assert.equal(question.answer,'D');
 assert.match(question.options.D,/B.*E/);
 const entry=JSON.parse(readFileSync(new URL('../content/explanations/intermediate-115-1-2.json',import.meta.url),'utf8'))[id];
 assert.doesNotMatch(entry.reasoning,/其超集BE/);
 assert.match(entry.reasoning,/頻繁二項集/);
 assert.match(entry.caveat,/maximal/);
});
