import {sampleElementChoreography} from '../../components/element-choreography.mjs';
import {advancePlaneFeedback} from '../../components/story-response.mjs';

/** DOM presentation responses consume one director sample and report settlement only. */
export function publishEditorial({choreography,stickyRects,reading,playbackScore,state,didSeek,didResume,sections,planes,hovered,focused,fine,dt,publisher,viewportHeight,chapter}){
  let moving=false;
      choreography.forEach((item,element)=>{
        if(item.last?.settled)return;
        // Sticky visibility uses the batched current rect, never reading anchors.
        const rect=stickyRects.get(element);
        const top=rect?rect.top:item.top-(item.viewportFixed?0:reading.visualDocY),bottom=rect?rect.bottom:top+item.height;
        const visible=bottom>(item.viewportFixed?0:80)&&top<viewportHeight-(item.viewportFixed?0:24);
        if(visible&&item.firstVisibleAt===null)item.firstVisibleAt=playbackScore.activeSeconds;
        if(visible&&(didSeek||state.systemReduced||state.paused||state.sceneFailed))item.firstVisibleAt=playbackScore.activeSeconds-3;
        if(item.firstVisibleAt===null)return;
        const value=sampleElementChoreography({kind:item.kind,index:item.index,elapsed:playbackScore.activeSeconds-item.firstVisibleAt,reducedMotion:state.reduced,light:state.detail==='light'});
        const values={'x':[value.x,'px'],'y':[value.y,'px'],'z':[value.z,'px'],'rx':[value.rotateX,'deg'],'ry':[value.rotateY,'deg'],'rz':[value.rotateZ,'deg'],'scale':[value.scale,''],'shadow':[value.shadowDepth,'px']};
        for(const [key,[amount,unit]]of Object.entries(values))publisher.style(element,'--choreo-'+key,amount+unit);
        publisher.style(element,'--choreo-transform','translate3d('+value.x+'px,'+value.y+'px,'+value.z+'px) rotateX('+value.rotateX+'deg) rotateY('+value.rotateY+'deg) rotateZ('+value.rotateZ+'deg) scale('+value.scale+')');
        publisher.style(element,'--choreo-progress',value.ruleProgress);
        publisher.attribute(element,'data-choreography-phase',value.phase);item.last=state.sceneEnabled?value:null;
      });
      sections.forEach((section,index)=>{
        publisher.style(section,'--attention',state.reduced?1:Math.max(.25,Number(index===chapter.index)));
        publisher.style(section,'--energy',state.reduced?0:playbackScore.energy);
      });
      planes.forEach(item=>{
        const active=item.element===hovered||item.element===focused;
        const target=!state.reduced&&active&&(fine.matches||item.element===focused)?item.target:{x:0,y:0,press:0};
        advancePlaneFeedback(item.response,target,dt,{reducedMotion:state.reduced,resumed:didResume});
        const value=item.response.value??item.response,amplitude=item.element.hasAttribute('data-editorial-copy')?1.2:3;
        publisher.attribute(item.element,'data-feedback-active',Math.abs(value.x)+Math.abs(value.y)+Math.abs(value.press)>.0001?'':null);
        publisher.style(item.element,'--feedback-x',-value.y*amplitude+'deg');publisher.style(item.element,'--feedback-y',value.x*amplitude+'deg');publisher.style(item.element,'--feedback-z',value.press*(amplitude>2?12:4)+'px');
        moving=moving||!item.response.settled;
      });


  return moving;
}
