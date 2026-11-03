import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath='roles/uiux-designer/cases/bending-active-thesis/';
const read=path=>readFile(new URL(path,root),'utf8');
// Original source byte pins are independently protected by original-portfolio-assets.test.mjs.
// Camera/material/text layout are reviewed behavior, not historical source-text reversals.
test('Dot exact original roles retain identity and reject source/owner misclassification',async()=>{
 const data=JSON.parse(await read(casePath+'release/project-studies.json')),snapshot=JSON.stringify(data),dot=data.projects.find(p=>p.id==='dot-based-3d-printing'),section=dot.sections.find(s=>s.id==='results'),layout=hybridProjectLayout(dot);
 assert.deepEqual(layout.nativeChapters,['overview','results','credits']);assert.equal(layout.results.section,section);assert.equal(layout.results.scene,section.media[0]);assert.equal(layout.results.evidence[0],section.media[1]);assert.equal(layout.results.evidence.length,1);
 assert.equal(dot.model.sha256,'60d49fe978cf0fb552c39f7188a9811dc39aa2e163b3a3388b192dbae502e891');assert.equal(dot.model.bytes,122884);assert.deepEqual(dot.model.chapters,['system']);assert.equal(dot.model.vertices,14810);assert.equal(dot.model.triangles,0);assert.equal(dot.model.primitive,'points');
 assert.deepEqual(section.media.map(i=>[i.src.split('/').at(-1),i.width,i.height]),[['prototype-family.webp',1024,683],['translucent-prototypes.webp',1024,758]]);assert(section.media.every(i=>!i.purpose));
 const movie=dot.motionMedia[0];assert.equal(movie.kind,'recording');assert.equal(movie.durationSeconds,4.4);assert.equal(movie.frameCount,27);assert.equal(movie.loop,true);assert.equal(movie.width,2500);assert.equal(movie.height,1304);
 for(const mutate of [p=>p.model=null,p=>p.model.chapters=['context','system'],p=>p.model.primitive='triangles',p=>p.model.vertices=14809,p=>p.model.triangles=1,p=>p.motionMedia=[],p=>p.motionMedia[0].chapter='results',p=>p.motionMedia[0].loop=false,p=>p.motionMedia[0].kind='simulation',p=>p.motionMedia[0].durationSeconds=8,p=>p.motionMedia[0].src='/wrong.mp4',p=>p.hero.src='/wrong.webp',p=>p.sections.find(s=>s.id==='results').media.reverse()]){const bad=structuredClone(dot);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));}
 assert.equal(JSON.stringify(data),snapshot,'Source role mapping does not mutate source objects');
});
