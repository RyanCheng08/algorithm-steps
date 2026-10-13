export const STORAGE_KEY = 'algo-steps-v1';
const DAY = 86400000;
const INTERVALS = [1, 3, 7, 14];
export const createState = (now = Date.now()) => ({ version: 1, lessons: {}, exercises: {}, problems: {}, notes: {}, lastLesson: null, updatedAt: new Date(now).toISOString() });
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const iso = now => new Date(now).toISOString();
export const normalizeAnswer = value => String(value ?? '').trim().replace(/\s+/g, ' ');

export function checkAnswer(question, answer) {
  if (question.type === 'choice') return String(answer) === String(question.answer);
  const accepted = Array.isArray(question.answer) ? question.answer : [question.answer];
  return accepted.some(value => normalizeAnswer(value).replace(/\s/g, '') === normalizeAnswer(answer).replace(/\s/g, ''));
}

export function lessonResult(state, lesson) {
  const answered = lesson.quiz.filter(q => state.exercises[q.id]?.answeredAt);
  const correct = lesson.quiz.filter(q => state.exercises[q.id]?.correct);
  const allCorrect = correct.length === lesson.quiz.length;
  const independent = allCorrect && lesson.quiz.every(q => !state.exercises[q.id].hints && !state.exercises[q.id].revealed && !state.exercises[q.id].mistakes);
  return { answered: answered.length, correct: correct.length, total: lesson.quiz.length, allCorrect, independent };
}

export function touchLesson(state, id, now = Date.now()) {
  state.lastLesson = id;
  state.lessons[id] = { ...state.lessons[id], lastSeenAt: iso(now) };
  state.updatedAt = iso(now);
}

export function recordHelp(state, question, reveal = false, now = Date.now()) {
  const previous = state.exercises[question.id] ?? {};
  state.exercises[question.id] = { ...previous, hints: Math.min(question.hints.length, (previous.hints ?? 0) + (reveal ? 0 : 1)), revealed: reveal || !!previous.revealed };
  state.updatedAt = iso(now);
}

export function submitAnswer(state, lesson, question, answer, now = Date.now()) {
  const correct = checkAnswer(question, answer);
  const previous = state.exercises[question.id] ?? {};
  state.exercises[question.id] = { ...previous, answer: String(answer), correct, attempts: (previous.attempts ?? 0) + 1, mistakes: (previous.mistakes ?? 0) + (correct ? 0 : 1), hints: previous.hints ?? 0, revealed: !!previous.revealed, answeredAt: iso(now) };
  const progress = state.lessons[lesson.id] ?? {};
  if (!correct) {
    progress.nextReviewAt = iso(now);
    progress.errorReview = true;
  }
  state.lessons[lesson.id] = progress;
  const result = lessonResult(state, lesson);
  if (result.allCorrect) {
    const first = !progress.completedAt;
    const due = progress.nextReviewAt && Date.parse(progress.nextReviewAt) <= now;
    const freshReview = due && lesson.quiz.every(q => Date.parse(state.exercises[q.id]?.answeredAt || '') >= Date.parse(progress.nextReviewAt));
    if (first || (due && (progress.errorReview || freshReview))) {
      const level = first ? 0 : Math.min(3, (progress.reviewLevel ?? 0) + (progress.errorReview ? 0 : 1));
      progress.reviewLevel = level;
      progress.nextReviewAt = iso(now + INTERVALS[level] * DAY);
      progress.lastReviewedAt = iso(now);
      progress.errorReview = false;
    }
    progress.completedAt = progress.completedAt || iso(now);
    progress.independent = result.independent;
  } else progress.independent = false;
  state.updatedAt = iso(now);
  return { ...result, correctCount: result.correct, correct };
}

export function resetRound(state, lesson, now = Date.now()) {
  for (const q of lesson.quiz) {
    state.exercises[q.id] = { attempts: state.exercises[q.id]?.attempts ?? 0, hints: 0, revealed: false };
  }
  if (state.lessons[lesson.id]) state.lessons[lesson.id].independent = false;
  state.updatedAt = iso(now);
}

export function dueLessons(state, lessons, now = Date.now()) {
  return lessons.filter(l => state.lessons[l.id]?.nextReviewAt && Date.parse(state.lessons[l.id].nextReviewAt) <= now);
}

