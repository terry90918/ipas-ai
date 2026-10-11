import test from 'node:test';
import assert from 'node:assert/strict';
import { filterExams, filterOptions, resumeIndex, paperUrl } from './practice-helpers.ts';

const exams = [
  { id: 'a', level: '初級', subject: '概論', year: 114, session: 1 },
  { id: 'b', level: '初級', subject: '概論', year: 115, session: 1 },
  { id: 'c', level: '中級', subject: '應用', year: 114, session: 2 },
  { id: 'd', level: '中級', subject: '應用', year: 115, session: 3 },
];

test('dependent filters show only available subjects, years and sessions', () => {
  assert.deepEqual(filterExams(exams, { level: '初級', year: 115 }).map(exam => exam.id), ['b']);
  assert.deepEqual(filterOptions(exams, { level: '初級' }, 'subject'), ['概論']);
  assert.deepEqual(filterOptions(exams, { level: '中級', subject: '應用' }, 'year'), [115, 114]);
  assert.deepEqual(filterOptions(exams, { level: '中級', subject: '應用', year: 114 }, 'session'), [2]);
});

test('resuming targets the first unanswered question without skipping it', () => {
  assert.equal(resumeIndex({ items: [{ grade: {} }, { grade: null }, { grade: null }] }), 1);
  assert.equal(resumeIndex({ items: [{ grade: {} }, { grade: {} }] }), 0);
});

test('PDF paths encode each source segment and select the original page', () => {
  assert.equal(paperUrl('初級/114 第1次.pdf', 3), '/papers/%E5%88%9D%E7%B4%9A/114%20%E7%AC%AC1%E6%AC%A1.pdf#page=3');
});
