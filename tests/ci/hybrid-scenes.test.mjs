import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {hybridProjectLayout,editorialProjectLayout} from '../../roles/uiux-designer/cases/bending-active-thesis/components/project-editorial-layout.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const projects=JSON.parse(await read('release/project-studies.json')).projects;

test('all six routes partition native chapters without mutating source records',()=>{
 const before=JSON.stringify(projects),expected={
  'mode-s-of-making':['overview','credits'],
  'entrance-installation-art':['overview','credits'],
  'dot-based-3d-printing':['overview','results','credits'],
  'hc3dp-caustics':['overview','results','credits'],
  'special-assemblies':['overview','results','credits'],
  'project-caschlatsch':['overview','xr-guidance','making','results','credits'],
 };
 assert.deepEqual(projects.map(project=>project.id),Object.keys(expected));
 for(const project of projects){
  const layout=hybridProjectLayout(project);
  assert.deepEqual(layout.nativeChapters,expected[project.id]);
  assert.equal(editorialProjectLayout(project),null);
  for(const chapter of project.model.chapters)assert.ok(!layout.nativeChapters.includes(chapter),'A source cannot have two presentation owners');
  for(const media of project.motionMedia??[])assert.ok(!layout.nativeChapters.includes(media.chapter),'Native chapter must not hide a selected film');
 }
 assert.equal(JSON.stringify(projects),before);
 assert.equal(hybridProjectLayout({id:'unreviewed-case'}),null);
});
test('Special retains its original model, photographic result pair and nonloop simulation',()=>{
 const project=projects.find(item=>item.id==='special-assemblies'),layout=hybridProjectLayout(project);
 const section=project.sections.find(s=>s.id==='results');
 assert.equal(layout.results.section,section);assert.equal(layout.results.scene,section.media[0]);assert.deepEqual(layout.results.evidence,[section.media[1]]);
 assert.deepEqual(section.media.map(i=>i.src),['/assets/projects/special-assemblies/front-prototype.webp','/assets/projects/special-assemblies/assembly-detail.webp']);
 assert.equal(project.hero.src,'/assets/projects/special-assemblies/hero.webp');
 assert.equal(project.model.sha256,'43de5ca2dd8095a125d7f29e58851b5a80dc9588625912918d75dbadae8e28df');
 assert.equal(project.model.meshes,60);assert.deepEqual(project.model.chapters,['context','system']);
 assert.equal(project.motionMedia.length,1);
 const film=project.motionMedia[0];
 assert.equal(film.src,'/assets/projects/special-assemblies/robot-assembly-motion.mp4');
 assert.equal(film.durationSeconds,7.56);assert.equal(film.kind,'simulation');assert.equal(film.loop,false);
 for(const mutate of [p=>p.model=null,p=>p.model.chapters=['results'],p=>p.motionMedia=[],p=>p.motionMedia[0].loop=true,p=>p.motionMedia[0].kind='recording',p=>p.hero.src='/wrong.webp',p=>p.sections.find(s=>s.id==='results').media.reverse()]){
  const bad=structuredClone(project);mutate(bad);assert.throws(()=>hybridProjectLayout(bad));
 }
});
test('native chapters retain the shared background lease and explicit absent-stage state',async()=>{
 const driver=await read('runtime/background/SiteBackgroundDriver.mjs'),presenter=await read('runtime/site/ProjectStudyBackdropPresenter.mjs');
 assert.match(driver,/if\(studyRoot&&!editorialStudy\)projectBackdrop=/);
 assert.match(driver,/if\(studyRoot&&!editorialStudy\)releaseStage=/);
 assert.match(driver,/if\(editorialStudy\|\|hybridStudy\)for\(const image/);
 assert.match(presenter,/if\(nativeChapters.has\(chapter\)\)/);
 assert.match(presenter,/kind:'native'/);assert.match(presenter,/absent:target.kind==='native'/);
});
