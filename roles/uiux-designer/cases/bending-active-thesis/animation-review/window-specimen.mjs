import {EventManager} from '../runtime/core/EventManager.ts';
import {mountStaticModel} from './static-model-window.mjs';
import {clamp} from './window-transitions.mjs';
import {setKineticPointer} from './kinetic-motion.mjs';
import {createWindowMotion,setWindowScrollTarget,advanceWindowMotion} from './window-motion.mjs';
import {sampleWindowOutline} from './window-outline.mjs';
import {scrollTarget,scrollingEffect,scrollGeometry,sampleScrollingPose} from './window-scroll.mjs';

/** Native flow owns page travel; one active-time RAF owns only elastic feedback. */
export function mountWindow(stage,effect,hooks={}){
 const root=document.createElement('div');root.className='vt-lab';root.dataset.layer=effect.layer;root.dataset.accent=effect.accent;root.dataset.effect=effect.key;
 root.innerHTML=`<div class="vt-browserbar"><span class="vt-dots" aria-hidden="true">+ + +</span><span>瀏覽視窗 · 在框內捲動</span><span class="vt-speed">靜止</span><span class="vt-state">準備中</span></div><div class="vt-scroll" tabindex="0" aria-label="視窗進出捲動示範"><div class="vt-track"><div class="vt-page-cue vt-page-before" aria-hidden="true">往下瀏覽<span>視窗會從下緣進入</span></div><div class="vt-flow"><div class="vt-guides" aria-hidden="true"><span>SCROLL / RESPONSE</span><span>頁面中的同一張視窗</span></div><div class="vt-halo" aria-hidden="true"></div><div class="vt-echo" aria-hidden="true"></div><div class="vt-window"><div class="vt-windowbar"><span>${effect.layer==='3d'?'MODEL CANVAS':'INFORMATION WINDOW'}</span><span>↗</span></div><div class="vt-content"></div><div class="vt-windowfoot">${effect.layer==='3d'?'SOURCE GEOMETRY · STATIC CAMERA':'SOURCE STUDY · ONE READING SURFACE'}</div></div></div><div class="vt-page-cue vt-page-after" aria-hidden="true">繼續瀏覽<span>向上捲可返回視窗</span></div></div></div><div class="vt-progress" aria-label="瀏覽位置"><i></i><span class="vt-entry-mark">進入畫面</span><span class="vt-exit-mark">滑出畫面</span></div><div class="vt-actions"><button data-action="before">進場前</button><button data-action="inside">進入視野</button><button data-action="after">離開視野</button><button data-action="return">反向返回</button><button data-force="soft">輕推</button><button data-force="strong">快推</button><button data-action="reverse-play">向上重播</button></div><p class="vt-caption">捲動決定位置，彈性回應力道。停止時保留眼前內容；繼續往下，整張視窗會滑過上緣。向上捲可帶回。</p><div class="vt-log" aria-live="polite"></div>`;
 stage.append(root);
 const $=s=>root.querySelector(s),viewport=$('.vt-scroll'),track=$('.vt-track'),windowNode=$('.vt-window'),content=$('.vt-content'),stateLabel=$('.vt-state'),log=$('.vt-log'),progressFill=$('.vt-progress i'),halo=$('.vt-halo'),echo=$('.vt-echo'),speedLabel=$('.vt-speed');
 const mq=hooks.reducedQuery??matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),events=new EventManager(),scope=events.createScope('scroll-window:'+effect.id);
 let motionEffect=scrollingEffect(effect,viewport.clientHeight),kinetic=createWindowMotion(motionEffect,{region:'inside'}),currentPose={...effect.visible};
 let loaded=false,disposed=false,model=null,region='inside',intent='idle',mode='scroll',nativeProgress=.5,paused=false,explicit=false,replay=null,replayDirection=1,hold=0,travel=null;
 let state='idle',beforePause='idle',handle=null,epoch=0,previous=null,frames=0,operationId=0,enters=0,exits=0,outerVisible=true,scriptedTop=null,lastScrollTime=null,inputSpeed=0,inputDirection=1,lastReport=0,windowSize={width:1,height:1},visible=true,lastReduced=mq.matches;
 const facts=[],reduced=()=>mq.matches&&!explicit;
 const inspectPoint=c=>({progress:c.response.progress,velocity:c.response.velocity,error:c.error,errorVelocity:c.errorVelocity,frontWeight:c.frontWeight});
 function info(){return {owner:effect.id,effect:effect.id,proposal:true,windowTransition:true,kineticWindow:true,scrollWindow:true,layer:effect.layer,ready:loaded,phase:nativeProgress,region,intent,mode,pose:{...currentPose},scrollProgress:nativeProgress,scrollTop:viewport.scrollTop,visible,travel:travel?{...travel}:null,enters,exits,replay,paused,state,operationId,frames,scheduled:handle!==null,model:model?.inspect()??null,inputSpeed,inputDirection,kinetic:{progress:kinetic.progress,target:kinetic.target,velocity:kinetic.velocity,acceleration:kinetic.acceleration,flow:kinetic.flow,transport:{...kinetic.transport},energy:kinetic.energy,direction:kinetic.direction,corners:kinetic.corners.map(inspectPoint),edges:kinetic.edges.map(inspectPoint),pointer:{...kinetic.pointer},resting:kinetic.resting},animatedTarget:'native page position plus one elastic feedback transform; always opaque',events:facts.slice(-12)};}
 function report(message,force=false){if(disposed)return;const now=performance.now();if(!force&&now-lastReport<90)return;lastReport=now;stateLabel.textContent=paused?'回饋暫停':mode==='timeline'?'位置檢視':visible?'畫面內':'畫面外';speedLabel.textContent=mode==='timeline'?'固定位置':kinetic.energy>.025?'力道 '+Math.round(kinetic.energy*100)+'%':'已收斂';hooks.report?.(message,info());}
 function record(type){facts.push({type,operationId,region,progress:nativeProgress,velocity:kinetic.velocity});if(facts.length>30)facts.shift();log.textContent=facts.slice(-3).map(f=>f.type).join(' → ');events.emit(type,{owner:effect.id,operationId,region});}
 const transform=p=>`perspective(900px) translate3d(${p.x}px,${p.y}px,${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) skewX(${p.skew}deg) scale(${p.sx},${p.sy})`;
 function paint(){
  const p=sampleScrollingPose(motionEffect,kinetic);currentPose={...p};windowNode.style.transformOrigin=effect.key==='corner'?'0% 100%':'50% 50%';windowNode.style.transform=transform(p);windowNode.style.opacity='1';windowNode.style.filter=p.blur>.001?`blur(${p.blur}px)`:'none';windowNode.style.borderRadius='18px';windowNode.style.clipPath=sampleWindowOutline(effect,p,windowSize.width,windowSize.height);
  echo.style.transform=transform({...p,x:p.x+p.echoX,y:p.y+p.echoY});echo.style.opacity=String(p.echo);echo.style.borderRadius='18px';
  halo.style.opacity=String(p.halo);halo.style.transform=`translate(${p.x*.3}px,${p.y*.3+25}px)`;
  const a=windowNode.getBoundingClientRect(),b=viewport.getBoundingClientRect();visible=a.bottom>b.top&&a.top<b.bottom&&a.right>b.left&&a.left<b.right;
  windowNode.inert=!visible;windowNode.setAttribute('aria-hidden',String(!visible));frames++;
 }
 function stopFrame(){epoch++;if(handle!==null)cancelAnimationFrame(handle);handle=null;previous=null;windowNode.style.willChange='auto';}
 function wake(){if(disposed||!loaded||paused||document.hidden||!outerVisible||handle!==null||mode==='timeline')return;const own=epoch;windowNode.style.willChange='transform,clip-path';handle=requestAnimationFrame(now=>{if(disposed||own!==epoch)return;handle=null;tick(now);});}
 function applyPosition(p,{energy=0,instant=false}={}){
  const previousProgress=nativeProgress;nativeProgress=clamp(p);progressFill.style.width=nativeProgress*100+'%';
  if(Math.abs(nativeProgress-previousProgress)>.00001)inputDirection=Math.sign(nativeProgress-previousProgress);
  const next=scrollGeometry(nativeProgress,viewport.clientHeight,windowSize.height).region;
  if(next!==region){region=next;if(next==='inside'){enters++;intent='enter';record('viewport:enter');}else{exits++;intent='exit';record('viewport:leave');}}
  setWindowScrollTarget(kinetic,scrollTarget(nativeProgress),{energy,reduced:instant||reduced()});
 }
 function position(p,options){const max=viewport.scrollHeight-viewport.clientHeight;scriptedTop=Math.round(max*clamp(p));viewport.scrollTop=scriptedTop;applyPosition(max?viewport.scrollTop/max:0,options);}
 function stopReplay(){replay=null;hold=0;}
 function complete(){if(state!=='running')return;state='completed';record('scroll:settled');if(intent==='enter'||intent==='exit')record(intent+':complete');intent='idle';if(replay==='entry'){replay='hold';hold=.8;}else if(replay==='exit'){replay=null;record('replay:complete');}}
 function tick(now){
  if(syncPreference()||paused||disposed)return;const dt=previous===null?0:Math.max(0,Math.min(.1,(now-previous)/1000));previous=now;
  if(travel){travel.elapsed=Math.min(travel.duration,travel.elapsed+dt);const t=travel.elapsed/travel.duration,ease=t*t*(3-2*t);position(travel.from+(travel.to-travel.from)*ease,{energy:Math.abs(travel.to-travel.from)*dt});if(t===1)travel=null;}
  advanceWindowMotion(kinetic,dt,{reduced:reduced()});paint();
  if(!travel&&kinetic.resting)complete();
  if(replay==='hold'){hold-=dt;if(hold<=0){replay='exit';go(replayDirection===1?'after':'before',true,.75);}}
  report('捲動帶動頁面位置；拖曳與回彈正在收斂');
  if(travel||!kinetic.resting||replay==='hold')wake();else{previous=null;windowNode.style.willChange='auto';report(visible?'保持目前捲動位置，內容持續可讀':'視窗已滑出畫面；向反方向捲動即可帶回',true);}
 }
 function go(next,automatic=false,strength=.55){
  if(!loaded)return;if(!automatic){stopReplay();paused=false;explicit=false;}mode='scroll';operationId++;state='running';intent=next==='inside'?'enter':'exit';const to=next==='before'?0:next==='after'?1:.5;
  travel={from:nativeProgress,to,elapsed:0,duration:1.35-.85*strength};record('scroll:travel');
  if(reduced()){travel=null;position(to,{instant:true});stopFrame();paint();complete();report('減少動態：保留原生捲動，回饋靜止',true);}else wake();
 }
 function onScroll(){
  const max=viewport.scrollHeight-viewport.clientHeight,p=max?viewport.scrollTop/max:0;
  if(scriptedTop!==null&&Math.abs(viewport.scrollTop-scriptedTop)<=1){scriptedTop=null;return;}scriptedTop=null;
  if(mode==='timeline')return;
  const now=performance.now(),delta=p-nativeProgress,dt=lastScrollTime===null?.06:Math.max(.016,(now-lastScrollTime)/1000);lastScrollTime=now;if(Math.abs(delta)<.00001)return;
  inputSpeed=Math.min(1,Math.abs(delta/dt)/3);travel=null;stopReplay();explicit=false;
  if(state!=='running'){operationId++;state='running';record('scroll:input');}applyPosition(p,{energy:inputSpeed*.14});
  if(reduced()){stopFrame();paint();complete();report('原生捲動：視窗位置跟隨頁面',true);}else if(!paused)wake();
 }
 function listen(target,type,callback,options){events.listen(scope,target,type,callback,options);}
 listen(viewport,'scroll',onScroll,{passive:true});
 function nativeIntent(){stopReplay();travel=null;scriptedTop=null;paused=false;explicit=false;mode='scroll';lastScrollTime=null;}
 for(const type of ['wheel','touchstart','pointerdown'])listen(viewport,type,nativeIntent,{passive:true});
 listen(viewport,'keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))nativeIntent();});
 listen(viewport,'pointermove',event=>{if(!fine.matches||event.pointerType==='touch'||paused||reduced()||mode!=='scroll'||!visible)return;const r=viewport.getBoundingClientRect();setKineticPointer(kinetic,(event.clientX-r.left)/r.width*2-1,(event.clientY-r.top)/r.height*2-1);wake();});
 const releasePointer=()=>{setKineticPointer(kinetic,0,0);wake();};listen(viewport,'pointerleave',releasePointer);listen(window,'blur',releasePointer);
 root.querySelectorAll('[data-action]').forEach(button=>listen(button,'click',()=>{const action=button.dataset.action;if(action==='reverse-play')play(-1);else go(action==='return'?'inside':action);}));
 root.querySelectorAll('[data-force]').forEach(button=>listen(button,'click',()=>{syncPreference();reset();explicit=true;go('inside',true,button.dataset.force==='strong'?1:.12);}));
 function pause(){if(syncPreference()||paused)return;beforePause=state;paused=true;state='paused';stopFrame();report('回饋與示範暫停；原生頁面仍可捲動',true);}
 function play(direction=1){if(!loaded||disposed)return;syncPreference();explicit=true;if(direction===1&&paused&&mode==='scroll'){paused=false;state=beforePause;wake();return;}reset(direction===-1?'after':'before');replayDirection=direction;explicit=true;replay='entry';record(direction===-1?'replay:up':'replay:down');go('inside',true,.7);}
 function reset(start='before'){if(!loaded||disposed)return;stopReplay();stopFrame();travel=null;paused=false;explicit=false;operationId++;state='idle';intent='idle';mode='scroll';kinetic=createWindowMotion(motionEffect,{region:start});position(start==='after'?1:0,{instant:true});intent='idle';lastScrollTime=null;paint();record('reset');report('視窗在畫面外；捲動或播放可帶入',true);}
 function seek(value){if(!loaded||disposed)return;stopReplay();stopFrame();travel=null;paused=false;explicit=true;mode='timeline';state='completed';kinetic=createWindowMotion(motionEffect,{region:'inside'});position(value,{instant:true});intent='idle';paint();record('position:inspect');report('固定捲動位置：0% 在下方 · 50% 置中 · 100% 在上方',true);}
 function syncPreference(){if(mq.matches===lastReduced)return false;lastReduced=mq.matches;explicit=false;stopReplay();travel=null;paused=false;stopFrame();const max=viewport.scrollHeight-viewport.clientHeight;applyPosition(max?viewport.scrollTop/max:0,{instant:true});paint();complete();report('動態偏好更新：保持目前頁面位置',true);return true;}
 if(!hooks.reducedQuery)listen(mq,'change',syncPreference);
 const outer=new IntersectionObserver(entries=>{const next=entries[0]?.isIntersecting??false;if(next===outerVisible)return;outerVisible=next;if(!next)stopFrame();else if(!kinetic.resting||travel||replay==='hold')wake();},{threshold:0});outer.observe(viewport);
 function measure(){
  const p=nativeProgress;track.style.height=viewport.clientHeight*3+'px';windowSize={width:windowNode.offsetWidth,height:windowNode.offsetHeight};motionEffect=scrollingEffect(effect,viewport.clientHeight);kinetic.axis=[...motionEffect.axis];kinetic.path={key:effect.key,axis:kinetic.axis};
  const geometry=scrollGeometry(p,viewport.clientHeight,windowSize.height);$('.vt-entry-mark').style.left=geometry.entry*100+'%';$('.vt-exit-mark').style.left=geometry.exit*100+'%';
  if(loaded){position(p);paint();}
 }
 const resize=new ResizeObserver(measure);resize.observe(viewport);
 const ready=(async()=>{
  if(effect.layer==='3d'){content.classList.add('vt-model');model=mountStaticModel(content);await model.ready;}else{content.classList.add('vt-info');content.innerHTML='<div><small>SYSTEM / FUNCTION LIBRARY</small><h3>From opening<br>to bending.</h3><p>Opening length<br>Opening width<br>Bending angle</p></div><img src="/assets/diagrams/library.svg" alt="Approved source diagram showing opening length, width and bending angle."/>';await content.querySelector('img').decode();}
  if(disposed)return;measure();loaded=true;position(.5,{instant:true});intent='idle';paint();record('ready:visible');report('在框內捲動：內容跟隨頁面移動，停止後仍可閱讀',true);
 })();
 return {ready,play,pause,reset,seek,applyMotionPreference:syncPreference,inspect:info,dispose(){if(disposed)return;stopReplay();travel=null;stopFrame();disposed=true;outer.disconnect();resize.disconnect();scope.dispose();events.dispose();model?.dispose();root.remove();}};
}
