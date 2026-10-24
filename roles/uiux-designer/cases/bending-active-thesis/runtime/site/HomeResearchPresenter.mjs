const clamp=value=>Math.max(0,Math.min(1,value));
/** A lifecycle boundary, not a timer or a proxy for successful GPU pixels. */
export function canCommitHomeResearchExposure({stage,generation,disposed=false,arrivalStatic=false,paused=false,hidden=false,connected=false,hasResource=false,entryState,loaderHidden=false,loaderDisplay}){
 return !disposed&&!arrivalStatic&&!paused&&!hidden&&connected&&hasResource&&stage?.active===true&&stage.phase==='ready'&&stage.id===generation&&Number.isInteger(generation)&&generation>0&&entryState==='entered'&&loaderHidden===true&&loaderDisplay==='none';
}
/** Native document progress borrows SiteBackgroundDriver's demand clock. No
 * listeners, timers, frame loop, source ownership or navigation interception. */
export function createHomeResearchPresenter({root,host,present,expose,inspect:inspectStage,subscribe,publisher,schedule=()=>{}}){
 let disposed=false,layout={top:0,height:0,viewportHeight:1},progress=0,presentedProgress=null,enabled=false,publications=0,visible=false,visibility=null,lastPresentation='',exposedGeneration=null,exposureCommits=0;
 let policy={ready:false,reduced:false,suspended:false,saveData:false,forcedColors:false};
 const release=subscribe?.(schedule)??(()=>{});
 return{
  measure({naturalY,viewportHeight}){
   if(disposed)return;
   layout={top:naturalY(root),height:root.offsetHeight,viewportHeight:Math.max(1,viewportHeight)};
   const visual=host.closest?.('[data-home-research-visual]')??host;
   const style=visual.ownerDocument?.defaultView?.getComputedStyle(visual);
   const parent=visual.parentElement??root,sticky=style?.position==='sticky';
   const origin=sticky?root.querySelector?.('[data-home-research-origin]'):null;
   const rawVisualTop=naturalY(visual),visualTop=origin?naturalY(origin):rawVisualTop;
   visibility={hostTop:visualTop+naturalY(host)-rawVisualTop,hostHeight:host.offsetHeight,visualTop,visualHeight:visual.offsetHeight,sticky,stickyTop:Number.parseFloat(style?.top)||0,parentBottom:naturalY(parent)+parent.offsetHeight};
  },
  publish({docY,ready=false,reduced=false,suspended=false,saveData=false,forcedColors=false}){
   if(disposed)return false;
   policy={ready:!!ready,reduced:!!reduced,suspended:!!suspended,saveData:!!saveData,forcedColors:!!forcedColors};
   const range=Math.max(1,layout.height-layout.viewportHeight);
   progress=clamp((Number.isFinite(docY)?docY-layout.top:0)/range);
   const stage=inspectStage(),paused=!!stage.paused;
   const scroll=Number.isFinite(docY)?docY:0;
   let hostTop=(visibility?.hostTop??layout.top)-scroll;
   if(visibility?.sticky){
    const visualTop=Math.min(Math.max(visibility.visualTop-scroll,visibility.stickyTop),visibility.parentBottom-scroll-visibility.visualHeight);
    hostTop=visualTop+visibility.hostTop-visibility.visualTop;
   }
   visible=hostTop<layout.viewportHeight&&hostTop+(visibility?.hostHeight??0)>0;
   const canPrepare=!policy.reduced&&!policy.suspended&&!policy.saveData&&!policy.forcedColors&&stage.phase==='ready';
   enabled=policy.ready&&canPrepare&&visible;
   publisher.attribute(root,'data-home-research-paused',paused?'':null);
   publisher.attribute(root,'data-home-research-motion',!enabled?(suspended||!visible?'suspended':'static'):paused?'paused':'active');
   // Presentation freezes, never the native document. Resume seeks today's
   // actual scroll position; it does not replay missed frames or steal focus.
   if(canPrepare&&!paused&&visible){
    const width=host.offsetWidth,height=host.offsetHeight,key=`${stage.id}:${progress}:${width}:${height}`;
    // Preparation may have drawn this exact pose behind the entry cover. The
    // first actual entered exposure gets one explicit commit, not an idle loop.
    if(enabled&&stage.entryState==='entered'&&stage.id!==exposedGeneration){
     const result=expose?.({generation:stage.id,progress,width,height});
     if(result?.completed===true){exposedGeneration=stage.id;exposureCommits++;lastPresentation=key;presentedProgress=progress;publications++;}
    }
    if(key!==lastPresentation){
     const result=present({progress,width,height});
     if(result!==false){lastPresentation=key;presentedProgress=progress;publications++;}
    }
    publisher.style(root,'--home-research-progress',progress.toFixed(6));
    publisher.style(root,'--home-research-detail',Math.sin(progress*Math.PI).toFixed(6));
   }
   return false;
  },
  inspect:()=>({layout:{...layout},progress,presentedProgress,enabled,visible,visibility:visibility?{...visibility}:null,policy:{...policy},publications,exposedGeneration,exposureCommits,stage:inspectStage(),disposed}),
  dispose(){if(disposed)return;disposed=true;release();publisher.attribute(root,'data-home-research-motion','static');},
 };
}
