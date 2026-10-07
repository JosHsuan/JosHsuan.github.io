/** Re-render original spatial stills from the running local build after a design change. */
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const role = fileURLToPath(new URL('../', import.meta.url));
const { chromium } = createRequire(path.resolve(role, '../../package.json'))('@playwright/test');
await mkdir(path.join(role, 'assets/previews'), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); const records = [];
  for (const [id, file] of [['spatial-wirefield', 'wirefield.png'], ['spatial-hatch', 'hatch.png']]) {
    await page.goto(`http://127.0.0.1:4175/?material=${id}`);
    const frame = page.frameLocator('#detail iframe');
    await frame.getByRole('button', { name: 'Enable 3D', exact: true }).click();
    await frame.getByRole('status').filter({ hasText: '3D ready' }).waitFor();
    const output = path.join(role, 'assets/previews', file); await frame.locator('canvas').screenshot({ path: output });
    const bytes = await readFile(output);
    records.push({ materialId: id, kind: 'original-preview', path: `assets/previews/${file}`, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), revision: 'uiux-original-v1', license: 'Project-original specimen; no distribution license assigned', retrievedAt: '2026-10-07', provenance: 'Captured from the actual local WebGL specimen; default amplitude 0.65, angle 0.7 radians, density 18 for hatch.' });
  }
  await writeFile(path.join(role, 'catalog/previews.manifest.json'), JSON.stringify(records, null, 2) + '\n');
} finally { await browser.close(); }
console.log('Captured actual default spatial previews; run write-catalog and build to version them.');
