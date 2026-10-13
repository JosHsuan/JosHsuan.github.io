/** Local animation-review specimens. Production sources are imported read-only.
 * Each specimen retains one renderer, freezes unrelated tracks, and releases
 * every owned resource. Geometry comes only from the approved release GLBs.
 */
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {createCinematicMaterial} from '../components/materials/cinematic-material.js';
import {sampleChapterScene, applyChapterLighting, CHAPTER_SCENE_IDS} from '../components/chapter-scene-score.mjs';
import {createChapterPlayback, advanceChapterPlayback, sampleChapterPlayback, PLAYBACK_CHAPTERS} from '../components/chapter-playback.mjs';
import {prepareSourceFamilies, fitSourcePose, resolveSourceSelection, sampleSourceScenePose, SOURCE_DIAGRAM_REVISION} from '../components/source-scene-score.mjs';
import {sampleContinuousLighting} from '../components/inspection-lighting.mjs';
import {resolveSceneStage} from '../components/scene-direction.mjs';
import {sampleSourceSeparation, SOURCE_LAYER_REVISION} from '../components/element-score.mjs';
import {sampleOpticalScore} from '../components/optical-score.mjs';
import {createExhibitionStage} from '../components/exhibition-stage.mjs';
import {createSceneCompositor} from '../components/scene-compositor.mjs';
import {createInspectionState, advanceInspection, resetInspectionState} from '../components/inspection-state.mjs';
import {createModelManager, MODEL_STUDIES} from '../runtime/features/ModelManager.mjs';
import {createCanvasMotion, advanceCanvasMotion, sampleCanvasHold} from '../components/canvas-motion.mjs';
import {INSPECTION_FRAMING_SUPPORT} from '../components/inspection-framing-support.mjs';
import {publishModelAnnotation} from '../runtime/presentation/ModelAnnotationPresenter.mjs';

