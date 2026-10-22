import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {acquireProjectStudyScene} from '../components/project-study-scene.mjs';
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
function rendererFixture({omitSource=false}={}){
 const canvas=new Target();canvas.dataset={};canvas.width=1;canvas.height=1;canvas.remove=()=>{canvas.parentNode=null;};
 const report={renders:0,disposals:0,losses:0,positions:[],primitive:null,pointSize:null,attenuation:null};let width=0,height=0,dpr=1;
 const renderer={domElement:canvas,debug:{},info:{render:{calls:0}},capabilities:{maxTextureSize:4096},xr:{isPresenting:false},
  setClearColor(){},getContext:()=>({isContextLost:()=>false}),setSize(){},setPixelRatio(){},setViewport(){},getPixelRatio:()=>dpr,getSize:value=>value.set(width,height),
  setDrawingBufferSize(w,h,ratio){width=w;height=h;dpr=ratio;canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);},
  render(scene,camera){report.renders++;this.info.render.calls=0;scene.traverse(node=>{if(!node.isMesh&&!node.isPoints)return;report.positions=[...node.geometry.getAttribute('position').array];report.primitive=node.isPoints?'points':'triangles';report.pointSize=node.material.size;report.attenuation=node.material.sizeAttenuation;if(!omitSource)node.onBeforeRender(this,scene,camera,node.geometry,node.material,null);this.info.render.calls++;});},
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
 scene.resize(1440,1000);assert.equal(scene.inspect().cameraFits,1);assert.equal(scene.inspect().supportPoints,8);
 const intent={yawRad:.9,pitchRad:.4,fovDeg:40,zoom:1.1};
 scene.present({chapter:'context',azimuth:5,elevation:5,cameraIntent:intent});
 const support=[];for(const x of [-1,1])for(const y of [0,1])for(const z of [0,0])support.push(x,y,z);
 assert.deepEqual(scene.inspect().pose,fitResearchCamera(support,1440*.51/(1000*.78),{yaw:.9,pitch:.4,fov:40,zoom:1.1}),'Already-composed intent must not add legacy inspection twice');
 const {draws,cameraFits}=scene.inspect();
 for(let i=0;i<100;i++)scene.present({chapter:i%2?'context':'system',azimuth:i,elevation:-i,cameraIntent:{...intent}});
 assert.equal(scene.inspect().draws,draws);assert.equal(scene.inspect().cameraFits,cameraFits);assert.equal(scene.inspect().view.chapter,'context','Semantic state can change without repainting identical geometry');
 scene.present({cameraIntent:{...intent,yawRad:1}});assert.equal(scene.inspect().cameraFits,cameraFits+1);
 scene.resize(390,844);assert.equal(scene.inspect().cameraFits,cameraFits+2);scene.resize(390,844);assert.equal(scene.inspect().cameraFits,cameraFits+2);
 assert.deepEqual(f.report.positions,positions,'Source positions remain byte-equivalent');
 scene.present({cameraIntent:{...intent,pitchRad:2}});
 assert.deepEqual(scene.inspect().pose,fitResearchCamera(support,390*.94/(844*.45),{yaw:.9,pitch:1.15,fov:40,zoom:1.1}),'Existing inspection safety clamp remains');
 assert.throws(()=>scene.present({cameraIntent:{...intent,yawRad:Infinity}}),/Finite composed/);
 assert.throws(()=>scene.present({cameraIntent:{...intent,fovDeg:180}}),/Valid source support/);
 controller.abort();assert.equal(scene.inspect().supportPoints,0);assert.equal(f.report.disposals,1);
});
