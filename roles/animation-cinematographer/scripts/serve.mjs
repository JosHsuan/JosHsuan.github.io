import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.hdr': 'application/octet-stream', '.txt': 'text/plain', '.md': 'text/plain', '.jsx': 'text/plain' };
createServer(async (req,res) => {
  if (req.method !== 'GET' || req.headers.host !== '127.0.0.1:4182') return res.writeHead(403).end();
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1:4182').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }).end(bytes);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4182, '127.0.0.1', () => console.log('Animation Cinematographer desk: http://127.0.0.1:4182/'));
