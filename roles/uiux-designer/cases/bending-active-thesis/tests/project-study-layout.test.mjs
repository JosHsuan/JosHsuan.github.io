import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projectStudyLayout,projectStudyEvidenceLayout} from '../components/project-study-layout.mjs';
import {projectStudyEvidence} from '../components/project-study-media.mjs';

const studies=JSON.parse(await readFile(new URL('../release/project-studies.json',import.meta.url),'utf8')).projects;
const study=id=>studies.find(project=>project.id===id);

test('all six real studies resolve every native chapter without changing source records',()=>{
 const original=JSON.stringify(studies),compositions=new Set(),layouts=new Set();
 assert.equal(studies.length,6);
 for(const project of studies){
  for(const chapter of ['overview',...project.sections.map(section=>section.id),'credits']){
   const result=projectStudyLayout(project,chapter);compositions.add(result.composition);layouts.add(result.layout);
   assert.ok(['opening','model','recording','documentary','closing'].includes(result.composition));
   assert.ok(['split','broad','reading'].includes(result.layout));
  }
  assert.equal(projectStudyLayout(project,'overview').composition,'opening');
  assert.deepEqual(projectStudyLayout(project,'credits'),{composition:'closing',layout:'reading',sourceShape:'none',sourceRole:'none',readingDensity:'normal'});
 }
 assert.deepEqual([...compositions].sort(),['closing','documentary','model','opening','recording']);
 assert.deepEqual([...layouts].sort(),['broad','reading','split']);
 assert.equal(JSON.stringify(studies),original,'Composition cannot rewrite pinned sources, prose or camera recipes');
});

test('every eligible model keeps the spatial split; movies use actual motion dimensions',()=>{
 for(const project of studies)for(const chapter of project.model?.chapters??[]){
  const result=projectStudyLayout(project,chapter);
  assert.equal(result.composition,'model');assert.equal(result.layout,'split');assert.equal(result.sourceRole,'model');
 }
 const special=study('special-assemblies');
 assert.ok(special.sections.find(section=>section.id==='making').media[0].width/special.sections.find(section=>section.id==='making').media[0].height<1.65);
 assert.equal(projectStudyLayout(special,'making').sourceShape,'wide','Robot animation has a wider native frame than the documentary alternative');
 assert.equal(projectStudyLayout(study('entrance-installation-art'),'results').sourceShape,'portrait','Portrait night footage must never inherit a landscape aperture');
 assert.equal(projectStudyLayout(study('hc3dp-caustics'),'making').sourceShape,'balanced');
 for(const project of studies)for(const media of project.motionMedia??[]){
  const result=projectStudyLayout(project,media.chapter);assert.equal(result.composition,'recording');assert.equal(result.layout,'broad');
  assert.equal(result.sourceRole,media.kind??'motion');
 }
});

test('Caschlatsch documentary primaries remain distinct from five full-width foreground technical plates',()=>{
 const project=study('project-caschlatsch'),evidence=projectStudyEvidence(project);
 const expected=[
  {chapter:'system',primary:project.hero,shape:'balanced',layout:'split',plates:['portfolio-voxel-framework','portfolio-module-infill']},
  {chapter:'xr-guidance',primary:project.sections.find(section=>section.id==='making').media[0],shape:'wide',layout:'broad',plates:['portfolio-xr-assembly-sequence','portfolio-xr-interface','portfolio-xr-data-exchange']},
 ];
 for(const {chapter,primary,shape,layout,plates} of expected){
  const section=project.sections.find(section=>section.id===chapter);
  assert.deepEqual(section.media[0],primary,'Narrative primaries reuse the approved documentary photographs');
  assert.equal(section.paragraphs.length,3);
  assert.deepEqual(projectStudyLayout(project,chapter),{composition:'documentary',sourceRole:'photograph',layout,readingDensity:'normal',sourceShape:shape});
  const foreground=evidence.get(chapter);
  assert.deepEqual(foreground.map(image=>image.src),plates.map(name=>`/assets/projects/project-caschlatsch/${name}.webp`));
  for(const image of foreground){
   assert.equal(image.purpose,'diagram');
   assert.equal(projectStudyEvidenceLayout(image),'full','Every complete technical plate retains a full row independently of the primary photograph');
  }
 }
 assert.equal(projectStudyLayout(project,'context').sourceShape,'portrait');
 assert.equal(projectStudyLayout(project,'context').layout,'split');
 assert.equal(projectStudyLayout(project,'making').readingDensity,'normal');
});

test('meaning comes from authored source purpose and never from a filename',()=>{
 const image={src:'misleading-diagram-name.webp',width:1200,height:1000,purpose:'photograph'};
 const project={hero:image,sections:[{id:'example',paragraphs:['A genuine source.'],media:[image]}]};
 assert.equal(projectStudyLayout(project,'example').layout,'split');
 image.purpose='diagram';assert.equal(projectStudyLayout(project,'example').layout,'broad');
 assert.equal(projectStudyEvidenceLayout({...image,purpose:'photograph'}),'pair');
 assert.equal(projectStudyEvidenceLayout({...image,width:700,height:1200,purpose:'photograph'}),'full');
});

test('unknown chapters and invalid source dimensions cannot silently invent a composition',()=>{
 const project=structuredClone(study('mode-s-of-making'));
 assert.throws(()=>projectStudyLayout(project,'not-a-real-chapter'),RangeError);
 for(const invalid of [0,-1,NaN,Infinity]){
  project.hero.width=invalid;assert.throws(()=>projectStudyLayout(project,'overview'),RangeError);
 }
 assert.equal(projectStudyLayout(project,'credits').layout,'reading','Credits do not require a fictional companion image');
});
