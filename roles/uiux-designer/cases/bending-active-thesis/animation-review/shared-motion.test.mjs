import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import * as shared from '../runtime/motion/window-motion-api.mjs';
import * as kinetic from './kinetic-motion.mjs';
import * as motion from './window-motion.mjs';
import * as path from './window-path.mjs';
import * as scroll from './window-scroll.mjs';
import * as outline from './window-outline.mjs';
import {windowEffects3D,windowEffects2D,sampleKineticPose} from './window-transitions.mjs';

test('catalog compatibility entries expose the actual shared function objects',()=>{
 for(const entry of [kinetic,motion,path,scroll,outline])for(const [name,value] of Object.entries(entry))assert.equal(value,shared[name],name);
 assert.equal(sampleKineticPose,shared.sampleKineticPose);
});

test('only membrane and ink recipes remain, with the original C3 membrane parameters pinned',()=>{
 assert.deepEqual(Object.keys(shared.WINDOW_MOTION_RECIPES),['membrane','ink']);
 assert.deepEqual(shared.getWindowMotionRecipe('membrane'),{key:'membrane',frequency:1.55,damping:.55,axis:[0,-100,60],mask:'membrane',accent:'copper',outlineLimit:.105});
 assert.deepEqual(shared.getWindowMotionRecipe('ink'),{key:'ink',frequency:1.6,damping:.58,axis:[-75,-35,20],mask:'ink',accent:'copper',outlineLimit:.055});
 assert(Object.isFrozen(shared.WINDOW_MOTION_RECIPES));assert(Object.isFrozen(shared.getWindowMotionRecipe('membrane').axis));
 assert.throws(()=>shared.getWindowMotionRecipe('orbit'),/Unknown/);
 assert.throws(()=>shared.getWindowMotionRecipe('toString'),/Unknown/);
 assert.equal(windowEffects3D.length,2);assert.equal(windowEffects2D.length,2);
 assert.equal(new Set([...windowEffects3D,...windowEffects2D].map(e=>e.id)).size,4);
});

test('each retained recipe produces identical numeric response and boundaries for model and information content',()=>{
 for(const key of ['membrane','ink']){
  const model=windowEffects3D.find(e=>e.key===key),information=windowEffects2D.find(e=>e.key===key);
  for(const field of ['frequency','damping','axis','mask','accent','outlineLimit'])assert.deepEqual(model[field],information[field]);
  const a=shared.scrollingEffect(model,380),b=shared.scrollingEffect(information,380),sa=shared.createWindowMotion(a),sb=shared.createWindowMotion(b);
  for(const target of [-.45,.3,.75,-.2,0]){
   shared.setWindowScrollTarget(sa,target,{energy:.3});shared.setWindowScrollTarget(sb,target,{energy:.3});
   shared.advanceWindowMotion(sa,.14);shared.advanceWindowMotion(sb,.14);
   const pa=shared.sampleScrollingPose(a,sa),pb=shared.sampleScrollingPose(b,sb);
   assert.deepEqual(pa,pb);assert.equal(shared.sampleWindowOutline(a,pa,670,280),shared.sampleWindowOutline(b,pb,670,280));
   assert.equal(pa.alpha,1);assert.equal(pa.cut,1);assert.equal(pa.aperture,0);
  }
 }
});

test('shared motion modules import only their own pure dependency graph',async()=>{
 const directory=new URL('../runtime/motion/',import.meta.url);
 for(const name of await readdir(directory)){
  if(!name.endsWith('.mjs'))continue;
  const source=await readFile(new URL(name,directory),'utf8');
  const code=source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  assert(!/animation-review|requestAnimationFrame\s*\(|cancelAnimationFrame\s*\(|setTimeout\s*\(|setInterval\s*\(|document\.|window\.|from ['"]react/.test(code),name);
  for(const match of source.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g))assert(match[1].startsWith('./'),name+' '+match[1]);
 }
});
