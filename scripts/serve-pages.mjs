import {createServer} from 'node:http';
import {readFile, realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = process.env.THESIS_PREVIEW_ROOT ? path.resolve(process.env.THESIS_PREVIEW_ROOT) + path.sep : fileURLToPath(new URL('../.pages-workspace/out/', import.meta.url));
const port = Number(process.env.THESIS_PREVIEW_PORT ?? 4186);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Invalid local preview port');
const origin = `http://127.0.0.1:${port}`;
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.xml':'application/xml','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.glb':'model/gltf-binary','.hdr':'application/octet-stream'};
createServer(async (request, response) => {
  if (request.headers.host !== `127.0.0.1:${port}` || !['GET','HEAD'].includes(request.method)) {response.writeHead(403).end(); return;}
  try {
    let name = decodeURIComponent(new URL(request.url, origin).pathname);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root) || !(await realpath(file)).startsWith(root)) {response.writeHead(403).end(); return;}
    const bytes = await readFile(file);
    response.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch {response.writeHead(404, {'Content-Type':'text/plain'}).end('Not found');}
}).listen(port, '127.0.0.1', () => console.log(`Public artifact preview: ${origin}`));
