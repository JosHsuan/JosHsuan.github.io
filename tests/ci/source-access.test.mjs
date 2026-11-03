import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const hash=value=>createHash('sha256').update(value).digest('hex');
const read=path=>readFile(new URL(path,root),'utf8');
const components=['ProjectCaseStudy.jsx','EditorialProjectStudy.jsx','XRProject.jsx','BendingProject.jsx','EntranceDiagramFocus.jsx'];
function imageReading(source){
 assert.doesNotMatch(source,/<a[^>]+href=\{(?:image|item)\.(?:src|source)\}/);
 assert.doesNotMatch(source,/data-inspect-figure|data-evidence-source-link|<EvidenceInspector|View full image|Open full image|Open complete source image/);
 assert.match(source,/<img|<image/);assert.match(source,/caption/);
}
test('all project images stay in native reading without enlargement or new-tab affordances',async()=>{
 for(const name of components)imageReading(await read('components/'+name));
 const runtime=await read('runtime/RuntimeRoot.mjs');assert.doesNotMatch(runtime,/createEvidenceManager/);
});
test('image-reading contract rejects a restored image anchor or inspection trigger',async()=>{
 const source=await read('components/ProjectCaseStudy.jsx');
 for(const added of ['<a href={image.src}>View</a>','<div data-inspect-figure="0"/>','<a data-evidence-source-link>Open full image</a>'])assert.throws(()=>imageReading(source+added));
});
// Literal foreground inventory, not the production evidence/dedup helper.
const foreground={
 'mode-s-of-making':['film-design-workflow','film-rotary-system','film-corexy-system'],
 'entrance-installation-art':['pattern-variations','workshop-assembly','built-installation'],
 'dot-based-3d-printing':['path-strategies','form-development','translucent-prototypes'],
 'hc3dp-caustics':['layer-system','path-logic','frame-arrangement','overinflation'],
 'special-assemblies':['module-aggregation','planning-workflow','robot-trajectories','assembly-detail'],
 'project-caschlatsch':['portfolio-voxel-framework','portfolio-module-infill','portfolio-xr-assembly-sequence','portfolio-xr-interface','portfolio-xr-data-exchange','portfolio-robotic-assembly'],
};
test('all 31 newly labelled source destinations retain their approved native asset bytes',async()=>{
 const projects=JSON.parse(await read('release/project-studies.json')).projects;
 const xr=JSON.parse(await read('release/xr-study.json'));
 const projectPins=JSON.parse(await read('release/project-assets.json')).assets;
 const xrPins=JSON.parse(await read('release/xr-assets.json')).assets;
 const paths=[];
 for(const [id,names]of Object.entries(foreground)){
  const project=projects.find(project=>project.id===id);assert.ok(project);
  for(const name of names){
   const path=`assets/projects/${id}/${name}.webp`;
   assert.ok(project.sections.flatMap(section=>section.media).some(image=>image.src===`/${path}`),path);paths.push(path);
  }
 }
 assert.equal(paths.length,23);
 for(const key of ['adaptiveMethod','physicalCapture','measurement','communication','dataCategories','physicalAssembly','assembly','physicalResult']){
  const source=xr.media[key];assert.ok(source.src.startsWith('/assets/xr/'));paths.push(source.src.slice(1));
 }
 assert.equal(paths.length,31);assert.equal(new Set(paths).size,31);
 for(const path of paths){
  const pin=[...projectPins,...xrPins].find(asset=>asset.path===path);assert.ok(pin,path);
  const bytes=await readFile(new URL(`release/public/${path}`,root));
  assert.equal(bytes.length,pin.bytes,path);assert.equal(hash(bytes),pin.sha256,path);
 }
 // This checks source bytes, not rendered visibility: the native browser tests
 // separately own 44px sizing, focus/forced paint, popup and return semantics.
});
