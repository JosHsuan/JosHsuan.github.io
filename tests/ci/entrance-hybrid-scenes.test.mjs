import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath='roles/uiux-designer/cases/bending-active-thesis/';
const read=path=>readFile(new URL(path,root),'utf8');
// Original source byte pins are independently protected by original-portfolio-assets.test.mjs.
// Camera/material/text layout are reviewed behavior, not historical source-text reversals.
test('Entrance explicitly has no native Results while original guides and real recording remain intact',async()=>{
 const data=JSON.parse(await read(casePath+'release/project-studies.json')),snapshot=JSON.stringify(data),p=data.projects.find(p=>p.id==='entrance-installation-art'),layout=hybridProjectLayout(p);
 assert.deepEqual(layout,{nativeChapters:['overview','credits'],results:null});assert.deepEqual([p.hero.width,p.hero.height],[2400,3200]);assert.equal(p.model.bytes,18828876);assert.equal(p.model.vertices,897015);assert.equal(p.model.triangles,997599);assert.equal(p.model.sha256,'cb7b5ea27a47c9451bd4220c835fb158aa3e65be19deff684f40eb076c43376c');assert.deepEqual(p.model.chapters,['context','system']);
 assert.deepEqual(p.sections.filter(s=>s.diagramFocus).map(s=>[s.id,s.diagramFocus.steps.length]),[['context',4],['system',5],['making',2]]);const film=p.motionMedia[0];assert.deepEqual([film.chapter,film.kind,film.loop,film.durationSeconds,film.frameCount,film.width,film.height],['results','recording',true,22.066666666666666,662,540,960]);
 for(const mutate of [p=>p.model=null,p=>p.model.chapters.reverse(),p=>p.hero.src='/wrong.webp',p=>p.hero.width=2401,p=>p.hero.height=3201,p=>p.motionMedia=[],p=>p.motionMedia.push(structuredClone(p.motionMedia[0])),p=>p.motionMedia[0].chapter='making',p=>p.motionMedia[0].kind='simulation',p=>p.motionMedia[0].loop=false,p=>p.motionMedia[0].durationSeconds=22,p=>p.motionMedia[0].frameCount=661,p=>p.motionMedia[0].width=541,p=>p.motionMedia[0].height=961,p=>p.motionMedia[0].src='/wrong.mp4',p=>p.sections[0].diagramFocus.source='/wrong.webp',p=>p.sections[0].diagramFocus.steps.pop(),p=>delete p.sections[0].diagramFocus]){const bad=structuredClone(p);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));}
 assert.equal(JSON.stringify(data),snapshot,'Source role mapping does not mutate source objects');
});
