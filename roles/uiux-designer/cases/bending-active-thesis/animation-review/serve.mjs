import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {build,directory,dist,source} from './build.mjs';
await build();
const port=Number(process.env.ANIMATION_REVIEW_PORT??4198);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local port');
const release=path.join(source,'release'),manifest=JSON.parse(await readFile(path.join(release,'manifest.json'),'utf8'));
const assets=new Map();for(const asset of manifest.assets){const file=path.join(release,'public',asset.path);const bytes=await readFile(file);if(bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('Approved asset mismatch: '+asset.path);assets.set('/'+asset.path,file);}
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.glb':'model/gltf-binary','.hdr':'application/octet-stream'};
const allowed=new Map([['/app.js',path.join(dist,'app.js')],['/style.css',path.join(dist,'style.css')],['/app.js.LEGAL.txt',path.join(dist,'app.js.LEGAL.txt')],['/source-manifest.json',path.join(dist,'source-manifest.json')],...assets]);
const server=createServer(async(request,response)=>{try{
 if(request.headers.host!==`127.0.0.1:${port}`||!['GET','HEAD'].includes(request.method)){response.writeHead(403).end();return;}
 const url=new URL(request.url,`http://127.0.0.1:${port}`),file=['/','/3d/','/2d/'].includes(url.pathname)?path.join(dist,'index.html'):allowed.get(url.pathname);
 if(!file){response.writeHead(404).end();return;}await realpath(file);const bytes=await readFile(file);
 response.writeHead(200,{'Content-Type':(mime[path.extname(file)]??'application/octet-stream')+'; charset=utf-8','Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});response.end(request.method==='HEAD'?undefined:bytes);
 }catch{response.writeHead(404).end();}});
server.listen(port,'127.0.0.1',()=>console.log(`Animation desk ready: http://127.0.0.1:${port}/3d/ and http://127.0.0.1:${port}/2d/`));
