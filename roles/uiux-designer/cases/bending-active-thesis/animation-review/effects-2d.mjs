import {sampleElementChoreography} from '../components/element-choreography.mjs';
import {createPlaneFeedback, advancePlaneFeedback} from '../components/story-response.mjs';
import {createChapterPlayback, advanceChapterPlayback, sampleChapterPlayback} from '../components/chapter-playback.mjs';
import {sampleChapterScene} from '../components/chapter-scene-score.mjs';

// Local owner review only. The original presentation, runtime and CSS are read-only.
// Neutral review controls replay the same samplers or the exact CSS properties.
const entranceNames = {heading:'標題進場',glyph:'章節符號進場',prose:'段落進場',diagram:'資訊圖解進場',photo:'照片進場',caption:'圖說／小標進場',metric:'數據框進場',credit:'署名／來源進場',nav:'導覽文字進場'};
const entranceDurations = {heading:1.25,glyph:1.42,prose:.98,diagram:1.45,photo:1.5,caption:.9,metric:1.1,credit:1.12,nav:.58};
const entranceSources = 'components/element-choreography.mjs; runtime/presentation/EditorialPresenter.mjs; app/globals.css';
const effect = (id,title,trigger,logic,end,source,kind=id) => ({id,title,trigger,logic,end,source,kind});

