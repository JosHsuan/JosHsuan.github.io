import {liquidGlassMode,createLiquidLensMap,createLiquidResponse,advanceLiquidResponse} from '../motion/liquid-glass.mjs';

const MARKER='[data-liquid-glass]';
const VARIABLES=['refraction-filter','glint-x','glint-y','hover','press'];
const REST={x:.5,y:.5,hover:0,press:0};
const clamp=value=>Math.max(0,Math.min(1,value));

/** Decorative navigation optics. React owns the nodes; this presenter alone
 * writes their maps/response. Layout creates maps, Director supplies active dt.
 * No listener, RAF, timer, scene readback, additional WebGL or React frame state. */
export function createLiquidGlassPresenter({publisher,root=globalThis.document,environment,encodeMap}={}){
 const doc=root.ownerDocument??root,win=doc.defaultView;
 const env=environment??{userAgent:win.navigator.userAgent,supportsBackdrop:!!(win.CSS?.supports('backdrop-filter','blur(1px)')||win.CSS?.supports('-webkit-backdrop-filter','blur(1px)'))};
 const registry=new Map();let disposed=false,hovered=null,pressed=null,point={x:0,y:0},canvas=null,mapGenerations=0,ticks=0,moving=false;
 let mode=liquidGlassMode(env);
 const encode=encodeMap??(map=>{
  canvas??=doc.createElement('canvas');canvas.width=map.width;canvas.height=map.height;
  const context=canvas.getContext('2d');if(!context)throw Error('Liquid map unavailable');
  const image=context.createImageData(map.width,map.height);image.data.set(map.data);context.putImageData(image,0,0);
  return canvas.toDataURL('image/png');
 });
 const contained=(element,target)=>!!target&&(element===target||element.contains(target));
 const itemAt=target=>{const element=target?.closest?.(MARKER);return element&&registry.has(element)?element:null;};

 function clearMap(item){
  publisher.attribute(item.image,'href','');publisher.attribute(item.displacement,'scale','0');
  publisher.attribute(item.image,'width',null);publisher.attribute(item.image,'height',null);
  publisher.style(item.element,'--liquid-refraction-filter','');item.mapKey=null;item.mapPixels=0;
 }
 function release(item){
  clearMap(item);
  publisher.attribute(item.element,'data-liquid-ready',null);publisher.attribute(item.element,'data-liquid-mode',null);
  for(const key of VARIABLES)publisher.style(item.element,'--liquid-'+key,'');
 }
 function setMode(opaque=false){
  const next=liquidGlassMode({...env,opaque});
  if(next===mode)return;
  mode=next;hovered=null;pressed=null;
  for(const item of registry.values()){
   if(mode!=='refractive')clearMap(item);
   publisher.attribute(item.element,'data-liquid-mode',mode==='refractive'&&!item.mapKey?'reflective':mode);
  }
 }

 function measure({opaque=false}={}){
  if(disposed)return;setMode(opaque);
  const rows=[];
  // Read geometry as a batch, before map or style publication. Three explicit
  // fixed control groups; no per-frame document scan or layout read.
  for(const element of root.querySelectorAll(MARKER)){
   const skin=element.querySelector(':scope > [data-liquid-skin]'),image=skin?.querySelector('[data-liquid-map]'),displacement=skin?.querySelector('[data-liquid-displacement]');
   if(!skin||!image||!displacement)continue;
   const rect=element.getBoundingClientRect(),style=win.getComputedStyle(element);
   rows.push({element,skin,image,displacement,rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},radius:parseFloat(style.borderTopLeftRadius)||0,visible:rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'});
  }
  const retained=new Set(rows.map(row=>row.element));
  for(const [element,item] of registry)if(!retained.has(element)){release(item);registry.delete(element);if(hovered===element)hovered=null;if(pressed===element)pressed=null;}
  for(const row of rows){
   let item=registry.get(row.element);
   if(!item){item={response:createLiquidResponse(),mapKey:null,mapPixels:0};registry.set(row.element,item);}
   Object.assign(item,row);
   if(mode==='refractive'&&row.visible){
    // feImage percentages resolve against the zero-size definitions SVG in
    // Chromium. Explicit local CSS pixels keep its map aligned with the slab.
    publisher.attribute(row.image,'width',String(row.rect.width));publisher.attribute(row.image,'height',String(row.rect.height));
    const key=[Math.round(row.rect.width*10),Math.round(row.rect.height*10),row.radius].join('/');
    if(item.mapKey!==key){
     try{
      const map=createLiquidLensMap(row.rect.width,row.rect.height,row.radius),url=encode(map);
      publisher.attribute(row.image,'href',url);item.mapKey=key;item.mapPixels=map.pixels;mapGenerations++;
     }catch{clearMap(item);}
    }
    if(item.mapKey)publisher.style(row.element,'--liquid-refraction-filter',`url("#liquid-${row.element.dataset.liquidGlass}")`);
   }else clearMap(item);
   publisher.attribute(row.element,'data-liquid-mode',mode==='refractive'&&!item.mapKey?'reflective':mode);
   publisher.attribute(row.element,'data-liquid-ready','');
  }
 }

 function pointer(event){
  if(disposed)return false;
  const previous=hovered,next=itemAt(event.target);
  if(event.type==='pointercancel'){const active=!!(hovered||pressed);reset();return active;}
  if(event.type==='pointerup'){pressed=null;hovered=event.pointerType==='touch'?null:next;}
  else{
   hovered=next;point={x:Number(event.clientX)||0,y:Number(event.clientY)||0};
   if(event.type==='pointerdown')pressed=next;
   else if(pressed&&next!==pressed)pressed=null;
  }
  return !!(previous||next||pressed);
 }

 function paint(item){
  const value=item.response.value;
  // A wider travel keeps the directional reflection visible on the neutral film.
  publisher.style(item.element,'--liquid-glint-x',(10+value.x*80).toFixed(2)+'%');
  publisher.style(item.element,'--liquid-glint-y',(15+value.y*70).toFixed(2)+'%');
  publisher.style(item.element,'--liquid-hover',value.hover.toFixed(4));
  publisher.style(item.element,'--liquid-press',value.press.toFixed(4));
  publisher.attribute(item.displacement,'scale',item.mapKey?(12+value.press*3).toFixed(3):'0');
 }
 function publish({dt=0,reduced=false,resumed=false,hidden=false,opaque=false,keyboardFocus=true}={}){
  if(disposed)return false;
  ticks++;setMode(opaque);moving=false;
  // A slow foreground frame must retain the latest user intent. The spring
  // already snaps long dt to that target; only an actual reset cancels input.
  const immediate=reduced||resumed||hidden||mode==='opaque';
  if(immediate){hovered=null;pressed=null;}
  for(const item of registry.values()){
   const focused=keyboardFocus&&contained(item.element,doc.activeElement),active=!immediate&&!focused&&item.visible;
   const over=active&&hovered===item.element,down=active&&pressed===item.element;
   const target=over||down?{x:clamp((point.x-item.rect.left)/Math.max(1,item.rect.width)),y:clamp((point.y-item.rect.top)/Math.max(1,item.rect.height)),hover:1,press:down?1:0}:REST;
   moving=advanceLiquidResponse(item.response,dt,target,{snap:immediate||focused||!item.visible})||moving;paint(item);
  }
  return moving;
 }
 function reset(){
  if(disposed)return;hovered=null;pressed=null;moving=false;
  for(const item of registry.values()){advanceLiquidResponse(item.response,0,REST,{snap:true});paint(item);}
 }
 function inspect(){return {mode,capability:mode,count:registry.size,ticks,moving,settled:!moving,mapGenerations,mapPixels:[...registry.values()].reduce((sum,item)=>sum+item.mapPixels,0),items:[...registry.values()].map(item=>({kind:item.element.dataset.liquidGlass,mode:mode==='refractive'&&!item.mapKey?'reflective':mode,visible:item.visible,...item.rect,radius:item.radius,mapPixels:item.mapPixels,settled:item.response.settled,...item.response.value}))};}
 function dispose(){
  if(disposed)return;disposed=true;hovered=null;pressed=null;moving=false;
  for(const item of registry.values())release(item);registry.clear();if(canvas){canvas.width=1;canvas.height=1;canvas=null;}
 }
 return {measure,pointer,publish,reset,inspect,dispose};
}
