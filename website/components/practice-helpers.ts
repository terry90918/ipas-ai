import type { Exam, Filters, PracticeState } from '@/lib/types';

export function filterExams(exams: Exam[], filters: Filters) {
  return exams.filter(exam =>
    (!filters.level || exam.level === filters.level) &&
    (!filters.subject || exam.subject === filters.subject) &&
    (!filters.year || exam.year === filters.year) &&
    (!filters.session || exam.session === filters.session)
  );
}

export function filterOptions(exams: Exam[], filters: Filters, key: keyof Filters) {
  const matching = filterExams(exams, {
    level: key === 'level' ? undefined : filters.level,
    subject: key === 'year' || key === 'session' ? filters.subject : undefined,
    year: key === 'session' ? filters.year : undefined,
  });
  return [...new Set(matching.map(exam => exam[key]))].sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return key === 'year' ? b - a : a - b;
    return String(a).localeCompare(String(b), 'zh-TW');
  });
}

export function resumeIndex(active: NonNullable<PracticeState['active']>) {
  const index = active.items.findIndex(item => item.grade === null);
  return index === -1 ? 0 : index;
}

export function paperUrl(source: string, page: number) {
  return `/papers/${source.split('/').map(encodeURIComponent).join('/')}#page=${page}`;
}

export function reconcileAnswerView(
  current: PracticeState['active'],
  incoming: PracticeState['active'] | undefined,
  index: number,
  choice: string,
  questionId: string,
): { index: number; choice: string; screen: 'home' | 'practice' | 'summary' | null } {
  if (incoming === undefined) return { index, choice, screen: null };
  if (!incoming) return { index: 0, choice: '', screen: 'home' };
  if (current?.id !== incoming.id) {
    return { index: resumeIndex(incoming), choice: '', screen: incoming.completed ? 'summary' : 'practice' };
  }
  const savedIndex = incoming.items.findIndex(item => item.question.id === questionId);
  return savedIndex < 0
    ? { index: resumeIndex(incoming), choice: '', screen: incoming.completed ? 'summary' : 'practice' }
    : { index: savedIndex, choice: '', screen: null };
}
