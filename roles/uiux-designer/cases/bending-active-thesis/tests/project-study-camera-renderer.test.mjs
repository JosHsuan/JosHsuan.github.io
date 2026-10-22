import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {acquireProjectStudyScene,projectStudyCanvasPoint} from '../components/project-study-scene.mjs';
import {fitResearchCamera} from '../components/research-scene-geometry.mjs';
class Target {
 constructor(){this.dataset={};this.style={};}
 addEventListener(){} removeEventListener(){} setAttribute(){}
}
function sourceGLB(points=false){
 const positions=new Float32Array([-1,0,0,1,0,0,0,1,0]),geometry=Buffer.from(positions.buffer);
 const json={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0},material:0,mode:points?0:4}]}],materials:[{pbrMetallicRoughness:{baseColorFactor:[.7,.8,.9,1]}}],buffers:[{byteLength:geometry.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:geometry.length}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[-1,0,0],max:[1,1,0]}]};
 let text=Buffer.from(JSON.stringify(json));text=Buffer.concat([text,Buffer.alloc((4-text.length%4)%4,32)]);
 const header=Buffer.alloc(12),jHeader=Buffer.alloc(8),bHeader=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+text.length+8+geometry.length,8);jHeader.writeUInt32LE(text.length);jHeader.writeUInt32LE(0x4e4f534a,4);bHeader.writeUInt32LE(geometry.length);bHeader.writeUInt32LE(0x004e4942,4);
 return{bytes:Buffer.concat([header,jHeader,text,bHeader,geometry]),positions:[...positions]};
}
function rendererFixture({omitSource=false,lossDuringDraw=false}={}){
 const canvas=new Target();canvas.dataset={};canvas.width=1;canvas.height=1;canvas.remove=()=>{canvas.parentNode=null;};
 const report={renders:0,disposals:0,losses:0,positions:[],primitive:null,pointSize:null,attenuation:null,contextLost:false};let width=0,height=0,dpr=1;
 const renderer={domElement:canvas,debug:{},info:{render:{calls:0}},capabilities:{maxTextureSize:4096},xr:{isPresenting:false},
  setClearColor(){},getContext:()=>({isContextLost:()=>report.contextLost}),setSize(){},setPixelRatio(){},setViewport(){},getPixelRatio:()=>dpr,getSize:value=>value.set(width,height),
  setDrawingBufferSize(w,h,ratio){width=w;height=h;dpr=ratio;canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);},
  render(scene,camera){report.renders++;this.info.render.calls=0;scene.traverse(node=>{if(!node.isMesh&&!node.isPoints)return;report.positions=[...node.geometry.getAttribute('position').array];report.primitive=node.isPoints?'points':'triangles';report.pointSize=node.material.size;report.attenuation=node.material.sizeAttenuation;if(!omitSource)node.onBeforeRender(this,scene,camera,node.geometry,node.material,null);this.info.render.calls++;});if(lossDuringDraw)report.contextLost=true;},
  dispose(){report.disposals++;},forceContextLoss(){report.losses++;},
 };
 const surface={appendChild(node){node.parentNode=this;}},host={ownerDocument:{defaultView:{location:{origin:'https://portfolio.test'},devicePixelRatio:2}},querySelector:()=>surface};
 return{renderer,report,canvas,host};
}

