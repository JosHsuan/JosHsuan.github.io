import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const child=spawn(process.execPath,[fileURLToPath(new URL('../mcp/model-server.mjs',import.meta.url))],{stdio:['pipe','pipe','pipe'],windowsHide:true});
let seq=0;const pending=new Map();
createInterface({input:child.stdout}).on('line',line=>{const v=JSON.parse(line),p=pending.get(v.id);if(p){clearTimeout(p.timer);pending.delete(v.id);v.error?p.reject(Error(v.error.message)):p.resolve(v.result);}});
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject,timer:setTimeout(()=>reject(Error('timeout')),15000)});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});}
try{
 const init=await call('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'geometry-verifier',version:'1'}});
 child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
 const list=await call('tools/list');assert.equal(list.tools.length,2);assert(list.tools.every(t=>t.annotations.readOnlyHint));
 const record=JSON.parse((await call('tools/call',{name:'geometry_model_record',arguments:{}})).content[0].text);assert.equal(record.vertices,84626);
 const limits=JSON.parse((await call('tools/call',{name:'geometry_conversion_limits',arguments:{}})).content[0].text);assert.equal(limits.publishable,false);
 await assert.rejects(call('tools/call',{name:'geometry_model_record',arguments:{path:'../../private'}}));
 await mkdir(new URL('../verification/',import.meta.url),{recursive:true});const report={verifiedAt:new Date().toISOString(),passed:true,server:init.serverInfo,tools:list.tools.map(t=>t.name),checks:['initialize','list','actual record read','actual scope/limits read','arbitrary path rejected']};await writeFile(new URL('../verification/mcp.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{child.stdin.end();child.kill();}