export const effects2D = [
  ...Object.keys(entranceNames).map(kind => effect('entrance-'+kind,entranceNames[kind],
    '元素首次進入可見範圍。示範按「播放」重演這次可見事件。',
    `事件啟動＋共用有效播放時間取樣；${entranceDurations[kind]} 秒，同類元素另有 stagger。包含預備、到達、回彈與收斂；不是依捲動百分比 scrub。`,
    '取樣 settled 後固定原位，正常頁面不重播。Pause／Reduced／跳轉會完成可見入口並移除裝飾變形。',entranceSources,'entrance')),
  effect('feedback-plane','標題：游標傾斜／按壓',
    '精細游標移入、移動或按下內層視覺平面；鍵盤 focus 也會給固定方向回饋。',
    '事件設定 x/y/press 目標；同一個 director tick 以 critical damping（ω=18）收斂。標題父平面最大傾斜 3°，按壓深度 12px。',
    '游標移出、放開、blur 後回到零；到達容差便 settled。Pause／Reduced 的裝飾目標為零。','runtime/presentation/EditorialPresenter.mjs; components/story-response.mjs','feedback'),
  effect('feedback-media','媒體：游標傾斜',
    '精細游標移入、移動或按下媒體內層；照片外框可接受鍵盤 focus。',
    '同一 feedback sampler，最大傾斜 3°。原碼雖發布 press 的 12px feedback-z，最終 choreography CSS 只採旋轉，因此按下沒有額外可見深度位移。',
    '移出／blur 後阻尼回零，settled 停止；Pause／Reduced 移除裝飾變形。','runtime/presentation/EditorialPresenter.mjs; app/page.module.css:324','feedback'),
  effect('feedback-prose','閱讀段落的游標傾斜',
    '精細游標移入、移動或按下段落；keyboard focus 的固定回饋需元素實際可取得焦點。',
    '同一 feedback sampler，段落幅度限制為 1.2°。原碼發布 press 的 4px feedback-z，但最終 CSS 只採旋轉，沒有可見深度位移。外層命中區維持穩定。',
    '離開／放開後阻尼回零，settled 停止；Pause／Reduced 歸零。','runtime/presentation/EditorialPresenter.mjs; components/story-response.mjs','feedback'),
  effect('photo-colour','照片：處理色 → 原色',
    '照片連結 hover、focus-visible 或 focus-within；觸控裝置依 focus 狀態。',
    'CSS 事件啟動 600ms cubic-bezier(.2,.75,.25,1) filter 過渡。grayscale(1) invert(1) contrast(.82) → none；mix-blend-mode 同時離散切換 multiply → normal。',
    '游標與焦點離開後以相同過渡返回。瀏覽器負責過渡時間；不是 chapter clock 的逐幀取樣。','app/page.module.css:300','photo'),
  effect('svg-trace','SVG 曲線／折線高亮',
    'Function library／Miura 圖形 hover、按鈕 focus、點擊 pin，或章節自動選取改變。',
    '離散 index 改變 data-diagram-active；SVG trace opacity 在 240ms ease 內 0↔1，按鈕樣式 200ms。沒有 stroke-dash 描邊動畫。',
    '暫時 hover 結束恢復 pin／automatic index；點擊 pin 留存到 Follow chapter／Escape。Pause／Reduced 關閉這段 CSS transition。','components/source-diagram.module.css; runtime/features/DiagramManager.mjs','diagram'),
  effect('svg-node','SVG 流程節點高亮',
    '點擊流程圖或按鈕選取；流程圖沒有 hover 選取。來源呈現事件也可提交已畫出的 index。',
    '原圖 bounds 外框與底色以 240ms opacity 0↔1；choices 用 200ms 樣式過渡，圖說文字直接替換。這裡只展示 2D 視覺。',
    'Follow chapter／Escape 只解除本地 pin；目前不清除 3D 共用 sourceSelection。晚載入也可能錯過已呈現快照，兩項缺口保留。','components/source-diagram.module.css; runtime/features/DiagramManager.mjs','diagram'),
  effect('svg-autonomous','SVG 自動輪替高亮',
    '沒有 pin／hover 時，director 依章節 phase 發布 Math.floor(phase × groupCount)。',
    '時間驅動的離散 index，接著由 CSS 240ms 淡入／淡出。不是所有動態都只在使用者事件後發生。示範沿用 PATTERN 18 秒週期與 11 曲線群組。',
    '播放持續循環，無自然終點；pin／hover 暫時接管，Pause／Reduced／頁面隱藏停止時間推進。','runtime/orchestration/ExperienceDirector.mjs:179; components/chapter-playback.mjs','diagram'),
  ...['form','system','make'].map(kind => effect('glyph-'+kind,`章節符號 ${kind.toUpperCase()} hover`,
    '章節小標 hover。原版 glyph 是裝飾元素，不接受獨立鍵盤焦點。',
    'CSS 直接改變偶數子元素的 translateY(-2.5px) rotate(-4deg)；形狀位移沒有 transform transition。color／stroke-width 的 180ms 過渡另由瀏覽器計時。',
    '離開小標後回到原形。Reduced 停止裝飾 transform；舊 glyph-spread 值已沒有 runtime writer。','app/page.module.css:218','glyph')),
  effect('nav-label','章節導覽：標籤顯示',
    '導覽 hover 或 focus-visible。',
    'CSS opacity 0↔1、color／border／background 都在 180ms 過渡；標籤不影響外層命中區。',
    'hover 與焦點離開後淡出。手機／短橫向版面原本不顯示旁側 railLabel。','app/page.module.css:89','nav'),
  effect('nav-current','章節導覽：目前章節指示',
    '捲動／導覽讓 semantic chapter 改變，director 更新 aria-current。此處用點選章節重現狀態。',
    '目前數字平移 -3px、指示線 scaleY(1)，250ms CSS 過渡；mobile 水平導覽改為 translateY(-2px) 與 scaleX。',
    '新的章節成為 current 後舊項返回。沒有另外一條導覽時鐘；CSS 負責短過渡。','app/page.module.css:237; runtime/orchestration/ExperienceDirector.mjs:110','nav'),
  effect('nav-press','章節導覽：按壓數字',
    '導覽連結 :active（滑鼠按下／觸控按住）。',
    '沿用數字 250ms transform 過渡至 translateX(-1px) scale(.9)；命中區不縮小。',
    '放開或 pointer cancel 回到 current／rest 位置；這是局部 CSS 回饋。','app/page.module.css:241','nav'),
  effect('media-cue','照片：Inspect evidence 提示',
    '媒體外框 hover 或 focus-visible。',
    '提示 opacity 0→1、translateY(4px→0)，180ms；outline／shadow 180ms，圓角框線 220ms。最終 CSS 的 frameCorner 沒有位移。',
    '移出／失焦後淡出。手機版提示直接可見；沒有連續跳動或另開 timer。','app/page.module.css:94; app/page.module.css:305','photo'),
  effect('media-press','照片：Inspect evidence 按壓',
    '媒體連結 :active。',
    '提示沿用 180ms transform 過渡，translateY(1px) scale(.97)。示範只重演回饋，不打開來源頁。',
    '放開／取消後回到 hover 的提示狀態；實際點擊另由 EvidenceManager 控制原始資料展開。','app/page.module.css:230','photo'),
  effect('method-arrow','方法說明：開啟／收合箭頭',
    '點擊 summary 或用 Enter／Space 開關原生 details。',
    '原生 open 狀態直接展開內容；只有箭頭 rotation 0→90°、color 用 220ms CSS transition，邊框狀態直接切換。',
    '再次操作 summary 收合。沒有內容高度 tween 或完成回報事件。','app/page.module.css:233','details'),
  effect('study-link','Explore the surface：箭頭回饋',
    '連結 hover／focus-visible；箭頭位移只綁 hover。',
    'CSS border／background 200ms；hover 的箭頭 translate(2px,-2px)，200ms。',
    '離開 hover／focus 返回。實際連結導航是獨立動作，不會由這段過渡完成才發生。','app/page.module.css:258','link'),
  effect('prose-highlight','段落：閱讀高亮',
    'hover:hover ＋ pointer:fine 裝置上的段落 hover。',
    'CSS border-left-color 與文字 color 過渡 180ms；不改內容、不移動閱讀位置。',
    '移出後返回原色；Reduced 直接變更樣式。','app/page.module.css:112','prose'),
  effect('metric-highlight','數據框：邊框高亮',
    'hover:hover ＋ pointer:fine 裝置上的數據框 hover。',
    '目前邊框直接變成 accent，沒有 transition 設定；這是事件驅動的狀態切換。',
    '移出後直接回復邊框。示範沒有額外添加淡入動畫。','app/page.module.css:113','metric'),
  effect('scene-rim','資訊平面：共用燈光邊緣',
    '章節循環播放時持續更新，精細游標位置另外影響亮邊位置。',
    '同一 chapter-scene sampler 的 areaAzimuth／rimEnergy 取樣到 DOM CSS；RGB 混色與 strength／x 量化。資訊層沒有自己的燈光時鐘。示範沿用 SYSTEM 20 秒週期。',
    '循環無自然終點；Pause／Reduced 停下。此示範只呈現 DOM 亮邊，不包含 ASCII。','runtime/orchestration/ExperienceDirector.mjs:186; app/page.module.css:348','rim'),
  effect('reading-progress','閱讀進度：直接跟隨捲動',
    '原生捲動位置／chapter navigation 改變。此處 slider 代表 native document progress。',
    'director 把 visualDocY / maxScroll 寫成 scaleX。Round 10 native reading 不做整頁補償；進度不是自主動畫或平滑 tween。',
    '本次位置更新後即完成；停止輸入就固定。播放只重演一段輸入示例，不新增正式頁動畫。','runtime/orchestration/ExperienceDirector.mjs:193; components/cinematic.module.css:15','progress'),
];

