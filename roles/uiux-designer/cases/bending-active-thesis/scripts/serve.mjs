import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../out/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.hdr':'application/octet-stream','.txt':'text/plain'};
createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)||req.headers.host!=='127.0.0.1:4184')return res.writeHead(403).end();
 try{let p=decodeURIComponent(new URL(req.url,'http://127.0.0.1:4184').pathname);let f=path.resolve(root,'.'+p);const relative=path.relative(root,f);if(relative.startsWith('..')||path.isAbsolute(relative))return res.writeHead(403).end();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const bytes=await readFile(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]??'application/octet-stream','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow, noarchive','Cache-Control':'no-store'}).end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(404).end('Not found');}
}).listen(4184,'127.0.0.1',()=>console.log('Bending-Active local review: http://127.0.0.1:4184/'));
