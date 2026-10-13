import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const textbook = process.env.ALGORITHM_PDF || 'E:/学习/e-book/hello算法-java版本 (靳宇栋 (Krahets)) (Z-Library).pdf';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.java': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/api/textbook') {
      const available = await stat(textbook).then(s => s.isFile()).catch(() => false);
      res.writeHead(200, { 'Content-Type': types['.json'], 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify({ available }));
    }
    if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const filename = pathname === '/textbook.pdf' ? textbook : path.resolve(root, relative);
    if (pathname !== '/textbook.pdf' && (!filename.startsWith(root) || relative.split(/[\\/]/).some(p => p.startsWith('.')) || relative.includes('\0'))) {
      res.writeHead(403); return res.end('Forbidden');
    }
    const info = await stat(filename);
    if (!info.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const headers = { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes' };
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      const start = match ? Number(match[1]) : -1;
      const end = match?.[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (start < 0 || start >= info.size || end < start) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }); return res.end(); }
      res.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${info.size}` });
      if (req.method === 'HEAD') return res.end();
      createReadStream(filename, { start, end }).on('error', () => res.destroy()).pipe(res);
    } else {
      res.writeHead(200, { ...headers, 'Content-Length': info.size });
      if (req.method === 'HEAD') return res.end();
      createReadStream(filename).on('error', () => res.destroy()).pipe(res);
    }
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`算法拾级 Local: http://127.0.0.1:${port}`));
server.on('error', error => { console.error(`启动失败：${error.message}`); process.exitCode = 1; });