const SVG_NS='http://www.w3.org/2000/svg';
const reducedQuery=()=>matchMedia('(prefers-reduced-motion: reduce)');
const neutral={x:0,y:0,press:0};
const glyphs={
  form:'<path d="M5 28 13 8l13 3 9 19-18 4Z"/><path d="m5 28 21-17M13 8l4 26m0 0 18-4"/>',
  system:'<path d="m9 9 22 4-3 19L9 25Z"/><path d="m9 9 19 23M9 25l22-12"/><circle cx="9" cy="9" r="3"/><circle cx="31" cy="13" r="3"/><circle cx="28" cy="32" r="3"/><circle cx="9" cy="25" r="3"/>',
  make:'<path d="m5 14 15-7 15 7-15 7Zm0 7 15 7 15-7M5 28l15 7 15-7"/><path d="M20 21v14"/>',
};
function glyph(kind='form'){return `<span class="ar2d-glyph" data-glyph-kind="${kind}" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none">${glyphs[kind]}</svg></span>`;}
function photo(){return '<img class="ar2d-image" src="/assets/cinematic/built-prototype.webp" width="1110" height="549" alt="The completed perforated metal-panel installation on a patterned base outdoors."/>';}
function base(stage,descriptor,hooks){
  const root=document.createElement('div');root.className='ar2d-shell';root.dataset.effect=descriptor.id;
  stage.classList.add('ar2d-stage');stage.append(root);
  const abort=new AbortController(),mq=reducedQuery();let disposed=false,frame=0,paused=false,explicit=false;
  const report=(status,state={})=>{if(!disposed)hooks.report?.(status,{effect:descriptor.id,...state});};
  function listen(target,type,handler,options={}){target.addEventListener(type,handler,{...options,signal:abort.signal});}
  const animations=()=>root.getAnimations({subtree:true});
  function freezeAnimations(){const active=animations();active.forEach(animation=>{const time=animation.currentTime;animation.pause();if(time!==null)animation.currentTime=time;});return active;}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
  function schedule(tick){if(!frame&&!disposed&&!paused&&!document.hidden)frame=requestAnimationFrame(now=>{frame=0;tick(now);});}
  function setExplicit(value){explicit=value;root.dataset.explicit=String(value);}
  function instant(action){root.dataset.instant='true';action();void root.offsetWidth;delete root.dataset.instant;}
  function dispose(){disposed=true;stop();abort.abort();animations().forEach(a=>a.cancel());root.remove();stage.classList.remove('ar2d-stage');}
  return {root,mq,report,listen,stop,schedule,setExplicit,instant,dispose,animations,freezeAnimations,
    get disposed(){return disposed;},get paused(){return paused;},set paused(v){paused=v;},
    get reduced(){return mq.matches&&!explicit;},get scheduled(){return !!frame;}};
}

function sampleTransform(node,value,{heading=false,shadow=false}={}){
  node.dataset.phase=value.phase;
  if(value.settled){node.style.transform='none';node.style.translate='none';node.style.rotate='none';node.style.scale='none';node.style.filter='none';return;}
  if(heading){
    node.style.translate='none';node.style.rotate='none';node.style.scale='none';
    node.style.transform=`translate3d(${value.x}px,${value.y}px,${value.z}px) rotateX(${value.rotateX}deg) rotateY(${value.rotateY}deg) rotateZ(${value.rotateZ}deg) scale(${value.scale})`;
  }else{
    node.style.translate=`${value.x}px ${value.y}px ${value.z}px`;node.style.rotate=`${value.rotateZ}deg`;node.style.scale=String(value.scale);
    node.style.transform=`perspective(1100px) rotateX(${value.rotateX}deg) rotateY(${value.rotateY}deg)`;
    node.style.filter=shadow?`drop-shadow(0 ${value.shadowDepth}px ${value.shadowDepth*1.4}px #0005)`:'none';
  }
}
function mountEntrance(ctx,descriptor){
  const kind=descriptor.id.slice(9);let elapsed=0,previous=0,playing=false,lastReport='',counter=0;
  const html={
    heading:'<h2 class="ar2d-heading"><span class="ar2d-object">The shape begins</span><span class="ar2d-object ar2d-italic">with an opening.</span></h2>',
    glyph:`<div class="ar2d-glyphs">${['form','system','make'].map(k=>`<span class="ar2d-object">${glyph(k)}</span>`).join('')}</div>`,
    prose:'<div class="ar2d-copy"><p class="ar2d-object">A desired surface is only the beginning. This thesis asks how the geometry of a cut pattern can help a metal sheet take that form.</p><p class="ar2d-object">Miura folding represents the surface’s local angles. Those angles link the overall shape to a repeatable operation at the scale of one opening.</p></div>',
    diagram:'<figure class="ar2d-object ar2d-drawing"><img src="/assets/diagrams/miura.svg" alt="Original Miura fold anatomy drawing."/></figure>',
    photo:`<figure class="ar2d-object ar2d-photo">${photo()}</figure>`,
    caption:'<div class="ar2d-caption"><span class="ar2d-object">FIG. 3–15</span><p class="ar2d-object">The assembled installation, photographed on site.</p></div>',
    metric:'<dl class="ar2d-metrics"><div class="ar2d-object"><dt>panels, reported</dt><dd>16</dd></div><div class="ar2d-object"><dt>prototype, reported</dt><dd>3.3 × 2.6 × 0.7 m</dd></div></dl>',
    credit:'<div class="ar2d-copy ar2d-credits"><p class="ar2d-object">Individual thesis research by JosHsuan Chao, supervised by Prof. Kane Yanagawa at National Cheng Kung University.</p><p class="ar2d-object">Prototype assembly was collaborative. Individual fabrication tasks and image authorship are not fully identified in the reviewed source.</p></div>',
    nav:'<nav class="ar2d-entrance-nav" aria-label="Entrance demonstration"><span class="ar2d-object">01 / OVERVIEW</span><span class="ar2d-object">02 / FORM</span><span class="ar2d-object">03 / SYSTEM</span><span class="ar2d-object">04 / PATTERN</span></nav>',
  };
  ctx.root.innerHTML=`<div class="ar2d-entrance" data-kind="${kind}">${html[kind]}</div>`;
  const nodes=[...ctx.root.querySelectorAll('.ar2d-object')];
  function render(){
    const values=nodes.map((node,index)=>{const value=sampleElementChoreography({kind,index,elapsed,reducedMotion:ctx.reduced});sampleTransform(node,value,{heading:kind==='heading',shadow:['glyph','diagram','photo','metric'].includes(kind)});return value;});
    const phase=values.map(v=>v.phase).join(' / '),settled=values.every(v=>v.settled);
    if(phase!==lastReport||settled||counter++%12===0){lastReport=phase;ctx.report(settled?'已完成，固定原位':playing?'入口播放中':'入口等待播放',{elapsed:Number(elapsed.toFixed(3)),phase,settled,profile:kind});}
    return settled;
  }
  function tick(now){if(!playing||ctx.paused)return;const dt=previous?(now-previous)/1000:0;previous=now;elapsed+=Math.min(dt,.1);if(!render())ctx.schedule(tick);else playing=false;}
  function play(){ctx.setExplicit(true);ctx.paused=false;if(render()&&!playing)elapsed=0;playing=true;previous=0;render();ctx.schedule(tick);}
  function pause(){ctx.paused=true;ctx.stop();previous=0;ctx.report('入口已暫停',{elapsed,phase:lastReport});}
  function reset(){ctx.stop();ctx.setExplicit(false);ctx.paused=false;playing=false;elapsed=0;previous=0;render();}
  ctx.listen(document,'visibilitychange',()=>{if(document.hidden){ctx.stop();previous=0;}else if(playing&&!ctx.paused)ctx.schedule(tick);});
  render();
  return {play,pause,reset,seek(value){ctx.stop();ctx.setExplicit(true);elapsed=Math.max(0,Math.min(1,Number(value)))*(entranceDurations[kind]+.48);playing=false;ctx.paused=false;render();},dispose:ctx.dispose,inspect:()=>({elapsed,phase:lastReport,scheduled:ctx.scheduled,settled:nodes.every(n=>n.dataset.phase==='settled')})};
}

