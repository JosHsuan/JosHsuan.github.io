import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const release=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',release),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function glb(file){const bytes=readFileSync(new URL('public/assets/projects/'+file,release)),size=bytes.readUInt32LE(12);return{bytes,json:JSON.parse(bytes.subarray(20,20+size)),binary:bytes.subarray(28+size)};}
const recipes=[
 {folder:'mode-s-of-making',original:'machine.glb',selected:'machine-materials.glb',originalHash:'3dbd3909d3eca07c765aa77f070231d3b0830b5de534f6520cce79138d86d382',selectedHash:'4b70d53fe51ed04e039285d797c1ead2babf027ffc05244b45080757a5877da9',attribute:'_SURFACE_FAMILY',count:503822,components:1,counts:[39244,356698,74494,3033,394,4755,17632,1196,24,6352]},
 {folder:'project-caschlatsch',original:'model.glb',selected:'model-materials.glb',originalHash:'4623278f7d9148d0ccdfd0080eb3f44dac36adb07bd6b8283b2863a7b9ad8f27',selectedHash:'4cf15112d405619ec27bc82fb81738f12d2da222ac1b720fd79f970a53af3e93',attribute:'_FIBER_AXIS',count:61362,components:3},
];
for(const recipe of recipes)test(`${recipe.folder} surface derivative retains every original geometry byte and one primitive`,async()=>{
 const original=glb(recipe.folder+'/'+recipe.original),selected=glb(recipe.folder+'/'+recipe.selected);
 assert.equal(sha(original.bytes),recipe.originalHash);assert.equal(sha(selected.bytes),recipe.selectedHash);
 for(const [name,source]of [[recipe.original,original],[recipe.selected,selected]]){
  const pin=manifest.assets.find(asset=>asset.path===`assets/projects/${recipe.folder}/${name}`);
  assert(pin,'Original and additive derivative both remain pinned');assert.equal(pin.bytes,source.bytes.length);assert.equal(pin.sha256,sha(source.bytes));
 }
 assert.deepEqual(selected.json.bufferViews.slice(0,4),original.json.bufferViews);
 assert.deepEqual(selected.json.accessors.slice(0,4),original.json.accessors);
 assert.deepEqual(selected.binary.subarray(0,original.binary.length),original.binary);
 assert.equal(selected.json.meshes.length,1);assert.equal(selected.json.meshes[0].primitives.length,1);
 const originalPrimitive=original.json.meshes[0].primitives[0],selectedPrimitive=structuredClone(selected.json.meshes[0].primitives[0]);
 delete selectedPrimitive.attributes[recipe.attribute];assert.deepEqual(selectedPrimitive,originalPrimitive);
 const accessor=selected.json.accessors[selected.json.meshes[0].primitives[0].attributes[recipe.attribute]];
 assert.equal(accessor.count,recipe.count);assert.equal(accessor.type,recipe.components===1?'SCALAR':'VEC3');
 // Full decoded family, fibre-axis and triangle agreement runs in the installed
 // application test suite; this pre-install gate proves source bytes/structure.
});
