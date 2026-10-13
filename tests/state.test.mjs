import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState, checkAnswer, lessonResult, touchLesson, recordHelp,
  submitAnswer, resetRound, dueLessons, stats, validateBackup,
} from '../src/state.js';

const DAY = 86_400_000;
const START = Date.parse('2026-10-13T02:00:00.000Z');
const iso = time => new Date(time).toISOString();
const choice = { id: 'sample-1', type: 'choice', answer: 1, hints: ['先看范围', '再看边界'] };
const fill = { id: 'sample-2', type: 'fill', answer: ['i < nums.length', 'nums.length > i'], hints: ['下标从零开始'] };
const lesson = { id: 'sample', quiz: [choice, fill] };
const lessons = [lesson];
const problems = [{ id: 704 }];
const fresh = () => createState(START);
const answerAll = (state, now = START) => {
  submitAnswer(state, lesson, choice, '1', now);
  return submitAnswer(state, lesson, fill, 'i < nums.length', now);
};
const clone = value => JSON.parse(JSON.stringify(value));
const valid = state => validateBackup(clone(state), lessons, problems);

test('阅读、访问与练习掌握分别计算', () => {
  const state = fresh();
  touchLesson(state, lesson.id, START);
  assert.equal(state.lastLesson, lesson.id);
  assert.deepEqual(stats(state, lessons, START), { read: 0, passed: 0, independent: 0, due: 0 });
  state.lessons[lesson.id].readAt = iso(START);
  assert.deepEqual(stats(state, lessons, START), { read: 1, passed: 0, independent: 0, due: 0 });
  answerAll(state);
  assert.deepEqual(stats(state, lessons, START), { read: 1, passed: 1, independent: 1, due: 0 });
  const unread = fresh();
  answerAll(unread);
  assert.equal(stats(unread, lessons, START).read, 0);
});

test('答案检查支持填空空白与候选，不把错误选项视为正确', () => {
  assert.equal(checkAnswer(choice, 1), true);
  assert.equal(checkAnswer(choice, '0'), false);
  assert.equal(checkAnswer(fill, '  i  <\n nums.length '), true);
  assert.equal(checkAnswer(fill, 'nums.length > i'), true);
  assert.equal(checkAnswer(fill, 'i <= nums.length'), false);
});

test('错误安排立即复习，纠正后清除当前错误但保留累计尝试', () => {
  const state = fresh();
  const wrong = submitAnswer(state, lesson, choice, '0', START);
  assert.equal(wrong.correct, false);
  assert.equal(state.exercises[choice.id].attempts, 1);
  assert.equal(state.lessons[lesson.id].errorReview, true);
  assert.deepEqual(dueLessons(state, lessons, START), [lesson]);
  answerAll(state, START + 1);
  assert.equal(state.exercises[choice.id].correct, true);
  assert.equal(state.exercises[choice.id].attempts, 2);
  assert.equal(state.lessons[lesson.id].errorReview, false);
  assert.equal(state.lessons[lesson.id].nextReviewAt, iso(START + 1 + DAY));
});

test('使用提示或查看答案可答对，但不能记为独立完成', () => {
  for (const reveal of [false, true]) {
    const state = fresh();
    recordHelp(state, choice, reveal, START);
    answerAll(state);
    assert.equal(lessonResult(state, lesson).allCorrect, true);
    assert.equal(lessonResult(state, lesson).independent, false);
    assert.equal(stats(state, lessons, START).independent, 0);
  }
  const state = fresh();
  for (let i = 0; i < 5; i++) recordHelp(state, choice, false, START);
  assert.equal(state.exercises[choice.id].hints, choice.hints.length);
  assert.equal(lessonResult(state, lesson).answered, 0);
});

