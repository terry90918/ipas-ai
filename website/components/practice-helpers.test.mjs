import test from 'node:test';
import assert from 'node:assert/strict';
import { filterExams, filterOptions, resumeIndex, paperUrl, reconcileAnswerView } from './practice-helpers.ts';

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

const round = (id, grades = [null, null, null], completed = false) => ({ id, mode: 'practice', completed, items: grades.map((grade, index) => ({ question: { id: `q${index}` }, grade })) });

for (const status of [200, 409]) {
  test(`${status} response for an old round resets the draft and resumes the new round`, () => {
    assert.deepEqual(reconcileAnswerView(round('old'), round('new', [{ correct: true }, null, null]), 2, 'B', 'q2'), { index: 1, choice: '', screen: 'practice' });
  });
  test(`${status} response switches a completed replacement round to its summary`, () => {
    assert.deepEqual(reconcileAnswerView(round('old'), round('new', [{}, {}, {}], true), 2, 'B', 'q2'), { index: 0, choice: '', screen: 'summary' });
  });
}

test('acknowledging the same round clears the draft while retaining the answered question', () => {
  assert.deepEqual(reconcileAnswerView(round('same'), round('same', [null, null, { choice: 'A' }]), 2, 'B', 'q2'), { index: 2, choice: '', screen: null });
});

test('a genuine failure preserves the same unsaved question and draft', () => {
  assert.deepEqual(reconcileAnswerView(round('same'), undefined, 1, 'C', 'q1'), { index: 1, choice: 'C', screen: null });
});

test('a loaded state without the submitted question cannot inherit its draft', () => {
  const incoming = round('same', [{}, null]);
  incoming.items[1].question.id = 'different';
  assert.deepEqual(reconcileAnswerView(round('same'), incoming, 2, 'D', 'q2'), { index: 1, choice: '', screen: 'practice' });
});
