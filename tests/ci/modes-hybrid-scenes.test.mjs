import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../',import.meta.url),casePath='roles/uiux-designer/cases/bending-active-thesis/';
const read=path=>readFile(new URL(path,root),'utf8');
// Original source byte pins are independently protected by original-portfolio-assets.test.mjs.
// Camera/material/text layout are reviewed behavior, not historical source-text reversals.
test('Mode preserves original three-film roles and nonnative Results with strict negative predicates',async()=>{
 const data=JSON.parse(await read(casePath+'release/project-studies.json')),snapshot=JSON.stringify(data),p=data.projects.find(p=>p.id==='mode-s-of-making');
 assert.deepEqual(hybridProjectLayout(p),{nativeChapters:['overview','credits'],results:null});
 assert.deepEqual([p.model.bytes,p.model.vertices,p.model.triangles],[13987056,699860,1026294]);assert.equal(p.model.sha256,'0a6963f5a206d0dc11b5fd9b0d9fc5e2a09085058d86bca62f3fb435a237cee0');
 assert.deepEqual(p.motionMedia.map(m=>[m.id,m.chapter,m.kind,m.durationSeconds,m.frameCount,m.width,m.height,m.loop]),[['film-machine-simulation','making','simulation',4.8,120,1920,1080,true],['film-physical-cutting','fabrication','recording',8.008,240,1920,1080,true],['prototype-cutting-operation','cutting','recording',8,200,1920,1080,true]]);
 const mutations=[p=>p.model=null,p=>p.model.chapters.reverse(),p=>p.hero.src='/wrong',p=>p.hero.width=1,p=>p.hero.height=1,p=>p.sections.find(s=>s.id==='results').media=[],p=>p.sections.find(s=>s.id==='results').media[0].src='/wrong',p=>p.motionMedia.pop(),p=>p.motionMedia.push(structuredClone(p.motionMedia[0]))];
 for(let index=0;index<3;index++)for(const[key,value]of Object.entries({id:'wrong',chapter:'wrong',kind:'wrong',loop:false,durationSeconds:1,frameCount:1,width:1,height:1,src:'/wrong'}))mutations.push(p=>{p.motionMedia[index][key]=value;});
 for(const mutate of mutations){const bad=structuredClone(p);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));}
 const reordered=structuredClone(p);reordered.motionMedia.reverse();assert.deepEqual(hybridProjectLayout(reordered),{nativeChapters:['overview','credits'],results:null});
 assert.equal(JSON.stringify(data),snapshot,'Source role mapping does not mutate source objects');
});
