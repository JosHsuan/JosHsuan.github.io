import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {scrollReadingDeltas,reverseScrollReadingDelta} from './scroll-reading-contract.mjs';
const root=new URL('../../',import.meta.url),caseRoot='roles/uiux-designer/cases/bending-active-thesis/';
const hash=value=>createHash('sha256').update(value).digest('hex');

test('only exact reviewed scroll-reading blocks reverse and every other source byte stays independently pinned',async()=>{
 for(const [path,record]of Object.entries(scrollReadingDeltas)){
  assert.ok(!path.includes('/release/public/'),'Documentary asset bytes must never be normalized');
  const source=await readFile(new URL(path,root),'utf8');
  assert.equal(hash(reverseScrollReadingDelta(path,source)),record.baselineSHA256,path+': unchanged baseline outside approved blocks');
  assert.notEqual(source,reverseScrollReadingDelta(path,source),path+': normalization is a real bounded delta');
 }
});
test('reviewed-delta proof rejects absent, duplicate, altered and unrelated source bytes',async()=>{
 for(const [path,record]of Object.entries(scrollReadingDeltas)){
  const source=await readFile(new URL(path,root),'utf8'),after=record.blocks[0].after;
  for(const changed of [source.replace(after,''),source.replace(after,after+after),source.replace(after,after+'/* unreviewed */')]){
   // A context-adjacent addition can leave the exact block present; its
   // independent full original pin, not permissive stripping, rejects that.
   assert.throws(()=>assert.equal(hash(reverseScrollReadingDelta(path,changed)),record.baselineSHA256),path);
  }
  assert.throws(()=>assert.equal(hash(reverseScrollReadingDelta(path,source+'\n/* unrelated */')),record.baselineSHA256),path);
 }
});
test('current project chrome, evidence and source plates never intercept native scrolling or offer click modes',async()=>{
 for(const name of ['ProjectStudyChrome.jsx','ProjectCaseStudyControls.jsx','ProjectCaseStudy.jsx','EditorialProjectStudy.jsx','EntranceDiagramFocus.jsx','ModelInspector.jsx','XRProject.jsx','BendingProject.jsx','SourceDiagram.jsx','HomeResearchStage.jsx','ProjectAnimationPreview.jsx','PortfolioHome.jsx','PortfolioNavigation.jsx']){
  const source=await readFile(new URL(caseRoot+'components/'+name,root),'utf8');
  assert.doesNotMatch(source,/<(?:button|input|select|details|summary)\b|role="(?:button|radio|tab)"|\b(?:onClick|onKeyDown|onPointerDown)=/,name);
  assert.doesNotMatch(source,/<a\b[^>]*href=(?:"#|\{`#|\{(?:image|item|motion|stage)\.(?:src|source)\})|data-evidence-source-link|data-inspect-figure/,name);
 }
});
test('current presentation does not switch to static media from OS motion or data-saving preferences',async()=>{
 for(const path of ['runtime/site/SiteNavigation.mjs','runtime/site/PreviewLifecycle.mjs','runtime/background/SiteBackgroundDriver.mjs','runtime/features/LifecycleManager.mjs','runtime/presentation/SceneRuntime.mjs','runtime/xr/XRStageDirector.mjs','components/HomeResearchStage.jsx','components/ProjectAnimationPreview.jsx','components/ProjectModelPreview.jsx','components/XRSceneStage.jsx']){
  const source=await readFile(new URL(caseRoot+path,root),'utf8');
  assert.doesNotMatch(source,/if\(reduced\|\|saveData\)/,path+': preference telemetry cannot select static fallback');
  assert.doesNotMatch(source,/matchMedia\??\.?(?:\s*\(|\?\.\()[^\n]*prefers-reduced-motion|reduced\.matches|reduced\?\.matches/,path);
 }
 for(const path of ['runtime/xr/XRStageDirector.mjs','runtime/background/SiteBackgroundDriver.mjs']){
  const source=await readFile(new URL(caseRoot+path,root),'utf8');assert.match(source,/reduced:false,saveData:false/,path+': real policies do not gate motion from preferences');
 }
 // Genuine visibility, failure and departure closure remain real—not modes.
 const lifecycle=await readFile(new URL(caseRoot+'runtime/site/PreviewLifecycle.mjs',root),'utf8');
 for(const event of ['visibilitychange','pagehide','pageshow'])assert.ok(lifecycle.includes(`'${event}'`));
 assert.match(lifecycle,/!hidden&&!pageAway/);assert.match(lifecycle,/scope\.dispose|events\.dispose|scope\.clear/);
});

test('authentic documentary photo colors are the normal scroll state, never a hover or focus reward',async()=>{
 const css=await readFile(new URL(caseRoot+'app/page.module.css',root),'utf8');
 assert.match(css,/(?:^|\n)\.evidence\[data-media-kind="photo"\] \.mediaFrame img\{filter:none;mix-blend-mode:normal\}/);
 assert.doesNotMatch(css,/\.evidence\[data-media-kind="photo"\] \.mediaFrame(?::is\([^)]*\))? img\{[^}]*grayscale/);
 assert.doesNotMatch(css,/\.evidence\[data-media-kind="photo"\] \.mediaFrame:is\(:hover,:focus-visible,:focus-within\)/);
 assert.match(css,/\.mediaFrame,\.mediaPlane,\.mediaFrame img\{border-radius:24px\}/);
});
