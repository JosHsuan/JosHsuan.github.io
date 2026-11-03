import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout,editorialProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const projects=JSON.parse(await read('release/project-studies.json')).projects;
const cas=projects.find(project=>project.id==='project-caschlatsch');
const prefix='/assets/projects/project-caschlatsch/';
const sceneNames=['portfolio-tower-on-site.webp','portfolio-timber-model.webp','portfolio-xr-workshop.webp','portfolio-robotic-assembly.webp','portfolio-timber-interior.webp'];
const evidenceNames=['portfolio-voxel-framework.webp','portfolio-module-infill.webp','portfolio-xr-assembly-sequence.webp','portfolio-xr-interface.webp','portfolio-xr-data-exchange.webp'];

test('Caschlatsch uses its reviewed structure for Context/System and native original evidence afterwards',()=>{
 const before=JSON.stringify(cas),layout=hybridProjectLayout(cas);
 assert.equal(editorialProjectLayout(cas),null);
 assert.deepEqual(layout.nativeChapters,['overview','xr-guidance','making','results','credits']);
 assert.equal(layout.results,null);
 assert.deepEqual(layout.nativeScenes.map(row=>row.section.id),['xr-guidance','making','results']);
 assert.deepEqual(layout.nativeScenes.map(row=>row.scene.src),sceneNames.slice(2).map(name=>prefix+name));
 assert.deepEqual(layout.nativeScenes.flatMap(row=>row.evidence.map(image=>image.src)),evidenceNames.slice(2).map(name=>prefix+name));
 for(const row of layout.nativeScenes){assert.equal(row.section,cas.sections.find(section=>section.id===row.section.id));assert.ok(row.section.media.includes(row.scene));}
 assert.equal(JSON.stringify(cas),before);
 for(const mutate of [
  p=>p.model.chapters=['context','results'],p=>p.motionMedia=[{}],
  p=>p.sections.find(section=>section.id==='making').media=[],
  p=>p.sections.push({id:'unreviewed',media:[]}),
 ]){const bad=structuredClone(cas);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));}
});
test('the model-free source layout still accounts for all ten portfolio images and workshop credit',()=>{
 const legacy=structuredClone(cas);delete legacy.model;
 const before=JSON.stringify(legacy),rows=editorialProjectLayout(legacy);
 assert.deepEqual(rows.map(row=>row.section.id),['context','system','xr-guidance','making','results']);
 assert.deepEqual(rows.map(row=>row.scene.src),sceneNames.map(name=>prefix+name));
 assert.deepEqual(rows.flatMap(row=>row.evidence.map(image=>image.src)),evidenceNames.map(name=>prefix+name));
 assert.deepEqual(rows.flatMap(row=>row.references.map(image=>image.src)),[prefix+'portfolio-xr-workshop.webp']);
 assert.deepEqual(legacy.hero,rows[1].scene);
 const images=rows.flatMap(row=>[row.scene,...row.evidence]);assert.equal(images.length,10);assert.equal(new Set(images.map(image=>image.src)).size,10);
 for(const row of rows)assert.deepEqual(new Set([row.scene,...row.evidence,...row.references]),new Set(row.section.media));
 assert.equal(JSON.stringify(legacy),before);
 for(const bad of [{...legacy,motionMedia:[{}]},{...legacy,sections:[{id:'unreviewed'}]},{...legacy,sections:[{...legacy.sections[0],media:[]}]}])assert.throws(()=>editorialProjectLayout(bad));
 for(const project of projects)assert.equal(editorialProjectLayout(project),null);
});
test('native figures retain complete images and credits without image-viewer actions or a separate clock',async()=>{
 const source=await read('components/EditorialProjectStudy.jsx'),css=await read('components/EditorialProjectStudy.module.css');
 for(const name of ['SourceFigure','NativeStudyOpening','NativeStudyChapter'])assert.ok(source.includes('export function '+name+'('));
 assert.ok(source.includes('<p>{image.caption}</p><span>{image.credit}</span>'));
 assert.ok(source.includes('src={image.src} width={image.width} height={image.height} alt={image.alt}'));
 assert.ok(source.includes('<InformationSkin/><p>{image.caption}'));
 assert.doesNotMatch(source,/href=\{image.src\}|SourceAction|data-evidence-source-link|Open full image|target="_blank"/);
 assert.doesNotMatch(source,/data-project-media|<canvas|onClick=|requestAnimationFrame|setInterval|setTimeout/);
 assert.ok(source.includes('href="/projects/"'),'Ordinary project navigation remains available');
 assert.ok(css.includes('height:auto;object-fit:contain'));assert.ok(css.includes('@media(forced-colors:active)'));
 const selectors='.scene figcaption>span:not(:global([data-information-skin])),.evidence figcaption>span:not(:global([data-information-skin])),.reference>span';
 assert.ok(css.includes(selectors+'{display:block;'));
 assert.doesNotMatch(css,/\.(?:scene|evidence) figcaption>span(?=[,{])/);
 const globals=await read('app/globals.css');assert.ok(globals.includes('[data-information-skin]{display:none;'));assert.ok(globals.includes('html [data-information-window][data-information-ready]>[data-information-skin]{'));
 const driver=await read('runtime/background/SiteBackgroundDriver.mjs');
 assert.ok(driver.includes("listen(image,'load',publish)"));assert.ok(driver.includes("listen(image,'error'"));
});
