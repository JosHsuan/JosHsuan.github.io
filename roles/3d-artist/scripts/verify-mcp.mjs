import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {executablePath} from './browser-path.mjs';
const role=fileURLToPath(new URL('../',import.meta.url));
function client(args){const child=spawn(process.execPath,args,{cwd:role,stdio:['pipe','pipe','pipe'],windowsHide:true});const pending=new Map();let seq=0;child.stderr.on('data',()=>{});createInterface({input:child.stdout}).on('line',line=>{try{const msg=JSON.parse(line),p=pending.get(msg.id);if(p){pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}}catch{}});return{request(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`${method} timed out`));},30000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});},notify(method){child.stdin.write(JSON.stringify({jsonrpc:'2.0',method})+'\n');},close(){child.stdin.end();child.kill();}};}
const results=[];
const catalog=client(['mcp/catalog-server.mjs']);
try{
 const init=await catalog.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'artist3d-verifier',version:'1'}});catalog.notify('notifications/initialized');
 const list=await catalog.request('tools/list');if(list.tools.length!==4||list.tools.some(t=>!t.annotations.readOnlyHint))throw new Error('Read-only tool contract failed');
 const study=await catalog.request('tools/call',{name:'artist3d_get_study',arguments:{id:'proximity'}});if(!JSON.parse(study.content[0].text).preview.endsWith('study=proximity'))throw new Error('Preview link failed');
 let rejected=false;try{await catalog.request('tools/call',{name:'artist3d_get_study',arguments:{id:'../../private'}});}catch{rejected=true;}if(!rejected)throw new Error('Unknown ID accepted');
 const recipe=await catalog.request('tools/call',{name:'artist3d_get_material_recipe',arguments:{id:'height-contours'}});if(JSON.parse(recipe.content[0].text).mode!=='contours')throw new Error('Recipe retrieval failed');
 const all=await catalog.request('tools/call',{name:'artist3d_get_material_recipe',arguments:{}});if(JSON.parse(all.content[0].text).recipes.length!==4)throw new Error('Recipe index failed');
 let pathRejected=false;try{await catalog.request('tools/call',{name:'artist3d_get_material_recipe',arguments:{id:'../../private'}});}catch{pathRejected=true;}if(!pathRejected)throw new Error('Recipe path accepted');
 results.push({server:init.serverInfo.name,passed:true,checks:['initialize','four read-only tools','real study details','unknown ID rejected','actual material recipe call','four recipe index','recipe path rejected']});
}finally{catalog.close();}
const browser=client(['node_modules/@playwright/mcp/cli.js','--browser','chromium','--executable-path',executablePath,'--headless','--isolated','--allowed-origins','http://127.0.0.1:4180','--output-dir',role+'/.runtime/browser-output']);
try{
 const init=await browser.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'artist3d-verifier',version:'1'}});browser.notify('notifications/initialized');
 const listed=await browser.request('tools/list');for(const name of ['browser_navigate','browser_snapshot','browser_take_screenshot'])if(!listed.tools.some(t=>t.name===name))throw new Error('Missing tool '+name);
 const nav=await browser.request('tools/call',{name:'browser_navigate',arguments:{url:'http://127.0.0.1:4180/?study=proximity'}});if(nav.isError)throw new Error(JSON.stringify(nav.content));
 const snapshot=await browser.request('tools/call',{name:'browser_snapshot',arguments:{}});if(!JSON.stringify(snapshot).includes('Proximity becomes selection'))throw new Error('Actual study not read');
 const shot=await browser.request('tools/call',{name:'browser_take_screenshot',arguments:{type:'png',filename:role+'/.runtime/browser-output/mcp-refraction.png'}});if(shot.isError)throw new Error('Screenshot failed');
 await browser.request('tools/call',{name:'browser_close',arguments:{}});
 results.push({server:init.serverInfo.name,version:'0.0.83',passed:true,checks:['initialize','tool discovery','real local navigation','accessible snapshot','screenshot','close'],browserNote:'Pinned project Chromium headless shell; MCP carries its own Playwright alpha. This exact combination was exercised.'});
}finally{browser.close();}
await writeFile(new URL('../verification/mcp-results.json',import.meta.url),JSON.stringify({verifiedAt:new Date().toISOString(),results},null,2)+'\n');console.log(JSON.stringify(results,null,2));
