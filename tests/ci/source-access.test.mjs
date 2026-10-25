// Exact hybrid additions are independently reversed to d3 in hybrid-scenes.test.mjs.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const hash=value=>createHash('sha256').update(value).digest('hex');
// Independently captured from deployed 33215722b196f4184028e0ad6ae18934fabc6e7a.
// Deliberately bounded to this additive source-access slice. No runtime git or
// generated baseline: future source changes require a separately reviewed pin.
// Four JSX pins include the separately reviewed name/hidden-description delta;
// link-announcements.test.mjs independently reverses its twelve exact substitutions
// to the deployed ce12 six-file baseline. Asset/data/CSS pins remain unchanged.
// Cas-only dispatcher is independently reversed by editorial-scenes.test.mjs.
const baseline={
  "release/manifest.json": "6bc10dfa18a7aafc828d9b39f1b046faddb7c8b514e9260a7d9adca0d46179e1",
  "release/project-assets.json": "83f51a9847419f66f9ddde151b135fd3c2c58d4744d01631579497aad2916244",
  "release/xr-assets.json": "33692e7a4a4be11e19e1cce804c5d5421f417aca6c0e6d7b51a60561692b45ad",
  "release/project-studies.json": "c222cdcec3fd5ff5f040f1db5a7c30f52a9871c6dc92b76dbb288e068e17341c",
  "release/xr-study.json": "3605cb7ed9abefc0721091d7883fdc765d0f0471af1b7d4db49f326228a68001",
  "release/xr-workspace.json": "41c48db687e71332240a002e0892141a7eac887c94740ef4c175cc4ccc4e1211",
  "release/story.json": "250c0853d8d5f9d993bc89b8a563eef5717300c1772a8c5da04647d165c740da",
  "components/ProjectCaseStudy.jsx": "e4e6b4c4430ecc47e9949f353afaf95c0446d17d5db351093aac2e249e996375",
  "components/XRProject.jsx": "946f16f178bc4d2ddc13c12066cb9670f0d63fbb7df8bb3a47ff3397cc0b1fae",
  "components/ProjectCaseStudy.module.css": "2d2bab984ea7c78fefa0909d900224c9f626539fe995573e8ed99aa12a25a432",
  "components/XRProject.module.css": "49e7c3d770d87c3d4d7eea5cec6c01421b5e998fcc82bff5a33e0c6b829f9cc5",
  "components/BendingProject.jsx": "585b055ff08bb0c8451d1780b6cf1268088b2ec46ded4661a2da46bca7b97970",
  "components/EntranceDiagramFocus.jsx": "e774fd4d6b6cb072834d4f8e3a269f0319d5aceaa360200a822f0ae6d085c146",
  "components/EntranceDiagramFocus.module.css": "e011224777e05129db70b2042006f5eb57998cae788d63f008ff1d35bd83b64f"
};
const read=path=>readFile(new URL(path,root),'utf8');
const components=[['ProjectCaseStudy.jsx','image','sourceLink'],['XRProject.jsx','item','recordingLink']];
function action(variable,style){return `<a className={styles.${style}} data-evidence-source-link href={${variable}.src} target="_blank" rel="noopener noreferrer" aria-label={\`Open full image (new tab): \${${variable}.alt}\`}>Open full image (new tab)</a>`;}
function verifyMarkup(source,name,variable,style){
 const anchor=action(variable,style);
 assert.equal(source.split(anchor).length,2,'Exactly one plain native action template');
 assert.ok(source.includes(`<p>{${variable}.caption}</p><span>{${variable}.credit}</span>${anchor}</figcaption>`),'Append after intact direct caption and credit, outside the original image anchor');
 // Exact allowed markup excludes handlers, nested planes, modal logic and any
 // changes to original image anchors, lazy loading, primary visuals or sources.
 assert.equal(hash(source.replace(anchor,'')),baseline[`components/${name}`],'Only the reviewed native anchor may differ from the deployed component');
}

test('source-access preserves source JSON, asset pins, existing controls and all reused CSS',async()=>{
 for(const [path,expected]of Object.entries(baseline)){
  if(components.some(([name])=>path===`components/${name}`))continue;
  assert.equal(hash(await readFile(new URL(path,root))),expected,path);
 }
});
test('generic and XR actions are additive native links with label-in-name and secure new-tab semantics',async()=>{
 for(const [name,variable,style]of components)verifyMarkup(await read(`components/${name}`),name,variable,style);
});
test('source-access markup contract rejects changed targets, handlers and nested ownership',async()=>{
 for(const [name,variable,style]of components){
  const source=await read(`components/${name}`),anchor=action(variable,style);
  for(const changed of [anchor.replace(`href={${variable}.src}`,'href="https://example.invalid/"'),anchor.replace('noopener noreferrer','noreferrer'),anchor.replace('data-evidence-source-link','data-evidence-source-link onClick={openModal}'),anchor.replace('data-evidence-source-link','data-evidence-source-link data-information-motion-surface="plane"'),anchor.replace('Open full image (new tab):','Image:')])assert.throws(()=>verifyMarkup(source.replace(anchor,changed),name,variable,style));
 }
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
