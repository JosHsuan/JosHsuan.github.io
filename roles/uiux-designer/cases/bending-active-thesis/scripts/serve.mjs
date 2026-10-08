import {createServer} from 'node:http';
import {readFile, realpath, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {gzip as gzipCallback} from 'node:zlib';

const root = fileURLToPath(new URL('../out/', import.meta.url));
const gzip = promisify(gzipCallback);
export const GZIP_LEVEL = 6;
const mime = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.hdr': 'application/octet-stream', '.txt': 'text/plain; charset=utf-8', '.wasm': 'application/wasm'};
const compressible = new Set(['.html', '.js', '.mjs', '.css', '.json', '.txt', '.svg', '.glb', '.gltf', '.hdr', '.bin', '.wasm', '.xml', '.map']);
const commonHeaders = {'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Cache-Control': 'no-store', 'Vary': 'Accept-Encoding'};
const contained = (directory, filename) => {
  const relative = path.relative(directory, filename);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};

/** RFC 9110 section 12.5.3. No header / empty header uses the identity variant.
 * Explicit gzip;q=0 overrides wildcard acceptance. Unknown/invalid weights do
 * not enable an encoding; duplicate entries use the more restrictive weight.
 */
export function negotiateEncoding(header, mayGzip) {
  if (typeof header !== 'string' || header.trim() === '') return 'identity';
  const weights = new Map();
  for (const entry of header.split(',')) {
    const parts = entry.trim().split(';').map(part => part.trim());
    const coding = parts.shift().toLowerCase();
    if (!coding) continue;
    let quality = 1;
    if (parts.length) {
      const match = parts.length === 1 && /^q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i.exec(parts[0]);
      quality = match ? Number(match[1]) : 0;
    }
    weights.set(coding, Math.min(weights.get(coding) ?? 1, quality));
  }
  const gzipQuality = mayGzip ? (weights.get('gzip') ?? weights.get('*') ?? 0) : 0;
  const identityQuality = weights.get('identity') ?? (weights.get('*') === 0 ? 0 : 1);
  if (gzipQuality > 0 && (!weights.has('identity') || gzipQuality >= identityQuality)) return 'gzip';
  return identityQuality > 0 ? 'identity' : null;
}

/** Exported only so focused tests can exercise real HTTP on an ephemeral local
 * port. The CLI entry point remains fixed to 127.0.0.1:4184 and exact Host below.
 */
export function createPreviewHandler(directory = root) {
  const directoryPath = path.resolve(directory);
  return async (req, res) => {
    const respond = (status, body, headers = {}) => {
      const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body);
      res.writeHead(status, {...commonHeaders, 'Content-Type': 'text/plain; charset=utf-8', ...headers, 'Content-Length': String(bytes.length)});
      res.end(req.method === 'HEAD' ? undefined : bytes);
    };
    if (!['GET', 'HEAD'].includes(req.method) || req.headers.host !== '127.0.0.1:4184') return respond(403, 'Forbidden');
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1:4184').pathname);
      let filename = path.resolve(directoryPath, '.' + pathname);
      if (!contained(directoryPath, filename)) return respond(403, 'Forbidden');
      if ((await stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
      const [actualRoot, actualFile] = await Promise.all([realpath(directoryPath), realpath(filename)]);
      if (!contained(actualRoot, actualFile)) return respond(403, 'Forbidden');
      const extension = path.extname(actualFile).toLowerCase();
      const encoding = negotiateEncoding(req.headers['accept-encoding'], compressible.has(extension));
      if (encoding === null) return respond(406, 'No acceptable content encoding');
      const raw = await readFile(actualFile);
      // Per-response compression avoids stale build data and unbounded caches.
      // Source files remain byte-identical, including GLB geometry and normals.
      const bytes = encoding === 'gzip' ? await gzip(raw, {level: GZIP_LEVEL}) : raw;
      respond(200, bytes, {'Content-Type': mime[extension] ?? 'application/octet-stream', ...(encoding === 'gzip' ? {'Content-Encoding': 'gzip'} : {})});
    } catch {
      respond(404, 'Not found');
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer(createPreviewHandler()).listen(4184, '127.0.0.1', () => console.log('Bending-Active local review: http://127.0.0.1:4184/'));
}
