/** Deliberate acquisition only; normal build/preview never fetches the internet. */
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const fontRevision = '5e8a3ba899557829a76cfdac30fa512bda91d7ca';
const sources = [
  { id: 'font-inter', family: 'Inter', folder: 'inter', file: 'Inter[opsz,wght].ttf', variable: true },
  { id: 'font-plex-sans', family: 'IBM Plex Sans', folder: 'ibmplexsans', file: 'IBMPlexSans[wdth,wght].ttf', variable: true },
  { id: 'font-plex-mono', family: 'IBM Plex Mono', folder: 'ibmplexmono', file: 'IBMPlexMono-Regular.ttf', variable: false },
  { id: 'font-space-grotesk', family: 'Space Grotesk', folder: 'spacegrotesk', file: 'SpaceGrotesk[wght].ttf', variable: true },
  { id: 'font-jetbrains-mono', family: 'JetBrains Mono', folder: 'jetbrainsmono', file: 'JetBrainsMono[wght].ttf', variable: true },
];
const packs = [
  { id: 'icons-lucide', repo: 'lucide-icons/lucide', revision: 'b56741cf30c08fc7248bf41ddd3a261367aa9579', directory: 'icons', license: 'ISC', licenseFile: 'LICENSE', names: ['arrow-up-right', 'layers', 'box', 'move-3d', 'code-xml', 'aperture', 'menu', 'x', 'play', 'pause', 'rotate-ccw', 'download'] },
  { id: 'icons-phosphor', repo: 'phosphor-icons/core', revision: '2b75f3ad12b420c9504ef05df8d2564a28f8500e', directory: 'assets/regular', license: 'MIT', licenseFile: 'LICENSE', names: ['arrow-up-right', 'stack', 'cube', 'bounding-box', 'code', 'circle-notch', 'list', 'x', 'play', 'pause', 'arrow-counter-clockwise', 'download-simple'] },
  { id: 'icons-tabler', repo: 'tabler/tabler-icons', revision: 'a4ce1404bc6d24d3c365afe7b258d6bf6f48d62d', directory: 'icons/outline', license: 'MIT', licenseFile: 'LICENSE', names: ['arrow-up-right', 'stack-2', 'cube', 'axis-x', 'code', 'aperture', 'menu-2', 'x', 'player-play', 'player-pause', 'rotate-clockwise', 'download'] },
];
const raw = (repo, revision, file) => `https://raw.githubusercontent.com/${repo}/${revision}/${file.split('/').map(encodeURIComponent).join('/')}`;
const records = [];
async function acquire(url, localPath, metadata) {
  const absolute = path.join(root, localPath);
  await mkdir(path.dirname(absolute), { recursive: true });
  const response = await fetch(url, { headers: { 'User-Agent': 'UIUX-Materials-Curation' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (localPath.endsWith('.svg')) {
    const text = bytes.toString('utf8');
    if (!text.includes('<svg') || /<script|<foreignObject|on\w+=|href\s*=\s*["']https?:/i.test(text)) throw new Error(`Unsafe or invalid SVG: ${localPath}`);
  }
  await writeFile(absolute, bytes);
  records.push({ ...metadata, path: localPath, url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), retrievedAt: '2026-10-07' });
}
for (const font of sources) {
  const source = `ofl/${font.folder}`;
  await acquire(raw('google/fonts', fontRevision, `${source}/${font.file}`), `assets/fonts/${font.folder}.ttf`, { materialId: font.id, kind: 'font', family: font.family, variable: font.variable, repo: 'google/fonts', revision: fontRevision, license: 'OFL-1.1', licensePath: `licenses/${font.folder}-OFL.txt` });
  await acquire(raw('google/fonts', fontRevision, `${source}/OFL.txt`), `licenses/${font.folder}-OFL.txt`, { materialId: font.id, kind: 'license', revision: fontRevision });
  console.log(`Font acquired: ${font.family}`);
}
for (const pack of packs) {
  await acquire(raw(pack.repo, pack.revision, pack.licenseFile), `licenses/${pack.id}.txt`, { materialId: pack.id, kind: 'license', revision: pack.revision });
  for (const name of pack.names) await acquire(raw(pack.repo, pack.revision, `${pack.directory}/${name}.svg`), `assets/icons/${pack.id}/${name}.svg`, { materialId: pack.id, kind: 'icon', name, repo: pack.repo, revision: pack.revision, license: pack.license, licensePath: `licenses/${pack.id}.txt` });
  console.log(`Icons acquired: ${pack.repo} (${pack.names.length})`);
}
await writeFile(path.join(root, 'catalog/assets.manifest.json'), JSON.stringify(records.sort((a, b) => a.path.localeCompare(b.path)), null, 2) + '\n');
console.log(`Acquired ${records.length} files with source revisions and hashes.`);
