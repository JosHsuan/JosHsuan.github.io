import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const hash=value=>createHash('sha256').update(value).digest('hex');
const read=path=>readFile(new URL(path,root),'utf8');
// Independently retained source pins from deployed 33215722. UI removal does not
// authorize changed documentary bytes, geometry, attribution or source records.
const baseline={
 'release/project-assets.json':'83f51a9847419f66f9ddde151b135fd3c2c58d4744d01631579497aad2916244',
 'release/xr-assets.json':'33692e7a4a4be11e19e1cce804c5d5421f417aca6c0e6d7b51a60561692b45ad',
 'release/xr-study.json':'3605cb7ed9abefc0721091d7883fdc765d0f0471af1b7d4db49f326228a68001',
 'release/xr-workspace.json':'41c48db687e71332240a002e0892141a7eac887c94740ef4c175cc4ccc4e1211',
 'release/story.json':'250c0853d8d5f9d993bc89b8a563eef5717300c1772a8c5da04647d165c740da',
};

test('scroll-only reading preserves all documentary records and manifest pins',async()=>{
 for(const [path,expected]of Object.entries(baseline))assert.equal(hash(await read(path)),expected,path);
 const raw=await read('release/project-studies.json'),studies=JSON.parse(raw);
 // Only the separately tested authored camera paths are newly authorized.
 // This independent pin is the original complete record with those five arrays
 // omitted; it still covers every source, view recipe, paragraph and credit.
 for(const project of studies.projects)if(project.model)delete project.model.cameraPath;
 assert.equal(hash(JSON.stringify(studies)),'62d2c2befe10add10c6756399e35aaec4c069b8143f17c91ab62ee1670e16e0a');
 const manifest=await read('release/manifest.json'),record=JSON.parse(manifest);
 assert.equal(record.projectStudiesSHA256,hash(raw),'Manifest pins the actual current authored-path record');
 const original=manifest.replace(record.projectStudiesSHA256,'c222cdcec3fd5ff5f040f1db5a7c30f52a9871c6dc92b76dbb288e068e17341c');
 assert.equal(hash(original),'6bc10dfa18a7aafc828d9b39f1b046faddb7c8b514e9260a7d9adca0d46179e1','No other manifest byte may change');
});

function assertInlineEvidence(source,name){
 assert.doesNotMatch(source,/<a\b[^>]*(?:href=\{(?:image|item|motion)\.(?:src|source)\}|data-evidence-source-link)/,name+' has no original-media action');
 assert.doesNotMatch(source,/data-evidence-source-link|View full image|Open full image|View recording|View animation/,name+' has no obsolete action copy');
 assert.match(source,/src=\{(?:image|item)\.src\} width=\{(?:image|item)\.width\} height=\{(?:image|item)\.height\}/,name+' retains original dimensions');
 assert.match(source,/<p>\{(?:image|item)\.caption\}<\/p><span>\{(?:image|item)\.credit\}<\/span>/,name+' retains direct caption and credit');
 assert.doesNotMatch(source,/<(?:button|input|select|details|summary)\b/,name+' does not gate reading behind a control');
}

test('generic and XR evidence are complete native inline media, not original-image links',async()=>{
 for(const name of ['ProjectCaseStudy.jsx','EditorialProjectStudy.jsx','XRProject.jsx'])assertInlineEvidence(await read('components/'+name),name);
});
test('inline evidence contract rejects restored source actions, missing provenance and altered dimension bindings',async()=>{
 const source=await read('components/ProjectCaseStudy.jsx');
 for(const changed of [source+'<a href={image.src}>Open</a>',source+'<button>Inspect</button>',source.replace('<p>{image.caption}</p><span>{image.credit}</span>','<p>{image.caption}</p>'),source.replace('width={image.width}','width={1}')])assert.throws(()=>assertInlineEvidence(changed,'mutation'));
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
test('all 31 inline documentary sources retain their approved native asset bytes',async()=>{
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
 // This checks immutable source bytes; browser tests separately establish that
 // the complete source, caption and credit are readable by scrolling alone.
});
