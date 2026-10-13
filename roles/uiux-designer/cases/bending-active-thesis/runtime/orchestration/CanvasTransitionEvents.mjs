/** Discrete transition facts close after DOM publication and the existing
 * passive scene acknowledgment. This service never schedules or owns time. */
export function createCanvasTransitionEvents(emit){
  let open=null,pending=null,closed=false;
  const history=[];
  const publish=value=>{history.push(value);if(history.length>32)history.shift();emit(value);};
  const cancel=reason=>{if(open)publish({...open,status:'cancelled',reason});open=null;pending=null;};
  return {
    consume(events,frame){
      if(closed)return;
      for(const value of events){
        if(value.status==='requested'){
          if(open)cancel('superseded');
          open=value;publish(value);
        }else if(open?.id===value.id){
          if(value.status==='cancelled')cancel(value.reason);
          else pending={...value,frame};
        }
      }
    },
    flush({presented,requiresScene}){
      if(pending&&(pending.target==='away'||!requiresScene||presented.chapterId===pending.chapter&&presented.controllerFrame>=pending.frame)){
        const {frame:_,...value}=pending;publish(value);open=null;pending=null;
      }
      return !!pending;
    },
    inspect:()=>({open:open?{...open}:null,pending:pending?{...pending}:null,history:[...history]}),
    dispose(){if(closed)return;cancel('disposed');closed=true;},
  };
}
