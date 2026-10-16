import {readFile, writeFile, mkdir, copyFile, realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync, execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {auditPages} from './audit-pages.mjs';
import {preparePagesWorkspace} from './prepare-pages-workspace.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'roles/uiux-designer/cases/bending-active-thesis');
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
assert.equal(digest(await readFile(path.join(release, 'contact.json'))), manifest.contactSHA256);
// Verify the complete public handoff before replacing generated workspace files.
for (const asset of manifest.assets) {
  assert.match(asset.path, /^(assets|licenses)\/[a-zA-Z0-9/._-]+$/);
  assert(!asset.path.split('/').includes('..'));
  const filename = path.join(release, 'public', asset.path);
  assert((await realpath(filename)).startsWith(path.join(release, 'public') + path.sep));
  const bytes = await readFile(filename);
  assert.equal(bytes.length, asset.bytes); assert.equal(digest(bytes), asset.sha256, asset.path);
}
assert.equal(path.dirname(path.resolve(work)), path.resolve(root));
assert.equal(path.basename(work), '.pages-workspace');
await preparePagesWorkspace(root);
const sources = [
  'tsconfig.json', 'runtime/ExperienceProvider.jsx',
  'runtime/core/DisposableScope.ts', 'runtime/core/EventManager.ts',
  'runtime/features/ModelManager.mjs', 'runtime/features/EvidenceManager.mjs',
  'runtime/features/DiagramManager.mjs',
  'runtime/features/LifecycleManager.mjs',
  'runtime/features/EntryManager.mjs', 'runtime/motion/entry-motion.mjs',
  'runtime/motion/library-reveal.mjs', 'runtime/presentation/LibraryDiagramPresenter.mjs',
  'runtime/motion/liquid-glass.mjs', 'runtime/presentation/LiquidGlassPresenter.mjs',
  'runtime/features/ReadingManager.mjs',
  'runtime/RuntimeInput.ts', 'runtime/contracts/state.ts', 'runtime/contracts/commands.ts',
  'runtime/core/StateStore.ts', 'runtime/core/FrameStore.ts',
  'runtime/core/TransactionEngine.ts', 'runtime/core/CommandRouter.ts',
  'runtime/orchestration/ExperienceDirector.mjs',
  'runtime/orchestration/CanvasTransitionEvents.mjs',
  'runtime/presentation/LayoutScheduler.ts', 'runtime/presentation/DOMPresenter.ts',
  'runtime/presentation/SceneRuntime.mjs',
  'runtime/presentation/EditorialPresenter.mjs',
  'runtime/presentation/InformationWindowPresenter.mjs',
  'runtime/motion/kinetic-motion.mjs', 'runtime/motion/window-motion.mjs',
  'runtime/motion/window-path.mjs', 'runtime/motion/window-pose.mjs',
  'runtime/motion/window-scroll.mjs', 'runtime/motion/window-outline.mjs',
  'runtime/motion/window-recipes.mjs', 'runtime/motion/window-motion-api.mjs',
  'runtime/presentation/ModelAnnotationPresenter.mjs',
  'runtime/RuntimeRoot.mjs', 'runtime/core/FeatureRegistry.ts', 'runtime/core/Registrar.ts',
  'app/page.jsx', 'app/layout.jsx', 'app/globals.css', 'app/glass-materials.css', 'app/page.module.css',
  'app/portfolio.module.css', 'app/about/page.jsx', 'app/projects/page.jsx', 'app/contact/page.jsx',
  'app/projects/bending-active/page.jsx', 'app/projects/xr-bending-active/page.jsx',
  'components/BendingProject.jsx', 'components/PortfolioHome.jsx', 'components/PortfolioNavigation.jsx',
  'components/ProjectModelPreview.jsx', 'components/project-model-scene.mjs', 'components/project-model-recipe.mjs',
  'components/GlobalBackground.jsx', 'runtime/background/BackgroundRuntime.mjs', 'runtime/background/SiteBackgroundDriver.mjs',
  'components/XRModelStudy.jsx', 'components/XRPhoneStudy.jsx', 'components/research-media.module.css',
  'components/research-scene.mjs', 'components/research-scene-geometry.mjs',
  'components/XRSceneStage.jsx', 'components/xr-stage-scene.mjs', 'components/xr-scene-stage.module.css',
  'runtime/xr/XRStageDirector.mjs',
  'components/ProjectAnimationPreview.jsx', 'runtime/site/PreviewLifecycle.mjs', 'runtime/site/video-resource.mjs',
  'components/XRProject.jsx', 'components/XRProject.module.css', 'release/xr-study.json', 'release/contact.json',
  'components/SiteExperience.jsx', 'components/site-experience.module.css',
  'runtime/site/SiteReadiness.mjs', 'runtime/site/SiteNavigation.mjs', 'runtime/site/site-entry-bridge.mjs',
  'components/CinematicExperience.jsx', 'components/CinematicScene.jsx',
  'components/InformationSkin.jsx',
  'components/LiquidGlassSkin.jsx',
  'components/EntryLoader.jsx', 'components/entry-loader.module.css',
  'components/EvidenceInspector.jsx', 'components/evidence-inspector.module.css',
  'components/cinematic.module.css', 'components/story-input.js', 'components/story-response.mjs',
  'components/render-budget.mjs', 'components/runtime-scheduler.mjs', 'components/dom-publisher.mjs', 'components/scene-visibility.mjs',
  'components/renderer-budget.mjs', 'components/render-pressure.mjs',
  'components/canvas-motion.mjs',
  'components/page-field-renderer.mjs', 'components/render-profile.mjs', 'components/scene-recovery.mjs',
  'components/element-score.mjs', 'components/optical-score.mjs', 'components/scene-compositor.mjs',
  'components/scene-direction.mjs', 'components/vendor/cinematic-plan.mjs', 'components/vendor/camera-plan.mjs',
  'components/exhibition-stage.mjs', 'components/editorial-score.mjs',
  'components/source-scene-score.mjs', 'components/chapter-playback.mjs', 'components/chapter-scene-score.mjs', 'components/element-choreography.mjs',
  'components/SourceDiagram.jsx', 'components/source-diagram.module.css',
  'components/ModelInspector.jsx', 'components/model-inspector.module.css',
  'components/model-information.mjs',
  'components/inspection-state.mjs', 'components/inspection-camera.mjs', 'components/inspection-lighting.mjs',
  'components/inspection-framing-support.mjs',
  'components/materials/cinematic-material.js', 'release/story.json', 'release/introduction.json',
];
for (const relative of sources) {
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
const routes=['/','/about/','/projects/','/contact/','/projects/bending-active/','/projects/xr-bending-active/'];
await writeFile(path.join(work, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${manifest.origin}${route}</loc></url>`).join('')}</urlset>\n`);
const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
await writeFile(path.join(work, 'public/release.json'), JSON.stringify({release: manifest.id, commit, modelRevision: 'ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e', diagramRevision: manifest.assets.find(asset => asset.path === 'assets/thesis/source-diagrams.glb').sha256, xrModelRevision: xrStudy.model.sha256, xrStudyRevision: manifest.xrStudySHA256, typography: 'IBM Plex'}) + '\n');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build', work, '--webpack'], {cwd: root, stdio: 'inherit', env: {...process.env, THESIS_PUBLIC_RELEASE: '1', NEXT_PUBLIC_BASE_PATH: '', NEXT_TELEMETRY_DISABLED: '1'}});
if (result.error) throw result.error;
assert.equal(result.status, 0, 'Public static build failed');
await auditPages();