test('composed scroll camera owns the final fit and unchanged physical intent never refits or redraws',async t=>{
 const previous=globalThis.fetch;t.after(()=>{globalThis.fetch=previous;});
 const {bytes,positions}=sourceGLB(),f=rendererFixture(),controller=new AbortController();t.after(()=>controller.abort());
 globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});
 const model={src:'/assets/projects/test/source.glb',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,webUnits:'meters',upAxis:'Y',vertices:3,triangles:1,meshes:1,bounds:{min:[-1,0,0],max:[1,1,0]},chapters:['context','system']};
 const scene=await acquireProjectStudyScene({host:f.host,model,signal:controller.signal,createRenderer:()=>f.renderer});
 const intent={yawRad:.9,pitchRad:.4,fovDeg:40,zoom:1.1};
 scene.present({chapter:'context',azimuth:5,elevation:5,cameraIntent:intent});assert.equal(scene.inspect().draws,0,'Intent can be prepared before size without a legacy-camera draw');
 scene.resize(1440,1000);assert.equal(scene.inspect().cameraFits,1);assert.equal(scene.inspect().supportPoints,8);
 const support=[];for(const x of [-1,1])for(const y of [0,1])for(const z of [0,0])support.push(x,y,z);
 assert.deepEqual(scene.inspect().pose,fitResearchCamera(support,1440*.51/(1000*.78),{yaw:.9,pitch:.4,fov:40,zoom:1.1}),'Already-composed intent must not add legacy inspection twice');
 const {draws,cameraFits}=scene.inspect();
 for(let i=0;i<100;i++)scene.present({chapter:i%2?'context':'system',azimuth:i,elevation:-i,cameraIntent:{...intent},handheld:{xPx:Math.sin(i)*.8,yPx:Math.cos(i)*.5,rollRad:Math.sin(i*.7)*.0008}});
 assert(scene.inspect().compositor.writes>=100);assert.equal(f.canvas.style.willChange,'transform');
 assert.equal(scene.inspect().draws,draws);assert.equal(scene.inspect().cameraFits,cameraFits);assert.equal(scene.inspect().view.chapter,'context','Semantic state can change without repainting identical geometry');
 scene.present({cameraIntent:{...intent,yawRad:1}});assert.equal(scene.inspect().cameraFits,cameraFits+1);
 scene.resize(390,844);assert.equal(scene.inspect().cameraFits,cameraFits+2);scene.resize(390,844);assert.equal(scene.inspect().cameraFits,cameraFits+2);
 assert.deepEqual(f.report.positions,positions,'Source positions remain byte-equivalent');
 scene.present({cameraIntent:{...intent,pitchRad:2}});
 assert.deepEqual(scene.inspect().pose,fitResearchCamera(support,390*.94/(844*.45),{yaw:.9,pitch:1.15,fov:40,zoom:1.1}),'Existing inspection safety clamp remains');
 assert.equal(scene.inspect().renderSubmit.kind,'cpu-submission-only');assert(Number.isFinite(scene.inspect().renderSubmit.lastMs));
 for(const handheld of [{xPx:NaN,yPx:0,rollRad:0},{xPx:1.21,yPx:0,rollRad:0},{xPx:0,yPx:1.21,rollRad:0},{xPx:0,yPx:0,rollRad:.00121}])assert.throws(()=>scene.present({cameraIntent:intent,handheld}),/Bounded compositor/);
 scene.present({cameraIntent:intent,handheld:null});assert.equal(f.canvas.style.transform,'none');assert.equal(f.canvas.style.willChange,'');
 assert.throws(()=>scene.present({cameraIntent:{...intent,yawRad:Infinity}}),/Finite composed/);
 assert.throws(()=>scene.present({cameraIntent:{...intent,fovDeg:180}}),/Valid source support/);
 controller.abort();assert.equal(scene.inspect().supportPoints,0);assert.equal(f.report.disposals,1);
});

test('inverse handheld hit mapping preserves real canvas points across pan, roll and parent axis scaling',()=>{
 for(const [width,height,ox,oy] of [[1440,1000,.735,.53],[390,844,.5,.42]])for(const angle of[-.0012,0,.0012]){
  const h={xPx:.9,yPx:-.6,rollRad:angle,originX:width*ox,originY:height*oy},c=Math.cos(angle),s=Math.sin(angle);
  const forward=(x,y)=>({x:h.originX+h.xPx+c*(x-h.originX)-s*(y-h.originY),y:h.originY+h.yPx+s*(x-h.originX)+c*(y-h.originY)});
  const corners=[[0,0],[width,0],[0,height],[width,height]].map(([x,y])=>forward(x,y)),minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
  const sx=.91,sy=1.07,left=23,top=-17,rect={left:left+minX*sx,top:top+minY*sy,width:(maxX-minX)*sx,height:(maxY-minY)*sy};
  for(const [x,y]of [[0,0],[width,0],[0,height],[width,height],[width*.735,height*.53]]){
   const q=forward(x,y),actual=projectStudyCanvasPoint(left+q.x*sx,top+q.y*sy,rect,{width,height},h);
   assert(actual);assert(Math.abs(actual.x-x)<1e-7);assert(Math.abs(actual.y-y)<1e-7);
  }
  const out=forward(-10,-10);assert.equal(projectStudyCanvasPoint(left+out.x*sx,top+out.y*sy,rect,{width,height},h),null);
 }
});


