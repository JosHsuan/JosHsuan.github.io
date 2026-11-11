import {readFile, writeFile, mkdir, copyFile, realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync, execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {auditPages,assertXRWorkspaceRecord,assertXRWorkspaceImage} from './audit-pages.mjs';
import {preparePagesWorkspace} from './prepare-pages-workspace.mjs';
import {PAGES_SOURCES, PAGES_SOURCE_ROOT} from './pages-sources.mjs';
import {auditPagesSources} from './audit-pages-sources.mjs';
import {assertProjectStudies,assertProjectImage,assertProjectModel,assertProjectAssetRecord,projectStudyModels,PROJECT_SLUGS} from './project-studies.mjs';
import {projectMotionMedia,assertProjectVideo} from './project-motion-media.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, PAGES_SOURCE_ROOT);
const release = path.join(source, 'release');
const work = path.join(root, '.pages-workspace');
const digest = data => createHash('sha256').update(data).digest('hex');
assert.equal(process.version, 'v24.19.0', 'Use the exact committed Node version');
const manifest = JSON.parse(await readFile(path.join(release, 'manifest.json'), 'utf8'));
const story = await readFile(path.join(release, 'story.json'));
assert.equal(digest(story), manifest.storySHA256);
assert.equal(digest(await readFile(path.join(release, 'introduction.json'))), manifest.introductionSHA256);
const xrStudyBytes = await readFile(path.join(release, 'xr-study.json'));
assert.equal(digest(xrStudyBytes), manifest.xrStudySHA256);
const xrStudy = JSON.parse(xrStudyBytes);
const projectStudyBytes=await readFile(path.join(release,'project-studies.json'));
assert.equal(digest(projectStudyBytes),manifest.projectStudiesSHA256,'Approved selected project narratives');
const projectAssetBytes=await readFile(path.join(release,'project-assets.json'));
assert.equal(digest(projectAssetBytes),manifest.projectAssetsSHA256,'Selected public image provenance');
const projectStudies=JSON.parse(projectStudyBytes);
const projectImages=assertProjectStudies(projectStudies,manifest);
const projectVideos=projectMotionMedia(projectStudies);
assertProjectAssetRecord(JSON.parse(projectAssetBytes),projectImages,manifest,projectStudies);
const xrWorkspaceBytes=await readFile(path.join(release,'xr-workspace.json'));
assert.equal(digest(xrWorkspaceBytes),manifest.xrWorkspaceSHA256,'Approved full-workspace source record');
const xrWorkspace=JSON.parse(xrWorkspaceBytes);
assertXRWorkspaceRecord(xrWorkspace,manifest);
assert.equal(xrWorkspace.schemaVersion,1,'Supported full-workspace source schema');
for(const image of [xrWorkspace.image,xrWorkspace.image?.mobile]){
  assert(image&&/^\/assets\/xr\/[a-zA-Z0-9._-]+\.webp$/.test(image.src),'Approved local workspace image');
  assert(Number.isInteger(image.width)&&image.width>0&&Number.isInteger(image.height)&&image.height>0,'Positive workspace image dimensions');
  const pin=manifest.assets.find(asset=>'/'+asset.path===image.src);
  assert(pin&&pin.sha256===image.sha256&&pin.bytes===image.bytes,'Workspace image matches its approved asset pin');
}
const typographyAsset=manifest.assets.find(asset=>asset.path==='assets/fonts/roboto-mono-variable.woff2');
const typographyNotice=manifest.assets.find(asset=>asset.path==='licenses/roboto-mono-OFL.txt');
assert(typographyAsset&&typographyNotice,'Roboto Mono and its original OFL are pinned together');
assert.equal(typographyAsset.sha256,'aafaa5d57a7180d02d1c6a5925523e06b3bcde4b182544a4d793d5ee87e61817','Unmodified upstream Roboto Mono variable font');
const displayTypographyAsset=typographyAsset,displayTypographyNotice=typographyNotice;
assert.equal(digest(await readFile(path.join(release, 'contact.json'))), manifest.contactSHA256);
// Verify the complete public handoff before replacing generated workspace files.
for (const asset of manifest.assets) {
  assert.match(asset.path, /^(assets|licenses)\/[a-zA-Z0-9/._-]+$/);
  assert(!asset.path.split('/').includes('..'));
  const filename = path.join(release, 'public', asset.path);
  assert((await realpath(filename)).startsWith(path.join(release, 'public') + path.sep));
  const bytes = await readFile(filename);
  assert.equal(bytes.length, asset.bytes); assert.equal(digest(bytes), asset.sha256, asset.path);
  const workspaceImage=[xrWorkspace.image,xrWorkspace.image.mobile].find(image=>image.src==='/'+asset.path);
  if(workspaceImage)assertXRWorkspaceImage(bytes,workspaceImage);
  const projectImage=projectImages.find(image=>image.src==='/'+asset.path);
  if(projectImage)assertProjectImage(bytes,projectImage);
  const projectModel=projectStudies.projects.flatMap(projectStudyModels).find(model=>model.src==='/'+asset.path);
  if(projectModel)assertProjectModel(bytes,projectModel);
  const projectVideo=projectVideos.find(media=>media.src==='/'+asset.path);
  if(projectVideo)assertProjectVideo(bytes,projectVideo);
}
assert.equal(path.dirname(path.resolve(work)), path.resolve(root));
assert.equal(path.basename(work), '.pages-workspace');
await auditPagesSources(source, PAGES_SOURCES);
await preparePagesWorkspace(root);

for (const relative of PAGES_SOURCES) {
  await mkdir(path.dirname(path.join(work, relative)), {recursive: true});
  await copyFile(path.join(source, relative), path.join(work, relative));
}
for (const asset of manifest.assets) {
  const destination = path.join(work, 'public', asset.path);
  await mkdir(path.dirname(destination), {recursive: true});
  await copyFile(path.join(release, 'public', asset.path), destination);
}
await writeFile(path.join(work, 'next.config.mjs'), `import config from '../roles/uiux-designer/cases/bending-active-thesis/next.config.mjs';\nimport {fileURLToPath} from 'node:url';\nexport default {...config, outputFileTracingRoot:fileURLToPath(new URL('../',import.meta.url))};\n`);
await writeFile(path.join(work, 'public/.nojekyll'), '');
await writeFile(path.join(work, 'public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${manifest.origin}/sitemap.xml\n`);
const routes=['/','/about/','/projects/','/contact/','/projects/bending-active/','/projects/xr-bending-active/',...PROJECT_SLUGS.map(slug=>`/projects/${slug}/`)];
await writeFile(path.join(work, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${manifest.origin}${route}</loc></url>`).join('')}</urlset>\n`);
const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
await writeFile(path.join(work, 'public/release.json'), JSON.stringify({release: manifest.id, commit, storyRevision:manifest.storySHA256, introductionRevision:manifest.introductionSHA256, modelRevision: 'ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e', diagramRevision: manifest.assets.find(asset => asset.path === 'assets/thesis/source-diagrams.glb').sha256, xrModelRevision: xrStudy.model.sha256, xrStudyRevision: manifest.xrStudySHA256, xrWorkspaceRevision:manifest.xrWorkspaceSHA256,projectStudiesRevision:manifest.projectStudiesSHA256,projectAssetsRevision:manifest.projectAssetsSHA256, typography: 'Roboto Mono',typographyRevision:typographyAsset.sha256,typographyNoticeRevision:typographyNotice.sha256,displayTypography:'Roboto Mono',displayTypographyRevision:displayTypographyAsset.sha256,displayTypographyNoticeRevision:displayTypographyNotice.sha256}) + '\n');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build', work, '--webpack'], {cwd: root, stdio: 'inherit', env: {...process.env, THESIS_PUBLIC_RELEASE: '1', NEXT_PUBLIC_BASE_PATH: '', NEXT_TELEMETRY_DISABLED: '1'}});
if (result.error) throw result.error;
assert.equal(result.status, 0, 'Public static build failed');
await auditPages();
