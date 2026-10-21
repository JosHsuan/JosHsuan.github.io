import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {projectStudyEvidence} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-study-media.mjs';

const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const studies=JSON.parse(await readFile(new URL('release/project-studies.json',root),'utf8')).projects;
const mode=studies.find(project=>project.id==='mode-s-of-making');
const section=id=>mode.sections.find(item=>item.id===id);

test('Mode/s moves from unit and workflow through whole operation and detail to a truthful assembly close',()=>{
 assert.deepEqual(mode.sections.map(item=>item.id),['context','system','making','cutting','fabrication','results']);
 assert.equal(section('system').media[0].src,section('context').media[0].src);
 assert.equal(section('system').media[1].src,'/assets/projects/mode-s-of-making/film-design-workflow.webp');
 assert.equal(section('making').media[1].src,'/assets/projects/mode-s-of-making/film-corexy-system.webp');
 assert.deepEqual(section('results').media,[mode.hero]);
 assert.match(section('results').paragraphs.join(' '),/digital assembly simulation/);
 assert.match(section('results').paragraphs.join(' '),/does not establish a completed physical version/);
});

test('the design-to-code and mechanism plates remain visible supporting evidence, not hidden model posters',()=>{
 const evidence=projectStudyEvidence(mode);
 assert(evidence.get('system').some(image=>image.src.endsWith('/film-design-workflow.webp')));
 assert(evidence.get('making').some(image=>image.src.endsWith('/film-corexy-system.webp')));
 assert(![...evidence.values()].flat().some(image=>image.src===mode.hero.src));
});

test('narrative reordering preserves the continuous source model and all original motion identities',()=>{
 assert.deepEqual(mode.model.chapters,['context','system']);
 assert.equal(mode.model.sha256,'0a6963f5a206d0dc11b5fd9b0d9fc5e2a09085058d86bca62f3fb435a237cee0');
 for(const view of Object.values(mode.model.views))assert.deepEqual(view,{yaw:.56,pitch:.18,fov:36,zoom:1.04});
 assert.deepEqual(mode.motionMedia.map(({id,chapter,kind,durationSeconds,frameCount})=>({id,chapter,kind,durationSeconds,frameCount})),[
  {id:'film-machine-simulation',chapter:'making',kind:'simulation',durationSeconds:4.8,frameCount:120},
  {id:'film-physical-cutting',chapter:'fabrication',kind:'recording',durationSeconds:8.008,frameCount:240},
  {id:'prototype-cutting-operation',chapter:'cutting',kind:'recording',durationSeconds:8,frameCount:200},
 ]);
});
