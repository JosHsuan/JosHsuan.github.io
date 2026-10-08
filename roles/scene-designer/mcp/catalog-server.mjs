import {readFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
const catalog=JSON.parse(await readFile(new URL('../catalog/chapters.json',import.meta.url)));
const contract=await readFile(new URL('../research/CONTRACT.md',import.meta.url),'utf8');
const prefix='scene';
const tools=[
 {name:prefix+'_list_chapters',description:'Scene Designer: read the seven closed chapter records.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:prefix+'_get_chapter',description:'Scene Designer: read a known chapter direction.',inputSchema:{type:'object',properties:{id:{type:'string',enum:catalog.chapters.map(c=>c.id)}},required:['id'],additionalProperties:false}},
 {name:prefix+'_get_contract',description:'Scene Designer: read the fixed direction and ownership contract.',inputSchema:{type:'object',properties:{},additionalProperties:false}}
].map(t=>({...t,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}}));
for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
 let request;
 try{
  request=JSON.parse(line);if(request.id===undefined)continue;let result;
  if(request.method==='initialize')result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'scene-designer-catalog',version:'1.0.0'}};
  else if(request.method==='ping')result={};
  else if(request.method==='tools/list')result={tools};
  else if(request.method==='tools/call'){
   const {name,arguments:args={}}=request.params??{},tool=tools.find(t=>t.name===name);
   if(!tool||!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(k=>!Object.hasOwn(tool.inputSchema.properties,k)))throw new Error('Unknown tool or arguments');
   let data;
   if(name===prefix+'_get_contract')data=contract;
   else if(name===prefix+'_list_chapters')data=catalog;
   else{data=catalog.chapters.find(c=>c.id===args.id);if(!data)throw new Error('Unknown chapter ID');}
   result={content:[{type:'text',text:typeof data==='string'?data:JSON.stringify(data)}]};
  }else throw new Error('Method not found');
  process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request.id,result})+'\n');
 }catch(error){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request?.id??null,error:{code:request?-32602:-32700,message:error.message}})+'\n');}
}
