import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const role = fileURLToPath(new URL('../', import.meta.url));
const project = path.resolve(role, '../..');
const { webpack } = createRequire(path.join(project, 'package.json'))('next/dist/compiled/webpack/webpack');
const out = path.join(role, '.runtime/author'); await mkdir(out, { recursive: true });
await new Promise((resolve, reject) => webpack({ mode: 'development', target: 'web', devtool: false, entry: path.join(role, 'src/motion/theatre/authoring.js'), output: { path: out, filename: 'authoring.js' }, resolve: { extensions: ['.js', '.json'], modules: [path.join(project, 'node_modules'), 'node_modules'] } }, (error, stats) => error || stats.hasErrors() ? reject(error ?? new Error(stats.toString({ all: false, errors: true }))) : resolve()));
const html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>UIUX section study authoring</title><style>body{background:#0b0d10;color:#f2f0ea;font:16px Arial;margin:0}#tools{position:absolute;top:70px;left:300px;right:300px}button{padding:12px;margin:4px}#drawing{width:70vw;height:65vh;margin:18vh auto 0}svg{width:100%;height:100%}</style><div id="tools"><h1>UIUX / authored section study</h1><p>Sequence assemblyProgress using the Studio property menu, then capture start, spread and end. Export downloads genuine Studio state.</p><button id="start">Start / 0s</button><button id="spread">Spread / 1.2s</button><button id="end">End / 2.4s</button><button id="play">Play sequence</button><button id="export">Export motion</button><output id="status"></output></div><div id="drawing"></div><script type="module" src="/authoring.js"></script></html>';
createServer(async (req, res) => {
  if (req.method !== 'GET' || req.headers.host !== '127.0.0.1:4176') { res.writeHead(403).end(); return; }
  if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }).end(html); return; }
  const file = req.url === '/authoring.js' ? path.join(out, 'authoring.js') : req.url === '/state.json' ? path.join(role, 'src/motion/theatre/motion.state.json') : null;
  if (!file) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': req.url.endsWith('.js') ? 'text/javascript' : 'application/json' }); res.end(await readFile(file).catch(() => 'null'));
}).listen(4176, '127.0.0.1', () => console.log('UIUX-only Studio: http://127.0.0.1:4176/'));
