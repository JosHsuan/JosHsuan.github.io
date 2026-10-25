import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout,editorialProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath="roles/uiux-designer/cases/bending-active-thesis/";
const read=path=>readFile(new URL(path,root),'utf8'),hash=value=>createHash('sha256').update(value).digest('hex');
// Independently captured published833; exact opt-in and optional-results dispatcher only.
const contracts={
  "roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs": {
    "sha256": "1200f7b3e85e741e2c5e8dcab9a97ef8e3171206e7cefd9ef09ddecd6198691d",
    "blocks": [
      [
        "\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id === 'dot-based-3d-printing') {\n  const results = project.sections.find(section => section.id === 'results');\n  const names = ['prototype-family.webp', 'translucent-prototypes.webp'];\n",
        "\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id === 'entrance-installation-art') {\n  const motion = project.motionMedia?.[0];\n  const guides = [['context','pattern-development.webp',4],['system','panel-system.webp',5],['making','fabrication-drawings.webp',2]];\n  if (!project.model || project.model.chapters.join(',') !== 'context,system' ||\n      !project.hero.src.endsWith('/entrance-installation-art/hero.webp') || project.hero.width !== 2400 || project.hero.height !== 3200 ||\n      project.motionMedia?.length !== 1 || motion.chapter !== 'results' || motion.kind !== 'recording' || motion.loop !== true ||\n      motion.durationSeconds !== 22.066666666666666 || motion.frameCount !== 662 || motion.width !== 540 || motion.height !== 960 ||\n      !motion.src.endsWith('/entrance-installation-art/installation-lighting-motion.mp4') ||\n      guides.some(([id,name,count]) => { const guide = project.sections.find(section => section.id === id)?.diagramFocus; return !guide?.source.endsWith(`/entrance-installation-art/${name}`) || guide.steps.length !== count; })) {\n   throw new Error('Hybrid scenes require the reviewed Entrance source roles.');\n  }\n  // Results retains its real night recording; the existing source guide flow is unchanged.\n  return {nativeChapters:['overview','credits'],results:null};\n }\n if (project.id === 'dot-based-3d-printing') {\n  const results = project.sections.find(section => section.id === 'results');\n  const names = ['prototype-family.webp', 'translucent-prototypes.webp'];\n"
      ]
    ]
  },
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudy.jsx": {
    "sha256": "2966ef228518551f98814073b42e20dc695b626ce264541dd2ba1bfab8355558",
    "blocks": [
      [
        "     </div>\n    </header>}\n    {project.sections.map((section,index)=>{\n     if(hybrid?.results.section===section)return <NativeStudyChapter key={section.id} project={project} section={section} index={index} scene={hybrid.results.scene} evidence={hybrid.results.evidence}/>;\n     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);\n     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>\n     <div className={styles.chapterInner}>\n",
        "     </div>\n    </header>}\n    {project.sections.map((section,index)=>{\n     if(hybrid?.results?.section===section)return <NativeStudyChapter key={section.id} project={project} section={section} index={index} scene={hybrid.results.scene} evidence={hybrid.results.evidence}/>;\n     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);\n     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>\n     <div className={styles.chapterInner}>\n"
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
  "roles/uiux-designer/cases/bending-active-thesis/components/EditorialProjectStudy.jsx": "ba1bed68dc665013c2a076d6bf3b30c07830a3e6c0e480c0b4fe82131d98e0b6",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-scene.mjs": "f04ca2d77f48a2bc3c366fee0d4a4a0959ce718db7b4f4263a050823193b659e",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-layout.mjs": "1eeb0aaf68cb6bdd6f844b3025405005fd5891ed4bff87edff836bf3e5567682",
  "roles/uiux-designer/cases/bending-active-thesis/components/project-study-media.mjs": "11c752df3c3c9d7890deddde856db3fa77c996c4849e0c9816beb9f9bd959890",
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudyStage.jsx": "697625588e79e3f96913c661d8578ac5b830476a7f4ac7c33363f779fb2f1f5f",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyScenePresenter.mjs": "91746860fb4157d5377f7c929605051ec3b2ff100c177483dc51bcccb8b85873",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyBackdropPresenter.mjs": "c562286ff62ca0e8def0dcbcbf7aaa3a7fa3c0f6ecd8443567daadff065a3837",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/site/ProjectStudyBackdropMotion.mjs": "faf1ba3aa624992ca400984ad90bca23d5be8919c093b69e42a527ac195c849a",
  "roles/uiux-designer/cases/bending-active-thesis/runtime/background/SiteBackgroundDriver.mjs": "fe16573ded1c71e73d27a59d7e969fbefd2076bb10b3d22a27a8bcb75bd74d93",
  "roles/uiux-designer/cases/bending-active-thesis/components/EditorialProjectStudy.module.css": "fd89ea83120fba43a85c4e49d7707f99dcef519c8add49388a79b7e6a4159b52",
  "roles/uiux-designer/cases/bending-active-thesis/components/EntranceDiagramFocus.jsx": "e774fd4d6b6cb072834d4f8e3a269f0319d5aceaa360200a822f0ae6d085c146",
  "roles/uiux-designer/cases/bending-active-thesis/components/EntranceDiagramFocus.module.css": "e011224777e05129db70b2042006f5eb57998cae788d63f008ff1d35bd83b64f"
};
function verify(path,source){for(const [before,after]of contracts[path].blocks){assert.equal(source.split(after).length,2,'Unique exact Entrance context');source=source.replace(after,before);}assert.equal(hash(source),contracts[path].sha256,'All other published833 bytes unchanged: '+path);}
test('Entrance branch and optional Results dispatcher reverse exactly to published833',async()=>{for(const path of Object.keys(contracts))verify(path,await read(path));});
test('Entrance exact proof rejects absent, duplicate, scope and unrelated changes',async()=>{for(const path of Object.keys(contracts)){const source=await read(path),after=contracts[path].blocks[0][1];for(const changed of [source+'\n',source.replace(after,''),source.replace(after,after+after),source.replace('results:null','results:{}').replace('hybrid?.results?.section','hybrid?.results.section')])assert.throws(()=>verify(path,changed));}});
test('Entrance preserves all data,137 assets, guides, camera, appearance and lifecycle owners',async()=>{for(const[path,pin]of Object.entries(pins))assert.equal(hash(await readFile(new URL(path,root))),pin,path);const manifest=JSON.parse(await read(casePath+'release/manifest.json'));assert.equal(manifest.assets.length,137);for(const a of manifest.assets){const b=await readFile(new URL(casePath+'release/public/'+a.path,root));assert.equal(b.length,a.bytes);assert.equal(hash(b),a.sha256);}});
test('Entrance explicitly has no native Results while original guides and real recording remain intact',async()=>{
 const data=JSON.parse(await read(casePath+'release/project-studies.json')),snapshot=JSON.stringify(data),p=data.projects.find(p=>p.id==='entrance-installation-art'),layout=hybridProjectLayout(p);
 assert.deepEqual(layout,{nativeChapters:['overview','credits'],results:null});assert.deepEqual([p.hero.width,p.hero.height],[2400,3200]);assert.equal(p.model.bytes,18828876);assert.equal(p.model.vertices,897015);assert.equal(p.model.triangles,997599);assert.equal(p.model.sha256,'cb7b5ea27a47c9451bd4220c835fb158aa3e65be19deff684f40eb076c43376c');assert.deepEqual(p.model.chapters,['context','system']);
 assert.deepEqual(p.sections.filter(s=>s.diagramFocus).map(s=>[s.id,s.diagramFocus.steps.length]),[['context',4],['system',5],['making',2]]);const film=p.motionMedia[0];assert.deepEqual([film.chapter,film.kind,film.loop,film.durationSeconds,film.frameCount,film.width,film.height],['results','recording',true,22.066666666666666,662,540,960]);
 for(const mutate of [p=>p.model=null,p=>p.model.chapters.reverse(),p=>p.hero.src='/wrong.webp',p=>p.hero.width=2401,p=>p.hero.height=3201,p=>p.motionMedia=[],p=>p.motionMedia.push(structuredClone(p.motionMedia[0])),p=>p.motionMedia[0].chapter='making',p=>p.motionMedia[0].kind='simulation',p=>p.motionMedia[0].loop=false,p=>p.motionMedia[0].durationSeconds=22,p=>p.motionMedia[0].frameCount=661,p=>p.motionMedia[0].width=541,p=>p.motionMedia[0].height=961,p=>p.motionMedia[0].src='/wrong.mp4',p=>p.sections[0].diagramFocus.source='/wrong.webp',p=>p.sections[0].diagramFocus.steps.pop(),p=>delete p.sections[0].diagramFocus]){const bad=structuredClone(p);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));}
 for(const p of data.projects){if(p.id==='entrance-installation-art')continue;if(['dot-based-3d-printing','hc3dp-caustics','special-assemblies'].includes(p.id))assert.deepEqual(hybridProjectLayout(p).nativeChapters,['overview','results','credits']);else assert.equal(hybridProjectLayout(p),null);assert.equal(!!editorialProjectLayout(p),p.id==='project-caschlatsch');}assert.equal(JSON.stringify(data),snapshot);
});
