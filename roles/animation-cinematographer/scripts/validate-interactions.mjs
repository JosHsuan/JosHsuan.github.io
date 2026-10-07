import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {role,studies} from '../src/review/catalog.js';
const local=fileURLToPath(new URL('../',import.meta.url)),root=path.resolve(local,'../..');
const readJSON=async file=>JSON.parse((await readFile(file,'utf8')).replace(/^\uFEFF/,''));
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex');
const checks=[];
const catalog=await readJSON(path.join(local,'catalog/studies.json'));assert.equal(catalog.studies.length,studies.length);assert.equal(catalog.role,role.id);assert.equal(catalog.input.simultaneous,false);assert.equal(catalog.input.autoplay,false);checks.push('Single-input catalog and role identity');
const captures=await readJSON(path.join(local,'catalog/captures.manifest.json'));assert.equal(captures.results.length,studies.length*2);for(const capture of captures.results){assert.equal(await hash(path.join(local,'assets/captures',capture.filename)),capture.sha256);assert.equal(capture.state.views.length,2);assert.equal(capture.state.study,capture.id);assert(Math.abs(capture.state.u-capture.u)<.003);}checks.push(`${captures.results.length} actual A/B capture states and hashes`);
const manifest=await readJSON(path.join(local,'src/motion/theatre/motion.manifest.json'));assert.equal(await hash(path.join(local,'src/motion/theatre/motion.state.json')),manifest.stateRevision);assert.equal(manifest.stateRevision,await hash(path.join(root,'roles/uiux-designer/src/motion/theatre/spatial/motion.state.json')));assert.deepEqual(manifest.clips.inspection,{start:0,end:4.8});checks.push('Genuine Theatre export, local project identity and clip manifest');
const build=await readJSON(path.join(local,'verification/interaction-build.json'));assert(build.studioExcluded);assert.equal(build.count,studies.length);assert(build.theatreModules.some(x=>x.includes('@theatre')));checks.push('Built runtime excludes Studio');
const browser=await readJSON(path.join(local,'verification/interaction-browser.json'));assert.deepEqual(browser.failures,[]);assert(browser.results.length>=34);checks.push(`${browser.results.length} real browser groups passed (see report limits)`);
const mcp=await readJSON(path.join(local,'verification/mcp-results.json'));assert(mcp.results.every(r=>r.passed));const loader=await readJSON(path.join(local,'verification/config-loader.json'));assert.deepEqual(loader.map(x=>x.name).sort(),(role.id==='3d-artist'?['artist3d_browser','artist3d_catalog']:['cinema_browser','cinema_catalog']));checks.push('Actual MCP calls and installed CLI role-only configuration load');
const toolkit=await readJSON(path.join(local,'toolkit.json'));assert.equal(toolkit.reviewStorageKey,role.key);assert.equal(await hash('C:/Users/JosHsuan/.codex/config.toml'),toolkit.globalConfigSHA256);checks.push('Global configuration unchanged');
const baseline=await readJSON(path.join(root,'roles/3d-artist/verification/interaction-boundary-before.json'));
const revisions=await readJSON(path.join(root,'roles/3d-artist/verification/integration-boundary-revisions.json'));
assert.equal(revisions.files.length,2);
for(const revision of revisions.files){assert(['README.md','docs/architecture.md'].includes(revision.file));assert.equal(baseline.find(entry=>entry.file===revision.file)?.sha256,revision.previousSHA256);}
for(const entry of baseline){const revision=revisions.files.find(item=>item.file===entry.file);assert.equal(await hash(path.join(root,entry.file)),revision?.reviewedSHA256??entry.sha256,`Protected file changed: ${entry.file}`);}
checks.push(`${baseline.length-revisions.files.length} protected files unchanged; ${revisions.files.length} explicitly reviewed integration documents match pinned revisions`);
const files=[];async function walk(folder){for(const e of await readdir(folder,{withFileTypes:true})){const f=path.join(folder,e.name);if(e.isDirectory())await walk(f);else files.push(f);}}await walk(path.join(local,'src/review'));for(const file of files){const source=await readFile(file,'utf8');assert(!/from\s+['"]@theatre\//.test(source));assert(!source.includes('D:\\JosHsuan_Website'));}checks.push('Direct Theatre imports and private-path boundaries');
await writeFile(path.join(local,'verification/interaction-validation.json'),JSON.stringify({verifiedAt:new Date().toISOString(),role:role.id,passed:true,checks},null,2)+'\n');console.log(JSON.stringify(checks,null,2));
