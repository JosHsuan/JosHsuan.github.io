import React,{useEffect,useRef} from 'react';
import {Canvas,useThree,useFrame} from '@react-three/fiber';
import * as T from 'three';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {sample} from './model.js';
import {createInspectionScore} from '../motion/theatre/runtime.js';
import {preparePhysics} from './physics-cache.js';

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const blurFragment=`uniform sampler2D image;uniform vec2 stepSize;uniform float extract;varying vec2 vUv;
vec3 read(vec2 uv){vec3 c=texture2D(image,uv).rgb;return extract>.5?max(c-vec3(1.05),vec3(0.)):c;}
void main(){vec3 c=vec3(0.);float weights=0.;for(int i=-24;i<=24;i++){float x=float(i);float w=exp(-x*x/128.);c+=read(vUv+stepSize*x)*w;weights+=w;}gl_FragColor=vec4(c/weights,1.);}`;
const compositeFragment=`uniform sampler2D image;uniform sampler2D depthMap;uniform sampler2D glow;uniform vec2 pixel;uniform float focus;uniform float defocus;uniform float mist;varying vec2 vUv;
void main(){float z=texture2D(depthMap,vUv).x;float d=.1*80./(80.-z*(80.-.1));float coc=min(abs(d-focus)/max(d,.1)*12.,9.)*defocus;vec3 c=texture2D(image,vUv).rgb;
for(int i=0;i<16;i++){float a=float(i)*2.399963;float r=sqrt((float(i)+.5)/16.);c+=texture2D(image,vUv+vec2(cos(a),sin(a))*r*coc*pixel).rgb;}c/=17.;c+=texture2D(glow,vUv).rgb*mist;gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
function makeFixture(){
 const scene=new T.Scene();scene.background=new T.Color('#11191d');scene.fog=new T.Fog('#11191d',24,55);
 const mat=(color,roughness=.35,metalness=.65)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.15});
 const mesh=(geometry,material,position=[0,0,0],parent=scene)=>{const m=new T.Mesh(geometry,material);m.position.fromArray(position);parent.add(m);return m;};
 scene.add(new T.HemisphereLight('#cbdbe8','#2e261f',1.1));
 const key=new T.DirectionalLight('#ffe7ce',4);key.position.set(4,6,4);scene.add(key);
 const fill=new T.DirectionalLight('#8bbcd9',1.7);fill.position.set(-4,2,2);scene.add(fill);
 const back=new T.DirectionalLight('#fa9c69',3);back.position.set(0,4,-5);scene.add(back);
 const floor=mesh(new T.PlaneGeometry(100,100),mat('#1c2529',.7,.25),[0,-1.55,0]);floor.rotation.x=-Math.PI/2;
 const grid=new T.GridHelper(24,48,'#465052','#29383c');grid.position.y=-1.545;scene.add(grid);
 const assembly=new T.Group();scene.add(assembly);
 const rings=Array.from({length:17},(_,i)=>mesh(new T.TorusGeometry(1.06+.18*Math.cos((i-8)*.2),.07,12,80),mat('#b5c4c7'),[0,0,(i-8)*.12],assembly));
 const core=mesh(new T.TorusGeometry(.55,.038,12,64),mat('#ef985d',.3,.5),[0,0,-1],assembly);
 const structures=new T.Group();scene.add(structures);
 for(const z of [-4,-7]){for(const x of [-2.6,2.6])mesh(new T.BoxGeometry(.14,5,.14),mat('#697e84',.4,.6),[x,.9,z],structures);mesh(new T.BoxGeometry(5.4,.14,.14),mat('#697e84'),[0,3.35,z],structures);}
 const foreground=new T.Group();scene.add(foreground);
 for(const x of [-2.1,2.1])mesh(new T.BoxGeometry(.18,3.7,.18),mat('#a5bbbd',.35,.75),[x,.3,4],foreground);
 const blocker=mesh(new T.BoxGeometry(1.0,4,.22),mat('#39464b'),[2.8,.5,4.3]);blocker.visible=false;
 for(const x of [-1.8,1.8])mesh(new T.BoxGeometry(.06,2.5,.06),new T.MeshStandardMaterial({color:'#ffc9a1',emissive:'#ffbf8a',emissiveIntensity:5}),[x,.5,-2.6],structures);
 mesh(new T.TorusGeometry(1.95,.023,8,96),new T.MeshStandardMaterial({color:'#ffe9c7',emissive:'#ffe1b2',emissiveIntensity:4}),[0,.3,-7],structures);
 const stripes=new T.Group();scene.add(stripes);stripes.visible=false;
 mesh(new T.BoxGeometry(4,3.3,.06),mat('#182125',.8,0),[0,0,-.7],stripes);
 for(let i=0;i<17;i++)mesh(new T.BoxGeometry(.075,3,.04),mat(i%4===0?'#f28e50':'#eee8cf',.5,0),[(i-8)*.23,0,-.64],stripes);
 const lens=mesh(new T.SphereGeometry(.8,48,32),new T.MeshPhysicalMaterial({transmission:1,roughness:.03,thickness:.9,ior:1.46,color:'#e7f4ef',attenuationColor:'#d3ebe9',attenuationDistance:3}),[0,0,.3]);lens.scale.z=.5;lens.visible=false;
 const particles=new T.BufferGeometry(),positions=new Float32Array(1300*3),seeds=new Float32Array(1300*3);let rng=87;const rand=()=>{rng=(1664525*rng+1013904223)>>>0;return rng/4294967296;};
 for(let i=0;i<seeds.length;i+=3){seeds[i]=(rand()-.5)*5;seeds[i+1]=(rand()-.5)*3;seeds[i+2]=(rand()-.5)*.6;}
 particles.setAttribute('position',new T.BufferAttribute(positions,3));const points=new T.Points(particles,new T.PointsMaterial({color:'#efb38a',size:.035}));scene.add(points);points.visible=false;
 const physics=new T.Group();scene.add(physics);physics.visible=false;
 const balls=Array.from({length:12},(_,i)=>mesh(new T.SphereGeometry(.25,24,16),mat(i%3===0?'#ed985e':'#b8cbcf'),[0,0,0],physics));
 mesh(new T.BoxGeometry(4.6,.24,3.2),mat('#4a5a60'),[0,-1.5,0],physics);
 for(const [x,z,w,d]of[[-2.3,0,.2,3.2],[2.3,0,.2,3.2],[0,-1.6,4.6,.2],[0,1.6,4.6,.2]])mesh(new T.BoxGeometry(w,.18,d),mat('#71878b'),[x,-1.1,z],physics);
 return {scene,key,rings,assembly,core,structures,foreground,blocker,stripes,lens,points,seeds,positions,physics,balls,
  apply(p,id,cache,variant){
   const special=['lens','particles','contact'].includes(id);assembly.visible=!special;structures.visible=!special;foreground.visible=['parallax','focus','reveal'].includes(id);blocker.visible=id==='reveal';stripes.visible=id==='lens';lens.visible=p.glass;points.visible=p.particles;physics.visible=p.contact;
   assembly.rotation.y=p.turn;key.position.fromArray(p.light);foreground.children.forEach((post,i)=>{post.position.x=(i?1:-1)*(id==='focus'?.9:2.1);});
   rings.forEach((ring,i)=>{const weight=p.selection<0?0:Math.exp(-Math.pow(i-p.selection,2)/3);ring.position.set(0,p.finish?0:weight*.25,(i-8)*(.12+p.assembly*.12));ring.material.color.set('#b5c4c7').lerp(new T.Color('#ef985d'),p.finish?0:weight);ring.material.roughness=p.finish?.8-weight*.75:.32;ring.material.clearcoat=p.finish?weight:.15;});
   lens.position.x=p.lensX??0;
   if(p.particles){for(let i=0;i<positions.length;i+=3){const x=seeds[i],y=seeds[i+1],w=Math.exp(-((x-p.brush)**2+y*y)*1.2);positions[i]=x+(x-p.brush)*w*.8;positions[i+1]=y+y*w*.4;positions[i+2]=seeds[i+2]+w*1.5;}particles.attributes.position.needsUpdate=true;}
   if(p.contact&&cache){const frame=cache[variant][p.frame];balls.forEach((ball,i)=>{ball.position.fromArray(frame[i]);});}
  },
  dispose(){const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());},
 };
}
export function Stage(props){return <Canvas frameloop="demand" dpr={[1,1.25]} gl={{antialias:true,alpha:false,preserveDrawingBuffer:true}} fallback={<p>WebGL unavailable. Use the captured comparison below.</p>}><Renderer {...props}/></Canvas>;}
function Renderer({study,input,onReady,onFailure,reduced}){
 const {gl,size,invalidate}=useThree(),runtime=useRef(null),latest=useRef({study,reduced});latest.current={study,reduced};
 useEffect(()=>{
  let live=true,envTarget;const fixture=makeFixture(),camera=new T.PerspectiveCamera(35,1,.1,80),quadCamera=new T.Camera();
  const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:4,depthTexture:new T.DepthTexture(1,1,T.UnsignedIntType)});
  const blurA=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false}),blurB=blurA.clone();
  const blurMat=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:blurFragment,uniforms:{image:{value:null},stepSize:{value:new T.Vector2()},extract:{value:1}},depthTest:false,depthWrite:false,toneMapped:false});
  const compMat=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:compositeFragment,uniforms:{image:{value:target.texture},depthMap:{value:target.depthTexture},glow:{value:blurB.texture},pixel:{value:new T.Vector2()},focus:{value:9},defocus:{value:0},mist:{value:0}},depthTest:false,depthWrite:false});
  const quadScene=new T.Scene(),quad=new T.Mesh(new T.PlaneGeometry(2,2),compMat);quadScene.add(quad);
  const r={fixture,camera,target,blurA,blurB,blurMat,compMat,quadScene,quadCamera,quad,frames:0,pose:null,cache:null,ready:false,scoreReady:false};runtime.current=r;
  const score=createInspectionScore(pose=>{r.pose=pose;invalidate();},invalidate);r.score=score;
  function seek(){if(r.scoreReady){score.seek('inspection',latest.current.reduced?.5:input.u);}invalidate();}
  const unsubscribe=input.subscribe(seek);
  const lose=event=>{event.preventDefault();onFailure('WebGL context lost. Captured comparisons remain available.');};gl.domElement.addEventListener('webglcontextlost',lose);
  gl.toneMapping=T.ACESFilmicToneMapping;gl.toneMappingExposure=1;gl.outputColorSpace=T.SRGBColorSpace;
  const env=new Promise((resolve,reject)=>new HDRLoader().load('/assets/studio_small_09_1k.hdr',texture=>{if(!live){texture.dispose();resolve();return;}const pmrem=new T.PMREMGenerator(gl);envTarget=pmrem.fromEquirectangular(texture);texture.dispose();pmrem.dispose();fixture.scene.environment=envTarget.texture;fixture.scene.environmentIntensity=.6;resolve();},undefined,reject));
  Promise.all([env,preparePhysics().then(cache=>{r.cache=cache;}),score.ready.then(()=>{if(live){r.scoreReady=true;score.setMode('story');seek();}})]).then(()=>{if(live){r.ready=true;onReady();invalidate();}}).catch(error=>{if(live)onFailure(error?.message||'A local rendering resource could not be loaded.');});
  window.__study={inspect:()=>({frames:r.frames,u:input.u,mode:input.mode,ready:r.ready,study:latest.current.study.id,views:r.views,physicsFrames:r.cache?.a.length??0,renderer:gl.getContext().getParameter(gl.getContext().RENDERER),memory:{...gl.info.memory}}),loseContext:()=>gl.getContext().getExtension('WEBGL_lose_context')?.loseContext(),capture:()=>gl.domElement.toDataURL('image/png')};
  return()=>{live=false;unsubscribe();score.dispose();gl.domElement.removeEventListener('webglcontextlost',lose);fixture.dispose();envTarget?.dispose();target.dispose();blurA.dispose();blurB.dispose();blurMat.dispose();compMat.dispose();quad.geometry.dispose();runtime.current=null;delete window.__study;};
 },[gl,input,invalidate,onReady,onFailure]);
 useEffect(()=>{const r=runtime.current;if(r?.scoreReady)r.score.seek('inspection',reduced?.5:input.u);invalidate();},[study.id,reduced,input,invalidate]);
 useFrame(()=>{
  const r=runtime.current;if(!r?.ready)return;const width=size.width,height=size.height,stack=width<650,dpr=gl.getPixelRatio(),pw=Math.round((stack?width:width/2)*dpr),ph=Math.round((stack?height/2:height)*dpr);
  if(r.target.width!==pw||r.target.height!==ph){r.target.setSize(pw,ph);r.blurA.setSize(Math.max(1,Math.round(pw/4)),Math.max(1,Math.round(ph/4)));r.blurB.setSize(r.blurA.width,r.blurA.height);}
  r.frames++;r.views=[];const u=reduced?.5:input.u;
  for(const variant of ['a','b']){
   let p=sample(study.id,u,variant);if(p.owner==='theatre'&&r.pose){const c=r.pose.camera;p={...p,position:[c.position.x,c.position.y,c.position.z],target:[c.target.x,c.target.y,c.target.z],fov:c.fov,assembly:r.pose.assemblyProgress};}
   r.fixture.apply(p,study.id,r.cache,variant);r.camera.position.fromArray(p.position);r.camera.up.set(0,1,0);r.camera.lookAt(new T.Vector3(...p.target));r.camera.rotateZ(p.roll);r.camera.fov=p.fov;r.camera.aspect=pw/ph;r.camera.updateProjectionMatrix();
   gl.setScissorTest(false);gl.setRenderTarget(r.target);gl.clear();gl.render(r.fixture.scene,r.camera);
   // A shared HDR pipeline: clean controls also pass through the same compositor.
   if(p.mist>0){const step=.35+p.spread*.08;r.quad.material=r.blurMat;r.blurMat.uniforms.image.value=r.target.texture;r.blurMat.uniforms.extract.value=1;r.blurMat.uniforms.stepSize.value.set(step/r.blurA.width,0);gl.setRenderTarget(r.blurA);gl.render(r.quadScene,r.quadCamera);r.blurMat.uniforms.image.value=r.blurA.texture;r.blurMat.uniforms.extract.value=0;r.blurMat.uniforms.stepSize.value.set(0,step/r.blurB.height);gl.setRenderTarget(r.blurB);gl.render(r.quadScene,r.quadCamera);}
   r.quad.material=r.compMat;const uniforms=r.compMat.uniforms;uniforms.pixel.value.set(1/pw,1/ph);uniforms.focus.value=p.focus;uniforms.defocus.value=p.blur;uniforms.mist.value=p.mist;
   gl.setRenderTarget(null);gl.setScissorTest(true);const x=stack?0:(variant==='a'?0:width/2),y=stack?(variant==='a'?height/2:0):0,w=stack?width:width/2,h=stack?height/2:height;gl.setViewport(x,y,w,h);gl.setScissor(x,y,w,h);gl.clear();gl.render(r.quadScene,r.quadCamera);
   r.views.push({variant,...p,focalLengthMm:12/Math.tan(p.fov*Math.PI/360),physicsSample:p.contact?r.cache?.[variant][p.frame][0]:undefined});
  }
  gl.setScissorTest(false);gl.setViewport(0,0,width,height);
 },1);
 return null;
}
