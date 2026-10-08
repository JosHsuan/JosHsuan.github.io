import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {client} from './mcp-client.mjs';
import {executablePath} from './browser-path.mjs';
const role=fileURLToPath(new URL('../',import.meta.url));
const output='D:/JosHsuan_Website/_work/bending-active-thesis/round-02/motion-browser';
await mkdir(output,{recursive:true});
const c=client(['node_modules/@playwright/mcp/cli.js','--browser','chromium','--executable-path',executablePath,'--headless','--isolated','--allowed-origins','http://127.0.0.1:4184','--output-dir',output],role);
const checks=[];
try {
 const init=await c.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'motion-browser-verifier',version:'1'}});
 c.notify('notifications/initialized');checks.push('real browser MCP initialize');
 const list=await c.request('tools/list');
 const names=['browser_navigate','browser_snapshot','browser_press_key','browser_take_screenshot','browser_resize','browser_console_messages','browser_close'];
 assert(names.every(name=>list.tools.some(t=>t.name===name)));checks.push('configured tools available');
 const call=async(name,args={})=>{const result=await c.request('tools/call',{name,arguments:args});assert(!result.isError,JSON.stringify(result));return result;};
 await call('browser_navigate',{url:'http://127.0.0.1:4184/'});
 const snapshot=await call('browser_snapshot');
 assert(JSON.stringify(snapshot).includes('Bending'));checks.push('existing actual thesis page read');
 await call('browser_press_key',{key:'PageDown'});checks.push('native keyboard interaction exercised');
 await call('browser_resize',{width:1024,height:768});checks.push('resize exercised');
 await call('browser_take_screenshot',{type:'png',filename:output+'/mcp-preexisting-case.png'});checks.push('capture written to D-drive work area');
 await call('browser_console_messages',{level:'error'});checks.push('console tool exercised');
 await call('browser_close');checks.push('browser closed');
 const report={verifiedAt:new Date().toISOString(),passed:true,server:init.serverInfo,packageVersion:'0.0.83',checks,limits:'Tool integration against the pre-existing case only. New response/geometry design has not been implemented or visually accepted.'};
 await writeFile(new URL('../verification/browser-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
} finally {c.close();}
