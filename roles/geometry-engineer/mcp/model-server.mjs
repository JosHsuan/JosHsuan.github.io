import {readFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
const record=JSON.parse(await readFile(new URL('../../uiux-designer/cases/bending-active-thesis/public/assets/model.json',import.meta.url)));
const names=['geometry_model_record','geometry_conversion_limits'];
const tools=names.map((name,i)=>({name,description:i?'Geometry Engineer: read verified conversion limits and publication scope.':'Geometry Engineer: read the sanitized record for the inspected thesis assembly mesh.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}}));
for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
 let q;try{q=JSON.parse(line);if(q.id===undefined)continue;let result;
 if(q.method==='initialize')result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'geometry-review',version:'1.0.0'}};
 else if(q.method==='ping')result={};
 else if(q.method==='tools/list')result={tools};
 else if(q.method==='tools/call'){
  const a=q.params?.arguments??{};if(!names.includes(q.params?.name)||!a||Array.isArray(a)||typeof a!=='object'||Object.keys(a).length)throw Error('Only closed model tools without path arguments are supported');
  result={content:[{type:'text',text:JSON.stringify(q.params.name===names[0]?record:{status:record.status,publishable:record.publishable,selection:record.selection,limits:record.limits})}]};
 }else throw Error('Unsupported method');
 process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:q.id,result})+'\n');
 }catch(e){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:q?.id??null,error:{code:-32602,message:e.message}})+'\n');}
}
