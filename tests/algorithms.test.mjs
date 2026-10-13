import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTrace, parseTarget, parseValues } from '../src/algorithms.js';

const finish = (kind, values, target) => makeTrace(kind, values, target).at(-1).result;

function* permutations(values) {
  if (!values.length) { yield []; return; }
  for (let i = 0; i < values.length; i++) {
    for (const tail of permutations(values.filter((_, index) => index !== i))) {
      yield [values[i], ...tail];
    }
  }
}

function* sequences(alphabet, maxLength, prefix = []) {
  yield prefix;
  if (prefix.length === maxLength) return;
  for (const value of alphabet) yield* sequences(alphabet, maxLength, [...prefix, value]);
}

test('输入解析支持中文逗号、空格、负数和空数组', () => {
  assert.deepEqual(parseValues('  -99， 0, 7\n99 '), [-99, 0, 7, 99]);
  assert.deepEqual(parseValues(' \t\n'), []);
  assert.equal(parseTarget(' -99 '), -99);
  assert.equal(parseTarget('0'), 0);
  assert.equal(parseTarget('99'), 99);
});

test('输入解析拒绝小数、科学计数、非数值、越界与过长数据', () => {
  for (const value of ['1.5', '1e2', '0x10', 'NaN', 'Infinity', '1 abc', '100', '-100', '1,']) {
    assert.throws(() => parseValues(value), Error, value);
  }
  assert.throws(() => parseValues(Array(13).fill('1').join(',')), /12/);
  for (const value of ['', ' ', '1.5', '1e2', 'NaN', 'Infinity', '100', '-100']) {
    assert.throws(() => parseTarget(value), Error, value);
  }
  for (const value of [null, {}, '1,2', [NaN], [1.5], [100], Array(13).fill(0)]) {
    assert.throws(() => makeTrace('sum', value), /演示数据/);
  }
  assert.throws(() => makeTrace('missing-kind', [1]), /没有找到/);
});

for (const kind of ['selection', 'bubble', 'insertion']) {
  test(`${kind}：检查 5 元素全部 120 种排列`, () => {
    let cases = 0;
    for (const values of permutations([-2, -1, 0, 1, 2])) {
      assert.deepEqual(finish(kind, values), [-2, -1, 0, 1, 2], values.join(','));
      cases++;
    }
    assert.equal(cases, 120);
  });

  test(`${kind}：检查空数组、负数、重复值与长度不超过 4 的所有三值序列`, () => {
    let cases = 0;
    for (const values of sequences([-1, 0, 1], 4)) {
      assert.deepEqual(finish(kind, values), [...values].sort((a, b) => a - b));
      cases++;
    }
    assert.equal(cases, 121);
  });
}

test('演示保留独立历史快照，不修改调用者输入或共享每帧数组', () => {
  for (const kind of ['selection', 'bubble', 'insertion', 'moveZeroes', 'sum', 'linear', 'max']) {
    const input = [3, 0, -2, 3];
    const original = [...input];
    const frames = makeTrace(kind, input, -2);
    assert.deepEqual(input, original, kind);
    assert.deepEqual(frames[0].values, original, kind);
    for (const key of ['values', 'variables', 'active', 'sorted']) {
      assert.equal(new Set(frames.map(frame => frame[key])).size, frames.length, `${kind}: ${key}`);
    }
    const firstSnapshot = structuredClone(frames[0]);
    input[0] = 88;
    frames.at(-1).values[0] = 77;
    frames.at(-1).variables.changedByTest = true;
    assert.deepEqual(frames[0], firstSnapshot, kind);
    for (const frame of frames) {
      for (const key of ['comparisons', 'reads', 'writes']) {
        assert(Number.isInteger(frame[key]) && frame[key] >= 0, `${kind}: ${key}`);
      }
    }
  }
});

test('求和、访问计数、最大值与数组访问处理边界', () => {
  assert.equal(finish('sum', []), 0);
  assert.equal(finish('sum', [-3, -2, 5]), 0);
  assert.equal(finish('count', []), 0);
  assert.equal(finish('count', [7, 7, 7]), 3);
  assert.equal(finish('max', [-9, -3, -3, -7]), -3);
  assert.equal(finish('max', [0]), 0);
  assert.throws(() => makeTrace('max', []), /空数组/);
  assert.equal(finish('array', [4, -2], 0), 4);
  assert.equal(finish('array', [4, -2], 1), -2);
  for (const target of [-1, 2, 1.5]) assert.throws(() => makeTrace('array', [4, -2], target), /下标/);
  assert.throws(() => makeTrace('array', [], 0), /空数组/);
});

test('顺序查找返回首次匹配并处理不存在与空数组', () => {
  assert.equal(finish('linear', [5, -2, -2], -2), 1);
  assert.equal(finish('linear', [5, -2], 9), -1);
  assert.equal(finish('linear', [], 0), -1);
});

test('二分查找与插入边界在小规模有序序列上符合定义', () => {
  for (const sequence of sequences([-2, 0, 2], 4)) {
    const values = [...sequence].sort((a, b) => a - b);
    for (let target = -3; target <= 3; target++) {
      const found = finish('binary', values, target);
      if (values.includes(target)) {
        assert(found >= 0 && found < values.length);
        assert.equal(values[found], target);
      } else assert.equal(found, -1);
      const expected = values.findIndex(value => value >= target);
      assert.equal(finish('boundary', values, target), expected === -1 ? values.length : expected);
    }
  }
});

test('二分要求有序输入，重复值可查，插入点允许为数组长度', () => {
  for (const kind of ['binary', 'boundary']) {
    const values = [3, 1, 2];
    assert.throws(() => makeTrace(kind, values, 2), /有序/);
    assert.deepEqual(values, [3, 1, 2]);
  }
  assert.equal(finish('boundary', [1, 2, 2, 2, 3], 2), 1);
  assert.equal(finish('boundary', [1, 2, 3], 4), 3);
  assert.equal(finish('boundary', [1, 2, 3], 0), 0);
  assert.equal(finish('boundary', [], 4), 0);
  assert.equal(finish('binary', [], 4), -1);
});

test('移动零保持非零元素相对顺序，覆盖全零、无零和空数组', () => {
  for (const values of sequences([-1, 0, 1], 5)) {
    const nonzero = values.filter(value => value !== 0);
    const expected = [...nonzero, ...Array(values.length - nonzero.length).fill(0)];
    assert.deepEqual(finish('moveZeroes', values), expected);
  }
});
