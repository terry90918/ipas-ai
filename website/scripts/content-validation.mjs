export function validateContent(exams,questions,explanations) {
 const ids=new Set();
 for(const exam of exams) {
  const rows=questions.filter(q=>q.examId===exam.id);
  if(rows.length!==exam.questionCount) throw new Error(`${exam.id}: 題數不符`);
  const numbers=rows.map(q=>q.number).sort((a,b)=>a-b);
  if(numbers.some((n,i)=>n!==i+1)) throw new Error(`${exam.id}: 題號不連續`);
 }
 for(const q of questions) {
  if(ids.has(q.id) || !exams.some(e=>e.id===q.examId)) throw new Error(`${q.id}: 題目識別碼無效`);
  ids.add(q.id);
  if(!q.stem || !/^[ABCD]$/.test(q.answer) || ['A','B','C','D'].some(k=>typeof q.options[k]!=='string' || !q.options[k].trim())) throw new Error(`${q.id}: 題目或答案不完整`);
  const e=explanations[q.id];
  if(!e || typeof e.reasoning!=='string' || e.reasoning.trim().length<60) throw new Error(`${q.id}: 詳細解析不足`);
  for(const letter of ['A','B','C','D']) if(typeof e.options?.[letter]!=='string' || e.options[letter].trim().length<12) throw new Error(`${q.id}: ${letter} 選項解析不足`);
  if(typeof e.concept!=='string' || !e.concept.trim() || typeof e.pitfalls!=='string' || !e.pitfalls.trim()) throw new Error(`${q.id}: 概念與誤區不足`);
  if(e.reasoning.length+Object.values(e.options).reduce((sum,value)=>sum+value.length,0)+e.concept.length+e.pitfalls.length<180) throw new Error(`${q.id}: 詳細解答總內容不足`);
  if(!Array.isArray(e.sources) || !e.sources.length || e.sources.some(source=>!source.title || !/^https?:\/\//.test(source.url))) throw new Error(`${q.id}: 解析來源不足`);
 }
 if(Object.keys(explanations).some(id=>!ids.has(id))) throw new Error('解析包含不存在的題目');
 return {exams:exams.length,questions:questions.length,explanations:Object.keys(explanations).length};
}
