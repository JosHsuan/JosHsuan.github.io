import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {projectStudyEvidence} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-study-media.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const projects=JSON.parse(await readFile(new URL('release/project-studies.json',root),'utf8')).projects;
const hc=projects.find(p=>p.id==='hc3dp-caustics'),asset=name=>`/assets/projects/hc3dp-caustics/${name}.webp`;

test('HC3DP opens with documented light and closes with physical samples plus limitations',()=>{
 assert.equal(hc.hero.src,asset('caustic-observation'));assert.equal(hc.hero.width,2048);assert.equal(hc.hero.height,1365);
 assert.match(hc.hero.caption,/photographed/i);assert.match(hc.hero.caption,/not a measured optical-performance result/);
 assert.deepEqual(hc.sections.map(s=>s.id),['context','system','making','results']);
 assert.deepEqual(hc.sections[3].media.map(m=>m.src),[asset('hero'),asset('overinflation')]);
 assert.match(hc.sections[3].paragraphs.join(' '),/do not establish a quantified relation/);
});
test('all three computational plates are foreground evidence rather than model-hidden primary sources',()=>{
 const evidence=projectStudyEvidence(hc);
 assert.deepEqual(evidence.get('context').map(m=>m.src),[asset('layer-system')]);
 assert.deepEqual(evidence.get('system').map(m=>m.src),[asset('path-logic'),asset('frame-arrangement')]);
 assert.deepEqual(evidence.get('results').map(m=>m.src),[asset('overinflation')]);
 for(const id of ['context','system'])assert.equal(hc.sections.find(s=>s.id===id).media[0].src,hc.model.poster.src);
});
test('shell camera interval and path-simulation identity remain unchanged',()=>{
 assert.equal(hc.model.sha256,'0dd22b441c422f2a9c2406d79288284ee7fc56f1f3028ae453015b3add40bb4a');
 assert.deepEqual(hc.model.chapters,['context','system']);
 assert.deepEqual(hc.model.views,{context:{yaw:.72,pitch:.14,fov:36,zoom:1.04},system:{yaw:.92,pitch:.38,fov:36,zoom:1.04}});
 assert.equal(hc.model.poster.src,asset('hero'));
 const motion=hc.motionMedia[0];assert.equal(hc.motionMedia.length,1);
 assert.deepEqual([motion.id,motion.chapter,motion.kind,motion.durationSeconds,motion.frameCount,motion.loop],['fabrication-path-motion','making','simulation',2.17,31,true]);
 assert.match(hc.sections[2].paragraphs[0],/not a recording of physical fabrication or a simulation of the resulting light pattern/);
});