test('本轮答错后订正只算练习通过，重新开始后可恢复独立通过', () => {
  const state = fresh();
  submitAnswer(state, lesson, choice, '0', START);
  submitAnswer(state, lesson, choice, '2', START + 1);
  answerAll(state, START + 2);
  assert.equal(state.exercises[choice.id].mistakes, 2);
  assert.equal(lessonResult(state, lesson).allCorrect, true);
  assert.equal(lessonResult(state, lesson).independent, false);
  assert.equal(state.lessons[lesson.id].independent, false);
  assert.equal(stats(state, lessons, START + 2).passed, 1);
  assert.equal(stats(state, lessons, START + 2).independent, 0);
  const restored = valid(state);
  assert.deepEqual(restored, state);
  assert.equal(restored.exercises[choice.id].mistakes, 2);
  assert.equal(lessonResult(restored, lesson).independent, false);
  resetRound(restored, lesson, START + 3);
  assert.equal(restored.exercises[choice.id].mistakes ?? 0, 0);
  answerAll(restored, START + 4);
  assert.equal(lessonResult(restored, lesson).independent, true);
  assert.equal(restored.exercises[choice.id].attempts, 4);
  assert.deepEqual(valid(restored), restored);
});

test('首次全对安排一天后复习，未到期重复提交不推进间隔', () => {
  const state = fresh();
  answerAll(state);
  assert.equal(state.lessons[lesson.id].reviewLevel, 0);
  assert.equal(state.lessons[lesson.id].nextReviewAt, iso(START + DAY));
  assert.equal(state.lessons[lesson.id].completedAt, iso(START));
  answerAll(state, START + DAY - 1);
  assert.equal(state.lessons[lesson.id].reviewLevel, 0);
  assert.equal(state.lessons[lesson.id].nextReviewAt, iso(START + DAY));
  assert.equal(dueLessons(state, lessons, START + DAY - 1).length, 0);
  assert.equal(dueLessons(state, lessons, START + DAY).length, 1);
});

test('到期重开一轮后全对，下一次为三天后，继续按七天与十四天推进', () => {
  const state = fresh();
  answerAll(state);
  let time = START + DAY;
  for (const [level, interval] of [[1, 3], [2, 7], [3, 14], [3, 14]]) {
    resetRound(state, lesson, time);
    assert.equal(lessonResult(state, lesson).allCorrect, false);
    answerAll(state, time);
    assert.equal(state.lessons[lesson.id].reviewLevel, level);
    assert.equal(state.lessons[lesson.id].nextReviewAt, iso(time + interval * DAY));
    time += interval * DAY;
  }
});

test('到期后的单题提交不能沿用上轮其余答案推进复习', () => {
  const state = fresh();
  answerAll(state);
  const due = START + DAY;
  submitAnswer(state, lesson, choice, '1', due);
  assert.equal(state.lessons[lesson.id].reviewLevel, 0);
  assert.equal(state.lessons[lesson.id].nextReviewAt, iso(due));
  submitAnswer(state, lesson, fill, 'i < nums.length', due + 1);
  assert.equal(state.lessons[lesson.id].reviewLevel, 1);
  assert.equal(state.lessons[lesson.id].nextReviewAt, iso(due + 1 + 3 * DAY));
});

test('复习答错后重新答对保持原间隔级别，不因纠错晋级', () => {
  const state = fresh();
  answerAll(state);
  const due = START + DAY;
  resetRound(state, lesson, due);
  submitAnswer(state, lesson, choice, '0', due);
  assert.equal(state.lessons[lesson.id].errorReview, true);
  submitAnswer(state, lesson, fill, 'i < nums.length', due + 1);
  submitAnswer(state, lesson, choice, '1', due + 2);
  assert.equal(state.lessons[lesson.id].reviewLevel, 0);
  assert.equal(state.lessons[lesson.id].nextReviewAt, iso(due + 2 + DAY));
  assert.equal(state.lessons[lesson.id].errorReview, false);
});

test('resetRound 清除本轮答案和帮助记录，保留累计尝试与阅读', () => {
  const state = fresh();
  touchLesson(state, lesson.id, START);
  state.lessons[lesson.id].readAt = iso(START);
  recordHelp(state, choice, false, START);
  answerAll(state);
  resetRound(state, lesson, START + 1000);
  for (const question of lesson.quiz) {
    assert.deepEqual(state.exercises[question.id], { attempts: 1, hints: 0, revealed: false });
  }
  assert.equal(state.lessons[lesson.id].readAt, iso(START));
  assert.equal(state.lessons[lesson.id].independent, false);
  assert.deepEqual(lessonResult(state, lesson), { answered: 0, correct: 0, total: 2, allCorrect: false, independent: false });
  answerAll(state, START + 1001);
  assert.equal(lessonResult(state, lesson).independent, true);
  assert.equal(state.exercises[choice.id].attempts, 2);
  assert.equal(state.lessons[lesson.id].reviewLevel, 0);
});

