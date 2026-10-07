import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {simplex2D} from '../src/materials/vendor/noise2D.js';
import {studies} from '../src/review/catalog.js';
const root=new URL('../',import.meta.url),json=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const maps=await json('catalog/texture-assets.json'),noise=await json('catalog/shader-sources.json'),recipes=await json('catalog/material-recipes.json'),captures=await json('catalog/captures.manifest.json'),build=await json('verification/interaction-build.json');
let hashChecks=0;
for(const record of [...maps.assets,...noise.assets]){const bytes=await readFile(new URL(record.file,root));assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256,record.file);if(record.md5)assert.equal(createHash('md5').update(bytes).digest('hex'),record.md5);hashChecks++;}
assert.equal(simplex2D,await readFile(new URL('src/materials/vendor/noise2D.glsl',root),'utf8'));
assert.equal(studies.length,12);assert.equal(recipes.recipes.length,4);assert.equal(maps.assets.reduce((a,s)=>a+s.bytes,0),1883768);
for(const study of studies){for(const u of [.3,.7]){const c=captures.results.find(r=>r.id===study.id&&r.u===u);assert(c,`Capture missing: ${study.id}/${u}`);assert.equal(createHash('sha256').update(await readFile(new URL('assets/captures/'+c.filename,root))).digest('hex'),c.sha256);}}
assert.equal(build.count,12);assert(build.studioExcluded);assert(build.theatreModules.every(x=>!/@theatre[+/]studio/.test(x)));
const report={verifiedAt:new Date().toISOString(),hashChecks,sourceStringByteIdentical:true,publicTextureBytes:1883768,studies:studies.length,captures:captures.results.length,materialRecipes:recipes.recipes.length,studioExcluded:true,scope:'Local public-source fixture desk; not private project materials'};
await writeFile(new URL('verification/material-validation.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
