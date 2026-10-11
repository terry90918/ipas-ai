import type { Exam, Grade, PracticeAction, PracticeState, PublicQuestion, Question } from './types.ts';
export type DatabaseState = { stats: Omit<PracticeState['stats'], 'total'>; legacyImported: boolean; active: null | { id: string; mode: 'practice' | 'wrong'; completed: boolean; question_ids: string[]; answers: { question_id: string; choice: string; correct: boolean }[] } };
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function keys(value: Record<string, unknown>, allowed: string[]) { if (Object.keys(value).some(key => !allowed.includes(key))) throw new Error('不支援的欄位'); }
export function parseAction(value: unknown): PracticeAction {
 if (!record(value)) throw new Error('無效的操作');
 if (value.action === 'import') { keys(value,['action']); return {action:'import'}; }
 if (value.action === 'answer') {
  keys(value,['action','sessionId','questionId','choice']);
  if (typeof value.sessionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.sessionId) || typeof value.questionId !== 'string' || !value.questionId || value.questionId.length > 100 || typeof value.choice !== 'string' || !/^[ABCD]$/.test(value.choice)) throw new Error('請選擇有效答案');
  return {action:'answer',sessionId:value.sessionId,questionId:value.questionId,choice:value.choice};
 }
 if (value.action === 'start') {
  keys(value,['action','mode','filters']);
  if (!['practice','wrong'].includes(String(value.mode)) || !record(value.filters)) throw new Error('無效的練習條件');
  keys(value.filters,['level','subject','year','session']);
  const filters=value.filters;
  if (filters.level !== undefined && !['初級','中級'].includes(String(filters.level))) throw new Error('無效的級別');
  if (filters.subject !== undefined && (typeof filters.subject !== 'string' || filters.subject.length > 100)) throw new Error('無效的科目');
  for (const key of ['year','session']) if (filters[key] !== undefined && (!Number.isInteger(filters[key]) || Number(filters[key]) < 1 || Number(filters[key]) > 999)) throw new Error('無效的年度或場次');
  return value as PracticeAction;
 }
 throw new Error('不支援的操作');
}
export function projectQuestion(question: Question): PublicQuestion {
 const {id,examId,number,stem,options,pages,images}=question;
 return {id,examId,number,stem,options,pages,images};
}
export function buildState(user: string, exams: Exam[], questions: Question[], raw: DatabaseState): PracticeState {
 const bank=new Map(questions.map(question=>[question.id,question]));
 const active=raw.active;
 return {user,exams,stats:{...raw.stats,total:questions.length},legacyImported:raw.legacyImported,active:active ? {id:active.id,mode:active.mode,completed:active.completed,items:active.question_ids.map(id=>{
  const question=bank.get(id);
  if (!question) throw new Error('題庫版本不一致');
  const saved=active.answers.find(answer=>answer.question_id===id);
  let grade: Grade | null=null;
  if (saved) {
   if (!question.explanation) throw new Error('題目解析尚未完成');
   grade={choice:saved.choice,correct:saved.correct,answer:question.answer,explanation:question.explanation,explanationImages:question.explanationImages ?? []};
  }
  return {question:projectQuestion(question),grade};
 })} : null};
}
export function sameOrigin(request: Request): boolean {
 const origin=request.headers.get('origin');
 if(!origin) return false;
 try {
  const url=new URL(request.url);
  return new URL(origin).origin===`${url.protocol}//${request.headers.get('host') ?? url.host}`;
 } catch { return false; }
}
