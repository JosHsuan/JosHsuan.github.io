import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath='roles/uiux-designer/cases/bending-active-thesis/';
const read=path=>readFile(new URL(path,root),'utf8');
// Original source byte pins are independently protected by original-portfolio-assets.test.mjs.
// Camera/material/text layout are reviewed behavior, not historical source-text reversals.
import {projectStudyEvidenceLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-study-layout.mjs';
test('HC source roles preserve looping simulation and native photographic results',async()=>{
 const data=JSON.parse(await read(casePath+'release/project-studies.json')),snapshot=JSON.stringify(data),hc=data.projects.find(p=>p.id==='hc3dp-caustics'),result=hc.sections.find(s=>s.id==='results'),layout=hybridProjectLayout(hc);
 assert.deepEqual(layout.nativeChapters,['overview','results','credits']);assert.equal(layout.results.section,result);assert.equal(layout.results.scene,result.media[0]);assert.equal(layout.results.evidence.length,1);assert.equal(layout.results.evidence[0],result.media[1]);
 assert.equal(hc.hero.src,'/assets/projects/hc3dp-caustics/caustic-observation.webp');assert.deepEqual(result.media.map(i=>i.src),['/assets/projects/hc3dp-caustics/hero.webp','/assets/projects/hc3dp-caustics/overinflation.webp']);
 assert.equal(hc.model.sha256,'0dd22b441c422f2a9c2406d79288284ee7fc56f1f3028ae453015b3add40bb4a');assert.equal(hc.model.bytes,50438508);assert.equal(hc.model.vertices,1894748);assert.equal(hc.model.triangles,2360266);assert.equal(hc.model.meshes,1);assert.deepEqual(hc.model.chapters,['context','system']);
 assert.equal(hc.motionMedia.length,1);const movie=hc.motionMedia[0];assert.equal(movie.src,'/assets/projects/hc3dp-caustics/fabrication-path-motion.mp4');assert.equal(movie.chapter,'making');assert.equal(movie.kind,'simulation');assert.equal(movie.loop,true);assert.equal(movie.durationSeconds,2.17);assert.equal(movie.frameCount,31);assert.equal(movie.width,2308);assert.equal(movie.height,2500);
 for(const name of ['layer-system.webp','path-logic.webp','frame-arrangement.webp']){const image=hc.sections.flatMap(s=>s.media).find(i=>i.src.endsWith('/'+name));assert.equal(image.purpose,undefined);assert.equal(projectStudyEvidenceLayout(image),'pair');}
 const mutations=[p=>p.model=null,p=>p.model.chapters.reverse(),p=>p.motionMedia=[],p=>p.motionMedia.push(structuredClone(p.motionMedia[0])),p=>p.motionMedia[0].chapter='results',p=>p.motionMedia[0].loop=false,p=>p.motionMedia[0].kind='recording',p=>p.motionMedia[0].durationSeconds=7.56,p=>p.motionMedia[0].src='/wrong.mp4',p=>p.hero.src='/wrong.webp',p=>p.sections.find(s=>s.id==='results').media.reverse(),p=>p.sections=p.sections.filter(s=>s.id!=='results')];
 for(const mutate of mutations){const bad=structuredClone(hc);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));}
 assert.equal(JSON.stringify(data),snapshot,'No source objects are mutated');
 // Source contracts do not certify pixels, complete model/movie journeys or latency.
});
