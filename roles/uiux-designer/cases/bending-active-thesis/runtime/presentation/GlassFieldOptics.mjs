import {createGlassEdgeMap} from '../motion/glass-motion.mjs';

/** Bounded scratch Canvas 2D, never appended or scheduled. Native DOM filters
 * work on the surface itself; no screen readback or WebGL context is acquired. */
export function createGlassFieldOptics({document:doc,publisher,axis='vertical',encodeMap}={}){
 let uri=null,failed=false,canvas=null,generations=0;
 const ua=doc.defaultView?.navigator?.userAgent??'';
 // Actual pixel qualification found WebKit displaces/clips the clear core.
 // Keep its continuous geometric field and rim; parsing url() is no proof.
 const mode=encodeMap||/(?:Chrome|Chromium|Edg|OPR)\/\d+/.test(ua)&&!/(?:CriOS|EdgiOS|FxiOS)\//.test(ua)?'displacement':'geometric';
 const records=new Map();
 function encode(){
  if(uri||failed)return uri;
  try{
   const map=createGlassEdgeMap(axis);
   if(encodeMap)uri=encodeMap(map);
   else{
    canvas=doc.createElement('canvas');canvas.width=map.width;canvas.height=map.height;
    const context=canvas.getContext('2d');if(!context)throw Error('No 2D map encoder');
    const image=context.createImageData(map.width,map.height);image.data.set(map.data);context.putImageData(image,0,0);
    uri=canvas.toDataURL('image/png');canvas.width=canvas.height=1;canvas=null;
   }
   generations++;
  }catch{failed=true;canvas=null;}
  return uri;
 }
 function measure(element,width,height){
  if(mode==='geometric'){publisher.attribute(element,'data-glass-optics','geometric');const record=records.get(element)??{element,geometric:true};records.set(element,record);return record;}
  const filter=element.querySelector('[data-glass-warp-filter]'),image=element.querySelector('[data-glass-warp-map]'),displacement=element.querySelector('[data-glass-warp-displacement]');
  if(!filter||!image||!displacement||!encode())return null;
  publisher.attribute(filter,'width',String(width+128));publisher.attribute(filter,'height',String(height+128));
  publisher.attribute(image,'href',uri);
  const record=records.get(element)??{element,filter,image,displacement,id:filter.id};records.set(element,record);return record;
 }
 function publish(record,{x=0,y=0,width,height,scale=0,enabled=true}={}){
  if(!record||record.geometric)return;
  const active=enabled&&scale>.05;
  publisher.style(record.element,'--glass-field-filter',active?`url("#${record.id}")`:'none');
  publisher.attribute(record.element,'data-glass-optics',active?'displacement':'clear');
  if(!active)return;
  for(const [key,value] of Object.entries({x,y,width,height}))publisher.attribute(record.image,key,Number(value).toFixed(2));
  publisher.attribute(record.displacement,'scale',Math.min(56,Math.max(0,scale)).toFixed(2));
 }
 function release(record){if(!record)return;publisher.style(record.element,'--glass-field-filter','');publisher.attribute(record.element,'data-glass-optics',null);if(!record.geometric){publisher.attribute(record.image,'href',null);publisher.attribute(record.displacement,'scale','0');}records.delete(record.element);}
 return{measure,publish,release,inspect:()=>({axis,mode,generations,failed,maps:uri?1:0,records:records.size}),dispose(){for(const record of records.values())release(record);uri=null;canvas=null;}};
}
