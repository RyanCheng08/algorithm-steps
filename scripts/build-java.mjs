import { mkdir, writeFile } from 'node:fs/promises';
import { lessons } from '../src/data/lessons.js';

const dir = new URL('../java/', import.meta.url);
await mkdir(dir, { recursive: true });
const methods = lessons.map(l => `    // Lesson ${l.number}: ${l.id}\n${l.java.code.split('\n').map(line => `    ${line}`).join('\n')}`).join('\n\n');
await writeFile(new URL('AlgorithmLab.java', dir), `// Generated from src/data/lessons.js. Rebuild: npm run java:generate\n// Teaching references: Hello Algo Java edition; supplementary implementations.\npublic class AlgorithmLab {\n${methods}\n}\n`, 'utf8');
console.log(`Generated AlgorithmLab.java with ${lessons.length} reference methods.`);
