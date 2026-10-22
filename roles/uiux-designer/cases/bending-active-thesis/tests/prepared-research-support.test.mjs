import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareResearchSupport} from '../components/prepared-research-support.mjs';
import {fitResearchCamera,collectResearchSupport} from '../components/research-scene-geometry.mjs';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function actualSupport(){
 const study=JSON.parse(await readFile(new URL('../release/xr-study.json',import.meta.url),'utf8'));
 const bytes=await readFile(new URL('../release/public'+study.model.src,import.meta.url));
 const hash=createHash('sha256').update(bytes).digest('hex');if(hash!==study.model.sha256)throw Error('Pin mismatch');
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const points=collectResearchSupport(gltf.scene);
 gltf.scene.traverse(node=>{node.geometry?.dispose();for(const material of(Array.isArray(node.material)?node.material:[node.material]))material?.dispose();});
 return{points,hash};
}
const cases=[];
for(const [yaw,pitch,zoom,fov] of [[.72,.36,1,36],[.52,.29,1,36],[.92,.28,1,36],[.55,.3,1,36],[.72,.36,1.1,36],[.1,-.025,.98,32],[0,0,.95,32],[.12,-.025,.95,32]])
 for(const aspect of [1440*.51/(1000*.78),390*.94/(844*.45),390*.94/(844*.76)])
 for(const offset of [0,.012,-.4,.9])cases.push({aspect,options:{yaw:yaw+offset,pitch:Math.max(-.1,Math.min(1.15,pitch+offset/2)),fov,zoom}});

test('actual pinned XR all-point poses remain bit-exact across authored, phone, aspect and inspection intents',async()=>{
 const {points}=await actualSupport();assert.equal(points.length/3,96312);const support=prepareResearchSupport(points);
 for(const {aspect,options} of cases)assert.deepEqual(support.fit(aspect,options),fitResearchCamera(points,aspect,options));
 assert.equal(support.inspect().bytes,2311488);support.dispose();
});
test('owned copy is isolated while raw-array API revalidates caller mutation',()=>{
 const raw=[-1,0,0,1,0,0,0,1,0],support=prepareResearchSupport(raw),before=support.fit(1);
 raw[0]=NaN;assert.throws(()=>fitResearchCamera(raw,1),/Finite source/);assert.deepEqual(support.fit(1),before);
 support.dispose();support.dispose();assert.deepEqual(support.inspect(),{disposed:true,points:0,bytes:0,bounds:null});assert.throws(()=>support.fit(1),/disposed/);
});
test('invalid support and parameters retain fail-closed behavior',()=>{
 for(const source of [null,[],[1,2],[0,NaN,1],[0,Infinity,1],[0,"1",2],[0,1n,2]])assert.throws(()=>prepareResearchSupport(source),RangeError);
 const raw=[-1,0,0,1,0,0],support=prepareResearchSupport(raw);
 for(const [aspect,options] of [[0,{}],[NaN,{}],[1,{fov:1}],[1,{fov:175}],[1,{zoom:0}],[1,{yaw:NaN}],[1,{pitch:Infinity}]]){
  assert.throws(()=>fitResearchCamera(raw,aspect,options),RangeError);assert.throws(()=>support.fit(aspect,options),RangeError);
 }
 support.dispose();
});
test('exceptional non-finite scalar recheck diagnostics stay exact, never fallback',()=>{
 const error=fn=>{try{fn();assert.fail('Expected a diagnostic');}catch(e){assert(e instanceof RangeError);assert.match(e.message,/firstNonFiniteProjection/);return e.message;}};
 for(const [raw,aspect,options] of [[[1e308,1e308,1e308],1,{}],[[-1,0,0,1,0,0],Number.MIN_VALUE,{}],[[-1,0,0,1,0,0],1,{zoom:Number.MAX_VALUE}]]){
  const support=prepareResearchSupport(raw);assert.equal(error(()=>support.fit(aspect,options)),error(()=>fitResearchCamera(raw,aspect,options)));support.dispose();
 }
});

test('prepared support preserves finite scalar diagnostic under injected Vector3.dot failure and recovers afterward',()=>{
 const raw=[-1,0,0,1,0,0,0,1,0],support=prepareResearchSupport(raw),healthy=support.fit(1),original=T.Vector3.prototype.dot;
 const message=fn=>{try{fn();assert.fail('Expected fit failure');}catch(error){assert(error instanceof RangeError);return error.message;}};
 try{T.Vector3.prototype.dot=()=>NaN;const prepared=message(()=>support.fit(1)),baseline=message(()=>fitResearchCamera(raw,1));assert.equal(prepared,baseline);const diagnostic=JSON.parse(prepared.slice(prepared.indexOf('{')));assert(Number.isFinite(diagnostic.recheckDistance));assert.equal(diagnostic.firstNonFiniteProjection,null);}
 finally{T.Vector3.prototype.dot=original;}
 assert.deepEqual(support.fit(1),healthy);support.dispose();
});

test('bounds metadata is copied and cannot mutate the owned support',()=>{
 const support=prepareResearchSupport([-1,2,3,4,-5,6]),bounds=support.inspect().bounds;assert.deepEqual(bounds,{min:[-1,-5,3],max:[4,2,6]});const before=support.fit(1);bounds.min[0]=1e10;assert.deepEqual(support.fit(1),before);assert.equal(support.inspect().bounds.min[0],-1);support.dispose();
});
