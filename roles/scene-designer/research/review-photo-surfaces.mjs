// Local source-material review; explicit execution only, no production clock.
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
const root=path.resolve(fileURLToPath(new URL('../../../',import.meta.url))),audit=path.join(root,'.runtime/nov03/surfaces');
await fs.mkdir(audit,{recursive:true});
const release='/roles/uiux-designer/cases/bending-active-thesis/release';
const studies=JSON.parse(await fs.readFile(path.join(root,release,'project-studies.json'),'utf8'));
const entries=studies.projects.flatMap(project=>[project.model,...(project.additionalModels??[])].filter(Boolean).map(model=>({projectId:model.id==='machine'?'mode-s-machine':project.id,model}))).filter(entry=>!process.argv[2]||entry.projectId===process.argv[2]);
const html=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#151c22}canvas{display:block}</style><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script><script type="module">
import * as T from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {installProjectStudyAppearance} from '/roles/uiux-designer/cases/bending-active-thesis/components/project-study-appearance.mjs';
import {fitResearchCamera} from '/roles/uiux-designer/cases/bending-active-thesis/components/research-scene-geometry.mjs';
const {projectId,model}=(${JSON.stringify(entries)})[Number(new URLSearchParams(location.search).get('entry'))];
const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1);renderer.toneMapping=T.ACESFilmicToneMapping;document.body.append(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.01,1000),loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const source=await loader.loadAsync('${release}/public'+model.src);scene.add(source.scene);source.scene.updateMatrixWorld(true);
const bounds=new T.Box3().setFromObject(source.scene),center=bounds.getCenter(new T.Vector3()),support=[];
for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])support.push(x,y,z);
const first=model.cameraPath[0],pose=fitResearchCamera(support,camera.aspect,{yaw:first.yawRad,pitch:first.pitchRad,fov:first.fovDeg,zoom:1.04});camera.fov=first.fovDeg;camera.position.fromArray(pose.position);camera.near=pose.near;camera.far=pose.far;camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
const appearance=installProjectStudyAppearance({scene,source:source.scene,renderer,bounds,projectId});appearance.update({activeSeconds:4,yawRad:first.yawRad});
renderer.render(scene,camera);
let vertices=0,triangles=0,sourceDraws=0;source.scene.traverse(o=>{if(!o.isMesh&&!o.isPoints)return;sourceDraws++;vertices+=o.geometry.attributes.position.count;if(o.isMesh)triangles+=o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3;});
window.review={projectId,vertices,triangles,sourceDraws,contextLost:renderer.getContext().isContextLost(),actualRender:{...renderer.info.render},appearance:appearance.inspect(),programs:renderer.info.programs.map(p=>({name:p.name,diagnostics:p.diagnostics??null}))};
window.detail=()=>{camera.position.lerp(center,.43);camera.near=Math.max(.0001,camera.near*.1);camera.updateProjectionMatrix();renderer.render(scene,camera);};
</script>`;
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1:4198');if(url.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html'}).end(html);return;}const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)||!(await fs.realpath(file)).startsWith(root+path.sep))throw Error('Outside source root');res.writeHead(200,{'Content-Type':['.js','.mjs'].includes(path.extname(file))?'text/javascript':'application/octet-stream'}).end(await fs.readFile(file));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(4198,'127.0.0.1',resolve));let browser;
try{browser=await chromium.launch({headless:true});const reports=[];
for(let index=0;index<entries.length;index++){
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
 page.on('pageerror',error=>errors.push(String(error)));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.goto('http://127.0.0.1:4198/?entry='+index);await page.waitForFunction(()=>window.review,{timeout:120000});
 const report=await page.evaluate(()=>window.review);report.errors=errors;reports.push(report);
 await page.screenshot({path:path.join(audit,report.projectId+'.png')});
 if(['mode-s-machine','project-caschlatsch','mode-s-of-making'].includes(report.projectId)){await page.evaluate(()=>window.detail());await page.screenshot({path:path.join(audit,report.projectId+'-detail.png')});}
 await page.close();console.log(JSON.stringify({projectId:report.projectId,vertices:report.vertices,triangles:report.triangles,sourceDraws:report.sourceDraws,errors}));
 if(errors.length||report.contextLost)throw Error('Source material compilation/review failed');
}
await fs.writeFile(path.join(audit,process.argv[2]?process.argv[2]+'-review.json':'review.json'),JSON.stringify(reports,null,2)+'\n');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
