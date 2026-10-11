import {readFileSync} from 'node:fs';
const read=file=>JSON.parse(readFileSync(file,'utf8'));
const exams=read('content/exams.json');
const questions=read('content/questions.json');
const explanations=read('content/explanations.json');
const supplements=read('content/supplements.json');
if(exams.length!==14 || questions.length!==700 || questions.some(q=>!explanations[q.id])) throw new Error('完整題庫與解析尚未就緒');
const literal=value=>"'"+JSON.stringify(value).replaceAll("'","''")+"'::jsonb";
const text=value=>"'"+value.replaceAll("'","''")+"'";
let output='begin;\n';
output+='insert into public.ipas_exams(id,body) values\n'+exams.map(exam=>`(${text(exam.id)},${literal(exam)})`).join(',\n')+'\non conflict(id) do update set body=excluded.body;\n';
for(let offset=0;offset<questions.length;offset+=50) {
 output+='insert into public.ipas_questions(id,exam_id,number,body) values\n'+questions.slice(offset,offset+50).map(q=>`(${text(q.id)},${text(q.examId)},${q.number},${literal({...q,explanation:explanations[q.id],explanationImages:supplements[q.id] ?? []})})`).join(',\n')+'\non conflict(id) do update set body=excluded.body;\n';
}
output+='commit;\n';
process.stdout.write(output);
