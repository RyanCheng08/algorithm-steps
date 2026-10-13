import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const run = promisify(execFile);
const sources = [
  'index.html', 'assets/styles.css', 'src/app.js', 'src/algorithms.js',
  'src/state.js', 'src/data/lessons.js', 'src/data/questions.js',
  'java/AlgorithmLab.java', 'java/AlgorithmLabTest.java',
];

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'algorithm-steps-build-'));
  t.after(async () => {
    // The target is the exact mkdtemp result inside the system temp directory.
    assert.equal(path.dirname(root), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith('algorithm-steps-build-'));
    await rm(root, { recursive: true, force: true });
  });
  for (const name of [...sources, 'scripts/build-site.mjs']) {
    const filename = path.join(root, name);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, await readFile(new URL(`../${name}`, import.meta.url)));
  }
  return root;
}

async function snapshot(root, prefix = '') {
  const entries = await readdir(path.join(root, prefix), { withFileTypes: true });
  const files = {};
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(files, await snapshot(root, relative));
    else files[relative] = (await readFile(path.join(root, relative))).toString('base64');
  }
  return files;
}

function build(root) {
  // The build resolves its own project, independently of the current directory.
  return run(process.execPath, [path.join(root, 'scripts/build-site.mjs')], { cwd: tmpdir() });
}

test('静态发布只包含允许文件，排除教材、服务脚本和本地资料', async t => {
  const root = await fixture(t);
  for (const name of ['.env', 'textbook.pdf', 'src/private-notes.json', 'assets/private.pdf', 'scripts/serve.mjs', 'tmp/secret.txt', 'docs/internal.md']) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), 'PRIVATE_SENTINEL');
  }
  await build(root);
  const actual = await snapshot(path.join(root, 'dist'));
  assert.deepEqual(Object.keys(actual).sort(), [...sources, 'api/textbook', '.nojekyll'].sort());
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'dist/api/textbook'), 'utf8')), { available: false });
  for (const name of sources) {
    assert.deepEqual(await readFile(path.join(root, 'dist', name)), await readFile(path.join(root, name)));
  }
  assert.ok(Object.values(actual).every(content => !Buffer.from(content, 'base64').toString().includes('PRIVATE_SENTINEL')));
});

test('重复构建保持内容相同、删除过期产物且不影响项目源文件', async t => {
  const root = await fixture(t);
  await build(root);
  const before = await snapshot(path.join(root, 'dist'));
  await writeFile(path.join(root, 'dist/stale.txt'), 'stale');
  await writeFile(path.join(root, 'keep.txt'), 'keep');
  await build(root);
  assert.deepEqual(await snapshot(path.join(root, 'dist')), before);
  assert.equal(await readFile(path.join(root, 'keep.txt'), 'utf8'), 'keep');
});

test('缺失必要输入时构建失败并保留上一次产物', async t => {
  const root = await fixture(t);
  await build(root);
  const before = await snapshot(path.join(root, 'dist'));
  await rm(path.join(root, 'src/app.js'));
  await assert.rejects(build(root), error => error.code !== 0);
  assert.deepEqual(await snapshot(path.join(root, 'dist')), before);
});
