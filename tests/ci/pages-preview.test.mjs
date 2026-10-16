import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer,request} from 'node:http';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';

test('the public preview serves video MIME and exact full, prefix, open and suffix ranges',async()=>{
 const folder=await mkdtemp(path.join(os.tmpdir(),'portfolio-video-http-'));
 const bytes=Buffer.from('0123456789abcdefghijklmnopqrstuv');
 const server=createServer(createPagesPreviewHandler({root:folder}));
 const http=(headers={},method='GET',url='/clip.mp4')=>new Promise((resolve,reject)=>{
  const call=request({hostname:'127.0.0.1',port:server.address().port,path:url,method,headers:{Host:'127.0.0.1:4186',...headers},agent:false},response=>{
   const chunks=[];response.on('data',chunk=>chunks.push(chunk));response.on('end',()=>resolve({status:response.statusCode,headers:response.headers,body:Buffer.concat(chunks)}));
  });call.on('error',reject);call.end();
 });
 try{
  await writeFile(path.join(folder,'clip.mp4'),bytes);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const full=await http();assert.equal(full.status,200);assert.equal(full.headers['content-type'],'video/mp4');assert.equal(full.headers['accept-ranges'],'bytes');assert.equal(full.headers['x-content-type-options'],'nosniff');assert.deepEqual(full.body,bytes);
  for(const [range,start,end] of [['bytes=0-1',0,1],['bytes=4-',4,31],['bytes=-4',28,31],['bytes=28-999',28,31]]){
   const part=await http({Range:range});assert.equal(part.status,206);assert.equal(part.headers['content-range'],`bytes ${start}-${end}/${bytes.length}`);assert.equal(Number(part.headers['content-length']),end-start+1);assert.deepEqual(part.body,bytes.subarray(start,end+1));
  }
  for(const range of ['bytes=32-','bytes=5-2','bytes=-0','bytes=0-1,4-5','bytes=-','bytes=9007199254740993-']){
   const invalid=await http({Range:range});assert.equal(invalid.status,416,range);assert.equal(invalid.headers['content-range'],`bytes */${bytes.length}`);assert.equal(invalid.body.length,0);
  }
  const head=await http({Range:'bytes=0-1'},'HEAD');assert.equal(head.status,200);assert.equal(head.body.length,0);assert.equal(Number(head.headers['content-length']),bytes.length);
  assert.equal((await http({Host:'localhost:4186'})).status,403);
  assert.equal((await http({},'POST')).status,403);
  assert.equal((await http({},'GET','/..%2fprivate.mp4')).status,403);
 }finally{
  if(server.listening)await new Promise(resolve=>server.close(resolve));
  assert.equal(path.dirname(path.resolve(folder)),path.resolve(os.tmpdir()));
  assert(path.basename(folder).startsWith('portfolio-video-http-'));
  await rm(folder,{recursive:true,force:true});
 }
});