const src = name => `components/${name}`;
const current = (id, title, trigger, logic, end, source, extra = {}) => ({id:`3d-${id}`,title,trigger,logic,end,source,availability:'current',...extra});
const loopTrigger='場景啟用、章節已選定、未 Pause／Reduced／檢視接管。可見時繪製；不可見時共用章節時鐘仍可能推進。展示用「播放」啟動同一參數軌道。';
const loopEnd='沒有自然終點。Pause、頁面隱藏或模型檢視會凍結章節時鐘；恢復後從原相位續播。';
export const effects3D = [
 current('orbit-azimuth','章節相機：水平微繞',loopTrigger,'事件啟用後由章節時間推進。SYSTEM 的水平偏移是 ±4.5°；其他相機通道在此凍結。',loopEnd,src('chapter-scene-score.mjs')),
 current('orbit-elevation','章節相機：俯仰微動',loopTrigger,'事件啟用後由時間推進。SYSTEM 俯仰 ±1.8°，頻率是水平微繞的兩倍。',loopEnd,src('chapter-scene-score.mjs')),
 current('dolly','章節相機：距離呼吸',loopTrigger,'事件啟用後由時間推進。SYSTEM 距離係數 1–1.022；原始凸包擬合仍保護模型邊界。',loopEnd,src('chapter-scene-score.mjs')),
 current('lens','章節相機：鏡頭視角呼吸',loopTrigger,'事件啟用後由時間推進。OVERVIEW 的 FOV 係數 0.985–1；先算視角，再擬合原始模型支撐點。',loopEnd,src('chapter-scene-score.mjs')),
 current('focus','景深：焦點往返',loopTrigger,'事件啟用後由時間推進。SYSTEM 焦點比例 0.47 ±0.15，映射到實際模型前後深度；景深強度保留正式頁面 20% 政策。',loopEnd,src('optical-score.mjs')),
 current('depth','景深：章節強度轉換','章節由 FORM 進入 SYSTEM。展示播放一次原本 0.92 秒章節過渡。','事件觸發過渡，之後逐幀混合光圈與模糊上限；焦點與相機在此凍結。主頁模型研究區的景深乘以 0.2。','0.92 秒後保留 SYSTEM 強度；新的章節、Pause／Reduced 或隱藏會改變／中斷過渡。',src('optical-score.mjs'),{finite:true}),
 current('mist','光學：Black Mist 高光擴散','章節由 OVERVIEW 進入 FORM。展示播放一次原本 0.92 秒章節過渡。','事件觸發過渡。原始 compositor 將真正的高光亮度重新分配為有限光暈；不是獨立 bloom，也不產生虛構分析色。','過渡到終點後保持；Light／Reduced 的光學權重為 0。',src('scene-compositor.mjs'),{finite:true}),
 current('key-energy','燈光：方向主光能量',loopTrigger,'時間循環只調整 SYSTEM 主光能量係數 1 ±0.06；接觸陰影主光的位置固定。',loopEnd,src('chapter-scene-score.mjs')),
 current('area-azimuth','燈光：面光方位',loopTrigger,'時間循環使 SYSTEM 真正的面光繞來源軸 ±5.5°；不移動接觸陰影主光。',loopEnd,src('chapter-scene-score.mjs')),
 current('area-energy','燈光：面主光能量',loopTrigger,'時間循環只調整 SYSTEM 面主光能量 1 ±0.06，頻率是水平相機微繞的兩倍。',loopEnd,src('chapter-scene-score.mjs')),
 current('rim-energy','燈光：輪廓光能量',loopTrigger,'時間循環只調整 SYSTEM 方向輪廓光與面輪廓光的能量 1 ±0.14。',loopEnd,src('chapter-scene-score.mjs')),
 current('light-transition','燈光：章節柔光／掠射轉換','章節由 FORM 進入 SYSTEM。','事件觸發 0.92 秒章節權重過渡；原始 continuous-lighting 改變燈的位置、面積、強度與顏色。此展示固定模型、相機和光學。','過渡後保持 SYSTEM；下一章節重新取當前合成值為起點。',src('inspection-lighting.mjs'),{finite:true}),
 current('chapter-camera','相機：章節構圖過渡','章節由 FORM 進入 SYSTEM。','事件觸發原始 0.92 秒權重過渡；相機從 FORM 方位進入 SYSTEM 方位。此展示將閱讀欄移除、使用來源模型的居中擬合。','過渡完成後保持；新章節會從目前權重重新轉向。',src('source-scene-score.mjs'),{finite:true}),
 current('pointer-camera','相機：游標微透視','精細游標在可操作頁面移動；此展示在畫面內移動滑鼠。','pointermove 更新目標，原始每秒衰減率 10 平滑輸入；水平 ±1.25°、垂直 ±0.8°。與手動拖曳相互獨立。','離開、失焦或 Pause／Reduced 後目標回到 0；收斂後停止補幀。',src('vendor/cinematic-plan.mjs')),
 current('source-loop','來源表示：章節自動輪替',loopTrigger,'SYSTEM 的 20 秒相位提出四種來源表示；最大 slot 決定離散切換，不混合或變形拓撲。','Pause／檢視接管凍結相位；手動選取在 8 秒有效播放時間內優先。',src('source-scene-score.mjs')),
 current('experiment-loop','實驗模型：章節自動輪替',loopTrigger,'PATTERN 的 18 秒相位依序提出三個原始實驗模型；保持同一家族凸包的相機擬合。','Pause／檢視接管凍結相位；手動選取在 8 秒有效播放時間內優先。',src('source-scene-score.mjs')),
 current('source-select','來源表示：點擊／鍵盤選取','按下並在 650ms 內放開實際模型；滑鼠／筆位移不超過 4px、觸控不超過 10px。亦可聚焦後按 Enter／Space；表示按鈕代送 model.select。','原始 ModelManager 驗證短點擊，然後提交 sourceSelection；成功繪製後才更新實際模型名稱。選取保留 8 秒有效播放時間，Pause 時期限不會走。','模型區 Escape／Home 清除選取；新選取覆蓋，或 8 秒有效播放時間後回到章節自動表示。','runtime/features/ModelManager.mjs'),
 current('hover','來源表面：游標暖色亮度','滑鼠／筆實際命中原始來源模型；在畫面內移入與移出。','事件／命中更新。一般來源材質增加少量暖色 emissive，保持原始幾何與 shader；空白位置不觸發。','游標離開、失焦或生命週期中斷立即清除；這個亮度回饋也可在 Pause 下使用。','runtime/presentation/SceneRuntime.mjs'),
 current('hover-curvature','原始曲率色：游標中性亮度','滑鼠／筆實際命中原始 curvature 模型。','事件／命中更新。保留原始 COLOR_0 位元組，只增加最多 3.5% 中性亮度；沒有暖色 emissive，也不推導新分析數值。','游標離開、失焦或生命週期中斷立即清除；Pause 下仍可操作。','runtime/presentation/SceneRuntime.mjs'),
 current('drag','檢視：滑鼠／筆拖曳與回正','在實際模型上按下立即接管並凍結章節；移動超過 4px 後開始旋轉。觸控滑動保留捲頁。','事件更新角度目標，原始臨界阻尼（ω=16）逐幀追隨。位移倍率水平 0.23°/px、垂直 0.18°/px；短點擊在本展示不切換來源。','放開、pointercancel、失去捕捉、失焦／隱藏後目標回正；回正收斂後解除 modelRecovering。','runtime/features/ModelManager.mjs'),
 current('key-view','檢視：鍵盤角度阻尼','點擊「聚焦模型」，以方向鍵操作。','事件更新角度目標：左右 7°、上下 5°；原始臨界阻尼逐幀收斂。按鍵放開仍保持新視角與檢視接管。','Escape／Home、失焦或切換章節解除；回正收斂後恢復章節播放。','runtime/features/ModelManager.mjs'),
 current('tempo-boost','章節時間：捲動脈衝與速度衰減','在展示畫面上使用滾輪，或以單指上下滑動。','wheel／touchmove 將一次 impulse 傳給原始章節時鐘：boost += |impulse|×0.85、最多 1.4，再以每秒 2.6 指數衰減。畫面僅用水平微繞顯示同一時間變快。','停止輸入後回到 tempo=1，章節仍播放；Pause／Reduced／隱藏／檢視會清除 boost，不補播離開期間。',src('chapter-playback.mjs')),
 current('stage-entry','場景平面：捲動進場','原生捲動進入 FORM 的進場區間；此展示用進度與播放代送捲動位置。','scroll 事件更新 docY，原始 canvas-motion 以每秒衰減率 16 追隨；畫布由右側 22%／下方 3.5% 到定位，透明度 0→1。','到達 holdStart 後精確固定 x=0、y=0、scale=1；seek／Reduced／resume 可直接落在 hold。',src('canvas-motion.mjs'),{finite:true}),
 current('stage-hold','場景平面：章節停留','捲動位置位於 holdStart 與 holdEnd 之間。','scroll 事件仍更新位置，但原始 canvas-motion 在整個停留區精確保持 x=0、y=0、scale=1。此展示凍結其他自主軌道。','進入退出區間後開始退場；停留本身沒有計時結束，也不自動跳章節。',src('canvas-motion.mjs'),{finite:true}),
 current('stage-exit','場景平面：捲動退場','原生捲動越過 FORM 的 holdEnd；此展示用進度與播放代送捲動位置。','scroll 更新目標後逐幀追隨；畫布向左移最多 108%、向上 5%，透明度 1→0。相機與模型本身在此凍結。','到達章節末端後停止此場景繪製；下一章節重新進場。MAKE／VALIDATION 固定 absent。',src('canvas-motion.mjs'),{finite:true}),
 current('layer-separation','已實作通道：來源層分離','正式頁面在 SYSTEM／PATTERN 計算分離值，但這時 assembly 隱藏；本地滑桿／播放只用於檢視此通道。','原始 source-relative 剛體位移：shell 最多上移 0.24m、上底板 0.09m、下底板不動。不是彎曲模擬或施工序列。','返回權重 0 時恢復原位置；目前正式頁面沒有直接可見的分離操作。',src('element-score.mjs'),{availability:'dormant',finite:true}),
 current('surface-emphasis','已實作通道：表面重點','目前可見的正式路徑將 surfaceEmphasis 保持為 0；本地滑桿／播放檢視現有 shader 反應。','只提高 satin shader 的粗糙度，係數 emphasis ×0.018。本地使用原始章節提案 0→0.5，固定幾何與燈光。','權重返回 0 後復原；目前沒有正式頁面可觸發的可見動畫。',src('materials/cinematic-material.js'),{availability:'dormant',finite:true}),
];

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const bufferCache=new Map();
function fetchAsset(url,json=false){
 const key=`${json}:${url}`;
 if(!bufferCache.has(key))bufferCache.set(key,fetch(url).then(response=>{if(!response.ok)throw Error(`Asset unavailable: ${url}`);return json?response.json():response.arrayBuffer();}).catch(error=>{bufferCache.delete(key);throw error;}));
 return bufferCache.get(key);
}
function disposeObject(object){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 object?.traverse(node=>{if(node.geometry)geometries.add(node.geometry);if(node.material)(Array.isArray(node.material)?node.material:[node.material]).forEach(material=>{materials.add(material);Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value);});});});
 geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());
}
async function loadAssets(){
 const results=await Promise.allSettled([
  fetchAsset('/assets/source-layers.glb').then(buffer=>new GLTFLoader().parseAsync(buffer.slice(0),'')),
  new HDRLoader().loadAsync('/assets/studio-small.hdr'),
  fetchAsset('/assets/source-layers.json',true),
  fetchAsset('/assets/thesis/source-diagrams.glb').then(async buffer=>{
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),value=>value.toString(16).padStart(2,'0')).join('');
   if(hash!==SOURCE_DIAGRAM_REVISION)throw Error('Unapproved source diagram bytes');
   return new GLTFLoader().parseAsync(buffer.slice(0),'');
  }),
  fetchAsset('/assets/thesis/source-diagrams.json',true),
 ]);
 if(results.some(result=>result.status==='rejected')){
  if(results[0].status==='fulfilled')disposeObject(results[0].value.scene);
  if(results[3].status==='fulfilled')disposeObject(results[3].value.scene);
  if(results[1].status==='fulfilled')results[1].value.dispose();
  throw results.find(result=>result.status==='rejected').reason;
 }
 return {assembly:results[0].value,hdr:results[1].value,meta:results[2].value,diagrams:results[3].value,diagramMeta:results[4].value};
}
function noAscii(score){score.field={...score.field,fieldWeight:0,fieldPointerStrength:0};return score;}
function snapshotFor(chapter,phase,activeSeconds=0){return {chapterWeights:CHAPTER_SCENE_IDS.map(id=>Number(id===chapter)),phases:CHAPTER_SCENE_IDS.map(()=>phase),activeSeconds};}
function frozenScore(chapter,aspect){
 const score=noAscii(sampleChapterScene(snapshotFor(chapter,0),{aspect}));
 score.camera={...score.camera,azimuthOffsetDeg:0,elevationOffsetDeg:0,distanceScale:1,fovScale:1};
 score.light={...score.light,keyEnergy:1,areaAzimuthDeg:0,areaEnergy:1,rimEnergy:1};
 return score;
}
function transitionSnapshot(from,to,phase){
 const state=createChapterPlayback(from);
 // The original playback advances .92 seconds. Time/loop cues are then frozen
 // so only the chapter transition being reviewed is shown.
 let remaining=.92*clamp(phase);
 if(remaining===0)advanceChapterPlayback(state,0,{chapter:to});
 while(remaining>1e-8){const dt=Math.min(remaining,.05);advanceChapterPlayback(state,dt,{chapter:to});remaining-=dt;}
 const result=sampleChapterPlayback(state);result.phases=CHAPTER_SCENE_IDS.map(()=>0);return result;
}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;}

