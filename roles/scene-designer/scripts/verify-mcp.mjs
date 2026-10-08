import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {executablePath} from './browser-path.mjs';
const role=fileURLToPath(new URL('../',import.meta.url)),prefix='scene';
const output='D:/JosHsuan_Website/_work/bending-active-thesis/round-02/scene-designer/browser';
function client(args){
 const child=spawn(process.execPath,args,{cwd:role,stdio:['pipe','pipe','pipe'],windowsHide:true});
 const pending=new Map();let seq=0;
 child.stderr.on('data',()=>{});
 child.on('error',error=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();});
 createInterface({input:child.stdout}).on('line',line=>{try{const msg=JSON.parse(line),p=pending.get(msg.id);if(p){pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}}catch{}});
 return{request(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(new Error(method+' timed out'));},35000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});},notify(method){child.stdin.write(JSON.stringify({jsonrpc:'2.0',method})+'\n');},close(){child.stdin.end();child.kill();}};
}
const results=[],catalog=client(['mcp/catalog-server.mjs']);
try{
 const init=await catalog.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:prefix+'-verifier',version:'1'}});catalog.notify('notifications/initialized');
 const list=await catalog.request('tools/list');
 if(list.tools.length!==3||list.tools.some(t=>!t.annotations.readOnlyHint||t.annotations.openWorldHint))throw new Error('Closed read-only tool contract failed');
 const all=JSON.parse((await catalog.request('tools/call',{name:prefix+'_list_chapters',arguments:{}})).content[0].text);
 if(all.chapters.length!==7||new Set(all.chapters.map(c=>c.id)).size!==7)throw new Error('Seven chapters missing');
 for(const chapter of all.chapters){const returned=JSON.parse((await catalog.request('tools/call',{name:prefix+'_get_chapter',arguments:{id:chapter.id}})).content[0].text);if(JSON.stringify(returned)!==JSON.stringify(chapter))throw new Error('Chapter mismatch');}
 const contract=await catalog.request('tools/call',{name:prefix+'_get_contract',arguments:{}});
 if(contract.content[0].text.length<1000)throw new Error('Direction contract missing');
 for(const args of [{},{id:'../../private'},{id:'make',path:'../../private'},{id:'make',toString:'extra'},{id:'make',constructor:'extra'},{id:5},null,[]]){
  let rejected=false;try{await catalog.request('tools/call',{name:prefix+'_get_chapter',arguments:args});}catch{rejected=true;}
  if(!rejected)throw new Error('Invalid/open-world arguments accepted');
 }
 results.push({server:init.serverInfo.name,passed:true,checks:['initialize','three closed read-only tools','all seven chapter records returned exactly','direction contract','missing/unknown/path/inherited-key/type/null/array arguments rejected']});
}finally{catalog.close();}
await mkdir(output,{recursive:true});
const browser=client(['node_modules/@playwright/mcp/cli.js','--browser','chromium','--executable-path',executablePath,'--headless','--isolated','--allowed-origins','http://127.0.0.1:4184','--output-dir',output]);
try{
 const init=await browser.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:prefix+'-verifier',version:'1'}});browser.notify('notifications/initialized');
 const list=await browser.request('tools/list');
 for(const name of ['browser_navigate','browser_snapshot','browser_take_screenshot','browser_press_key','browser_resize'])if(!list.tools.some(t=>t.name===name))throw new Error('Missing '+name);
 const nav=await browser.request('tools/call',{name:'browser_navigate',arguments:{url:'http://127.0.0.1:4184/'}});
 if(nav.isError)throw new Error(JSON.stringify(nav.content));
 const snapshot=await browser.request('tools/call',{name:'browser_snapshot',arguments:{}});
 if(!JSON.stringify(snapshot).includes('Bending'))throw new Error('Actual thesis page not read');
 const key=await browser.request('tools/call',{name:'browser_press_key',arguments:{key:'PageDown'}});
 if(key.isError)throw new Error('Native key failed');
 const capture=await browser.request('tools/call',{name:'browser_take_screenshot',arguments:{type:'png',filename:output+'/mcp-local-thesis.png'}});
 if(capture.isError)throw new Error('Capture failed');
 await browser.request('tools/call',{name:'browser_close',arguments:{}});
 results.push({server:init.serverInfo.name,version:'0.0.83',passed:true,checks:['initialize','tool discovery','real local case navigation','accessible snapshot','native PageDown','D-drive screenshot','close'],scope:'Tool operation against current case; not acceptance of new round-02 implementation.'});
}finally{browser.close();}
await mkdir(new URL('../verification/',import.meta.url),{recursive:true});
await writeFile(new URL('../verification/mcp-results.json',import.meta.url),JSON.stringify({verifiedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify(results,null,2));
