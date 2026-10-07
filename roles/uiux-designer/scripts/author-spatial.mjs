import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const role = fileURLToPath(new URL('../', import.meta.url));
const project = path.resolve(role, '../..');
const { webpack } = createRequire(path.join(project, 'package.json'))('next/dist/compiled/webpack/webpack');
const out = path.join(role, '.runtime/author-spatial'); await mkdir(out, { recursive: true });
await new Promise((resolve, reject) => webpack({ mode: 'development', target: 'web', devtool: false, entry: path.join(role, 'src/motion/theatre/spatial/authoring.js'), output: { path: out, filename: 'authoring.js' }, resolve: { extensions: ['.js', '.json'], modules: [path.join(project, 'node_modules'), 'node_modules'] } }, (error, stats) => error || stats.hasErrors() ? reject(error ?? new Error(stats.toString({ all: false, errors: true }))) : resolve()));
const html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>UIUX spatial score authoring</title><style>body{background:#0b0d10;color:#f2f0ea;font:16px Arial;margin:0}#tools{position:absolute;top:80px;left:290px;right:300px}button{padding:12px;margin:4px}#drawing{white-space:pre;width:45vw;margin:32vh auto 0}</style><div id="tools"><h1>UIUX / spatial score</h1><p>The seed is the previous genuine Studio export. Sequence camera.position using the actual property menu, then capture the six designed checkpoints.</p><button id="capture">Capture spatial score</button><button id="play">Play sequence</button><button id="export">Export spatial motion</button><output id="status"></output></div><pre id="drawing"></pre><script type="module" src="/authoring.js"></script></html>';
createServer(async (req, res) => {
  if (req.method !== 'GET' || req.headers.host !== '127.0.0.1:4176') { res.writeHead(403).end(); return; }
  if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }).end(html); return; }
  const file = req.url === '/authoring.js' ? path.join(out, 'authoring.js') : req.url === '/state.json' ? path.join(role, 'src/motion/theatre/spatial/motion.state.json') : null;
  if (!file) { res.writeHead(404).end(); return; }
  const bytes = await readFile(file).catch(() => readFile(path.join(role, 'src/motion/theatre/motion.state.json')));
  res.writeHead(200, { 'Content-Type': req.url.endsWith('.js') ? 'text/javascript' : 'application/json' }).end(bytes);
}).listen(4176, '127.0.0.1', () => console.log('UIUX spatial Studio: http://127.0.0.1:4176/'));