export function mount3D(stage,descriptor,hooks={}){
 const effect=descriptor.effect??descriptor.id.replace(/^3d-/,'');
 const projection=effect==='projection';
 const chapter=effect==='experiment-loop'?'pattern':effect==='lens'?'overview':'system';
 const chapterIndex=CHAPTER_SCENE_IDS.indexOf(chapter);
 const period=PLAYBACK_CHAPTERS[chapterIndex].period;
 const stageEffect=effect.startsWith('stage-');
 const finite=descriptor.finite===true||stageEffect;
 const transitionEffect=['depth','mist','light-transition','chapter-camera'].includes(effect);
 const duration=(transitionEffect||['layer-separation','surface-emphasis'].includes(effect)) ? .92 : stageEffect ? 4 : period;
 const root=element('div','three-review-root');
 root.style.cssText='position:relative;width:100%;height:100%;min-height:360px;display:flex;flex-direction:column;background:#091217;overflow:hidden;';
 root.dataset.modelStudy='';root.dataset.studyChapter=chapter;
 const viewport=element('div','three-review-viewport');
 viewport.style.cssText='position:relative;flex:1;min-height:310px;overflow:hidden;touch-action:pan-y;';
 viewport.dataset.modelViewport='';viewport.dataset.studyChapter=chapter;viewport.tabIndex=0;
 viewport.setAttribute('role','group');viewport.setAttribute('aria-label',projection?'原始模型與圖說連線；方向鍵與拖曳調整視角':'原始來源 3D 效果展示');
 const caption=element('div','three-review-caption','載入已核准的原始來源模型…');
 caption.style.cssText='position:absolute;left:14px;bottom:12px;color:#c7d4d6;font:12px/1.5 monospace;pointer-events:none;max-width:90%;z-index:2;';
 caption.dataset.sourceLabel='';
 const announcement=element('span','','');announcement.dataset.sourceAnnouncement='';announcement.setAttribute('aria-live','polite');announcement.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);';
 const controls=element('div','three-review-controls');
 controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 14px;color:#ced8d9;font:13px/1.4 sans-serif;background:#101c22;';
 root.append(viewport,controls,announcement);viewport.append(caption);stage.append(root);
 let renderer;
 try{renderer=new T.WebGLRenderer({antialias:false,alpha:true,powerPreference:'default'});}catch(error){hooks.report?.('WebGL 無法啟動',{error:error.message});return {play(){},pause(){},reset(){},seek(){},dispose(){root.remove();},inspect:()=>({ready:false,error:error.message}),ready:Promise.resolve()};}
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.setClearColor(0x091217,0);renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.enabled=true;
 renderer.domElement.style.cssText='display:block;width:100%;height:100%;position:absolute;inset:0;transform-origin:50% 50%;';viewport.prepend(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.01,100);
 scene.fog=new T.FogExp2('#091217',0);
 const inspection=createInspectionState();
 let disposed=false,loaded=false,failed=false,playing=false,explicitPaused=false,reviewMotionAllowed=false,elapsed=0,activeSeconds=0,raf=0,previous=0,lastReported=0,frames=0;
 let assets=null,environment=null,exhibition=null,compositor=null,families=null,world=null,representation='bending',last={},placement=createCanvasMotion();
 let pointer={x:0,y:0},pointerTarget={x:0,y:0},pointerInside=false,pointerClient={x:0,y:0},hover=0,forcedPhase=null;
 let tempoPlayback=createChapterPlayback(chapter),pendingImpulse=0,touchY=null;
 let state={sourceSelection:null,modelEngaged:false,modelRecovering:false,modelInteractionChapter:null,playback:snapshotFor(chapter,0),inspectionRevision:0};
 const adapters=[],layers=[],entries=new Map(),lights={},eventCleanups=[];
 const ray=new T.Raycaster(),rayPoint=new T.Vector2(),rayHits=[];
 const systemReduced=matchMedia('(prefers-reduced-motion: reduce)');
 const listen=(target,type,callback,options)=>{target.addEventListener(type,callback,options);eventCleanups.push(()=>target.removeEventListener(type,callback,options));};
 const report=(status,force=false)=>{if(disposed)return;const now=performance.now();if(force||now-lastReported>220){lastReported=now;hooks.report?.(status,{...last,ready:loaded,frames,playing,paused:explicitPaused,phase:clamp(elapsed/duration),availability:descriptor.availability??'current',asciiWeight:0,fieldWeight:0});}};
 const request=()=>{if(!disposed&&!failed&&!raf&&!document.hidden)raf=requestAnimationFrame(tick);};
 const update=patch=>{Object.assign(state,patch);request();};
 const input={get:()=>state,updateInteraction:update,publishFrame:update,commands:{execute(name,payload){
  if(name!=='model.select'||!MODEL_STUDIES.some(study=>study.id===payload.chapterId&&Number.isInteger(payload.index)&&payload.index>=0&&payload.index<study.labels.length))return {status:'rejected'};
  update({sourceSelection:{chapterId:payload.chapterId,index:payload.index,selectedAt:payload.selectedAt},modelEngaged:false,modelRecovering:payload.modelRecovering??false});return {status:'accepted'};
 }}};
 function hitTest(clientX,clientY){
  if(!loaded||!last.present)return null;
  const rect=renderer.domElement.getBoundingClientRect();if(rect.width<1||rect.height<1)return null;
  const x=(clientX-rect.left)/rect.width,y=(clientY-rect.top)/rect.height;
  if(x<0||x>1||y<0||y>1)return null;
  ray.setFromCamera(rayPoint.set(x*2-1,1-y*2),camera);
  try{ray.intersectObjects(representation==='assembly'?layers.map(layer=>layer.node):[entries.get(representation)?.mesh].filter(Boolean),false,rayHits);return rayHits.length?{source:true,chapterId:chapter,index:last.representationIndex,representationId:representation}:null;}finally{rayHits.length=0;}
 }
 const manager=createModelManager({input,inspection,hitTest});manager.bindSurface(chapter,viewport);
 const study=MODEL_STUDIES.find(value=>value.id===chapter)??MODEL_STUDIES[1];
 const key=(keyName)=>manager.key({key:keyName,preventDefault(){},repeat:false,currentTarget:viewport},study,loaded);
 function button(label,action){const b=element('button','',label);b.type='button';b.style.cssText='padding:7px 10px;border:1px solid #64717b;border-radius:5px;background:#182830;color:#edf1e9;cursor:pointer;';listen(b,'click',action);controls.append(b);return b;}
 if(['source-select','key-view','drag'].includes(effect)||projection){button('聚焦模型',()=>viewport.focus());button('返回章節',()=>key('Escape'));}
 if(effect==='source-select'){
  ['折紙','開孔','彎曲','原始曲率色'].forEach((label,index)=>{const b=button(label,()=>{input.commands.execute('model.select',{chapterId:chapter,index,selectedAt:activeSeconds});report('已請求選取',true);});b.dataset.sourceChoice=String(index);});
 }
 if(['layer-separation','surface-emphasis'].includes(effect)){
  const label=element('label','',effect==='layer-separation'?'分離權重 ':'表面 emphasis '),slider=element('input');slider.type='range';slider.min='0';slider.max='1';slider.step='.01';slider.value='0';slider.setAttribute('aria-label',label.textContent);slider.dataset.channelControl=effect;
  listen(slider,'input',()=>{elapsed=Number(slider.value)*duration;playing=false;forcedPhase=Number(slider.value);request();report('本地通道值更新',true);});label.append(slider);controls.append(label);
 }
 if(effect==='pointer-camera')controls.append(element('span','','在模型畫面移動滑鼠；移出後微透視回正。'));
 if(['hover','hover-curvature'].includes(effect))controls.append(element('span','','游標必須命中實際模型，空白處不會增加亮度。'));
 if(effect==='tempo-boost')controls.append(element('span','','滾輪／單指滑動加入一次加速；停止輸入後速度自然衰減。'));
 if(effect==='drag')controls.append(element('span','','以滑鼠／筆拖動模型，放開後阻尼回正。'));
 if(effect==='key-view')controls.append(element('span','','方向鍵調整；放開後保持。Escape／Home 回正。'));
 if(stageEffect)controls.append(element('span','','展示進度代表這一段捲動位置；其他相機／燈光動畫已凍結。'));
 if(!controls.children.length)controls.hidden=true;
 let svg=null,annotationLabel=null;
 if(projection){
  svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.dataset.modelConnector='';svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;';
  const leader=document.createElementNS(svg.namespaceURI,'polyline');leader.dataset.modelLeader='';leader.setAttribute('fill','none');leader.setAttribute('stroke','#efa86e');leader.setAttribute('stroke-width','1.5');
  const dot=document.createElementNS(svg.namespaceURI,'circle');dot.dataset.modelAnchor='';dot.setAttribute('r','4');dot.setAttribute('fill','#efa86e');svg.append(leader,dot);
  annotationLabel=element('div','','Source surface');annotationLabel.dataset.modelAnnotationLabel='';annotationLabel.style.cssText='position:absolute;right:18px;top:40%;width:100px;max-width:23%;color:#efcaa3;background:#091217d9;padding:7px;font:12px/1.4 sans-serif;pointer-events:none;z-index:4;';
  viewport.append(svg,annotationLabel);viewport.dataset.modelStudy='';controls.append(element('span','','拖動或方向鍵改變相機；SVG 連線使用實際模型支撐點投影。'));
 }
 listen(viewport,'pointermove',event=>{
  if(['drag','source-select'].includes(effect)||projection)manager.move(event,loaded);
  if(!['mouse','pen'].includes(event.pointerType))return;
  pointerInside=true;pointerClient={x:event.clientX,y:event.clientY};const rect=viewport.getBoundingClientRect();pointerTarget={x:clamp((event.clientX-rect.left)/rect.width*2-1,-1,1),y:clamp((event.clientY-rect.top)/rect.height*2-1,-1,1)};
  request();
 });
 listen(viewport,'pointerdown',event=>{if(event.target.closest('button,input'))return;if(['drag','source-select'].includes(effect)||projection)manager.begin(event,study,viewport,loaded);if(effect==='key-view'||effect==='source-select'||projection)viewport.focus();});
 listen(viewport,'pointerup',event=>{
  if(['drag','source-select'].includes(effect)||projection)manager.end(event,effect==='drag',loaded);
  request();
 });
 listen(viewport,'pointercancel',event=>{manager.end(event,true,loaded);request();});
 listen(viewport,'lostpointercapture',event=>manager.lostCapture(event));
 listen(viewport,'pointerleave',()=>{pointerInside=false;pointerTarget={x:0,y:0};hover=0;manager.leave();request();});
 listen(viewport,'keydown',event=>{
  if(!['key-view','source-select'].includes(effect)&&!projection)return;
  if(effect==='source-select'&&!['Enter',' ','Escape','Home'].includes(event.key))return;
  if(effect==='key-view'&&['Enter',' '].includes(event.key))return;
  manager.key(event,study,loaded);request();
 });
 listen(viewport,'blur',()=>{manager.blur();request();});
 const cancelInteraction=()=>{manager.cancelPress();manager.clearHover();pointerInside=false;pointerTarget={x:0,y:0};hover=0;previous=0;request();};
 listen(window,'blur',cancelInteraction);
 listen(document,'visibilitychange',()=>{if(document.hidden){cancelInteraction();tempoPlayback.boost=0;tempoPlayback.direction=0;if(raf)cancelAnimationFrame(raf);raf=0;previous=0;}else{previous=0;request();}});
 listen(systemReduced,'change',()=>{reviewMotionAllowed=false;tempoPlayback.boost=0;tempoPlayback.direction=0;previous=0;request();});
 if(effect==='tempo-boost'){
  listen(viewport,'wheel',event=>{if(event.ctrlKey)return;event.preventDefault();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?heightOfViewport():1);pendingImpulse=clamp(pendingImpulse+delta/600,-1,1);request();},{passive:false});
  listen(viewport,'touchstart',event=>{touchY=event.touches.length===1?event.touches[0].clientY:null;},{passive:true});
  listen(viewport,'touchmove',event=>{if(touchY===null||event.touches.length!==1)return;const y=event.touches[0].clientY;pendingImpulse=clamp(pendingImpulse+(touchY-y)/500,-1,1);touchY=y;request();},{passive:true});
  listen(viewport,'touchend',()=>{touchY=null;},{passive:true});
 }
 function heightOfViewport(){return Math.max(1,viewport.clientHeight);}
 listen(renderer.domElement,'webglcontextlost',event=>{event.preventDefault();failed=true;playing=false;if(raf)cancelAnimationFrame(raf);raf=0;caption.textContent='WebGL context 已中斷；請重新開啟此效果。';report('繪製中斷',true);});
 const resize=new ResizeObserver(()=>request());resize.observe(viewport);

 function prepare(loadedAssets){
  assets=loadedAssets;
  if(assets.meta.revision!==SOURCE_LAYER_REVISION||assets.meta.viewerUnits!=='meters'||assets.meta.upAxis!=='Y'||assets.meta.layers.length!==3)throw Error('Unexpected assembly source metadata');
  const max=sampleSourceSeparation(1);
  const inspectionBounds={min:[0,1,2].map(i=>Math.min(...assets.meta.layers.map(layer=>layer.bounds.min[i]+max.offsets[layer.id][i]),assets.meta.bounds.min[i])),max:[0,1,2].map(i=>Math.max(...assets.meta.layers.map(layer=>layer.bounds.max[i]+max.offsets[layer.id][i]),assets.meta.bounds.max[i]))};
  families=prepareSourceFamilies(assets.diagramMeta,{bounds:inspectionBounds,points:INSPECTION_FRAMING_SUPPORT.points,revision:assets.meta.revision});
  const generator=new T.PMREMGenerator(renderer);try{environment=generator.fromEquirectangular(assets.hdr);}finally{generator.dispose();assets.hdr.dispose();}
  scene.environment=environment.texture;
  assets.assembly.scene.traverse(node=>{
   if(!node.isMesh)return;const record=assets.meta.layers.find(layer=>layer.id===node.userData.role);
   if(!record||layers.some(layer=>layer.id===record.id)||(node.geometry.index?.count??node.geometry.attributes.position.count)/3!==record.triangles||node.geometry.attributes.position.count!==record.vertices)throw Error('Source assembly counts differ');
   (Array.isArray(node.material)?node.material:[node.material]).forEach(material=>material.dispose());
   if(record.id==='shell'){const adapter=createCinematicMaterial({bounds:assets.meta.bounds});adapters.push(adapter);node.material=adapter.material;}else node.material=new T.MeshStandardMaterial({color:'#535b5b',roughness:.7,metalness:.12,side:T.DoubleSide});
   node.castShadow=true;node.receiveShadow=true;layers.push({id:record.id,node,record,rest:node.position.clone()});
  });
  assets.diagrams.scene.traverse(node=>{
   if(!node.isMesh&&!node.isLineSegments)return;const record=assets.diagramMeta.representations.find(value=>value.id===node.userData.representationId);
   if(!record)throw Error('Unknown source representation');const entry=entries.get(record.id)??{record,nodes:[],mesh:null};
   (Array.isArray(node.material)?node.material:[node.material]).forEach(material=>material.dispose());
   if(node.isLineSegments){if(!node.userData.sourceEdgeOverlay||(node.geometry.index?.count??node.geometry.attributes.position.count)/2!==record.sourceEdgeSegments)throw Error('Unexpected original polygon-edge count');node.material=new T.LineBasicMaterial({color:'#e98943',transparent:true,opacity:.7,depthWrite:false});}
   else{
    if(!node.userData.sourceGeometry||entry.mesh||node.geometry.attributes.position.count!==record.vertices||(node.geometry.index?.count??record.vertices)/3!==record.triangles)throw Error('Unexpected source representation counts');
    if(record.id==='curvature'){if(node.geometry.attributes.color?.count!==record.vertexColors)throw Error('Original curvature colours missing');node.material=new T.MeshBasicMaterial({color:0xffffff,vertexColors:true,side:T.DoubleSide});}
    else if(['origami','opening'].includes(record.id))node.material=new T.MeshStandardMaterial({color:record.id==='origami'?'#b5bdba':'#abb8be',roughness:.72,metalness:.32,side:T.DoubleSide,polygonOffset:record.id==='origami',polygonOffsetFactor:1,polygonOffsetUnits:1});
    else{const adapter=createCinematicMaterial({bounds:record.bounds});adapters.push(adapter);node.material=adapter.material;}
    node.castShadow=true;node.receiveShadow=true;entry.mesh=node;
   }
   node.visible=false;entry.nodes.push(node);entries.set(record.id,entry);
  });
  if(layers.length!==3||entries.size!==7||[...entries.values()].some(entry=>!entry.mesh))throw Error('Missing verified source geometry');
  world=new T.Group();world.add(assets.assembly.scene,assets.diagrams.scene);scene.add(world);
  for(const id of ['key','fill','rim']){lights[id]=new T.DirectionalLight();scene.add(lights[id],lights[id].target);}
  lights.hemisphere=new T.HemisphereLight();scene.add(lights.hemisphere);lights.key.castShadow=true;lights.key.shadow.mapSize.set(1024,1024);
  exhibition=createExhibitionStage({bounds:families.representation.bounds});scene.add(exhibition.group);compositor=createSceneCompositor(renderer);
  if(effect==='layer-separation')representation='assembly';else if(effect==='experiment-loop')representation='experiment-a';else if(effect==='hover-curvature')representation='curvature';else if(effect==='source-loop'||effect==='source-select')representation='origami';
  loaded=true;request();report('來源模型載入完成',true);
 }
 const ready=loadAssets().then(value=>{if(disposed){disposeObject(value.assembly.scene);disposeObject(value.diagrams.scene);value.hdr.dispose();return;}prepare(value);}).catch(error=>{if(disposed)return;failed=true;caption.textContent=`來源展示無法完成：${error.message}`;last={error:error.message};report('載入或初始化失敗',true);});

 function tick(now){
  raf=0;if(disposed||failed||!loaded||document.hidden)return;
  const dt=previous?Math.min(.08,(now-previous)/1000):1/60;previous=now;
  // The local owner can explicitly replay a specimen under Reduced. Ordinary
  // activation and a newly changed OS preference still use the static policy.
  const reduced=systemReduced.matches&&!reviewMotionAllowed;
  const manualOnly=['hover','hover-curvature','drag','key-view','pointer-camera'].includes(effect);
  const selectionRunning=effect!=='source-select'||!!state.sourceSelection&&activeSeconds-state.sourceSelection.selectedAt<8;
  const clockRunning=playing&&!manualOnly&&selectionRunning&&!reduced&&!state.modelEngaged&&!state.modelRecovering;
  if(clockRunning&&effect!=='tempo-boost'){elapsed+=dt;if(finite&&elapsed>=duration){elapsed=duration;playing=false;}}
  const phase=forcedPhase??(finite?clamp(elapsed/duration):(elapsed%duration)/duration);
  if(clockRunning&&!explicitPaused&&effect!=='tempo-boost')activeSeconds+=dt;
  advanceInspection(inspection,dt,{reducedMotion:explicitPaused||reduced});
  if(state.modelRecovering&&inspection.settled)state.modelRecovering=false;
  const pointerAlpha=1-Math.exp(-10*dt),target=explicitPaused||reduced?{x:0,y:0}:pointerTarget;
  pointer={x:pointer.x+(target.x-pointer.x)*pointerAlpha,y:pointer.y+(target.y-pointer.y)*pointerAlpha};
  const pointerMoving=Math.abs(pointer.x-target.x)+Math.abs(pointer.y-target.y)>.001;
  if(!pointerMoving)pointer={...target};
  const width=Math.max(1,viewport.clientWidth),height=Math.max(1,viewport.clientHeight),aspect=width/height;
  const dpr=Math.min(devicePixelRatio||1,1.25);if(renderer.domElement.width!==Math.floor(width*dpr)||renderer.domElement.height!==Math.floor(height*dpr)){renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);}
  let playback=snapshotFor(chapter,phase,activeSeconds),score=frozenScore(chapter,aspect),transitionOpticalWeight=.2,lightingStageU=null;
  if(effect==='tempo-boost'){
   advanceChapterPlayback(tempoPlayback,dt,{chapter,impulse:pendingImpulse,paused:!playing||explicitPaused,reducedMotion:reduced,engaged:state.modelEngaged||state.modelRecovering});pendingImpulse=0;
   playback=sampleChapterPlayback(tempoPlayback);activeSeconds=playback.activeSeconds;elapsed=activeSeconds;
  }
  const movingScore=noAscii(sampleChapterScene(playback,{aspect,reducedMotion:reduced}));
  const cameraKey={'orbit-azimuth':'azimuthOffsetDeg','orbit-elevation':'elevationOffsetDeg',dolly:'distanceScale',lens:'fovScale'}[effect];
  if(cameraKey)score.camera[cameraKey]=movingScore.camera[cameraKey];
  if(effect==='tempo-boost')score.camera.azimuthOffsetDeg=movingScore.camera.azimuthOffsetDeg;
  if(effect==='focus')score.optics.focusFraction=movingScore.optics.focusFraction;
  const lightKey={'key-energy':'keyEnergy','area-azimuth':'areaAzimuthDeg','area-energy':'areaEnergy','rim-energy':'rimEnergy'}[effect];if(lightKey)score.light[lightKey]=movingScore.light[lightKey];
  if(transitionEffect){
   const transition=transitionSnapshot(effect==='mist'?'overview':'form',effect==='mist'?'form':'system',phase);
   const sample=noAscii(sampleChapterScene(transition,{aspect,reducedMotion:reduced}));
   if(effect==='depth'){score.optics.apertureScale=sample.optics.apertureScale;score.optics.maxBlurPx=sample.optics.maxBlurPx;}
   if(effect==='mist'){score.optics.mistStrength=sample.optics.mistStrength;transitionOpticalWeight=resolveSourceSelection(transition,null,sample).chapterId==='overview'?1:.2;}
   if(effect==='light-transition')lightingStageU=transition.chapterWeights.reduce((sum,weight,index)=>sum+weight*(index+.5)/7,0);
   if(effect==='chapter-camera')playback=transition;
   if(effect==='chapter-camera')score=frozenScore('system',aspect);
  }
  // Resolve only real approved representations. Other effects keep a fixed
  // source, so an automatic cut cannot masquerade as the chosen visual track.
  const sourceCycles=['source-loop','experiment-loop','source-select'].includes(effect);
  let selected=resolveSourceSelection(playback,sourceCycles?state.sourceSelection:null,sourceCycles?movingScore:score);
  if(sourceCycles)representation=selected.id;
  else{const record=entries.get(representation)?.record;selected={...selected,id:representation,index:record?assets.diagramMeta.representations.filter(r=>r.family===record.family).findIndex(r=>r.id===record.id):0,family:representation==='assembly'?'assembly':record.family};}
  state.playback=playback;viewport.dataset.sourceIndex=String(selected.index);viewport.dataset.representationId=representation;
  const family=families[selected.family],entry=entries.get(representation);
  const separation=sampleSourceSeparation(effect==='layer-separation'?phase:0);
  layers.forEach(layer=>layer.node.position.copy(layer.rest).add(new T.Vector3(...separation.offsets[layer.id])));
  let pose=sampleSourceScenePose({playback,chapterScene:score,families,selection:selected,aspect,viewportWidth:width,weight:1,canvasLocal:true,inspection:inspection.value,interactionChapter:state.modelInteractionChapter,pointer:effect==='pointer-camera'?pointer:{x:0,y:0}});
  if(projection){
   score.camera.azimuthOffsetDeg=movingScore.camera.azimuthOffsetDeg;
   pose=fitSourcePose({...family,aspect,azimuth:pose.azimuth+movingScore.camera.azimuthOffsetDeg,elevation:pose.elevation,fov:pose.fov,viewport:{left:.04,top:.08,width:.68,height:.82}});
  }
  // Dormant channel is deliberately shown separately, with its original shader.
  const emphasis=effect==='surface-emphasis'?phase*.5:0;
  let stageU=playback.chapterWeights.reduce((sum,weight,index)=>sum+weight*(index+.5)/7,0);
  if(effect==='light-transition')stageU=lightingStageU;
  else stageU=(chapterIndex+.5)/7;
  const direction=applyChapterLighting(sampleContinuousLighting(stageU),score),layout=resolveSceneStage(family.bounds,direction);
  const bounds=entry?.record.bounds??{min:[0,1,2].map(i=>Math.min(...assets.meta.layers.map(layer=>layer.bounds.min[i]+separation.offsets[layer.id][i]))),max:[0,1,2].map(i=>Math.max(...assets.meta.layers.map(layer=>layer.bounds.max[i]+separation.offsets[layer.id][i])))};
  const optics=sampleOpticalScore({stageU,aspect,chapterScene:score,reducedMotion:reduced},pose,{bounds});
  const opticalWeight=effect==='mist'?transitionOpticalWeight:.2;
  optics.apertureScale*=opticalWeight;optics.maxBlurPx*=opticalWeight;optics.mistStrength*=opticalWeight;
  // No ASCII or glyph-derived output, even on the source surfaces.
  optics.asciiWeight=0;optics.fieldWeight=0;optics.fieldPointerStrength=0;optics.veil=0;
  if(!['focus','depth'].includes(effect)){optics.apertureScale=0;optics.maxBlurPx=0;}
  if(effect!=='mist')optics.mistStrength=0;
  camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.aspect=aspect;camera.zoom=1;camera.near=pose.near;camera.far=pose.far;camera.filmGauge=optics.filmGaugeMm;camera.setFocalLength(optics.focalLengthMm);
  camera.setViewOffset(width,height,width*pose.viewOffsetNormalized.x,height*pose.viewOffsetNormalized.y,width,height);camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  assets.assembly.scene.visible=representation==='assembly';entries.forEach((value,id)=>value.nodes.forEach(node=>{node.visible=id===representation;}));
  exhibition.update({direction,camera,bounds:family.bounds,quality:'full',reducedMotion:reduced,lightSweep:0});
  for(const id of ['key','fill','rim']){const light=lights[id],spec=direction[id];light.position.fromArray(spec.position.map((value,i)=>value+layout.center[i]));light.target.position.fromArray(layout.lightTarget);light.color.fromArray(spec.color);light.intensity=spec.intensity;}
  lights.hemisphere.color.fromArray(direction.hemisphere.sky);lights.hemisphere.groundColor.fromArray(direction.hemisphere.ground);lights.hemisphere.intensity=direction.hemisphere.intensity;
  const shadow=lights.key.shadow,extent=layout.shadowHalfExtent;shadow.camera.left=shadow.camera.bottom=-extent;shadow.camera.right=shadow.camera.top=extent;shadow.camera.near=.05;shadow.camera.far=Math.max(20,layout.radius*10);shadow.camera.updateProjectionMatrix();shadow.bias=direction.stage.shadow.bias;shadow.normalBias=direction.stage.shadow.normalBias;
  scene.environmentIntensity=direction.environmentIntensity;scene.fog.color.fromArray(direction.haze.color);scene.fog.density=direction.haze.density;
  adapters.forEach(adapter=>adapter.update({progress:phase,emphasis,finish:'satin'}));world.updateMatrixWorld(true);
  if(['hover','hover-curvature'].includes(effect)){last.present=true;hover=pointerInside&&hitTest(pointerClient.x,pointerClient.y)?1:0;}
  for(const value of entries.values()){
   if(value.mesh.material.emissive){value.mesh.material.emissive.setRGB(.045,.019,.004);value.mesh.material.emissiveIntensity=value===entry?hover:0;}
   else if(value.record.id==='curvature')value.mesh.material.color.setScalar(1+(value===entry?hover*.035:0));
  }
  let stageState=null;
  if(stageEffect){
   const anchors=Array.from({length:8},(_,i)=>i*1000),start=anchors[1]-height*.62,end=start+1000;
   const target=sampleCanvasHold({anchors,docY:start+500,viewport:{width,height},forcedChapter:'form'});
   // Keep the exit specimen inside its own chapter. The next entry belongs to
   // the separate entry specimen; at the exact boundary the original sampler
   // quite correctly selects that next chapter.
   const docY=effect==='stage-entry'?start+(target.holdStart-start)*phase:effect==='stage-exit'?target.holdEnd+(end-.001-target.holdEnd)*phase:target.holdStart+(target.holdEnd-target.holdStart)*phase;
   stageState=advanceCanvasMotion(placement,dt,{anchors,docY,viewport:{width,height},seek:false});
   renderer.domElement.style.transform=`translate3d(${stageState.x}px,${stageState.y}px,0)`;renderer.domElement.style.opacity=String(stageState.opacity);
  }else{renderer.domElement.style.transform='';renderer.domElement.style.opacity='1';}
  compositor.render(scene,camera,optics,{width,height,dpr,samples:2});frames++;
  let annotation=null;
  if(projection){annotation=publishModelAnnotation(viewport,{points:entry?.record.framingSupport.points,mesh:entry?.mesh,camera,width,height,present:true,canvasRect:renderer.domElement.getBoundingClientRect()});svg.style.visibility=annotation?.visible?'visible':'hidden';}
  const name=entry?.record.label??'Source assembly';caption.textContent=`${name} · ${effect==='source-select'&&selected.pinned?`手動選取剩餘 ${selected.pinSecondsRemaining.toFixed(1)}s`:'其他軌道凍結'}${reduced?' · 系統 Reduced':''}`;
  last={effect,representation,representationIndex:selected.index,present:!stageState||stageState.visible,sourceGeometryUnmodified:true,sourceRevision:entry?assets.diagramMeta.revision:assets.meta.revision,
   camera:{azimuth:pose.azimuth,elevation:pose.elevation,distance:pose.distance,fov:camera.fov},cameraCue:{...score.camera},lightCue:{...score.light},
   optics:{focusFraction:score.optics.focusFraction,focusDistanceM:optics.focusDistanceM,focusRangeM:optics.focusRangeM,apertureScale:optics.apertureScale,maxBlurPx:optics.maxBlurPx,mistStrength:optics.mistStrength,veil:0},
   material:{emphasis,hover,finish:'satin'},separationWeight:separation.separationWeight,
   modelEngaged:state.modelEngaged,modelRecovering:state.modelRecovering,inspectionSettled:inspection.settled,inspection:{...inspection.value},modelPress:manager.inspect(),selectedPinned:selected.pinned,pinSecondsRemaining:selected.pinSecondsRemaining,activeSeconds,
   stage:stageState?{mode:stageState.mode,x:stageState.x,y:stageState.y,scale:1,opacity:stageState.opacity,settled:stageState.settled,sceneDocY:stageState.sceneDocY}:null,
   annotation:annotation?{visible:annotation.visible,supportIndex:annotation.index,x:annotation.screen?.x,y:annotation.screen?.y}:null,
   systemReduced:systemReduced.matches,reducedOverride:systemReduced.matches&&reviewMotionAllowed,
   tempo:effect==='tempo-boost'?playback.tempo:1,boost:effect==='tempo-boost'?tempoPlayback.boost:0,
  };
  const unsettled=!inspection.settled||effect==='pointer-camera'&&pointerMoving||stageState&&!stageState.settled;
  report(state.modelEngaged?'檢視接管':state.modelRecovering?'回正中':unsettled?'事件回應中':clockRunning?'播放中':manualOnly?'等待操作（已收斂）':'目前狀態');
  if(clockRunning||unsettled)request();else previous=0;
 }
 function dispose(){
  if(disposed)return;disposed=true;if(raf)cancelAnimationFrame(raf);raf=0;resize.disconnect();eventCleanups.forEach(cleanup=>cleanup());manager.unavailable();
  compositor?.dispose();exhibition?.dispose();adapters.forEach(adapter=>adapter.dispose());disposeObject(assets?.assembly.scene);disposeObject(assets?.diagrams.scene);environment?.dispose();assets?.hdr.dispose();
  Object.values(lights).forEach(light=>{light.shadow?.dispose();light.dispose?.();});scene.clear();renderer.dispose();renderer.forceContextLoss();root.remove();
 }
 return {
  ready,
  play(){if(disposed||failed)return;if(finite&&elapsed>=duration)elapsed=0;forcedPhase=null;playing=true;explicitPaused=false;reviewMotionAllowed=true;previous=0;request();report(systemReduced.matches?'本地明確重演；正式頁 Reduced 仍為靜態':'展示已啟動',true);},
  pause(){playing=false;explicitPaused=true;tempoPlayback.boost=0;tempoPlayback.direction=0;previous=0;request();report('展示已暫停',true);},
  reset(){playing=false;explicitPaused=false;reviewMotionAllowed=false;elapsed=0;activeSeconds=0;forcedPhase=null;manager.cancelPress();resetInspectionState(inspection);state.sourceSelection=null;state.modelEngaged=false;state.modelRecovering=false;state.modelInteractionChapter=null;pointer={x:0,y:0};pointerTarget={x:0,y:0};hover=0;placement=createCanvasMotion();tempoPlayback=createChapterPlayback(chapter);pendingImpulse=0;touchY=null;previous=0;controls.querySelectorAll('input[type=range]').forEach(slider=>{slider.value='0';});request();report('已重設',true);},
  seek(value){if(!Number.isFinite(value))return;reviewMotionAllowed=true;elapsed=clamp(value)*duration;forcedPhase=clamp(value);if(effect==='tempo-boost'){tempoPlayback=createChapterPlayback(chapter);tempoPlayback.activeSeconds=elapsed;}previous=0;request();},
  inspect(){return {...last,ready:loaded,failed,disposed,frames,playing,paused:explicitPaused,phase:clamp(elapsed/duration),asciiWeight:0,fieldWeight:0};},
  dispose,
 };
}

export function mountModelProjection(stage,hooks={}){
 return mount3D(stage,{id:'2d-model-projection',effect:'projection',title:'模型圖說：SVG 連線投影',availability:'current'},hooks);
}