function mountFeedback(ctx,descriptor){
  const prose=descriptor.id==='feedback-prose',heading=descriptor.id==='feedback-plane',amplitude=prose?1.2:3,depth=heading?12:0;
  ctx.root.innerHTML=prose?'<div class="ar2d-feedback-zone" tabindex="0"><p class="ar2d-feedback-plane ar2d-feedback-copy">A desired surface is only the beginning. This thesis asks how the geometry of a cut pattern can help a metal sheet take that form.</p></div>':heading?'<div class="ar2d-feedback-zone" tabindex="0"><h2 class="ar2d-feedback-plane ar2d-heading">The shape begins<br/><span class="ar2d-italic">with an opening.</span></h2></div>':`<div class="ar2d-feedback-zone" tabindex="0"><div class="ar2d-feedback-plane ar2d-photo">${photo()}</div></div>`;
  const zone=ctx.root.querySelector('.ar2d-feedback-zone'),plane=ctx.root.querySelector('.ar2d-feedback-plane');
  let state=createPlaneFeedback(),target={...neutral},previous=0,sequence=null,sequenceTime=0,focused=false,inside=false,press=0,counter=0;
  function paint(){const x=-state.y*amplitude,y=state.x*amplitude,z=state.press*depth;plane.style.transform=ctx.reduced?'none':`perspective(1100px) translateZ(${z}px) rotateX(${x}deg) rotateY(${y}deg)`;if(counter++%8===0||state.settled)ctx.report(state.settled?'回饋已收斂':'回饋收斂中',{x:Number(x.toFixed(3)),y:Number(y.toFixed(3)),z:Number(z.toFixed(3)),publishedPressDepth:state.press*(prose?4:12),target:{...target},settled:state.settled});}
  function set(next){if(ctx.paused)return;sequence=null;target=ctx.reduced?{...neutral}:next;previous=0;ctx.schedule(tick);}
  function tick(now){if(ctx.paused)return;const dt=previous?Math.min(.1,(now-previous)/1000):1/60;previous=now;
    if(sequence){sequenceTime+=dt;const frame=sequenceTime<.8?{x:.9,y:-.8,press:0}:sequenceTime<1.5?{x:-.75,y:.55,press:1}:sequenceTime<2?{x:.3,y:-.3,press:.35}:{...neutral};target=frame;if(sequenceTime>2)sequence=null;}
    advancePlaneFeedback(state,ctx.reduced?neutral:target,dt,{reducedMotion:ctx.reduced});paint();if(sequence||!state.settled)ctx.schedule(tick);
  }
  ctx.listen(zone,'pointerenter',event=>{if(event.pointerType==='touch')return;inside=true;set({...target,press:0});});
  ctx.listen(zone,'pointermove',event=>{if(event.pointerType==='touch'||ctx.paused)return;const r=zone.getBoundingClientRect();set({x:Math.min(1,Math.max(-1,(event.clientX-r.left)/r.width*2-1)),y:Math.min(1,Math.max(-1,(event.clientY-r.top)/r.height*2-1)),press});});
  ctx.listen(zone,'pointerdown',event=>{if(event.pointerType==='touch')return;press=1;set({...target,press});});
  ctx.listen(window,'pointerup',()=>{press=0;if(inside||focused)set({...target,press:focused?.35:0});});
  ctx.listen(zone,'pointerleave',()=>{inside=false;press=0;set(focused?{x:.3,y:-.3,press:.35}:{...neutral});});
  ctx.listen(zone,'pointercancel',()=>{inside=false;press=0;set({...neutral});});
  ctx.listen(zone,'focusin',()=>{focused=true;set({x:.3,y:-.3,press:.35});});
  ctx.listen(zone,'focusout',()=>{focused=false;set(inside?{...target,press:0}:{...neutral});});
  ctx.listen(window,'blur',()=>{inside=focused=false;press=0;set({...neutral});});
  ctx.listen(document,'visibilitychange',()=>{if(document.hidden){ctx.stop();previous=0;target={...neutral};sequence=null;}else if(!ctx.paused){ctx.schedule(tick);}});
  paint();
  return {play(){ctx.setExplicit(true);ctx.paused=false;sequence='replay';sequenceTime=0;previous=0;ctx.schedule(tick);},pause(){ctx.paused=true;ctx.stop();previous=0;ctx.report('回饋已暫停',{...state});},reset(){ctx.stop();ctx.setExplicit(false);ctx.paused=false;sequence=null;state=createPlaneFeedback();target={...neutral};previous=0;paint();},dispose:ctx.dispose,inspect:()=>({...state,target:{...target},scheduled:ctx.scheduled})};
}

