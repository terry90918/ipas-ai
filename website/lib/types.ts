export type Exam = { id: string; level: string; year: number; session: number; subject: string; subjectNumber: number; source: string; questionCount: number };
export type Explanation = { reasoning: string; options: Record<string, string>; concept: string; pitfalls: string; sources: { title: string; url: string }[]; caveat?: string };
export type Question = { id: string; examId: string; number: number; stem: string; options: Record<string, string>; answer: string; pages: number[]; images: string[]; explanation?: Explanation; explanationImages?: string[] };
export type PublicQuestion = Omit<Question, 'answer' | 'explanation' | 'explanationImages'>;
export type Grade = { choice: string; correct: boolean; answer: string; explanation: Explanation; explanationImages: string[] };
export type Filters = { level?: string; subject?: string; year?: number; session?: number };
export type PracticeState = { user: string; exams: Exam[]; stats: { attempts: number; correct: number; practiced: number; total: number; wrong: number }; legacyImported: boolean; active: null | { id: string; mode: 'practice' | 'wrong'; completed: boolean; items: { question: PublicQuestion; grade: Grade | null }[] } };
export type PracticeAction = { action: 'start'; mode: 'practice' | 'wrong'; filters: Filters } | { action: 'answer'; sessionId: string; questionId: string; choice: string } | { action: 'import' };
