import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
const catalog = JSON.parse(await readFile(new URL('../catalog/score.json', import.meta.url)));
const contract = await readFile(new URL('../research/RESPONSE_CONTRACT.md', import.meta.url), 'utf8');
const [listName, itemName, contractName] = ["motion_score","motion_chapter","motion_contract"];
const names = catalog.chapters.map(item => item.id);
const tools = [
 {name:listName, description:'Motion Designer: read the closed reviewed catalog including readiness limits.', inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:itemName, description:'Motion Designer: read one known catalog record.', inputSchema:{type:'object',properties:{id:{type:'string',enum:names}},required:['id'],additionalProperties:false}},
 {name:contractName, description:'Motion Designer: read the role-owned handoff and verification contract.', inputSchema:{type:'object',properties:{},additionalProperties:false}}
].map(tool=>({...tool,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}}));
for await (const line of createInterface({input:process.stdin,crlfDelay:Infinity})) {
 let request;
 try {
  request=JSON.parse(line); if (request.id===undefined) continue;
  let result;
  if(request.method==='initialize') result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'motion-review',version:'1.0.0'}};
  else if(request.method==='ping') result={};
  else if(request.method==='tools/list') result={tools};
  else if(request.method==='tools/call') {
   const {name,arguments:args={}}=request.params??{};
   const tool=tools.find(item=>item.name===name);
   if(!tool||!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(key=>!Object.hasOwn(tool.inputSchema.properties,key))) throw new Error('Unknown tool or arguments');
   let data;
   if(name===listName) data=catalog;
   else if(name===contractName) data=contract;
   else {data=catalog.chapters.find(item=>item.id===args.id);if(!data)throw new Error('Unknown record ID');}
   result={content:[{type:'text',text:typeof data==='string'?data:JSON.stringify(data)}]};
  } else throw new Error('Method not found');
  process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request.id,result})+'\n');
 } catch(error) {
  process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request?.id??null,error:{code:request?-32602:-32700,message:error.message}})+'\n');
 }
}
