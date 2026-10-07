import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {executablePath} from './browser-path.mjs';
const role=fileURLToPath(new URL('../',import.meta.url));
function client(args){
 const child=spawn(process.execPath,args,{cwd:role,stdio:['pipe','pipe','pipe'],windowsHide:true});
 const pending=new Map();let seq=0;
 child.stderr.on('data',()=>{});
 createInterface({input:child.stdout}).on('line',line=>{try{const msg=JSON.parse(line),p=pending.get(msg.id);if(p){pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}}catch{}});
 return{request(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(new Error(method+' timed out'));},35000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});},notify(method){child.stdin.write(JSON.stringify({jsonrpc:'2.0',method})+'\n');},close(){child.stdin.end();child.kill();}};
}
const results=[];
const story=client(['mcp/story-server.mjs']);
try{
 const init=await story.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'experience-verifier',version:'1'}});story.notify('notifications/initialized');
 const list=await story.request('tools/list');
 if(list.tools.length!==3||list.tools.some(t=>!t.annotations.readOnlyHint||t.annotations.openWorldHint))throw new Error('Closed read-only tool contract failed');
 const all=JSON.parse((await story.request('tools/call',{name:'experience_list_chapters',arguments:{}})).content[0].text);
 if(all.chapters.length!==7||new Set(all.chapters.map(c=>c.id)).size!==7)throw new Error('Seven chapter records missing');
 const one=JSON.parse((await story.request('tools/call',{name:'experience_get_chapter',arguments:{id:'make'}})).content[0].text);
 if(one.textSide!=='right'||one.evidenceSide!=='left')throw new Error('Coordinated make composition missing');
 const contract=await story.request('tools/call',{name:'experience_get_contract',arguments:{}});
 if(!contract.content[0].text.includes('Pointer tilt is decorative'))throw new Error('Layer ownership contract not returned');
 for(const args of [{id:'../../private'},{id:'make',path:'../../private'},{id:5}]){
  let rejected=false;try{await story.request('tools/call',{name:'experience_get_chapter',arguments:args});}catch{rejected=true;}
  if(!rejected)throw new Error('Invalid/open-world arguments accepted');
 }
 results.push({server:init.serverInfo.name,passed:true,checks:['initialize','three closed read-only tools','all seven chapters','real make composition','complete layer contract','unknown/path/type arguments rejected']});
}finally{story.close();}
const browser=client(['node_modules/@playwright/mcp/cli.js','--browser','chromium','--executable-path',executablePath,'--headless','--isolated','--allowed-origins','http://127.0.0.1:4184','--output-dir','D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/director-browser']);
try{
 const init=await browser.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'experience-verifier',version:'1'}});browser.notify('notifications/initialized');
 const list=await browser.request('tools/list');
 for(const name of ['browser_navigate','browser_snapshot','browser_take_screenshot','browser_press_key','browser_resize'])if(!list.tools.some(t=>t.name===name))throw new Error('Missing '+name);
 const nav=await browser.request('tools/call',{name:'browser_navigate',arguments:{url:'http://127.0.0.1:4184/'}});
 if(nav.isError)throw new Error(JSON.stringify(nav.content));
 const snapshot=await browser.request('tools/call',{name:'browser_snapshot',arguments:{}});
 if(!JSON.stringify(snapshot).includes('Bending'))throw new Error('Actual thesis page not read');
 const key=await browser.request('tools/call',{name:'browser_press_key',arguments:{key:'PageDown'}});
 if(key.isError)throw new Error('Native keyboard interaction failed');
 const screenshot=await browser.request('tools/call',{name:'browser_take_screenshot',arguments:{type:'png',filename:'D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/director-browser/mcp-local-thesis.png'}});
 if(screenshot.isError)throw new Error('Screenshot failed');
 await browser.request('tools/call',{name:'browser_close',arguments:{}});
 results.push({server:init.serverInfo.name,version:'0.0.83',passed:true,checks:['initialize','tool discovery','real local thesis navigation','accessible snapshot','PageDown','screenshot','close'],note:'Tool verification only; not final case visual acceptance. Exact MCP alpha/root Chromium combination exercised.'});
}finally{browser.close();}
await mkdir(new URL('../verification/',import.meta.url),{recursive:true});
await writeFile(new URL('../verification/mcp-results.json',import.meta.url),JSON.stringify({verifiedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify(results,null,2));