export function stats(state, lessons, now = Date.now()) {
  return {
    read: lessons.filter(l => state.lessons[l.id]?.readAt).length,
    passed: lessons.filter(l => lessonResult(state, l).allCorrect).length,
    independent: lessons.filter(l => lessonResult(state, l).independent).length,
    due: dueLessons(state, lessons, now).length,
  };
}

// Construct a fresh allowlisted object; never merge arbitrary backup keys into state.
export function validateBackup(input, lessons, problems) {
  if (!isObject(input) || input.version !== 1) throw new Error('备份版本不受支持，请选择本站导出的 JSON 文件。');
  const lessonIds = new Set(lessons.map(l => l.id));
  const exerciseMap = new Map(lessons.flatMap(l => l.quiz.map(q => [q.id, q])));
  const problemIds = new Set(problems.map(p => String(p.id)));
  const output = createState();
  const error = () => { throw new Error('备份字段不完整或包含无效记录，未修改现有数据。'); };
  const date = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT/.test(value) || !Number.isFinite(Date.parse(value))) error();
    return value;
  };
  const number = (value, max) => { if (!Number.isInteger(value) || value < 0 || value > max) error(); return value; };
  const boolean = value => { if (typeof value !== 'boolean') error(); return value; };
  const allowed = (value, fields) => { if (!isObject(value) || Object.keys(value).some(k => !fields.includes(k))) error(); };
  allowed(input, ['version', 'lessons', 'exercises', 'problems', 'notes', 'lastLesson', 'updatedAt']);
  for (const key of ['lessons', 'exercises', 'problems', 'notes']) if (!isObject(input[key])) error();
  for (const [id, record] of Object.entries(input.lessons)) {
    if (!lessonIds.has(id)) error();
    allowed(record, ['readAt', 'lastSeenAt', 'completedAt', 'independent', 'nextReviewAt', 'reviewLevel', 'lastReviewedAt', 'challengeDone', 'errorReview']);
    const clean = {};
    for (const [key, value] of Object.entries(record)) {
      if (key.endsWith('At')) clean[key] = value === null ? null : date(value);
      else if (key === 'reviewLevel') clean[key] = number(value, 3);
      else clean[key] = boolean(value);
    }
    output.lessons[id] = clean;
  }
  for (const [id, record] of Object.entries(input.exercises)) {
    const question = exerciseMap.get(id);
    if (!question) error();
    allowed(record, ['answer', 'correct', 'hints', 'revealed', 'attempts', 'mistakes', 'answeredAt']);
    const clean = {};
    if ('answer' in record) {
      if (typeof record.answer !== 'string' || record.answer.length > 1000) error();
      clean.answer = record.answer;
    }
    if ('correct' in record) {
      clean.correct = boolean(record.correct);
      if (!('answer' in clean) || clean.correct !== checkAnswer(question, clean.answer)) error();
    }
    if ('hints' in record) clean.hints = number(record.hints, question.hints.length);
    if ('revealed' in record) clean.revealed = boolean(record.revealed);
    if ('attempts' in record) clean.attempts = number(record.attempts, 1000000);
    if ('mistakes' in record) clean.mistakes = number(record.mistakes, 1000000);
    if ('answeredAt' in record) clean.answeredAt = date(record.answeredAt);
    if (clean.answeredAt && (!('correct' in clean) || !('answer' in clean))) error();
    output.exercises[id] = clean;
  }
  for (const [id, record] of Object.entries(input.problems)) {
    if (!problemIds.has(id)) error();
    allowed(record, ['status', 'updatedAt']);
    if (!['unstarted', 'trying', 'done'].includes(record.status)) error();
    output.problems[id] = { status: record.status, updatedAt: date(record.updatedAt) };
  }
  for (const [id, note] of Object.entries(input.notes)) {
    if (!lessonIds.has(id) || typeof note !== 'string' || note.length > 10000) error();
    output.notes[id] = note;
  }
  if (input.lastLesson !== null && !lessonIds.has(input.lastLesson)) error();
  output.lastLesson = input.lastLesson;
  output.updatedAt = date(input.updatedAt);
  return output;
}
