import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {acquireXRStage,stageCameraPose,xrStageCanvasPoint} from '../components/xr-stage-scene.mjs';
import {prepareResearchSupport} from '../components/prepared-research-support.mjs';

const positions=new Float32Array([-1,-1,0,1,-1,0,0,1,1]);
function sourceGLB(){
 const binary=Buffer.from(positions.buffer),data={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0},material:0}]}],materials:[{pbrMetallicRoughness:{baseColorFactor:[.7,.8,.9,1]}}],buffers:[{byteLength:binary.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:binary.length}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[-1,-1,0],max:[1,1,1]}]};
 let json=Buffer.from(JSON.stringify(data));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
 const header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);
 return Buffer.concat([header,jh,json,bh,binary]);
}
class Canvas extends EventTarget{
 constructor(){super();this.style={};this.dataset={};this.width=1;this.height=1;}
 setAttribute(){} remove(){this.removed=true;}
}
async function fixture(t,{stages=[],videos={},acquireMedia}={}){
 const bytes=sourceGLB(),previous=globalThis.fetch;
 globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});t.after(()=>{globalThis.fetch=previous;});
 const canvas=new Canvas(),context={lost:false,isContextLost(){return this.lost;}},report={renders:0,disposals:0,sourcePositions:null};let width=1,height=1,dpr=1;
 const gpu={domElement:canvas,debug:{},capabilities:{maxTextureSize:8192},info:{render:{calls:0}},setClearColor(){},getClearAlpha:()=>0,getContext:()=>context,
  getSize:target=>target.set(width,height),getPixelRatio:()=>dpr,setSize(){},setPixelRatio(){},setViewport(){},setDrawingBufferSize(w,h,p){width=w;height=h;dpr=p;canvas.width=Math.floor(w*p);canvas.height=Math.floor(h*p);},
  render(scene,camera){report.renders++;report.camera=camera.clone();this.info.render.calls=0;scene.traverseVisible(node=>{if(!node.isMesh)return;if(node.userData.sourceGeometry!==false)report.sourcePositions=[...node.geometry.getAttribute('position').array];node.onBeforeRender(this,scene,camera,node.geometry,node.material,null);this.info.render.calls++;});},
  dispose(){report.disposals++;},forceContextLoss(){context.lost=true;},
 };
 const host={dataset:{},ownerDocument:{defaultView:{devicePixelRatio:1,location:{origin:'https://site.test'},setTimeout,clearTimeout}},querySelector:selector=>selector.includes('data-xr-native-phone')?{dataset:{},hidden:false}:null,appendChild(){}};
 const model={src:'/assets/xr/fixture.glb',sha256:createHash('sha256').update(bytes).digest('hex'),vertices:3,triangles:1,bounds:{min:[-1,-1,0],max:[1,1,1]},sourceUnits:'meters',webUnits:'meters'};
 const abort=new AbortController(),scene=await acquireXRStage({host,signal:abort.signal,model,stages,videos,acquireMedia,createRenderer:()=>gpu});t.after(()=>scene.dispose());
 return{scene,abort,canvas,context,gpu,report,model};
}

test('XR prepared and raw fitting agree; composed model intent is not doubled and phone framing ignores it',()=>{
 const prepared=prepareResearchSupport(positions),intent={yawRad:.81,pitchRad:.42,fovDeg:39,zoom:1.08};
 try{
  for(const [width,height]of [[1440,1000],[390,844]]){
   const state={chapter:'method',azimuth:.8,elevation:.4,cameraIntent:intent};
   const raw=stageCameraPose(positions,width,height,state);assert.deepEqual(stageCameraPose(prepared,width,height,state),raw);
   const delta=raw.position.map((n,i)=>n-raw.target[i]);assert(Math.abs(Math.atan2(delta[0],delta[2])-intent.yawRad)<1e-12);assert(Math.abs(Math.atan2(delta[1],Math.hypot(delta[0],delta[2]))-intent.pitchRad)<1e-12);
   for(const chapter of ['adapt','assemble','join'])assert.deepEqual(stageCameraPose(prepared,width,height,{...state,chapter}),stageCameraPose(positions,width,height,{chapter}),'Source model intent cannot reframe a native recording');
  }
 }finally{prepared.dispose();}
});

