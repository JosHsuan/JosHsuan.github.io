import {EventManager} from '../runtime/core/EventManager.ts';

/** Isolated feature service with the same scoped-event/frame-writer boundary.
 * A host can inject its EventManager and frame driver. Scalar samples do not
 * become application state events; only operation boundaries are facts.
 */
export function createMotionSession({owner,hooks={},render,duration=1,events:hostEvents,requestFrame=callback=>requestAnimationFrame(callback),cancelFrame=id=>cancelAnimationFrame(id)}){
 if(typeof owner!=='string'||!owner||typeof render!=='function')throw Error('Named owner and presenter required');
 const events=hostEvents??new EventManager(),scope=events.createScope('review-motion:'+owner);
 let operationId=0,state='idle',phase=0,from=0,to=1,elapsed=0,period=duration,previous=null,handle=null,frames=0,disposed=false,reason='',frameEpoch=0,resumable=false;
 const inspect=()=>({owner,operationId,state,phase,elapsed,duration:period,scheduled:handle!==null,frames,disposed,reason});
 const fact=(type,detail={})=>{events.emit(type,{...inspect(),...detail});};
 const report=text=>hooks.report?.(text,inspect());
 const stop=()=>{frameEpoch++;if(handle!==null)cancelFrame(handle);handle=null;previous=null;};
 function present(dt=0){render(phase,{dt,operationId,state});frames++;fact('reviewMotionPresented');}
 function finish(){state='completed';stop();fact('reviewMotionCompleted');report('動作完成，最後畫面已呈現');}
 function schedule(){if(disposed||state!=='running'||handle!==null)return;const own=operationId,epoch=frameEpoch;handle=requestFrame(now=>{
  if(disposed||own!==operationId||epoch!==frameEpoch||state!=='running')return;handle=null;
  const dt=previous===null?0:Math.max(0,Math.min(.1,(now-previous)/1000));previous=now;elapsed=Math.min(period,elapsed+dt);
  const t=period===0?1:elapsed/period,s=t*t*(3-2*t);phase=from+(to-from)*s;
  try{present(dt);}catch(error){state='failed';stop();fact('reviewMotionFailed',{error:String(error.message??error)});report('呈現失敗：'+error.message);return;}
  if(own!==operationId||disposed)return;if(t>=1)finish();else schedule();
 });}
 function cancel(cancelReason='cancelled'){
  if(disposed)return;stop();resumable=false;if(['running','paused'].includes(state)){state='cancelled';reason=cancelReason;fact('reviewMotionCancelled');report('動作已取消：'+cancelReason);}operationId++;
 }
 return {
  start({duration:seconds=duration,from:start=0,to:target=1,reason:why='explicit event'}={}){
   if(disposed)throw Error('Motion session disposed');
   if(!Number.isFinite(seconds)||seconds<.02||seconds>30||![start,target].every(value=>Number.isFinite(value)&&value>=0&&value<=1))throw Error('Finite bounded motion command required');
   cancel('superseded');from=start;to=target;phase=start;elapsed=0;period=seconds;reason=why;state='running';previous=null;
   fact('reviewMotionStarted');try{present();}catch(error){state='failed';stop();fact('reviewMotionFailed',{error:String(error.message??error)});throw error;}if(start===target){finish();return;}report('事件已接受，動作執行中');schedule();
  },
  pause(){if(state==='running'){stop();state='paused';resumable=true;fact('reviewMotionPaused');report('動作已暫停');}},
  resume(){if(disposed)return;if(state==='paused'&&resumable){state='running';resumable=false;previous=null;fact('reviewMotionResumed');schedule();report('動作繼續');}},
  reset(value=0){if(disposed)return;if(!Number.isFinite(value)||value<0||value>1)throw Error('Bounded reset value required');cancel('reset');phase=value;elapsed=0;state='idle';present();fact('reviewMotionReset');report('已回到重設狀態');},
  seek(value){if(disposed)return;if(!Number.isFinite(value)||value<0||value>1)throw Error('Bounded sample required');cancel('phase inspection');phase=value;state='paused';present();report('檢討相位已直接呈現');},
  cancel,inspect,
  listen(target,type,handler,options){return events.listen(scope,target,type,handler,options);},
  on(type,handler){return events.on(scope,type,handler);},
  dispose(){if(disposed)return;cancel('dispose');disposed=true;state='disposed';scope.dispose();if(!hostEvents)events.dispose();},
 };
}
