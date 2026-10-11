'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, Check, CircleCheck, CircleHelp, ExternalLink, GraduationCap, LayoutDashboard, LoaderCircle, LogOut, RotateCcw, Sparkles, Target, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Filters, PracticeAction, PracticeState } from '@/lib/types';
import { filterExams, filterOptions, paperUrl, resumeIndex, reconcileAnswerView } from './practice-helpers';

const filterLabels = { level: '考試級別', subject: '考試科目', year: '年度', session: '梯次' };
const loginUrl = '/signin-with-chatgpt?return_to=%2F';

async function responseMessage(response: Response) {
  const body = await response.json().catch(() => null) as { error?: unknown } | null;
  return typeof body?.error === 'string' ? body.error : `連線失敗（${response.status}），請稍後重試。`;
}

export function Practice() {
  const [state, setState] = useState<PracticeState | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'login' | 'config' | 'error'>('loading');
  const [screen, setScreen] = useState<'home' | 'practice' | 'summary'>('home');
  const [filters, setFilters] = useState<Filters>({});
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/practice', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) {
          const message = await responseMessage(response);
          setError(response.status === 401 ? '' : message);
          setPhase(response.status === 401 ? 'login' : response.status === 503 ? 'config' : 'error');
          return;
        }
        const data: PracticeState = await response.json();
        setState(data);
        setIndex(data.active ? resumeIndex(data.active) : 0);
        setScreen(data.active ? data.active.completed ? 'summary' : 'practice' : 'home');
        setPhase('ready');
        setError('');
      } catch (failure) {
        if (controller.signal.aborted) return;
        setError(failure instanceof Error ? failure.message : '無法連線，請重試。');
        setPhase('error');
      }
    }
    void load();
    return () => controller.abort();
  }, [reload]);

  async function send(action: PracticeAction) {
    if (busy) return null;
    setBusy(true);
    setError('');
    setConflict(false);
    let incoming: PracticeState | undefined;
    try {
      const response = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      if (!response.ok) {
        setAuthRequired(response.status === 401);
        const body = await response.json().catch(() => null) as { error?: string; state?: PracticeState } | null;
        if (response.status === 409 && body?.state) {
          incoming = body.state;
          setConflict(true);
        }
        throw new Error(body?.error ?? `儲存失敗（${response.status}），請重試。`);
      }
      const data: PracticeState = await response.json();
      incoming = data;
      setAuthRequired(false);
      return data;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '儲存失敗，請重試。');
      return null;
    } finally {
      if (action.action === 'answer') {
        const view = reconcileAnswerView(state?.active ?? null, incoming?.active, index, choice, action.questionId);
        setIndex(view.index);
        setChoice(view.choice);
        if (view.screen) setScreen(view.screen);
      }
      if (incoming) setState(incoming);
      setBusy(false);
    }
  }

  async function start(mode: 'practice' | 'wrong') {
    const data = await send({ action: 'start', mode, filters });
    if (!data?.active) return;
    setIndex(resumeIndex(data.active));
    setChoice('');
    setScreen(data.active.completed ? 'summary' : 'practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function viewQuestion(nextIndex: number) {
    setIndex(nextIndex);
    setChoice('');
    setError('');
    setScreen('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function updateFilter(key: keyof Filters, value: string) {
    const next = key === 'level' ? {} : key === 'subject' ? { level: filters.level } : key === 'year' ? { level: filters.level, subject: filters.subject } : { level: filters.level, subject: filters.subject, year: filters.year };
    setFilters({ ...next, [key]: value ? key === 'year' || key === 'session' ? Number(value) : value : undefined });
  }

  const active = state?.active;
  const item = active?.items[index];
  const exam = state?.exams.find(exam => exam.id === item?.question.examId);
  const answered = active?.items.filter(item => item.grade !== null).length ?? 0;
  const roundCorrect = active?.items.filter(item => item.grade?.correct).length ?? 0;
  const matching = state ? filterExams(state.exams, filters) : [];
  const matchingCount = matching.reduce((sum, exam) => sum + exam.questionCount, 0);
  const progress = state?.stats.total ? state.stats.practiced / state.stats.total * 100 : 0;
  const accuracy = state?.stats.attempts ? Math.round(state.stats.correct / state.stats.attempts * 100) : null;

  return (
    <div className="study-app">
      <a className="skip-link" href="#main-content">跳至主要內容</a>
      <header className="app-header">
        <Link className="brand" href="/" aria-label="iPAS 自習室首頁">
          <span className="brand-icon"><BookOpen size={21} strokeWidth={1.8} /></span>
          <span>iPAS <span className="font-normal">自習室</span><span className="brand-subtitle">AI 應用規劃師</span></span>
        </Link>
        <div className="header-actions">
          <Badge variant="outline" className="hidden sm:inline-flex"><span className="status-dot" />個人學習空間</Badge>
          {state && <Button variant="ghost" size="sm" asChild><a href="/signout-with-chatgpt?return_to=%2F" target="_top"><LogOut />登出</a></Button>}
        </div>
      </header>

      <div className="app-grid">
        <aside className="sidebar" aria-label="學習導覽">
          <p className="eyebrow sidebar-caption">我的自習室</p>
          <Button variant={screen === 'home' ? 'secondary' : 'ghost'} className="nav-button" onClick={() => { setScreen('home'); setError(''); }}><LayoutDashboard />練習總覽</Button>
          <Button variant={screen === 'practice' ? 'secondary' : 'ghost'} className="nav-button" disabled={!active || busy} onClick={() => active && viewQuestion(resumeIndex(active))}><BookOpen />{active && !active.completed ? '繼續本輪練習' : '本輪答題回顧'}{active && !active.completed && <span className="ml-auto text-xs">{answered}/{active.items.length}</span>}</Button>
          <Button variant="ghost" className="nav-button" disabled={!state || busy || !state.stats.wrong || Boolean(active && !active.completed && active.mode !== 'wrong')} onClick={() => start('wrong')}><RotateCcw />錯題複習{state && <span className="ml-auto text-xs">{state.stats.wrong}</span>}</Button>
          <div className="sidebar-note"><span className="note-icon"><Sparkles size={18} /></span><p>每回合五題</p><span>提交後查看完整解析。<br />答錯的題目可再次練習。</span></div>
          <div className="sidebar-bottom"><span className="status-dot" />{state ? '進度連結你的登入帳號' : '登入後保存學習進度'}</div>
        </aside>

        <main id="main-content" className="main-content">
          {error && <div role="alert" className="error-message"><CircleHelp className="shrink-0" size={18} /><div><p>{error}</p>{state && <p className="mt-1 text-xs">{conflict ? '已同步最新練習進度，請確認目前題目。' : '目前選擇已保留；送出成功後才會記錄作答。'}</p>}{authRequired && <Button variant="link" asChild className="px-0"><a href={loginUrl} target="_top">重新登入</a></Button>}</div></div>}

          {phase !== 'ready' ? (
            <section className="gate-wrap">
              <div className="page-heading"><p className="eyebrow">iPAS AI 應用規劃師</p><h1>你的 iPAS 自習室</h1><p>選擇考試範圍，開始五題練習或複習錯題。</p></div>
              <Card className="gate-card"><CardHeader><span className="feature-icon"><GraduationCap size={28} /></span><CardTitle>{phase === 'loading' ? '正在讀取學習進度' : phase === 'login' ? '登入，接著練習' : phase === 'config' ? '尚未完成儲存服務設定' : '目前無法讀取進度'}</CardTitle><CardDescription className="leading-7">{phase === 'loading' ? '載入你的題庫、練習紀錄與錯題。' : phase === 'login' ? '使用 ChatGPT 登入。答題紀錄、錯題與未完成的練習，會連結到你的帳號。' : phase === 'config' ? '目前無法安全儲存作答。請完成資料庫與登入服務設定後，再開始練習。' : '請檢查連線後重新讀取。'}</CardDescription></CardHeader><CardContent>{phase === 'loading' ? <LoaderCircle className="animate-spin text-primary" aria-label="載入中" /> : phase === 'login' ? <Button size="lg" asChild><a href={loginUrl} target="_top">使用 ChatGPT 登入<ArrowRight /></a></Button> : <Button variant="outline" onClick={() => { setPhase('loading'); setReload(value => value + 1); }}><RotateCcw />重新讀取</Button>}</CardContent></Card>
            </section>
          ) : state && screen === 'home' ? (
            <>
              <div className="page-heading heading-with-badge"><div><p className="eyebrow">MY STUDY SPACE</p><h1>考題練習</h1><p>選擇考試範圍，每回合最多五題，未練過的題目優先。</p></div><Badge variant="outline" className="soft-badge"><GraduationCap />AI 應用規劃師</Badge></div>
              <div className="stats-grid">
                {[{ label: '題庫總題數', value: state.stats.total, unit: '題', icon: BookOpen }, { label: '已練習題數', value: state.stats.practiced, unit: '題', icon: CircleCheck }, { label: '作答正確率', value: accuracy === null ? '—' : accuracy, unit: accuracy === null ? '' : '%', icon: Target }, { label: '待複習錯題', value: state.stats.wrong, unit: '題', icon: RotateCcw }].map(stat => <Card className="stat-card" key={stat.label}><CardContent><div className="stat-label"><span>{stat.label}</span><stat.icon size={17} /></div><p className="stat-value">{stat.value}<span>{stat.unit}</span></p></CardContent></Card>)}
              </div>
              {active && !active.completed && <div className="resume-banner"><div><strong>有一輪未完成的練習</strong><p>{active.mode === 'wrong' ? '錯題複習' : '五題練習'} · 已完成 {answered} / {active.items.length} 題。每次只會保留一輪未完成的練習。</p></div><Button onClick={() => viewQuestion(resumeIndex(active))}>繼續練習<ArrowRight /></Button></div>}
              <div className="home-columns">
                <Card className="filter-card"><CardHeader><div className="section-label"><span className="step-tag">01</span><span>設定練習範圍</span></div><CardTitle className="text-xl">選擇練習範圍</CardTitle><CardDescription>從歷屆試題選擇範圍，每輪最多五題。</CardDescription></CardHeader><CardContent><div className="filter-grid">{(Object.keys(filterLabels) as (keyof Filters)[]).map(key => <div className="filter-field" key={key}><label htmlFor={`filter-${key}`}>{filterLabels[key]}</label><NativeSelect id={`filter-${key}`} value={filters[key] ?? ''} onChange={event => updateFilter(key, event.target.value)} disabled={busy}><NativeSelectOption value="">全部{key === 'level' ? '級別' : key === 'subject' ? '科目' : key === 'year' ? '年度' : '梯次'}</NativeSelectOption>{filterOptions(state.exams, filters, key).map(value => <NativeSelectOption key={value} value={value}>{key === 'year' ? `${value} 年` : key === 'session' ? `第 ${value} 次` : value}</NativeSelectOption>)}</NativeSelect></div>)}</div><div className="filter-result"><span className="status-dot" />目前範圍：<strong>{matchingCount} 題</strong><span className="text-muted-foreground">／{matching.length} 份試卷</span></div><Button size="lg" className="start-button" disabled={busy || (!matchingCount && (!active || active.completed))} onClick={() => start('practice')}>{busy ? <LoaderCircle className="animate-spin" /> : <BookOpen />}{active && !active.completed ? '繼續未完成的練習' : '開始五題練習'}<ArrowRight className="ml-auto" /></Button><p className="action-note">選答案後送出，才會揭曉答案與解析。</p></CardContent></Card>
                <div className="home-side"><Card className="review-card"><CardHeader><span className="feature-icon warm"><RotateCcw size={23} /></span><CardTitle>錯題複習</CardTitle><CardDescription className="leading-6">依所選範圍練習仍答錯的題目。答對後，就會離開待複習清單。</CardDescription></CardHeader><CardContent><div className="review-count"><strong>{state.stats.wrong}</strong><span>題等待複習</span></div><Button variant="outline" className="w-full" disabled={busy || !state.stats.wrong || Boolean(active && !active.completed && active.mode !== 'wrong')} onClick={() => start('wrong')}>複習錯題<ArrowRight /></Button>{!state.stats.wrong ? <p className="action-note">目前沒有待複習的錯題。</p> : active && !active.completed && active.mode !== 'wrong' ? <p className="action-note">完成本輪後再開始錯題複習。</p> : null}</CardContent></Card><Card className="progress-card"><CardContent><div className="flex justify-between gap-4"><strong className="text-sm">題庫探索進度</strong><span className="text-sm text-primary">{Math.round(progress)}%</span></div><Progress value={progress} className="my-4" aria-label="題庫探索進度" /><p className="text-xs text-muted-foreground leading-6">已練習 {state.stats.practiced} / {state.stats.total} 題<br />正確率以所有已送出的作答計算。</p></CardContent></Card></div>
              </div>
              <Card className="import-card"><CardContent><span className="import-icon"><ArrowDownToLine size={20} /></span><div><strong>{state.legacyImported ? '既有紀錄已匯入' : '接續之前的學習進度'}</strong><p>{state.legacyImported ? '匯入只會執行一次，你可以繼續累積新的作答。' : '將先前的 24 筆作答紀錄匯入目前帳號。'}</p></div><Button variant="outline" disabled={state.legacyImported || busy} onClick={() => { setError(''); setImportOpen(true); }}>{state.legacyImported ? <><Check />已匯入</> : <>匯入既有紀錄<ArrowRight /></>}</Button></CardContent></Card>
              {active?.completed && <Button variant="link" onClick={() => setScreen('summary')}>查看上一輪成果<ArrowRight /></Button>}
            </>
          ) : state && active && screen === 'summary' ? (
            <>
              <Button variant="ghost" className="back-button" onClick={() => setScreen('home')}><ArrowLeft />練習總覽</Button>
              <div className="page-heading"><p className="eyebrow">ROUND COMPLETE</p><h1>這一輪，完成了。</h1><p>回顧答題，讓觀念再清楚一點。</p></div>
              <Card className="summary-card"><CardContent><span className="summary-icon"><CircleCheck size={34} /></span><div><p className="eyebrow">本輪成果</p><p className="summary-score">{roundCorrect}<span> / {active.items.length} 題答對</span></p><p className="text-muted-foreground text-sm">{active.mode === 'wrong' ? '錯題複習' : '五題練習'} · 錯題 {active.items.length - roundCorrect} 題</p></div><Button size="lg" disabled={busy} onClick={() => start(active.mode)}>{busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}再練習一輪</Button></CardContent></Card>
              <section className="round-review"><h2>逐題回顧 <span>{active.items.length} 題</span></h2>{active.items.map((entry, entryIndex) => <Card className="review-row" key={entry.question.id}><CardContent><span className={`result-icon ${entry.grade?.correct ? 'correct' : 'incorrect'}`}>{entry.grade?.correct ? <Check size={17} /> : <X size={17} />}</span><div className="min-w-0 flex-1"><p className="review-row-title"><span>第 {entryIndex + 1} 題</span>{state.exams.find(exam => exam.id === entry.question.examId)?.subject}</p><p className="review-stem">{entry.question.stem}</p><p className="text-xs text-muted-foreground mt-2">你的答案：{entry.grade?.choice ?? '未作答'} · 公告答案：{entry.grade?.answer ?? '—'}</p></div><Button variant="outline" size="sm" onClick={() => viewQuestion(entryIndex)}>查看詳解<ArrowRight /></Button></CardContent></Card>)}</section>
              <Button variant="outline" onClick={() => setScreen('home')}><ArrowLeft />調整練習範圍</Button>
            </>
          ) : state && active && item ? (
            <>
              <div className="practice-topline"><Button variant="ghost" className="back-button" disabled={busy} onClick={() => setScreen('home')}><ArrowLeft />練習總覽</Button><Badge variant="outline">{active.mode === 'wrong' ? '錯題複習' : '五題練習'}</Badge></div>
              <div className="round-progress"><div><span className="eyebrow">第 {index + 1} 題 / 共 {active.items.length} 題</span><span className="text-sm text-muted-foreground">已作答 {answered} 題</span></div><Progress value={answered / active.items.length * 100} aria-label="本輪作答進度" /><nav aria-label="本輪題目" className="question-steps">{active.items.map((entry, entryIndex) => <Button key={entry.question.id} variant={entryIndex === index ? 'default' : 'outline'} size="sm" aria-label={`第 ${entryIndex + 1} 題${entry.grade ? entry.grade.correct ? '，答對' : '，答錯' : '，未作答'}`} aria-current={entryIndex === index ? 'step' : undefined} disabled={busy || (!entry.grade && entryIndex !== resumeIndex(active))} onClick={() => viewQuestion(entryIndex)} className={entryIndex !== index && entry.grade ? entry.grade.correct ? 'step-correct' : 'step-incorrect' : ''}>{entry.grade && (entry.grade.correct ? <Check /> : <X />)}{entryIndex + 1}</Button>)}</nav></div>
              <Card className="question-card"><CardHeader><div className="question-meta"><Badge variant="secondary">{exam?.level}</Badge><span>{exam?.subject}</span><span>{exam?.year} 年 · 第 {exam?.session} 次 · 原題 {item.question.number}</span></div><h1 className="question-stem" tabIndex={-1} ref={headingRef}>{item.question.stem}</h1></CardHeader><CardContent>
                {item.question.images.length > 0 && <div className="question-images"><p className="image-caption"><ExternalLink size={13} />原題圖表與版面 · 點圖可放大閱讀</p>{item.question.images.map((source, imageIndex) => <a key={source} href={source} target="_blank" rel="noreferrer" aria-label={`開啟原題圖 ${imageIndex + 1}，另開分頁`}><Image src={source} alt={`第 ${item.question.number} 題原題圖 ${imageIndex + 1}`} width={1600} height={1000} unoptimized className="source-image" /></a>)}</div>}
                <fieldset><legend className="answer-legend">{item.grade ? '作答結果' : '選擇你的答案'}</legend><RadioGroup aria-label="答案選項" value={item.grade?.choice ?? choice} onValueChange={setChoice} disabled={Boolean(item.grade) || busy} className="answer-options">{Object.entries(item.question.options).map(([key, text]) => <label className={`answer-option ${!item.grade && choice === key ? 'selected' : ''} ${item.grade?.answer === key ? 'answer-correct' : item.grade?.choice === key ? 'answer-incorrect' : ''}`} key={key} htmlFor={`answer-${item.question.id}-${key}`}><RadioGroupItem id={`answer-${item.question.id}-${key}`} value={key} /><span className="option-key">{key}</span><span className="option-text">{text.trim() || '圖示選項，請參照原題影像'}</span>{item.grade?.answer === key ? <span className="option-result"><Check size={15} />公告答案</span> : item.grade?.choice === key ? <span className="option-result"><X size={15} />你的答案</span> : null}</label>)}</RadioGroup></fieldset>
                {!item.grade && <div className="answer-footer"><p><CircleHelp size={15} />選定後送出，即可查看完整詳解。</p><Button size="lg" disabled={!choice || busy} onClick={() => send({ action: 'answer', sessionId: active.id, questionId: item.question.id, choice })}>{busy ? <LoaderCircle className="animate-spin" /> : <Check />} {busy ? '正在儲存作答' : error ? '重新送出答案' : '送出答案'}</Button></div>}
              </CardContent></Card>
              {item.grade && <section className="explanation-section" aria-label="作答詳解"><div className={`grade-banner ${item.grade.correct ? 'correct' : 'incorrect'}`} role="status"><span className="result-icon">{item.grade.correct ? <Check size={20} /> : <X size={20} />}</span><div><strong>{item.grade.correct ? '答對' : '答錯，已加入錯題複習'}</strong><p>你的答案 {item.grade.choice} · 公告答案 {item.grade.answer}{!item.grade.correct && ' · 已加入錯題複習'}</p></div></div><Card className="explanation-card"><CardHeader><div className="section-label"><Sparkles size={18} /><span>完整詳解</span></div><CardTitle>公告答案 {item.grade.answer} 的判斷依據</CardTitle></CardHeader><CardContent><>{item.grade.explanation.caveat && <aside className="answer-caveat" aria-label="題目疑義"><strong>公告答案與題目疑義</strong><p>{item.grade.explanation.caveat}</p></aside>}<p className="explanation-text">{item.grade.explanation.reasoning}</p></><h3>逐項解析</h3><div className="option-analyses">{Object.entries(item.question.options).map(([key]) => <div className="option-analysis" key={key}><Badge variant={item.grade?.answer === key ? 'default' : 'outline'}>{key}</Badge><p>{item.grade?.explanation.options[key] ?? '本選項尚未提供解析。'}</p></div>)}</div><div className="concept-grid"><div><h3><BookOpen size={16} />核心觀念</h3><p>{item.grade.explanation.concept}</p></div><div><h3><CircleHelp size={16} />常見陷阱</h3><p>{item.grade.explanation.pitfalls}</p></div></div>{item.grade.explanationImages.length > 0 && <div className="explanation-images"><h3>補充圖解</h3>{item.grade.explanationImages.map((source, imageIndex) => <a href={source} target="_blank" rel="noreferrer" key={source}><Image src={source} alt={`答案補充圖解 ${imageIndex + 1}`} width={1600} height={1000} unoptimized className="source-image" /></a>)}</div>}<div className="sources-block"><h3>參考來源</h3><div className="source-links">{item.grade.explanation.sources.map(source => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={13} /></a>)}{exam && <Button variant="outline" size="sm" asChild><a href={paperUrl(`${exam.id}.pdf`, item.question.pages[0] ?? 1)} target="_blank" rel="noreferrer"><BookOpen />{exam.source.split('/').pop()} · 第 {item.question.pages.join('、')} 頁<ExternalLink /></a></Button>}</div><p className="source-caveat">作答依試卷公告答案計分；解析另附資料來源與題目疑義。</p></div></CardContent></Card><div className="next-question"><span>{active.completed ? '本輪作答已全部儲存。' : '作答已儲存，隨時可以接著練習。'}</span><Button size="lg" onClick={() => active.completed && index === active.items.length - 1 ? setScreen('summary') : viewQuestion(active.items[index + 1] ? index + 1 : resumeIndex(active))}>{active.completed && index === active.items.length - 1 ? '查看本輪成果' : '下一題'}<ArrowRight /></Button></div>{active.completed && index !== active.items.length - 1 && <Button variant="link" onClick={() => setScreen('summary')}>查看本輪成果<ArrowRight /></Button>}</section>}
            </>
          ) : null}
          <footer className="app-footer"><span>iPAS 自習室</span><span>歷屆試題練習 · 個人學習用途</span></footer>
        </main>
      </div>

      <Dialog open={importOpen} onOpenChange={open => !busy && setImportOpen(open)}><DialogContent><DialogHeader><DialogTitle>匯入 24 筆既有作答紀錄？</DialogTitle><DialogDescription className="leading-7">這些紀錄會加入目前登入帳號的練習進度，並更新統計與錯題清單。每個帳號只會匯入一次。</DialogDescription></DialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><DialogClose asChild><Button variant="outline" disabled={busy}>先不要</Button></DialogClose><Button disabled={busy} onClick={async () => { const data = await send({ action: 'import' }); if (data) setImportOpen(false); }}>{busy ? <LoaderCircle className="animate-spin" /> : <ArrowDownToLine />}{busy ? '正在匯入' : '確認匯入'}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