// CSS is the actual animation writer for these effects. The single review RAF
// only replays the entering/leaving events, observes completion and can freeze.
function mountCss(ctx,descriptor){
  const id=descriptor.id;let active=false,playing=false,elapsed=0,previous=0,focused=false,inside=false,pausedAnimations=[];
  let target,apply=()=>{},total=1.9,holding=1.15;
  if(id.startsWith('glyph-')){
    const kind=id.slice(6);ctx.root.innerHTML=`<div class="ar2d-label">${glyph(kind)}<span>${kind.toUpperCase()}</span></div>`;target=ctx.root.querySelector('.ar2d-label');apply=value=>target.dataset.active=String(value);
  }else if(id==='photo-colour'||id==='media-cue'||id==='media-press'){
    ctx.root.innerHTML=`<button type="button" class="ar2d-media ${id}" aria-label="Review photo feedback"><span class="ar2d-media-plane">${photo()}<span class="ar2d-frame-corner" aria-hidden="true"></span></span><span class="ar2d-media-action">Inspect evidence <span aria-hidden="true">↗</span></span></button>`;
    target=ctx.root.querySelector('.ar2d-media');apply=value=>target.dataset.active=String(value);
    if(id==='media-press'){target.dataset.cue='true';holding=.8;total=1.6;}
    if(id==='photo-colour')total=2.1;
  }else if(id.startsWith('nav-')){
    ctx.root.innerHTML='<nav class="ar2d-rail" aria-label="Review chapter states"><button type="button" data-nav="0"><span>01</span><span class="ar2d-rail-label">Overview</span></button><button type="button" data-nav="1"><span>02</span><span class="ar2d-rail-label">Form</span></button><button type="button" data-nav="2"><span>03</span><span class="ar2d-rail-label">System</span></button></nav>';
    const buttons=[...ctx.root.querySelectorAll('.ar2d-rail button')];target=buttons[1];
    if(id==='nav-label')apply=value=>target.dataset.active=String(value);
    if(id==='nav-press')apply=value=>target.dataset.pressed=String(value);
    if(id==='nav-current'){apply=value=>{buttons.forEach((button,index)=>{const current=index===(value?1:0);button.dataset.current=String(current);if(current)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');});};buttons.forEach(button=>ctx.listen(button,'click',()=>{if(!ctx.paused){playing=false;ctx.stop();buttons.forEach(b=>{b.dataset.current=String(b===button);if(b===button)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});ctx.report('目前章節已切換',{chapter:Number(button.dataset.nav)+1});}}));}
  }else if(id==='method-arrow'){
    ctx.root.innerHTML='<div class="ar2d-method"><details><summary><span>01</span><span>Target surface</span><span class="ar2d-step-arrow" aria-hidden="true">↗</span></summary><p>Start with the desired surface geometry.</p></details></div>';target=ctx.root.querySelector('details');apply=value=>{target.open=value;};ctx.listen(target,'toggle',()=>{active=target.open;ctx.report(active?'說明已開啟，箭頭過渡中':'說明已收合，箭頭返回',{open:active});});
  }else if(id==='study-link'){
    ctx.root.innerHTML='<button class="ar2d-study-link" type="button"><span>Explore the surface</span><span aria-hidden="true">↓</span><small>Hover the model. Click to compare. Drag to explore.</small></button>';target=ctx.root.querySelector('button');apply=value=>target.dataset.active=String(value);
  }else if(id==='prose-highlight'){
    ctx.root.innerHTML='<p class="ar2d-prose-highlight">A desired surface is only the beginning. This thesis asks how the geometry of a cut pattern can help a metal sheet take that form.</p>';target=ctx.root.querySelector('p');apply=value=>target.dataset.active=String(value);
  }else if(id==='metric-highlight'){
    ctx.root.innerHTML='<dl class="ar2d-metrics"><div class="ar2d-metric-highlight"><dt>panels, reported</dt><dd>16</dd></div></dl>';target=ctx.root.querySelector('dl>div');apply=value=>target.dataset.active=String(value);
  }
  function change(value,reason){if(ctx.paused)return;active=value;apply(value);ctx.report(reason,{active:value,animationOwner:'browser CSS',directState:['metric-highlight'].includes(id)});}
  function tick(now){if(!playing||ctx.paused)return;const dt=previous?Math.min(.1,(now-previous)/1000):0;previous=now;elapsed+=dt;if(elapsed>=holding&&active)change(false,'離開事件：返回原位');if(elapsed<total)ctx.schedule(tick);else{playing=false;ctx.setExplicit(false);ctx.report('示範完成，CSS 已收斂',{active:false,elapsed});}}
  if(id!=='method-arrow'&&id!=='nav-current'){
    const pressEffect=['media-press','nav-press'].includes(id);
    ctx.listen(target,'pointerenter',event=>{if(event.pointerType==='touch'||pressEffect)return;inside=true;playing=false;ctx.stop();change(true,'hover：局部回饋');});
    ctx.listen(target,'pointerleave',()=>{inside=false;if(!pressEffect)change(focused&&id!=='study-link','離開 hover');});
    if(['nav-label','media-cue','photo-colour','study-link'].includes(id)){
      ctx.listen(target,'focusin',()=>{focused=true;if(id==='study-link'){target.dataset.focused='true';change(inside,'focus：外框回饋，箭頭只接受 hover');}else change(true,'focus：局部回饋');});ctx.listen(target,'focusout',()=>{focused=false;delete target.dataset.focused;change(inside,'焦點離開');});
    }
    if(pressEffect){ctx.listen(target,'pointerdown',()=>change(true,'按下事件'));ctx.listen(window,'pointerup',()=>{if(active)change(false,'放開事件');});ctx.listen(target,'pointercancel',()=>change(false,'取消事件'));}
  }
  ctx.listen(target,'transitionend',event=>{if(!playing&&!ctx.paused)ctx.report('CSS 過渡完成',{active,property:event.propertyName});});
  ctx.listen(window,'blur',()=>{if(!ctx.paused){ctx.stop();playing=false;inside=focused=false;change(false,'視窗失焦：返回原位');}});
  ctx.listen(document,'visibilitychange',()=>{if(document.hidden){ctx.stop();previous=0;ctx.animations().forEach(a=>a.pause());}else if(!ctx.paused){ctx.animations().forEach(a=>a.play());if(playing)ctx.schedule(tick);}});
  apply(false);void target.offsetWidth;ctx.report('可直接操作，或播放一次事件重演',{active:false,animationOwner:'browser CSS'});
  return {play(){ctx.setExplicit(true);if(ctx.paused){ctx.paused=false;pausedAnimations.forEach(a=>a.play());pausedAnimations=[];previous=0;if(playing)ctx.schedule(tick);else ctx.report('CSS 回饋已恢復',{active});return;}ctx.stop();elapsed=0;previous=0;playing=true;change(true,'進入事件：局部回饋');ctx.schedule(tick);},pause(){ctx.paused=true;ctx.stop();pausedAnimations=ctx.freezeAnimations();previous=0;ctx.report('CSS 回饋已暫停',{active,elapsed});},reset(){ctx.stop();pausedAnimations.forEach(a=>a.cancel());pausedAnimations=[];ctx.paused=false;ctx.setExplicit(false);playing=false;active=inside=focused=false;delete target.dataset.focused;ctx.instant(()=>apply(false));ctx.report('已重設為原始狀態',{active:false});},dispose:ctx.dispose,inspect:()=>({active,elapsed,scheduled:ctx.scheduled,cssAnimations:ctx.animations().map(a=>({playState:a.playState,currentTime:a.currentTime}))})};
}

function svgElement(name,attrs={}){const node=document.createElementNS(SVG_NS,name);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,String(value));return node;}
function mountDiagram(ctx,descriptor){
  const autonomous=descriptor.id==='svg-autonomous',kind=descriptor.id==='svg-node'?'workflow':'library';
  ctx.root.innerHTML=`<figure class="ar2d-diagram"><div class="ar2d-diagram-panel"><img class="ar2d-diagram-original" src="/assets/diagrams/${kind}.svg" alt="Original ${kind} drawing."/><svg class="ar2d-diagram-overlay" aria-hidden="true"></svg></div><div class="ar2d-choices" role="group" aria-label="Select source highlight"></div><p class="ar2d-diagram-caption"></p></figure>`;
  const panel=ctx.root.querySelector('.ar2d-diagram-panel'),svg=ctx.root.querySelector('svg'),choices=ctx.root.querySelector('.ar2d-choices'),caption=ctx.root.querySelector('.ar2d-diagram-caption');
  const loading=new AbortController();let data=null,groupNodes=[],buttons=[],presented=0,automatic=0,pinned=null,hover=null,playing=false,pendingPlay=false,previous=0,elapsed=0,lastIndex=-1;
  let playback=createChapterPlayback('pattern');
  function paint(index,reason='高亮已切換'){
    if(!data)return;const selected=((index%data.groups.length)+data.groups.length)%data.groups.length;presented=selected;
    groupNodes.forEach((node,i)=>node.dataset.active=String(i===selected));buttons.forEach((button,i)=>{button.dataset.active=String(i===selected);button.setAttribute('aria-pressed',String(i===selected));});caption.textContent=data.groups[selected].description;
    if(selected!==lastIndex){lastIndex=selected;ctx.report(reason,{index:selected,label:data.groups[selected].label,pinned,hover,phase:sampleChapterPlayback(playback).phases[3],animationOwner:'CSS opacity / shared phase sampler'});}
  }
  function restore(){paint(pinned??hover??automatic,'恢復目前自動／選取狀態');}
  function tick(now){if(ctx.paused||!playing)return;const dt=previous?Math.min(.1,(now-previous)/1000):1/60;previous=now;elapsed+=dt;
    if(autonomous){advanceChapterPlayback(playback,dt,{chapter:'pattern'});const index=Math.floor(sampleChapterPlayback(playback).phases[3]*data.groups.length)%data.groups.length;automatic=index;if(pinned===null&&hover===null)paint(index,'共用 phase：自動輪替');ctx.schedule(tick);}
    else{if(elapsed<.9)paint(0,'第一個選取事件');else if(elapsed<1.8)paint(1,'第二個選取事件');else if(elapsed<2.7)paint(2,'第三個選取事件');else{playing=false;ctx.setExplicit(false);ctx.report('高亮示範完成',{index:presented,label:data.groups[presented].label});return;}ctx.schedule(tick);}
  }
  function play(){ctx.setExplicit(true);ctx.paused=false;if(!data){pendingPlay=true;ctx.report('正在載入公開原圖');return;}ctx.animations().forEach(a=>a.play());if(!playing&&!autonomous){elapsed=0;lastIndex=-1;}playing=true;previous=0;ctx.schedule(tick);}
  async function load(){
    try{const response=await fetch(`/assets/diagrams/${kind}.json`,{signal:loading.signal});if(!response.ok)throw Error('Public drawing unavailable');const source=await response.json();if(ctx.disposed)return;data=source;
      panel.style.aspectRatio=`${data.viewBox[2]} / ${data.viewBox[3]}`;svg.setAttribute('viewBox',data.viewBox.join(' '));
      const paths=new Map(data.paths.map(path=>[path.id,path]));
      data.groups.forEach((group,index)=>{
        const node=svgElement('g',{'data-index':index,'data-active':'false',class:'ar2d-svg-highlight'});
        if(group.paths.length)group.paths.forEach(pathId=>{const path=paths.get(pathId);if(path)node.append(svgElement('path',{d:path.attrs.d,class:'ar2d-svg-trace'}));});
        else node.append(svgElement('rect',{x:group.bounds[0],y:group.bounds[1],width:group.bounds[2]-group.bounds[0],height:group.bounds[3]-group.bounds[1],rx:12,class:'ar2d-svg-node'}));
        const hit=kind==='library'?svgElement('path',{d:paths.get(group.paths[0])?.attrs.d??'',class:'ar2d-svg-hit-curve'}):svgElement('rect',{x:group.bounds[0],y:group.bounds[1],width:group.bounds[2]-group.bounds[0],height:group.bounds[3]-group.bounds[1],class:'ar2d-svg-hit-region'});node.append(hit);svg.append(node);groupNodes.push(node);
        const button=document.createElement('button');button.type='button';button.textContent=group.label;button.setAttribute('aria-pressed','false');choices.append(button);buttons.push(button);
        const select=()=>{if(ctx.paused)return;pinned=index;hover=null;paint(index,'點擊 pin：保持高亮');};ctx.listen(node,'click',select);ctx.listen(button,'click',select);
        if(kind!=='workflow'){
          ctx.listen(node,'pointerenter',event=>{if(event.pointerType!=='touch'&&!ctx.paused){hover=index;paint(index,'hover：暫時預覽');}});ctx.listen(node,'pointerleave',()=>{if(!ctx.paused){hover=null;restore();}});
          ctx.listen(button,'focus',()=>{if(!ctx.paused){hover=index;paint(index,'focus：暫時預覽');}});
        }
      });
      const follow=document.createElement('button');follow.type='button';follow.className='ar2d-follow';follow.textContent='Follow chapter';choices.append(follow);const unpin=()=>{if(ctx.paused)return;pinned=hover=null;restore();ctx.report('本地 pin 已解除',{index:presented,note:kind==='workflow'?'原正式頁尚未解除共用 sourceSelection':'回到自動 index'});};ctx.listen(follow,'click',unpin);ctx.listen(ctx.root,'keydown',event=>{if(event.key==='Escape')unpin();});
      ctx.listen(choices,'focusout',event=>{if(!choices.contains(event.relatedTarget)&&!ctx.paused){hover=null;restore();}});
      paint(0,'公開原圖已就緒');if(pendingPlay){pendingPlay=false;play();}
    }catch(error){if(error.name!=='AbortError')ctx.report('原圖載入失敗',{error:error.message});}
  }
  const dispose=()=>{loading.abort();ctx.dispose();};
  ctx.listen(document,'visibilitychange',()=>{if(document.hidden){ctx.stop();previous=0;}else if(playing&&!ctx.paused)ctx.schedule(tick);});
  load();
  return {play,pause(){ctx.paused=true;ctx.stop();ctx.freezeAnimations();previous=0;ctx.report('高亮已暫停',{index:presented,pinned});},reset(){ctx.stop();ctx.setExplicit(false);ctx.paused=false;ctx.animations().forEach(a=>a.cancel());playing=pendingPlay=false;previous=elapsed=automatic=0;pinned=hover=null;playback=createChapterPlayback('pattern');lastIndex=-1;ctx.instant(()=>paint(0,'已重設第一個高亮'));},seek(value){if(!data)return;ctx.stop();ctx.setExplicit(true);ctx.paused=false;playing=false;playback=createChapterPlayback('pattern');const seconds=Math.max(0,Math.min(1,value))*18;for(let t=0;t<seconds;t+=.1)advanceChapterPlayback(playback,Math.min(.1,seconds-t),{chapter:'pattern'});automatic=Math.min(data.groups.length-1,Math.floor(Math.max(0,Math.min(.999,value))*data.groups.length));paint(automatic,'檢視指定 phase 高亮');},dispose,inspect:()=>({loaded:!!data,index:presented,automatic,pinned,hover,playing,scheduled:ctx.scheduled,phase:sampleChapterPlayback(playback).phases[3]})};
}

function mountRim(ctx){
  ctx.root.innerHTML='<article class="ar2d-rim-card"><span class="ar2d-rim-index">SYSTEM / INFORMATION PLANE</span><h2>From angle<br/>to pattern.</h2><p>The opening values inform a reconstructed mesh. Paired edges then describe how the openings close and the panel bends.</p><span class="ar2d-rim-readout"></span></article>';
  const card=ctx.root.querySelector('article'),readout=ctx.root.querySelector('.ar2d-rim-readout');let playback=createChapterPlayback('system'),playing=false,previous=0,pointer=0,pointerTarget=0,last=null,counter=0;
  function render(){const sample=sampleChapterScene(sampleChapterPlayback(playback),{reducedMotion:ctx.reduced,aspect:1.6,quality:'full'}),neutralRgb=[200,214,201],tint=sample.field.asciiTint;
    const rgb=neutralRgb.map((v,i)=>Math.round(v*.88+tint[i]*255*.12)),strength=Math.round(Math.min(1,Math.max(0,.35+(sample.light.rimEnergy-1)*1.5))*20)/20,x=Math.round(50+sample.light.areaAzimuthDeg*2+pointer*15);
    card.style.setProperty('--scene-rim-rgb',rgb.join(' '));card.style.setProperty('--scene-rim-strength',strength);card.style.setProperty('--scene-rim-x',x+'%');last={rgb,strength,x,pointer,pointerTarget,phase:sampleChapterPlayback(playback).phases[2]};readout.textContent=`rim x ${x}% · strength ${strength.toFixed(2)}`;if(counter++%12===0)ctx.report(playing?'章節循環：共用燈光亮邊':'亮邊已固定',last);
  }
  function tick(now){if(ctx.paused)return;const dt=previous?Math.min(.1,(now-previous)/1000):1/60;previous=now;if(playing)advanceChapterPlayback(playback,dt,{chapter:'system'});const next=ctx.reduced?0:pointerTarget,alpha=1-Math.exp(-10*Math.min(dt,1));pointer+=(next-pointer)*alpha;const moving=Math.abs(pointer-next)>.001;if(!moving)pointer=next;render();if(playing||moving)ctx.schedule(tick);}
  ctx.listen(card,'pointermove',event=>{if(event.pointerType==='touch'||ctx.paused)return;pointerTarget=ctx.reduced?0:Math.max(-1,Math.min(1,event.clientX/innerWidth*2-1));ctx.schedule(tick);});ctx.listen(card,'pointerleave',()=>{if(ctx.paused)return;pointerTarget=0;ctx.schedule(tick);});
  ctx.listen(window,'blur',()=>{if(ctx.paused)return;pointerTarget=0;ctx.schedule(tick);});
  ctx.listen(document,'visibilitychange',()=>{if(document.hidden){ctx.stop();previous=0;}else if(playing&&!ctx.paused)ctx.schedule(tick);});render();
  return {play(){ctx.setExplicit(true);ctx.paused=false;playing=true;previous=0;ctx.schedule(tick);},pause(){ctx.paused=true;ctx.stop();previous=0;ctx.report('燈光亮邊循環已暫停',last);},reset(){ctx.stop();ctx.setExplicit(false);ctx.paused=false;playing=false;previous=pointer=pointerTarget=0;playback=createChapterPlayback('system');render();},seek(value){ctx.stop();ctx.setExplicit(true);ctx.paused=false;playing=false;playback=createChapterPlayback('system');const seconds=Math.max(0,Math.min(1,value))*20;for(let elapsed=0;elapsed<seconds;elapsed+=.1)advanceChapterPlayback(playback,Math.min(.1,seconds-elapsed),{chapter:'system'});render();},dispose:ctx.dispose,inspect:()=>({...last,playing,scheduled:ctx.scheduled})};
}

function mountProgress(ctx){
  ctx.root.innerHTML='<div class="ar2d-progress-demo"><div class="ar2d-progress-track"><span></span></div><label>Native document progress <input type="range" min="0" max="1" step=".001" value="0"/></label><output>0%</output></div>';
  const line=ctx.root.querySelector('.ar2d-progress-track span'),input=ctx.root.querySelector('input'),output=ctx.root.querySelector('output');let value=0,playing=false,elapsed=0,previous=0;
  function render(next){value=Math.max(0,Math.min(1,Number(next)));line.style.transform=`scaleX(${value})`;input.value=value;output.textContent=Math.round(value*100)+'%';ctx.report('位置事件已提交：直接更新',{progress:value,animationOwner:'direct DOM style',settled:true});}
  function tick(now){if(!playing||ctx.paused)return;const dt=previous?Math.min(.1,(now-previous)/1000):0;previous=now;elapsed+=dt;render(Math.min(1,elapsed/2));if(elapsed<2)ctx.schedule(tick);else{playing=false;ctx.report('輸入重演完成；沒有自主進度循環',{progress:value});}}
  ctx.listen(input,'input',()=>{if(ctx.paused)return;ctx.stop();playing=false;render(input.value);});render(0);
  return {play(){ctx.setExplicit(true);ctx.paused=false;if(value===1)elapsed=0;playing=true;previous=0;ctx.schedule(tick);},pause(){ctx.paused=true;ctx.stop();previous=0;ctx.report('輸入重演已暫停',{progress:value});},reset(){ctx.stop();ctx.setExplicit(false);ctx.paused=false;playing=false;elapsed=previous=0;render(0);},seek:render,dispose:ctx.dispose,inspect:()=>({progress:value,playing,scheduled:ctx.scheduled})};
}

export function mount2D(stage,descriptor,hooks={}){
  const ctx=base(stage,descriptor,hooks);
  switch(descriptor.kind){
    case 'entrance':return mountEntrance(ctx,descriptor);
    case 'feedback':return mountFeedback(ctx,descriptor);
    case 'diagram':return mountDiagram(ctx,descriptor);
    case 'rim':return mountRim(ctx,descriptor);
    case 'progress':return mountProgress(ctx,descriptor);
    default:return mountCss(ctx,descriptor);
  }
}
