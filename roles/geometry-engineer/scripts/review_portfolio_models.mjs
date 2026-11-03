// Explicit local derivative review. This does not start the production runtime.
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const root = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const audit = path.join(root, 'roles/geometry-engineer/.runtime/nov03');
const mime = {'.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary'};
const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#151a1e}canvas{display:block}p{position:absolute;left:24px;top:12px;color:#d8e2e5;font:14px monospace}</style>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script></head><body><p id="label"></p><script type="module">
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {fitResearchCamera} from '/roles/uiux-designer/cases/bending-active-thesis/components/research-scene-geometry.mjs';
const kind=new URLSearchParams(location.search).get('kind'),mobile=innerWidth<600;
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(1);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;document.body.append(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#151a1e');const camera=new T.PerspectiveCamera(kind==='machine'?35:42,innerWidth/innerHeight,.01,1000);
const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.04,.1,100,{size:128});scene.environment=env.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
const hemi=new T.HemisphereLight('#c8d6eb','#25201a',.45);scene.add(hemi);
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const source=await loader.loadAsync('/roles/geometry-engineer/.runtime/nov03/'+kind+'/'+(kind==='machine'?'machine':'model')+'-compressed.glb');scene.add(source.scene);source.scene.updateMatrixWorld(true);
const bounds=new T.Box3().setFromObject(source.scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),radius=size.length()/2;
const key=new T.DirectionalLight('#fff1de',2.6);key.position.copy(center).add(new T.Vector3(2,3,4).normalize().multiplyScalar(radius*3));key.target.position.copy(center);scene.add(key,key.target);
const rim=new T.DirectionalLight('#b5d4ff',1.4);rim.position.copy(center).add(new T.Vector3(-3,2,-4).normalize().multiplyScalar(radius*3));rim.target.position.copy(center);scene.add(rim,rim.target);
const yaw=kind==='machine'?.6:.58,pitch=kind==='machine'?.42:-.14;
const support=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])support.push(x,y,z);
const pose=fitResearchCamera(support,camera.aspect,{yaw,pitch,fov:camera.fov,zoom:1.04});
camera.position.fromArray(pose.position);camera.near=pose.near;camera.far=pose.far;camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
let vertices=0,triangles=0,meshes=0,finite=true;source.scene.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;vertices+=p.count;triangles+=o.geometry.index?o.geometry.index.count/3:p.count/3;for(const x of p.array)finite&&=Number.isFinite(x);});
renderer.render(scene,camera);document.querySelector('#label').textContent=kind+' — original CAD mesh review';window.review={kind,vertices,triangles,meshes,finite,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},drawCalls:renderer.info.render.calls,renderedTriangles:renderer.info.render.triangles,contextLost:renderer.getContext().isContextLost(),size:[innerWidth,innerHeight]};
</script></body></html>`;
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:4198');
    if (url.pathname === '/') {res.writeHead(200, {'Content-Type': 'text/html'}).end(html); return;}
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) || !(await fs.realpath(file)).startsWith(root + path.sep)) throw Error('Outside review root');
    res.writeHead(200, {'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream'}).end(await fs.readFile(file));
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve => server.listen(4198, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({headless: true});
  const reports=[];
  for (const kind of ['machine', 'caschlatsch']) for (const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto('http://127.0.0.1:4198/?kind='+kind);
    await page.waitForFunction(()=>window.review,{timeout:30000});
    const report=await page.evaluate(()=>window.review);report.errors=errors;report.profile=name;reports.push(report);
    if(errors.length||!report.finite||report.contextLost||report.drawCalls<1)throw Error(JSON.stringify(report));
    await page.screenshot({path:path.join(audit,kind+'-'+name+'.png')});await page.close();
  }
  await fs.writeFile(path.join(audit,'render-review.json'),JSON.stringify(reports,null,2)+'\n');
  console.log(JSON.stringify(reports));
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
