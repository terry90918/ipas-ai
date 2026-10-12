import type { Exam, Filters, PracticeState } from '@/lib/types';

export function displayOptionText(value: string) {
  const lines = value.split(/\r?\n/);
  if (lines.length === 1) return value;
  const newline = value.includes('\r\n') ? '\r\n' : '\n';
  let fenced = false;
  const blocks = lines.map(line => {
    const delimiter = /^\s*```/.test(line);
    const preserve = fenced || delimiter ||
      /^\s{2,}\S/.test(line) ||
      /^(?:import|from|export|const|let|var|def|class|return|for|if|while)\b/.test(line.trim()) ||
      /\b(?:train_test_split|LogisticRegression|torch|params?)\b/i.test(line) ||
      /^\s*(?:[-=]{3,}|[-•]\s|[A-Z][：:]|\(?\d+[.)、]|（\d+）)/.test(line) ||
      /^\s*[A-Za-zα-ωΑ-Ω][\wα-ωΑ-Ω.()[\]|^²³₀-₉]*\s*[=<>≤≥≈]/.test(line) ||
      /^\S+\s+\[[^\]]+\]/.test(line) ||
      /^\s*[A-Za-z][\w /(),-]*:\s*[-\d]/.test(line) ||
      /\S[ \t]{2,}\S/.test(line);
    if (delimiter) fenced = !fenced;
    return { line, preserve };
  });
  return blocks.reduce((result, block, index) => {
    const current = block.preserve ? block.line : block.line.trim();
    if (index === 0) return current;
    const previous = blocks[index - 1];
    const separator = block.preserve || previous.preserve || !current || !previous.line.trim()
      ? newline
      : /^[A-Za-z0-9(]/.test(current) && /[A-Za-z0-9),.!?;:]$/.test(result.at(-1) ?? '') ? ' ' : '';
    return result + separator + current;
  }, '');
}

export type AnswerDraft = { sessionId: string; questionId: string; choice: string };

export function draftChoice(active: PracticeState['active'], index: number, draft: AnswerDraft | null) {
  const item = active?.items[index];
  return active?.id === draft?.sessionId && item?.question.id === draft?.questionId && item?.grade === null ? draft?.choice ?? '' : '';
}

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
