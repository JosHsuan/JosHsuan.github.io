import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout,editorialProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath="roles/uiux-designer/cases/bending-active-thesis/";
const read=path=>readFile(new URL(path,root),'utf8'),hash=value=>createHash('sha256').update(value).digest('hex');
// Independently captured immutable published64e bytes, never current-source rebaselining.
const contracts={
  "roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs": {
    "sha256": "ab89ce3830523008fe66e1662c02f110cd0b2c7d8dd443efdccbbc7169d9a13b",
    "blocks": [
      // Entrance exact833 reversal independently proved in entrance-hybrid-scenes.test.mjs.
      ["\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id === 'dot-based-3d-printing') {\n  const results = project.sections.find(section => section.id === 'results');\n  const names = ['prototype-family.webp', 'translucent-prototypes.webp'];\n", "\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id === 'entrance-installation-art') {\n  const motion = project.motionMedia?.[0];\n  const guides = [['context','pattern-development.webp',4],['system','panel-system.webp',5],['making','fabrication-drawings.webp',2]];\n  if (!project.model || project.model.chapters.join(',') !== 'context,system' ||\n      !project.hero.src.endsWith('/entrance-installation-art/hero.webp') || project.hero.width !== 2400 || project.hero.height !== 3200 ||\n      project.motionMedia?.length !== 1 || motion.chapter !== 'results' || motion.kind !== 'recording' || motion.loop !== true ||\n      motion.durationSeconds !== 22.066666666666666 || motion.frameCount !== 662 || motion.width !== 540 || motion.height !== 960 ||\n      !motion.src.endsWith('/entrance-installation-art/installation-lighting-motion.mp4') ||\n      guides.some(([id,name,count]) => { const guide = project.sections.find(section => section.id === id)?.diagramFocus; return !guide?.source.endsWith(`/entrance-installation-art/${name}`) || guide.steps.length !== count; })) {\n   throw new Error('Hybrid scenes require the reviewed Entrance source roles.');\n  }\n  // Results retains its real night recording; the existing source guide flow is unchanged.\n  return {nativeChapters:['overview','credits'],results:null};\n }\n if (project.id === 'dot-based-3d-printing') {\n  const results = project.sections.find(section => section.id === 'results');\n  const names = ['prototype-family.webp', 'translucent-prototypes.webp'];\n"],
      [
        "\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id === 'hc3dp-caustics') {\n  const results = project.sections.find(section => section.id === 'results');\n  const names = ['hero.webp', 'overinflation.webp'];\n",
        "\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id === 'dot-based-3d-printing') {\n  const results = project.sections.find(section => section.id === 'results');\n  const names = ['prototype-family.webp', 'translucent-prototypes.webp'];\n  const motion = project.motionMedia?.[0];\n  if (!project.model || project.model.chapters.join(',') !== 'system' ||\n      project.model.primitive !== 'points' || project.model.vertices !== 14810 || project.model.triangles !== 0 ||\n      project.motionMedia?.length !== 1 || motion.chapter !== 'making' ||\n      motion.loop !== true || motion.kind !== 'recording' || motion.durationSeconds !== 4.4 ||\n      !motion.src.endsWith('/dot-based-3d-printing/printing-process-motion-web.mp4') ||\n      !project.hero.src.endsWith('/dot-based-3d-printing/hero.webp') ||\n      results?.media.length !== 2 || results.media.some((image,index) => !image.src.endsWith(`/dot-based-3d-printing/${names[index]}`))) {\n   throw new Error('Hybrid scenes require the reviewed Dot source roles.');\n  }\n  return {nativeChapters:['overview','results','credits'],results:{section:results,scene:results.media[0],evidence:[results.media[1]]}};\n }\n if (project.id === 'hc3dp-caustics') {\n  const results = project.sections.find(section => section.id === 'results');\n  const names = ['hero.webp', 'overinflation.webp'];\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/components/EditorialProjectStudy.module.css": {
    "sha256": "5ec5cc86a04c026116c76aad4cdb2d9a9d42265b50092d28dc6c2f800bd199c3",
    "blocks": [
      [
        "@media(max-width:360px){.nativeSurface{padding-left:1.25rem;padding-right:1.25rem}}\n@media(forced-colors:active){.nativeSurface{color:CanvasText}}\n@media print{.nativeSurface{color:#111;padding:1rem 0}.nativeOpeningRow,.nativeSceneRow{display:block}.nativeSurface .rail{width:100%}}\n",
        "@media(max-width:360px){.nativeSurface{padding-left:1.25rem;padding-right:1.25rem}}\n@media(forced-colors:active){.nativeSurface{color:CanvasText}}\n@media print{.nativeSurface{color:#111;padding:1rem 0}.nativeOpeningRow,.nativeSceneRow{display:block}.nativeSurface .rail{width:100%}}\n/* Dot's two original Results photographs are 1024px wide; retain their source-scale ceiling. */\n:global([data-project-study=\"dot-based-3d-printing\"]) .nativeSurface[data-project-native-source=\"results\"] .scene{max-width:1024px}\n"
      ]
    ]
  }
};
const pins={
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyStageRegistry.mjs": "838177ca52ab2675e08581828a1ea29c797fea76af7edca37a09e861e72b799b",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/PreviewLifecycle.mjs": "04096986c9a88f71bb4d9b77f1d27ce4c759cb69036d16896056cf34031f09d4",
  "roles/uiux-designer/cases/bending-active-thesis/release/introduction.json": "ab0fa9933275c22bad9f24fb79c27f7307d469ba570d9cd4a78f6f9fd3a6751b",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-assets.json": "33692e7a4a4be11e19e1cce804c5d5421f417aca6c0e6d7b51a60561692b45ad",
  "roles/uiux-designer/cases/bending-active-thesis/release/project-assets.json": "83f51a9847419f66f9ddde151b135fd3c2c58d4744d01631579497aad2916244",
  "roles/uiux-designer/cases/bending-active-thesis/release/contact.json": "c68b4bc45a3ecc13eeee55bae43f3cab75f2085a095a5084e1494f90c5695882",
  "roles/uiux-designer/cases/bending-active-thesis/release/manifest.json": "6bc10dfa18a7aafc828d9b39f1b046faddb7c8b514e9260a7d9adca0d46179e1",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-study.json": "3605cb7ed9abefc0721091d7883fdc765d0f0471af1b7d4db49f326228a68001",
  "roles/uiux-designer/cases/bending-active-thesis/release/story.json": "250c0853d8d5f9d993bc89b8a563eef5717300c1772a8c5da04647d165c740da",
  "roles/uiux-designer/cases/bending-active-thesis/release/xr-workspace.json": "41c48db687e71332240a002e0892141a7eac887c94740ef4c175cc4ccc4e1211",
  "roles/uiux-designer/cases/bending-active-thesis/release/dot-web-delivery.json": "f43d76d380dc5d1fbb55d67f6c02c2f4b142535e011662feeb176f931535ad0e",
  "roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json": "c222cdcec3fd5ff5f040f1db5a7c30f52a9871c6dc92b76dbb288e068e17341c",
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudy.jsx": "bfc9a0d2dd42ed137fa7b9a42452d83ffe7e0ebe0112f0f82061cf3aeb1ac62a",
  "roles/uiux-designer/cases/bending-active-thesis/components/EditorialProjectStudy.jsx": "ba1bed68dc665013c2a076d6bf3b30c07830a3e6c0e480c0b4fe82131d98e0b6",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-scene.mjs": "f04ca2d77f48a2bc3c366fee0d4a4a0959ce718db7b4f4263a050823193b659e",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-layout.mjs": "1eeb0aaf68cb6bdd6f844b3025405005fd5891ed4bff87edff836bf3e5567682",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-media.mjs": "11c752df3c3c9d7890deddde856db3fa77c996c4849e0c9816beb9f9bd959890",
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudyStage.jsx": "697625588e79e3f96913c661d8578ac5b830476a7f4ac7c33363f779fb2f1f5f",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyScenePresenter.mjs": "91746860fb4157d5377f7c929605051ec3b2ff100c177483dc51bcccb8b85873",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyBackdropPresenter.mjs": "c562286ff62ca0e8def0dcbcbf7aaa3a7fa3c0f6ecd8443567daadff065a3837",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyBackdropMotion.mjs": "faf1ba3aa624992ca400984ad90bca23d5be8919c093b69e42a527ac195c849a",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/background/SiteBackgroundDriver.mjs": "fe16573ded1c71e73d27a59d7e969fbefd2076bb10b3d22a27a8bcb75bd74d93"
};
function verify(path,source){for(const [before,after]of contracts[path].blocks){assert.equal(source.split(after).length,2,'Unique exact Dot context');source=source.replace(after,before);}assert.equal(hash(source),contracts[path].sha256,'All other64e bytes unchanged: '+path);}
test('Dot policy and route/Results-only CSS reverse exactly to published64e',async()=>{for(const path of Object.keys(contracts))verify(path,await read(path));});
test('Dot exact proof rejects removed/duplicated/changed scope and unrelated bytes',async()=>{for(const path of Object.keys(contracts)){const source=await read(path),block=contracts[path].blocks[0][1];for(const changed of [source+'\n',source.replace(block,''),source.replace(block,block+block),source.replaceAll('dot-based-3d-printing','other-case')])assert.throws(()=>verify(path,changed));}});
test('Dot rollout preserves every release/source byte and original model, cameras, media and lifecycle owners',async()=>{for(const [path,pin]of Object.entries(pins))assert.equal(hash(await readFile(new URL(path,root))),pin,path);const manifest=JSON.parse(await read(casePath+'release/manifest.json'));assert.equal(manifest.assets.length,137);for(const asset of manifest.assets){const bytes=await readFile(new URL(casePath+'release/public/'+asset.path,root));assert.equal(bytes.length,asset.bytes,asset.path);assert.equal(hash(bytes),asset.sha256,asset.path);}});
test('Dot exact original roles retain identity and reject source/owner misclassification',async()=>{
 const data=JSON.parse(await read(casePath+'release/project-studies.json')),snapshot=JSON.stringify(data),dot=data.projects.find(p=>p.id==='dot-based-3d-printing'),section=dot.sections.find(s=>s.id==='results'),layout=hybridProjectLayout(dot);
 assert.deepEqual(layout.nativeChapters,['overview','results','credits']);assert.equal(layout.results.section,section);assert.equal(layout.results.scene,section.media[0]);assert.equal(layout.results.evidence[0],section.media[1]);assert.equal(layout.results.evidence.length,1);
 assert.equal(dot.model.sha256,'60d49fe978cf0fb552c39f7188a9811dc39aa2e163b3a3388b192dbae502e891');assert.equal(dot.model.bytes,122884);assert.deepEqual(dot.model.chapters,['system']);assert.equal(dot.model.vertices,14810);assert.equal(dot.model.triangles,0);assert.equal(dot.model.primitive,'points');
 assert.deepEqual(section.media.map(i=>[i.src.split('/').at(-1),i.width,i.height]),[['prototype-family.webp',1024,683],['translucent-prototypes.webp',1024,758]]);assert(section.media.every(i=>!i.purpose));
 const movie=dot.motionMedia[0];assert.equal(movie.kind,'recording');assert.equal(movie.durationSeconds,4.4);assert.equal(movie.frameCount,27);assert.equal(movie.loop,true);assert.equal(movie.width,2500);assert.equal(movie.height,1304);
 for(const mutate of [p=>p.model=null,p=>p.model.chapters=['context','system'],p=>p.model.primitive='triangles',p=>p.model.vertices=14809,p=>p.model.triangles=1,p=>p.motionMedia=[],p=>p.motionMedia[0].chapter='results',p=>p.motionMedia[0].loop=false,p=>p.motionMedia[0].kind='simulation',p=>p.motionMedia[0].durationSeconds=8,p=>p.motionMedia[0].src='/wrong.mp4',p=>p.hero.src='/wrong.webp',p=>p.sections.find(s=>s.id==='results').media.reverse()]){const bad=structuredClone(dot);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));}
 for(const p of data.projects){if(p.id==='entrance-installation-art'){assert.deepEqual(hybridProjectLayout(p),{nativeChapters:['overview','credits'],results:null});continue;}if(['dot-based-3d-printing','hc3dp-caustics','special-assemblies'].includes(p.id))assert.deepEqual(hybridProjectLayout(p).nativeChapters,['overview','results','credits']);else assert.equal(hybridProjectLayout(p),null);assert.equal(!!editorialProjectLayout(p),p.id==='project-caschlatsch');}assert.equal(JSON.stringify(data),snapshot);
});
