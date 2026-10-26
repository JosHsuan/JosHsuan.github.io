// Historical exact-baseline checks below first reverse ONLY the separately
// reviewed 26 October scroll-reading delta; raw current-DOM contracts live in
// scroll-reading-contract.test.mjs and source-access.test.mjs. No asset is normalized.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readReviewedFile as readFile} from './scroll-reading-contract.mjs';
import test from 'node:test';
import {hybridProjectLayout,editorialProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath="roles/uiux-designer/cases/bending-active-thesis/";
const read=path=>readFile(new URL(path,root),'utf8'),hash=value=>createHash('sha256').update(value).digest('hex');
// Immutable published1ca policy baseline; one exact reviewed Mode branch, no normalization.
const policyPath="roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs",baselineHash="fc911953c502dd2835a17e2964dd45627c44217414ca676d7757daecffa15f94",before="\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id === 'entrance-installation-art') {\n  const motion = project.motionMedia?.[0];\n",after="\n/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */\nexport function hybridProjectLayout(project) {\n if (project.id === 'mode-s-of-making') {\n  const results = project.sections.find(section => section.id === 'results');\n  const films = [['film-machine-simulation','making','simulation',4.8,120],['film-physical-cutting','fabrication','recording',8.008,240],['prototype-cutting-operation','cutting','recording',8,200]];\n  if (!project.model || project.model.chapters.join(',') !== 'context,system' ||\n      !project.hero.src.endsWith('/mode-s-of-making/film-assembly-hero.webp') || project.hero.width !== 1920 || project.hero.height !== 1080 ||\n      results?.media.length !== 1 || results.media[0].src !== project.hero.src ||\n      project.motionMedia?.length !== 3 || films.some(([id,chapter,kind,duration,frames]) => {\n       const film = project.motionMedia.find(media => media.id === id);\n       return !film || film.chapter !== chapter || film.kind !== kind || film.loop !== true ||\n        film.durationSeconds !== duration || film.frameCount !== frames || film.width !== 1920 || film.height !== 1080 ||\n        !film.src.endsWith(`/mode-s-of-making/${id}.mp4`);\n      })) {\n   throw new Error('Hybrid scenes require the reviewed Mode/s simulation and recording roles.');\n  }\n  // The opening is a simulation still; Results keeps its original assembly-study return.\n  return {nativeChapters:['overview','credits'],results:null};\n }\n if (project.id === 'entrance-installation-art') {\n  const motion = project.motionMedia?.[0];\n";
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
  "roles/uiux-designer/cases/bending-active-thesis/components/EntranceDiagramFocus.module.css": "e011224777e05129db70b2042006f5eb57998cae788d63f008ff1d35bd83b64f",
  "roles/uiux-designer/cases/bending-active-thesis/components/ProjectCaseStudy.jsx": "bfc9a0d2dd42ed137fa7b9a42452d83ffe7e0ebe0112f0f82061cf3aeb1ac62a"
};
function reverse(source){assert.equal(source.split(after).length,2,'Unique exact Mode context');const baseline=source.replace(after,before);assert.equal(hash(baseline),baselineHash,'Every other published1ca policy byte unchanged');return baseline;}
test('Mode policy reverses exactly to immutable published1ca',async()=>{reverse(await read(policyPath));});
test('Mode proof rejects missing, duplicate, altered role and unrelated bytes',async()=>{const source=await read(policyPath);for(const bad of [source+'\n',source.replace(after,''),source.replace(after,after+after),source.replace("['overview','credits']","['overview','results','credits']"),source.replace("'simulation',4.8,120","'recording',4.8,120")])assert.throws(()=>reverse(bad));});
test('Mode preserves all original data/assets, shared components, camera/material and runtime owners',async()=>{for(const[path,pin]of Object.entries(pins))assert.equal(hash(await readFile(new URL(path,root))),pin,path);const manifest=JSON.parse(await read(casePath+'release/manifest.json'));assert.equal(manifest.assets.length,137);for(const a of manifest.assets){const bytes=await readFile(new URL(casePath+'release/public/'+a.path,root));assert.equal(bytes.length,a.bytes);assert.equal(hash(bytes),a.sha256);}});
test('Mode preserves original three-film roles and nonnative Results with strict negative predicates',async()=>{
 const data=JSON.parse(await read(casePath+'release/project-studies.json')),snapshot=JSON.stringify(data),p=data.projects.find(p=>p.id==='mode-s-of-making');
 assert.deepEqual(hybridProjectLayout(p),{nativeChapters:['overview','credits'],results:null});
 assert.deepEqual([p.model.bytes,p.model.vertices,p.model.triangles],[13987056,699860,1026294]);assert.equal(p.model.sha256,'0a6963f5a206d0dc11b5fd9b0d9fc5e2a09085058d86bca62f3fb435a237cee0');
 assert.deepEqual(p.motionMedia.map(m=>[m.id,m.chapter,m.kind,m.durationSeconds,m.frameCount,m.width,m.height,m.loop]),[['film-machine-simulation','making','simulation',4.8,120,1920,1080,true],['film-physical-cutting','fabrication','recording',8.008,240,1920,1080,true],['prototype-cutting-operation','cutting','recording',8,200,1920,1080,true]]);
 const mutations=[p=>p.model=null,p=>p.model.chapters.reverse(),p=>p.hero.src='/wrong',p=>p.hero.width=1,p=>p.hero.height=1,p=>p.sections.find(s=>s.id==='results').media=[],p=>p.sections.find(s=>s.id==='results').media[0].src='/wrong',p=>p.motionMedia.pop(),p=>p.motionMedia.push(structuredClone(p.motionMedia[0]))];
 for(let index=0;index<3;index++)for(const[key,value]of Object.entries({id:'wrong',chapter:'wrong',kind:'wrong',loop:false,durationSeconds:1,frameCount:1,width:1,height:1,src:'/wrong'}))mutations.push(p=>{p.motionMedia[index][key]=value;});
 for(const mutate of mutations){const bad=structuredClone(p);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));}
 const reordered=structuredClone(p);reordered.motionMedia.reverse();assert.deepEqual(hybridProjectLayout(reordered),{nativeChapters:['overview','credits'],results:null});
 const baseline=await import('data:text/javascript;base64,'+Buffer.from(reverse(await read(policyPath))).toString('base64'));
 for(const project of data.projects){assert.deepEqual(editorialProjectLayout(project),baseline.editorialProjectLayout(project));if(project.id!==p.id)assert.deepEqual(hybridProjectLayout(project),baseline.hybridProjectLayout(project));}assert.equal(JSON.stringify(data),snapshot);
});