test('有效备份完整往返，返回对象不共享原备份引用', () => {
  const state = fresh();
  touchLesson(state, lesson.id, START);
  state.lessons[lesson.id].readAt = iso(START);
  answerAll(state);
  state.notes[lesson.id] = '<script>只是笔记文本</script>';
  state.problems['704'] = { status: 'trying', updatedAt: iso(START) };
  const restored = valid(state);
  assert.deepEqual(restored, state);
  restored.notes[lesson.id] = 'changed';
  restored.lessons[lesson.id].independent = false;
  assert.notEqual(restored.notes[lesson.id], state.notes[lesson.id]);
  assert.equal(state.lessons[lesson.id].independent, true);
  assert.deepEqual(valid(fresh()), fresh());
});

test('备份拒绝未知课程、练习、题目、笔记与最后课程', () => {
  const mutations = [
    s => { s.lessons.unknown = {}; },
    s => { s.exercises.unknown = {}; },
    s => { s.problems['999999'] = { status: 'done', updatedAt: iso(START) }; },
    s => { s.notes.unknown = 'text'; },
    s => { s.lastLesson = 'unknown'; },
  ];
  for (const mutate of mutations) {
    const state = fresh(); mutate(state);
    assert.throws(() => valid(state), Error);
  }
});

test('备份拒绝 JSON 原型字段和任意额外字段，不污染对象原型', () => {
  for (const key of ['__proto__', 'constructor', 'prototype']) {
    for (const path of ['root', 'lessons', 'lesson', 'exercise']) {
      const state = fresh();
      state.lessons[lesson.id] = {};
      state.exercises[choice.id] = {};
      const target = path === 'root' ? state : path === 'lessons' ? state.lessons : path === 'lesson' ? state.lessons[lesson.id] : state.exercises[choice.id];
      Object.defineProperty(target, key, { value: { polluted: true }, enumerable: true });
      assert.throws(() => valid(state), Error, `${path}.${key}`);
    }
  }
  assert.equal({}.polluted, undefined);
  const state = fresh();
  state.unexpected = 'value';
  assert.throws(() => valid(state), Error);
});

test('备份拒绝坏版本、坏日期、坏类型、越界数值与伪造答案结果', () => {
  const mutations = [
    s => { s.version = 2; },
    s => { s.version = '1'; },
    s => { s.lessons = []; },
    s => { s.updatedAt = 'not-a-date'; },
    s => { s.updatedAt = 0; },
    s => { s.lessons[lesson.id] = { readAt: 'tomorrow' }; },
    s => { s.lessons[lesson.id] = { independent: 1 }; },
    s => { s.lessons[lesson.id] = { reviewLevel: -1 }; },
    s => { s.lessons[lesson.id] = { reviewLevel: 4 }; },
    s => { s.exercises[choice.id] = { answer: '0', correct: true }; },
    s => { s.exercises[choice.id] = { answer: '1', correct: false }; },
    s => { s.exercises[choice.id] = { correct: true }; },
    s => { s.exercises[choice.id] = { answeredAt: iso(START) }; },
    s => { s.exercises[choice.id] = { hints: 3 }; },
    s => { s.exercises[choice.id] = { hints: 0.5 }; },
    s => { s.exercises[choice.id] = { attempts: -1 }; },
    s => { s.exercises[choice.id] = { attempts: 1_000_001 }; },
    s => { s.exercises[choice.id] = { mistakes: -1 }; },
    s => { s.exercises[choice.id] = { mistakes: 0.5 }; },
    s => { s.exercises[choice.id] = { mistakes: '1' }; },
    s => { s.exercises[choice.id] = { revealed: 'yes' }; },
    s => { s.exercises[choice.id] = { answer: 'x'.repeat(1001) }; },
    s => { s.problems['704'] = { status: 'passed', updatedAt: iso(START) }; },
    s => { s.notes[lesson.id] = 'x'.repeat(10001); },
    s => { s.notes[lesson.id] = {}; },
  ];
  for (const mutate of mutations) {
    const state = fresh(); mutate(state);
    assert.throws(() => valid(state), Error);
  }
  for (const input of [null, [], 'text']) assert.throws(() => validateBackup(input, lessons, problems), Error);
});