test('all five authored source boxes remain inside the viewport under bounded handheld and inspection extremes',async()=>{
 const {projects}=JSON.parse(await readFile(new URL('../release/project-studies.json',import.meta.url),'utf8'));
 for(const project of projects.filter(value=>value.model))for(const [width,height]of [[1440,1000],[390,844],[320,568]]){
  const model=project.model,slot=width<800?{x:.5,y:.42,width:.94,height:.45}:{x:.735,y:.53,width:.51,height:.78},support=[];
  for(const x of [model.bounds.min[0],model.bounds.max[0]])for(const y of [model.bounds.min[1],model.bounds.max[1]])for(const z of [model.bounds.min[2],model.bounds.max[2]])support.push(x,y,z);
  for(const key of model.cameraPath)for(const [azimuth,elevation]of [[0,0],[-.9,-.4],[-.9,.5],[.9,-.4],[.9,.5]]){
   const pose=fitResearchCamera(support,width*slot.width/(height*slot.height),{yaw:key.yawRad+azimuth,pitch:Math.max(-.1,Math.min(1.15,key.pitchRad+elevation)),fov:key.fovDeg,zoom:key.zoom}),camera=new T.PerspectiveCamera();
   camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.aspect=width/height;
   camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(pose.fov/2))/slot.height));camera.near=pose.near;camera.far=pose.far;
   camera.setViewOffset(width,height,width*(.5-slot.x),height*(.5-slot.y),width,height);camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
   for(let i=0;i<support.length;i+=3){
    const projected=new T.Vector3(...support.slice(i,i+3)).project(camera),x=(projected.x+1)*width*.5,y=(1-projected.y)*height*.5;
    assert(projected.z>=-1&&projected.z<=1,`${project.id} near/far source clipping`);
    for(const roll of [-.0012,.0012])for(const tx of [-1.2,1.2])for(const ty of [-1.2,1.2]){
     const ox=width*slot.x,oy=height*slot.y,c=Math.cos(roll),s=Math.sin(roll),px=ox+tx+c*(x-ox)-s*(y-oy),py=oy+ty+s*(x-ox)+c*(y-oy);
     assert(px>=0&&px<=width&&py>=0&&py<=height,`${project.id} ${width} compositor clips verified source box`);
    }
   }
  }
 }
});


test('native context loss detected before or during draw retains the event-path classification',async t=>{
 const previous=globalThis.fetch;t.after(()=>{globalThis.fetch=previous;});const {bytes}=sourceGLB();
 globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});
 const model={src:'/assets/projects/test/source.glb',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,webUnits:'meters',upAxis:'Y',vertices:3,triangles:1,meshes:1,bounds:{min:[-1,0,0],max:[1,1,0]},chapters:['context']};
 for(const lossDuringDraw of [false,true]){
  const f=rendererFixture({lossDuringDraw}),controller=new AbortController();t.after(()=>controller.abort());
  const scene=await acquireProjectStudyScene({host:f.host,model,signal:controller.signal,createRenderer:()=>f.renderer});
  if(!lossDuringDraw)f.report.contextLost=true;
  assert.throws(()=>scene.resize(390,844),{message:'context-lost'});assert.equal(scene.inspect().successfulPaint,false);assert.equal(scene.inspect().draws,0);
  controller.abort();assert.equal(f.report.disposals,1);
 }
});
