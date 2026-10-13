import { lstat, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// An explicit list keeps local books, notes, tools and credentials out of Pages.
const publicFiles = [
  'index.html',
  'assets/styles.css',
  'src/app.js',
  'src/algorithms.js',
  'src/state.js',
  'src/data/lessons.js',
  'src/data/questions.js',
  'java/AlgorithmLab.java',
  'java/AlgorithmLabTest.java',
];
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
  throw new Error('Refusing to build outside this project’s dist directory.');
}

// Read every source before deleting an earlier build. Reject links so the
// allowlist cannot inadvertently publish files from elsewhere on this machine.
const entries = [];
for (const relative of publicFiles) {
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if ((await lstat(current)).isSymbolicLink()) {
      throw new Error(`Refusing symbolic-link input: ${relative}`);
    }
  }
  const info = await lstat(current);
  if (!info.isFile()) throw new Error(`Expected a regular file: ${relative}`);
  entries.push([relative, await readFile(current)]);
}
entries.push(['api/textbook', '{"available":false}\n'], ['.nojekyll', '']);

const existing = await lstat(output).catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
if (existing && (!existing.isDirectory() || existing.isSymbolicLink())) {
  throw new Error('Refusing to replace dist: it must be a regular directory.');
}
// Both the lexical destination and an existing directory's real destination
// must be the fixed child checked above before recursive removal is allowed.
if (existing && await realpath(output) !== output) {
  throw new Error('Refusing to remove a redirected dist directory.');
}
await rm(output, { recursive: true, force: true });
for (const [relative, content] of entries) {
  const filename = path.join(output, ...relative.split('/'));
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, content);
}
console.log(`Built ${entries.length} static files in dist/. Local textbook is excluded.`);
