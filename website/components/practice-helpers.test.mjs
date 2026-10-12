import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { displayOptionText, draftChoice, filterExams, filterOptions, resumeIndex, paperUrl, reconcileAnswerView } from './practice-helpers.ts';

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

test('joins PDF line wraps in prose options but preserves code formatting', () => {
  assert.equal(displayOptionText('推播行\n銷策略；'), '推播行銷策略；');
  const code = 'import torch\nfor param in model.parameters():\n    param.requires_grad = False';
  assert.equal(displayOptionText(code), code);
  assert.equal(displayOptionText('This model\nuses training data.'), 'This model uses training data.');
  assert.equal(displayOptionText('Select one,\nthen continue.'), 'Select one, then continue.');
});

test('normalizes question prose while preserving paragraph boundaries', () => {
  assert.equal(displayOptionText('Self-Attention 的核心功\n能為何？'), 'Self-Attention 的核心功能為何？');
  assert.equal(displayOptionText('共用情境的第一\n段。\n\n這一題的問\n題。'), '共用情境的第一段。\n\n這一題的問題。');
  assert.equal(displayOptionText('Question text\r\ncontinues.\r\n\r\nNext paragraph.'), 'Question text continues.\r\n\r\nNext paragraph.');
});

test('preserves mathematical, numbered, code and tabular blocks', () => {
  for (const value of [
    '請計算：\nx = 2\ny = x² + 1',
    '作法如下：\n(1) 清理資料\n(2) 訓練模型',
    '敘述如下：\nA：第一個條件\nB：第二個條件',
    '模型架構：\n----------------\nLayer (type) Output Shape Param #\nConv2d-1 [-1, 64, 150, 150] 1,792',
    '```python\nprint(1)\n```',
  ]) assert.equal(displayOptionText(value), value);
});

test('display normalization preserves all non-whitespace content in the full question bank', () => {
  const questions = JSON.parse(readFileSync(new URL('../content/questions.json', import.meta.url), 'utf8'));
  for (const question of questions) {
    for (const value of [question.stem, ...Object.values(question.options)]) {
      assert.equal(displayOptionText(value).replace(/\s/g, ''), value.replace(/\s/g, ''), question.id);
    }
  }
});

const round = (id, grades = [null, null, null], completed = false) => ({ id, mode: 'practice', completed, items: grades.map((grade, index) => ({ question: { id: `q${index}` }, grade })) });

test('an unsent choice follows its question through overview and saved-question review', () => {
  const active = round('same', [{ choice: 'A' }, null, null]);
  const draft = { sessionId: 'same', questionId: 'q1', choice: 'C' };
  assert.equal(draftChoice(active, 1, draft), 'C');
  assert.equal(draftChoice(active, 0, draft), '');
  assert.equal(draftChoice(active, 1, draft), 'C');
});

test('a draft never becomes a saved answer or leaks into another round or question', () => {
  const draft = { sessionId: 'same', questionId: 'q1', choice: 'C' };
  assert.equal(draftChoice(null, 1, draft), '');
  assert.equal(draftChoice(round('new'), 1, draft), '');
  assert.equal(draftChoice(round('same'), 2, draft), '');
  assert.equal(draftChoice(round('same', [null, { choice: 'A' }]), 1, draft), '');
  assert.equal(draftChoice(round('same'), 1, null), '');
});

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
