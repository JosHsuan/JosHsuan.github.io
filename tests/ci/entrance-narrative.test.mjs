import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const projects=JSON.parse(await readFile(new URL('release/project-studies.json',root),'utf8')).projects;
const project=projects.find(p=>p.id==='entrance-installation-art');
test('Entrance guides follow original surface, named joint figures and fabrication information',()=>{
 assert.deepEqual(project.sections.map(s=>s.id),['context','system','making','results']);
 assert.deepEqual(project.sections.filter(s=>s.diagramFocus).map(s=>[s.id,s.diagramFocus.steps.length]),[['context',4],['system',5],['making',2]]);
 assert.match(project.sections[1].diagramFocus.steps[1].description,/Fig\. 1-06/);
 assert.match(project.sections[1].diagramFocus.steps[2].description,/Fig\. 1-07/);
 for(const section of project.sections.filter(s=>s.diagramFocus))assert.equal(section.diagramFocus.source,section.media[0].src);
 assert.deepEqual(project.model.chapters,['context','system']);
 assert.equal(project.model.sha256,'cb7b5ea27a47c9451bd4220c835fb158aa3e65be19deff684f40eb076c43376c');
 assert.equal(project.motionMedia[0].chapter,'results');assert.equal(project.motionMedia[0].frameCount,662);
});
test('native raster focus owns no JavaScript clock and never replaces the original image with SVG',async()=>{
 const component=await readFile(new URL('components/EntranceDiagramFocus.jsx',root),'utf8');
 const css=await readFile(new URL('components/EntranceDiagramFocus.module.css',root),'utf8');
 assert.match(component,/data-entrance-original/);assert.match(component,/<ol[^>]*>/);assert.match(component,/data-focus-description=\{index\}/);assert.doesNotMatch(component,/<(?:a|button|input)\b/);
 assert.doesNotMatch(component,/useEffect|useState|requestAnimationFrame|setTimeout|setInterval|<image /);
 assert.match(css,/fill:none/);assert.match(css,/pointer-events:none/);assert.match(css,/height:auto;object-fit:contain/);assert.doesNotMatch(css,/:checked|data-study-paused|prefers-reduced-motion/);
});
