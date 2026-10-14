import {LIBRARY_TRACE_COUNT,createLibraryReveal,advanceLibraryReveal,cancelLibraryReveal,sampleLibraryReveal} from '../motion/library-reveal.mjs';

const MARKER='[data-source-diagram="library"]';

/** One owner for original path reveal. No observer, timer, listener or independent RAF. */
export function createLibraryDiagramPresenter({publisher,emit,root=globalThis.document}){
 const registry=new Map(),history=[];
 let viewportHeight=1,disposed=false;
 const publishEvents=events=>{for(const event of events){history.push(event);if(history.length>32)history.shift();emit(event);}};
 const paint=(item,progress)=>{
  item.paths.forEach((path,index)=>{
   const value=progress[index];
   // Fully revealed paths use their original authored paint, including line caps.
   publisher.style(path,'stroke-dasharray',value===1?'':'1');
   publisher.style(path,'stroke-dashoffset',value===1?'':String(1-value));
   publisher.style(path,'visibility',value===0?'hidden':'');
  });
  publisher.attribute(item.element,'data-diagram-reveal',item.state.status);
  publisher.attribute(item.element,'data-diagram-reveal-id',String(item.state.id));
 };
 const release=(item,reason)=>{
  const events=cancelLibraryReveal(item.state,reason);
  paint(item,Array(LIBRARY_TRACE_COUNT).fill(1));
  publishEvents(events);
  publisher.attribute(item.element,'data-diagram-reveal',null);
  publisher.attribute(item.element,'data-diagram-reveal-id',null);
 };
 return {
  measure({naturalY,viewportHeight:height}){
   if(disposed)return;
   viewportHeight=Math.max(1,Number(height)||1);
   const rows=[];
   for(const element of root.querySelectorAll(MARKER)){
    const drawing=element.querySelector('[data-library-drawing]');
    const paths=[...element.querySelectorAll('[data-library-trace]')].sort((a,b)=>Number(a.dataset.libraryTrace)-Number(b.dataset.libraryTrace));
    if(!drawing||paths.length!==LIBRARY_TRACE_COUNT)continue;
    rows.push({element,paths,top:naturalY(drawing),height:drawing.offsetHeight});
   }
   const retained=new Set(rows.map(row=>row.element));
   for(const [element,item] of registry)if(!retained.has(element)){release(item,'removed');registry.delete(element);}
   for(const row of rows){
    const previous=registry.get(row.element);
    if(previous&&previous.paths.some((path,index)=>path!==row.paths[index])){release(previous,'replaced');registry.delete(row.element);}
    const item=registry.get(row.element)??{state:createLibraryReveal(),progress:Array(LIBRARY_TRACE_COUNT).fill(1)};
    Object.assign(item,row);registry.set(row.element,item);
   }
  },
  publish({docY,dt,reduced=false,resumed=false,hidden=false}){
   if(disposed||hidden)return false;
   let moving=false;
   for(const item of registry.values()){
    const top=item.top-docY,bottom=top+item.height;
    const onScreen=bottom>0&&top<viewportHeight;
    // The panel must enter the reading area, rather than start at a single edge pixel.
    const visible=bottom>viewportHeight*.1&&top<viewportHeight*.85;
    const events=advanceLibraryReveal(item.state,dt,{visible,onScreen,reduced,resumed});
    item.progress=sampleLibraryReveal(item.state,{reduced});
    paint(item,item.progress);
    // Terminal facts follow the actual DOM writes, never just elapsed time.
    publishEvents(events);
    moving=item.state.status==='playing'||moving;
   }
   return moving;
  },
  inspect:()=>({count:registry.size,open:[...registry.values()].filter(item=>item.state.status==='playing').map(item=>item.state.id),history:[...history],items:[...registry.values()].map(item=>({...item.state,progress:[...item.progress],order:Array.from({length:LIBRARY_TRACE_COUNT},(_,index)=>60+index*10)}))}),
  dispose(){if(disposed)return;for(const item of registry.values())release(item,'disposed');registry.clear();disposed=true;},
 };
}
