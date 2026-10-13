import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {fitSourcePose,SOURCE_DIAGRAM_REVISION} from '../components/source-scene-score.mjs';
import {createCinematicMaterial} from '../components/materials/cinematic-material.js';
let bytesPromise,metadataPromise;
function assets(){
 bytesPromise??=fetch('/assets/thesis/source-diagrams.glb').then(async r=>{if(!r.ok)throw Error('Approved model unavailable');const bytes=await r.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==SOURCE_DIAGRAM_REVISION)throw Error('Model revision differs');return bytes;}).catch(e=>{bytesPromise=null;throw e;});
 metadataPromise??=fetch('/assets/thesis/source-diagrams.json').then(r=>{if(!r.ok)throw Error('Approved metadata unavailable');return r.json();});return Promise.all([bytesPromise,metadataPromise]);
}
export function mountStaticModel(container){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setClearColor('#0a151b');renderer.toneMapping=T.ACESFilmicToneMapping;renderer.outputColorSpace=T.SRGBColorSpace;container.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.01,100),key=new T.DirectionalLight('#e8eceb',4),rim=new T.DirectionalLight('#eab896',2.2),fill=new T.HemisphereLight('#d4e5e4','#23323a',2);key.position.set(3,5,4);rim.position.set(-4,2,-3);scene.add(key,rim,fill);
 let disposed=false,ready=false,frames=0,model=null,record=null,adapter=null,pose=null;
 function draw(){if(disposed||!ready)return;const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(width,height,false);camera.aspect=width/height;
  pose=fitSourcePose({bounds:record.bounds,points:record.framingSupport.points,aspect:camera.aspect,azimuth:32,elevation:26,fov:38,viewport:{left:.07,top:.06,width:.86,height:.84}});
  camera.position.fromArray(pose.position);camera.fov=pose.fov;camera.near=pose.near;camera.far=pose.far;camera.lookAt(...pose.target);camera.updateProjectionMatrix();renderer.render(scene,camera);frames++;
 }
 function free(object){const geometries=new Set(),materials=new Set();object?.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 const observer=new ResizeObserver(draw);observer.observe(container);
 const loading=assets().then(async([bytes,data])=>{const loaded=await new GLTFLoader().parseAsync(bytes.slice(0),'');if(disposed){free(loaded.scene);return;}model=loaded.scene;record=data.representations.find(r=>r.id==='bending');if(data.revision!==SOURCE_DIAGRAM_REVISION||!record?.framingSupport?.points?.length)throw Error('Verified model support missing');
  let count=0;model.traverse(n=>{if(!n.isMesh&&!n.isLineSegments)return;n.visible=false;if(n.isMesh&&n.userData.representationId==='bending'){count++;if(!n.userData.sourceGeometry||n.geometry.attributes.position.count!==record.vertices)throw Error('Model geometry differs');(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>m.dispose());adapter=createCinematicMaterial({bounds:record.bounds});n.material=adapter.material;n.visible=true;}});if(count!==1)throw Error('Source model missing');scene.add(model);ready=true;draw();});
 return {ready:loading,inspect:()=>({ready,frames,scheduled:false,camera:pose?{position:pose.position,target:pose.target,fov:pose.fov}:null,geometry:record?.geometrySHA256,vertices:record?.vertices,animatedProperties:[]}),dispose(){if(disposed)return;disposed=true;observer.disconnect();adapter?.dispose();free(model);scene.clear();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
