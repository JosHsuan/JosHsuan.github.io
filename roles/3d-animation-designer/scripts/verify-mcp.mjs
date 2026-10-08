import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {client} from './mcp-client.mjs';
const role=fileURLToPath(new URL('../',import.meta.url));
const names=["animation3d_elements","animation3d_element","animation3d_contract"];
const c=client(['mcp/catalog-server.mjs'],role);
const checked=[];
try {
 const init=await c.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'animation3d-verifier',version:'1'}});
 c.notify('notifications/initialized');
 assert.equal(init.serverInfo.name,'animation3d-review');checked.push('real process initialize');
 const list=await c.request('tools/list');
 assert.deepEqual(list.tools.map(t=>t.name),names);
 assert(list.tools.every(t=>t.annotations.readOnlyHint&&!t.annotations.openWorldHint&&!t.annotations.destructiveHint));checked.push('three closed read-only tools');
 const catalog=JSON.parse((await c.request('tools/call',{name:names[0],arguments:{}})).content[0].text);
 const expected=JSON.parse(await readFile(new URL('../catalog/elements.json',import.meta.url)));
 assert.deepEqual(catalog,expected);checked.push('full current catalog returned');
 for(const entry of expected.elements) {
  const actual=JSON.parse((await c.request('tools/call',{name:names[1],arguments:{id:entry.id}})).content[0].text);
  assert.deepEqual(actual,entry);
 }
 checked.push('all elements returned exactly');
 const contract=(await c.request('tools/call',{name:names[2],arguments:{}})).content[0].text;
 assert.equal(contract,await readFile(new URL('../research/ELEMENT_CONTRACT.md',import.meta.url),'utf8'));checked.push('current full contract returned');
 for(const args of [{id:'../../private'}, {id:1}, {}, {id:expected.elements[0].id,path:'../../private'}, [],null]) {
  await assert.rejects(c.request('tools/call',{name:names[1],arguments:args}));
 }
 await assert.rejects(c.request('tools/call',{name:'shell',arguments:{}}));
 await assert.rejects(c.request('tools/call',{name:names[0],arguments:{path:'../../private'}}));
 checked.push('missing, unknown, typed, path and arbitrary-tool input rejected');
 assert.equal(expected.elements.find(e=>e.id==='base').sourceObjectId,null);assert(expected.elements.find(e=>e.id==='base').status.includes('pending'));checked.push('unverified base remains explicitly pending');
 const result={verifiedAt:new Date().toISOString(),role:'3d-animation-designer',passed:true,checked,scope:'Role tool protocol and fixed contract only; not source geometry conversion or rendered case acceptance.'};
 await mkdir(new URL('../verification/',import.meta.url),{recursive:true});
 await writeFile(new URL('../verification/mcp-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
} finally {c.close();}
