import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createResearchPhoneGeometry,fitResearchCamera,fitResearchPhoneCamera} from '../components/research-scene-geometry.mjs';

function cameraFor(pose,aspect){const camera=new T.PerspectiveCamera(pose.fov,aspect,pose.near,pose.far);camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return camera;}

test('source support stays inside the display frustum across aspect and orbit without changing its coordinates',()=>{
 const points=new Float64Array([-81,-10,-200,92,30,240,-81,30,240,92,-10,-200,1,12,9]);
 const original=Array.from(points);
 for(const aspect of [.46,.72,1,1.6,2.4])for(const yaw of [-2,.72,2.8])for(const pitch of [-.1,.36,1.15]){
  const pose=fitResearchCamera(points,aspect,{yaw,pitch}),camera=cameraFor(pose,aspect),v=new T.Vector3();
  for(let i=0;i<points.length;i+=3){v.fromArray(points,i).project(camera);assert(Math.abs(v.x)<.89&&Math.abs(v.y)<.89,'Complete source support must be in frame');assert(v.z>=-1&&v.z<=1);}
 }
 assert.deepEqual(Array.from(points),original,'Camera fitting cannot rescale or reorient source data');
 assert.throws(()=>fitResearchCamera([0,0,NaN],1),/Finite/);assert.throws(()=>fitResearchCamera(points,0),/Valid/);
});

test('phone screen preserves the full recorded aspect and UV extent while the shell remains outside it',()=>{
 for(const aspect of [666/1440,534/1152,533/1152]){
  const phone=createResearchPhoneGeometry(aspect),positions=phone.screen.getAttribute('position'),uv=phone.screen.getAttribute('uv');
  phone.screen.computeBoundingBox();phone.body.computeBoundingBox();
  const screen=phone.screen.boundingBox,body=phone.body.boundingBox;
  assert(Math.abs((screen.max.x-screen.min.x)/(screen.max.y-screen.min.y)-aspect)<1e-6);
  assert(body.min.x<screen.min.x&&body.max.x>screen.max.x&&body.min.y<screen.min.y&&body.max.y>screen.max.y);
  assert(screen.min.z>body.max.z,'Screen is in front of the body, without a notch or occluding accessory');
  let minU=1,minV=1,maxU=0,maxV=0;
  for(let i=0;i<positions.count;i++){
   minU=Math.min(minU,uv.getX(i));minV=Math.min(minV,uv.getY(i));maxU=Math.max(maxU,uv.getX(i));maxV=Math.max(maxV,uv.getY(i));
   assert(Math.abs(uv.getX(i)-(positions.getX(i)/phone.dimensions.width+.5))<1e-6);
   assert(Math.abs(uv.getY(i)-(positions.getY(i)/phone.dimensions.height+.5))<1e-6);
  }
  assert(Math.abs(minU)<1e-6&&Math.abs(minV)<1e-6&&Math.abs(maxU-1)<1e-6&&Math.abs(maxV-1)<1e-6);
  phone.dispose();
 }
});

test('the complete 3D phone fits narrow and desktop display frames in front and mild perspective views',()=>{
 const phone=createResearchPhoneGeometry(666/1440);
 for(const aspect of [.4,.5,.8,1.3])for(const front of [true,false]){
  const pose=fitResearchPhoneCamera(phone.support,aspect,{front}),camera=cameraFor(pose,aspect),v=new T.Vector3();
  for(const geometry of [phone.body,phone.screen]){const p=geometry.getAttribute('position');for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).project(camera);assert(Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>=-1&&v.z<=1,'Device and recorded screen cannot be clipped');}}
  phone.body.computeBoundingBox();phone.screen.computeBoundingBox();
  const bodyDepth=new T.Vector3(0,0,phone.body.boundingBox.max.z).project(camera).z,screenDepth=new T.Vector3(0,0,phone.screen.boundingBox.min.z).project(camera).z;
  assert(Math.abs(bodyDepth-screenDepth)/2*(2**24)>32,'Recorded UI must have sufficient depth precision above the device casing');
 }
 phone.dispose();
});
