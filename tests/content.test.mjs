import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { lessons, futureModules } from '../src/data/lessons.js';
import { questions } from '../src/data/questions.js';
import { makeTrace } from '../src/algorithms.js';
import { checkAnswer } from '../src/state.js';

test('12 课、36 题与前置依赖有效，教材页码指向已知版本', () => {
  assert.equal(lessons.length, 12);
  assert.equal(lessons.flatMap(l => l.quiz).length, 36);
  const seen = new Set(), questionIds = new Set(), methods = new Set();
  for (const lesson of lessons) {
    assert.ok(!seen.has(lesson.id));
    for (const prerequisite of lesson.prerequisites) assert.ok(seen.has(prerequisite), `${lesson.id} prerequisite ${prerequisite}`);
    seen.add(lesson.id);
    assert.ok(lesson.objectives.length >= 3);
    assert.ok(lesson.sections.length >= 3);
    assert.equal(lesson.quiz.length, 3);
    assert.ok(lesson.source.note.includes('原创') || lesson.source.note.includes('辅助'));
    assert.deepEqual(lesson.source.pdfPages, lesson.source.bookPages.map(n => n + 6));
    assert.ok(lesson.source.pdfPages.every(n => n > 0 && n <= 376));
    assert.equal(lesson.java.method, lesson.challenge.javaMethod);
    assert.ok(lesson.java.code.includes(` ${lesson.java.method}(`));
    assert.ok(!methods.has(lesson.java.method)); methods.add(lesson.java.method);
    const frames = makeTrace(lesson.simulation.kind, lesson.simulation.values, lesson.simulation.target);
    assert.ok(frames.length > 1);
    assert.notEqual(frames.at(-1).result, undefined);
    for (const question of lesson.quiz) {
      assert.ok(!questionIds.has(question.id)); questionIds.add(question.id);
      assert.ok(question.hints.length >= 2);
      assert.ok(question.explanation && question.misconception);
      if (question.type === 'choice') {
        assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length);
        assert.ok(checkAnswer(question, question.answer));
      } else for (const answer of question.answer) assert.ok(checkAnswer(question, answer));
    }
  }
  assert.equal(futureModules.length, 7);
});

test('题单48题去重，首版8题，阶段与依赖不混淆', () => {
  assert.equal(questions.length, 48);
  assert.equal(new Set(questions.map(q => q.id)).size, 48);
  assert.equal(questions.filter(q => q.stage === 'ready').length, 8);
  assert.equal(questions.filter(q => q.difficulty === '简单').length, 32);
  const ids = new Set(lessons.map(l => l.id));
  for (const q of questions) {
    assert.match(q.url, /^https:\/\/leetcode\.cn\/problems\/[a-z0-9-]+\/(?:description\/)?$/);
    assert.ok(q.prerequisites.every(id => ids.has(id)));
    assert.equal(q.stage === 'planned', q.futurePrerequisites.length > 0);
    assert.ok(q.title && q.summary && q.hint && q.verification);
  }
});

test('下载的 Java 方法与课程源代码一致', async () => {
  const source = await readFile(new URL('../java/AlgorithmLab.java', import.meta.url), 'utf8');
  for (const lesson of lessons) assert.ok(source.includes(lesson.java.code.split('\n').map(line => `    ${line}`).join('\n')));
});
