import {readFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
const catalog=JSON.parse(await readFile(new URL('../catalog/studies.json',import.meta.url)));
const recipes=JSON.parse(await readFile(new URL('../catalog/material-recipes.json',import.meta.url)));
const tools=[
 {name:'artist3d_list_studies',description:'3D Artist only: list/search local physical and visual study proposals.',inputSchema:{type:'object',properties:{query:{type:'string',maxLength:200}},additionalProperties:false}},
 {name:'artist3d_get_study',description:'3D Artist only: retrieve one local study, limitations, controls and source IDs.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false}},
 {name:'artist3d_catalog_status',description:'3D Artist only: read catalog scope and review origin.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'artist3d_get_material_recipe',description:'3D Artist only: read the local texture/shader adapter recipes, required coordinates, sources and limitations. No filesystem or network access.',inputSchema:{type:'object',properties:{id:{type:'string',maxLength:80}},additionalProperties:false}},
].map(t=>({...t,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}}));
for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
 let request;try{
   request=JSON.parse(line);if(request.id===undefined)continue;let result;
   if(request.method==='initialize')result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'artist3d-catalog',version:'1.0.0'}};
   else if(request.method==='ping')result={};
   else if(request.method==='tools/list')result={tools};
   else if(request.method==='tools/call'){
     const{name,arguments:args={}}=request.params??{},tool=tools.find(t=>t.name===name);
     if(!tool||!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(k=>!(k in tool.inputSchema.properties)))throw new Error('Unknown tool or arguments');
     let data;
     if(name==='artist3d_catalog_status')data={role:'3d-artist',count:catalog.studies.length,materialRecipes:recipes.recipes.length,origin:'http://127.0.0.1:4180',uiuxSaved:'not captured',productionIntegrated:false};
     else if(name==='artist3d_get_material_recipe'){if(args.id!==undefined&&(typeof args.id!=='string'||args.id.length>80))throw new Error('Invalid recipe ID');data=args.id?recipes.recipes.find(r=>r.id===args.id):recipes;if(!data)throw new Error('Unknown recipe ID');}
     else if(name==='artist3d_get_study'){data=catalog.studies.find(s=>s.id===args.id);if(!data)throw new Error('Unknown study ID');}
     else {if(args.query!==undefined&&(typeof args.query!=='string'||args.query.length>200))throw new Error('Invalid query');data=catalog.studies.filter(s=>JSON.stringify(s).toLowerCase().includes((args.query??'').toLowerCase()));}
     result={content:[{type:'text',text:JSON.stringify(data)}]};
   }else throw new Error('Method not found');
   process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request.id,result})+'\n');
 }catch(error){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request?.id??null,error:{code:request?-32602:-32700,message:error.message}})+'\n');}
}
