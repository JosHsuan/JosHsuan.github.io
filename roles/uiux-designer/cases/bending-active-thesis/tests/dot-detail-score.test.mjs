import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {DOT_SOURCE_REVISION,DOT_DETAIL_SELECTION,sampleDotDetail,createDotDetailCollector,fitDotDetailCamera} from '../components/dot-detail-score.mjs';
import {fitResearchCamera} from '../components/research-scene-geometry.mjs';
const bytes=await readFile(new URL('../release/public/assets/projects/dot-based-3d-printing/model.glb',import.meta.url)),jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+jsonLength)),offset=28+jsonLength,compression=json.bufferViews[0].extensions.EXT_meshopt_compression;
await MeshoptDecoder.ready;
const decoded=new Uint8Array(compression.count*compression.byteStride);MeshoptDecoder.decodeGltfBuffer(decoded,compression.count,compression.byteStride,bytes.subarray(offset+compression.byteOffset,offset+compression.byteOffset+compression.byteLength),compression.mode,compression.filter);
const points=new Float32Array(decoded.buffer),collector=createDotDetailCollector();for(let i=0;i<points.length;i+=3)collector.add(points[i],points[i+1],points[i+2],i/3);const selection=collector.finish(),support=[];
for(const x of[json.accessors[0].min[0],json.accessors[0].max[0]])for(const y of[json.accessors[0].min[1],json.accessors[0].max[1]])for(const z of[json.accessors[0].min[2],json.accessors[0].max[2]])support.push(x,y,z);
const hash=value=>createHash('sha256').update(value).digest('hex');
test('Dot detail is a pinned nonchronological original-point coordinate selection',()=>{
 assert.equal(hash(bytes),DOT_SOURCE_REVISION);assert.equal(hash(decoded),'6841b1ddbcf8c8435ba64e0a14f232891b07be25dbe1bc71dc9b8d892e02bcf8');
 assert.equal(points.length/3,14810);assert.equal(selection.indices.length,78);assert.equal(hash(selection.indices),DOT_DETAIL_SELECTION.indexSHA256);
 for(let i=0;i<78;i++)assert.deepEqual([...selection.points.slice(i*3,i*3+3)],[...points.slice(selection.indices[i]*3,selection.indices[i]*3+3)]);
 assert(selection.indices.some((index,i)=>i&&index!==selection.indices[i-1]+1),'Not a fabricated source-order segment');
 assert.throws(()=>createDotDetailCollector().finish(),/differs/);
});
test('Dot camera beat has exact full endpoints, bounded reversible weights and flat joins',()=>{
 for(const p of[-1,0,.2,.85,1,2])assert.deepEqual(sampleDotDetail(p),{weight:0,beat:'full',cameraProgress:p>=.85?1:0});
 for(const p of[.45,.5,.55,.6,.62])assert.deepEqual(sampleDotDetail(p),{weight:1,beat:'detail',cameraProgress:.5});
 for(let i=0;i<=100;i++){const p=i/100,v=sampleDotDetail(p);assert(v.weight>=0&&v.weight<=1);assert.equal(sampleDotDetail(p,{enabled:false}).weight,0);assert.deepEqual(sampleDotDetail(p),v);}
 for(const p of[.2,.45,.62,.85])assert(Math.abs(sampleDotDetail(p+1e-5).weight-sampleDotDetail(p-1e-5).weight)<1e-9);
 assert.throws(()=>sampleDotDetail(NaN),/Finite/);
});
test('Detail fits selected original points while all 14810 retain valid near/far across authored yaw, blend and aspect',()=>{
 const before=hash(decoded);
 for(const aspect of[1440*.51/(1000*.78),390*.94/(844*.45),320*.94/(568*.45)])for(const yaw of[.5,.63,.76,.89,1.02])for(const weight of[0,.25,.5,.75,1]){
  const intent={yaw,pitch:.16+(yaw-.5)/.52*.12,fov:36,zoom:1.04},pose=fitDotDetailCamera(support,selection,aspect,intent,weight),full=fitResearchCamera(support,aspect,intent);
  if(weight===0)assert.deepEqual(pose,full);assert.equal(pose.near,full.near);assert.equal(pose.far,full.far);
  const camera=new T.PerspectiveCamera(pose.fov,aspect,pose.near,pose.far);camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.lookAt(...pose.target);camera.updateMatrixWorld();
  for(let i=0;i<points.length;i+=3){const v=new T.Vector3(points[i],points[i+1],points[i+2]).project(camera);assert(v.z>=-1&&v.z<=1,'No original source near/far clipping');}
  for(let i=0;i<selection.points.length;i+=3){const v=new T.Vector3(...selection.points.slice(i,i+3)).project(camera);assert(Math.abs(v.x)<.95&&Math.abs(v.y)<.95,'Selected points remain framed');}
 }
 assert.equal(hash(decoded),before);for(const weight of[-.1,1.1,NaN])assert.throws(()=>fitDotDetailCamera(support,selection,1,{},weight),/Bounded/);
});
