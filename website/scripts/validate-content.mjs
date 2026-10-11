import {existsSync,readFileSync,readdirSync,writeFileSync,renameSync} from 'node:fs';
import path from 'node:path';
import {validateContent} from './content-validation.mjs';
const read=file=>JSON.parse(readFileSync(file,'utf8'));
const exams=read('content/exams.json');
const questions=read('content/questions.json');
const explanations={};
for(const filename of readdirSync('content/explanations').filter(name=>name.endsWith('.json')).sort()) {
 const entries=read(`content/explanations/${filename}`);
 for(const [id,entry] of Object.entries(entries)) {
  if(explanations[id]) throw new Error(`重複解析: ${id}`);
  explanations[id]=entry;
 }
}
const result=validateContent(exams,questions,explanations);
if(result.exams!==14 || result.questions!==700) throw new Error('必須完整收錄 14 份、700 題');
for(const question of questions) for(const image of question.images) {
 const file=path.resolve('public',image.replace(/^\//,''));
 if(!file.startsWith(path.resolve('public')+path.sep) || !existsSync(file)) throw new Error(`找不到原題圖: ${image}`);
}
for(const exam of exams) if(!existsSync(`public/papers/${exam.id}.pdf`)) throw new Error(`缺少來源試卷: ${exam.id}`);
writeFileSync('content/explanations.json.tmp',JSON.stringify(explanations,null,2)+'\n');
renameSync('content/explanations.json.tmp','content/explanations.json');
console.log(JSON.stringify(result));
