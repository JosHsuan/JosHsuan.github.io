/** One semantic native-chapter owner on the existing site driver's lifetime.
 * Measurement is invalidated by that driver; selection performs no layout read.
 * Only child reading surfaces transform, so section rect + native scroll gives
 * the original fractional document anchor without presentation feedback. */
export function createProjectStudyChapterPresenter({root,tools,navigation,publisher,listen,onPause=()=>{}}){
 const counter=tools.querySelector('[data-project-chapter-count]'),toggle=tools.querySelector('[data-study-motion-toggle]');
 let rows=[],links=[],current=null,paused=null,disposed=false,publicationDirty=true,measurements=0,selections=0,changes=0;
 let reading=null;
 const syncPause=()=>{
  if(disposed)return false;
  const next=root.hasAttribute('data-study-paused');if(next===paused)return false;paused=next;
  if(toggle){publisher.attribute(toggle,'aria-pressed',String(next));publisher.text(toggle,next?'Resume motion':'Pause motion');}return true;
 };
 const release=toggle?listen(toggle,'click',()=>{
  if(disposed)return;
  publisher.attribute(root,'data-study-paused',root.hasAttribute('data-study-paused')?null:'');
  if(syncPause())onPause();
 }):null;
 publisher.attribute(root,'data-project-study-ready','');publisher.attribute(tools,'hidden',null);syncPause();
 return{
  measure({docY=0}={}){
   if(disposed)return;measurements++;
   rows=[...root.querySelectorAll('[data-project-chapter]')].map(node=>{const rect=node.getBoundingClientRect();return{id:node.dataset.projectChapter,top:rect.top+docY,height:rect.height??0};});
   links=[...navigation?.querySelectorAll('[data-project-chapter-link]')??[]];
   // A changed collection must republish its current ordinal and navigation.
   publicationDirty=true;
  },
  publish({docY=0,viewportHeight=0}={}){
   if(disposed||!rows.length)return;selections++;
   const midpoint=docY+viewportHeight*.5;
   let index=0;
   for(let next=1;next<rows.length&&rows[next].top<=midpoint;next++)index=next;
   const row=rows[index],end=rows[index+1]?.top??row.top+Math.max(1,row.height);
   reading={chapter:row.id,index,progress:Math.max(0,Math.min(1,(midpoint-row.top)/Math.max(1,end-row.top)))};
   const id=row.id;if(id===current&&!publicationDirty)return reading;if(id!==current)changes++;current=id;publicationDirty=false;
   publisher.attribute(root,'data-project-active-chapter',id);
   for(const link of links)publisher.attribute(link,'aria-current',link.dataset.projectChapterLink===id?'location':null);
   publisher.text(counter,`${String(index+1).padStart(2,'0')} / ${String(rows.length).padStart(2,'0')}`);return reading;
  },
  syncPause,
  inspect:()=>({reading,chapter:current,paused,chapters:rows.length,measurements,selections,changes,disposed}),
  dispose(){
   if(disposed)return;disposed=true;release?.dispose();
   for(const link of links)publisher.attribute(link,'aria-current',null);
   publisher.attribute(root,'data-project-study-ready',null);publisher.attribute(root,'data-project-active-chapter',null);publisher.attribute(tools,'hidden','');rows=[];links=[];
  },
 };
}