test('XR retains source/environment participation while compositor-only idle performs no extra fit or draw',async t=>{
 const f=await fixture(t),intent={yawRad:.81,pitchRad:.42,fovDeg:39,zoom:1.08};
 f.scene.present({chapter:'method',azimuth:.8,elevation:.4,cameraIntent:intent});assert.equal(f.report.renders,0);
 f.scene.resize(1440,1000);let state=f.scene.inspect();
 assert.equal(state.successfulPaint,true);assert.equal(state.support.points,3);assert.equal(state.support.bytes,72);
 assert.equal(state.surface.sourceCalls,1);assert(state.surface.stageCalls>=1&&state.surface.stageCalls<=3);assert.equal(state.surface.calls,state.surface.sourceCalls+state.surface.stageCalls);
 assert.deepEqual(state.pose,stageCameraPose(positions,1440,1000,{chapter:'method',cameraIntent:intent}));
 const {draws,cameraFits}=state.surface;
 for(let i=0;i<100;i++)f.scene.present({chapter:'method',cameraIntent:{...intent},handheld:{xPx:Math.sin(i)*.8,yPx:Math.cos(i)*.65,rollRad:Math.sin(i*.47)*.00065}});
 state=f.scene.inspect();assert.equal(state.surface.draws,draws);assert.equal(state.surface.cameraFits,cameraFits);assert(state.surface.compositor.writes>=100);assert.equal(state.surface.compositor.kind,'2d-pan-roll');
 assert.deepEqual(f.report.sourcePositions,[...positions]);
 f.scene.present({cameraIntent:{...intent,yawRad:1}});assert.equal(f.scene.inspect().surface.draws,draws+1);assert.equal(f.scene.inspect().surface.cameraFits,cameraFits+1);
 f.scene.resize(390,844);assert.equal(f.scene.inspect().surface.cameraFits,cameraFits+2);f.scene.resize(390,844);assert.equal(f.scene.inspect().surface.cameraFits,cameraFits+2);
 f.abort.abort();assert.equal(f.scene.inspect().support.disposed,true);assert.equal(f.scene.inspect().support.bytes,0);assert.equal(f.report.disposals,1);assert.equal(f.canvas.removed,true);
});

test('XR native context loss releases acquisition-owned prepared support and preserves failure classification',async t=>{
 const f=await fixture(t);f.scene.resize(1440,1000);assert.equal(f.scene.inspect().support.points,3);
 f.context.lost=true;f.canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
 const state=f.scene.inspect();assert.equal(state.fallbackReason,'context-lost');assert.equal(state.successfulPaint,false);assert.equal(state.support.disposed,true);assert.equal(state.support.points,0);assert.equal(state.support.bytes,0);assert.equal(f.report.disposals,1);
 f.abort.abort();assert.equal(f.report.disposals,1,'Loss and abort release one renderer exactly once');
});

test('XR compositor inverse maps real source points through pan/roll and held parent axis scaling',()=>{
 for(const [width,height,ox,oy]of [[1440,1000,.735,.53],[390,844,.5,.32]])for(const rollRad of[-.0012,0,.0012]){
  const h={xPx:.8,yPx:-.65,rollRad,originX:width*ox,originY:height*oy},c=Math.cos(rollRad),s=Math.sin(rollRad);
  const forward=(x,y)=>({x:h.originX+h.xPx+c*(x-h.originX)-s*(y-h.originY),y:h.originY+h.yPx+s*(x-h.originX)+c*(y-h.originY)});
  const corners=[[0,0],[width,0],[0,height],[width,height]].map(([x,y])=>forward(x,y)),minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
  const sx=.91,sy=1.07,left=23,top=-17,rect={left:left+minX*sx,top:top+minY*sy,width:(maxX-minX)*sx,height:(maxY-minY)*sy};
  for(const [x,y]of [[0,0],[width,0],[0,height],[width,height],[width*ox,height*oy]]){
   const q=forward(x,y),local=xrStageCanvasPoint(left+q.x*sx,top+q.y*sy,rect,{width,height},h);assert(local);assert(Math.abs(local.x-x)<1e-7);assert(Math.abs(local.y-y)<1e-7);
  }
  const out=forward(-10,-10);assert.equal(xrStageCanvasPoint(left+out.x*sx,top+out.y*sy,rect,{width,height},h),null);
 }
});


test('XR decoded phone frames still draw while their unchanged prepared camera fit is reused',async t=>{
 const callbacks=new Map();let serial=0;
 const video={currentTime:1,paused:false,readyState:4,requestVideoFrameCallback(fn){callbacks.set(++serial,fn);return serial;},cancelVideoFrameCallback(id){callbacks.delete(id);},pause(){this.paused=true;},play(){this.paused=false;return Promise.resolve();}};
 const stage={id:'adapt',src:'/assets/xr/fixture.mp4',width:666,height:1440};
 const acquireMedia=async()=>({inspect:()=>({ready:true,hasSource:true}),dispose(){video.pause();}});
 const f=await fixture(t,{stages:[stage],videos:{adapt:video},acquireMedia});f.scene.resize(390,844);
 f.scene.present({chapter:'adapt',cameraIntent:{yawRad:99,pitchRad:99,fovDeg:90,zoom:10},handheld:{xPx:.8,yPx:.6,rollRad:.00065}});
 for(let i=0;i<12;i++)await Promise.resolve();
 const before=f.scene.inspect();assert.equal(before.mode,'webgl-phone');assert.equal(before.surface.sourceCalls,0);assert.equal(before.surface.phoneBodyCalls,1);assert.equal(before.surface.phoneScreenCalls,1);assert.equal(before.surface.compositor.xPx,0);assert.equal(before.surface.compositor.rollRad,0);
 assert(callbacks.size>0);
 for(const [id,callback]of [...callbacks]){callbacks.delete(id);callback(16,{mediaTime:1.1});}
 const after=f.scene.inspect();assert.equal(after.media.frames,before.media.frames+1);assert.equal(after.surface.draws,before.surface.draws+1);assert.equal(after.surface.cameraFits,before.surface.cameraFits);assert.deepEqual(after.pose,before.pose);assert.equal(after.surface.phoneScreenCalls,1);
 f.abort.abort();assert.equal(callbacks.size,0,'Both application and VideoTexture callbacks are released');
});
