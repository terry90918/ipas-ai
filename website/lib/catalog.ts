import examsData from '../content/exams.json';
import questionsData from '../content/questions.json';
import explanationData from '../content/explanations.json';
import supplements from '../content/supplements.json';
import type { Exam, Explanation, Question } from './types';
export const exams=examsData as Exam[];
export const questions=questionsData.map(question=>({...question,explanationImages:(supplements as Record<string,string[]>)[question.id] ?? [],explanation:(explanationData as Record<string,Explanation>)[question.id]})) as Question[];
