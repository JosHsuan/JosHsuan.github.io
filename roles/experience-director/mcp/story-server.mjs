import {readFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
const story=JSON.parse(await readFile(new URL('../catalog/story.json',import.meta.url)));
const contract=await readFile(new URL('../research/LAYER_STORY_CONTRACT.md',import.meta.url),'utf8');
const tools=[
 {name:'experience_list_chapters',description:'Interactive Experience Director: read the seven reviewed local case chapters.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'experience_get_chapter',description:'Interactive Experience Director: read a known chapter purpose and composition.',inputSchema:{type:'object',properties:{id:{type:'string',enum:story.chapters.map(c=>c.id)}},required:['id'],additionalProperties:false}},
 {name:'experience_get_contract',description:'Interactive Experience Director: read the reviewed layer, input ownership and acceptance contract.',inputSchema:{type:'object',properties:{},additionalProperties:false}}
].map(tool=>({...tool,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}}));
for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
 let request;
 try{
  request=JSON.parse(line);if(request.id===undefined)continue;let result;
  if(request.method==='initialize')result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'experience-story',version:'1.0.0'}};
  else if(request.method==='ping')result={};
  else if(request.method==='tools/list')result={tools};
  else if(request.method==='tools/call'){
   const {name,arguments:args={}}=request.params??{},tool=tools.find(t=>t.name===name);
   if(!tool||!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(k=>!(k in tool.inputSchema.properties)))throw new Error('Unknown tool or arguments');
   let data;
   if(name==='experience_get_contract')data=contract;
   else if(name==='experience_list_chapters')data=story;
   else{data=story.chapters.find(c=>c.id===args.id);if(!data)throw new Error('Unknown chapter ID');}
   result={content:[{type:'text',text:typeof data==='string'?data:JSON.stringify(data)}]};
  }else throw new Error('Method not found');
  process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request.id,result})+'\n');
 }catch(error){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request?.id??null,error:{code:request?-32602:-32700,message:error.message}})+'\n');}
}
