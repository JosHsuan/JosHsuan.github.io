import {createServer} from 'node:http';
import {readFile, realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.xml':'application/xml','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.glb':'model/gltf-binary','.hdr':'application/octet-stream','.mp4':'video/mp4'};

/** Serve the exact built bytes, including native video's single-range reads. */
export function createPagesPreviewHandler({root:directory,port=4186}) {
 const root=path.resolve(directory)+path.sep,origin=`http://127.0.0.1:${port}`;
 return async (request, response) => {
  if (request.headers.host !== `127.0.0.1:${port}` || !['GET','HEAD'].includes(request.method)) {response.writeHead(403).end(); return;}
  try {
    let name = decodeURIComponent(new URL(request.url, origin).pathname);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root) || !(await realpath(file)).startsWith(root)) {response.writeHead(403).end(); return;}
    const bytes = await readFile(file);
    const headers={'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
    const range=request.method==='GET'?request.headers.range:undefined;
    if(range!==undefined){
      const match=/^bytes=(\d*)-(\d*)$/.exec(range);
      let start=0,end=bytes.length-1;
      if(match&&(match[1]||match[2])){
        if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
        else {const suffix=Number(match[2]);start=suffix>0?Math.max(0,bytes.length-suffix):bytes.length;}
      }else start=bytes.length;
      if(![start,end].every(Number.isSafeInteger)||start<0||start>=bytes.length||end<start){
        response.writeHead(416,{...headers,'Content-Length':0,'Content-Range':`bytes */${bytes.length}`}).end();return;
      }
      const selected=bytes.subarray(start,end+1);
      response.writeHead(206,{...headers,'Content-Length':selected.length,'Content-Range':`bytes ${start}-${end}/${bytes.length}`}).end(selected);return;
    }
    response.writeHead(200,headers).end(request.method==='HEAD'?undefined:bytes);
  } catch {response.writeHead(404, {'Content-Type':'text/plain'}).end('Not found');}
 };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=process.env.THESIS_PREVIEW_ROOT?path.resolve(process.env.THESIS_PREVIEW_ROOT):fileURLToPath(new URL('../.pages-workspace/out/',import.meta.url));
 const port=Number(process.env.THESIS_PREVIEW_PORT??4186);
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local preview port');
 createServer(createPagesPreviewHandler({root,port})).listen(port,'127.0.0.1',()=>console.log(`Public artifact preview: http://127.0.0.1:${port}`));
}
