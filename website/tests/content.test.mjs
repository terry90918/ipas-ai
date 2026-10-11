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
