// Two shared recipes, presented with either a model Canvas or information surface.
import {getWindowMotionRecipe,createWindowMotion,advanceWindowMotion,retargetWindowMotion,sampleKineticPose,WINDOW_REST_POSE,clamp} from '../runtime/motion/window-motion-api.mjs';
export {sampleKineticPose,blendPose,clamp} from '../runtime/motion/window-pose.mjs';
const sources=[{label:'Lusion 主站：尺度對比、視窗與游標痕跡',url:'https://lusion.co/'},{label:'Lusion / Atlas Motion：動態節奏',url:'https://lusion.co/projects/atlas_motion/'},{label:'Lusion 官方 GitHub：WebGL / DOM 同步',url:'https://github.com/lusionltd/WebGL-Scroll-Sync'},{label:'R3F：有需要才補幀',url:'https://r3f.docs.pmnd.rs/advanced/scaling-performance'}];
const end='停止捲動後，彈性收斂，內容保留在目前頁面位置。繼續往下時整窗滑過瀏覽視窗上緣，向上捲則帶回。全程保持不透明，依畫面邊界自然裁切。反向保留慣性；Reduced 保留原生捲動，關閉彈性回饋。';
const descriptions={
 membrane:{title:'壓力開口',idea:'一面柔軟的承載面跟著移動受力，尾緣以寬弧拖曳，煞車後整面釋放壓力。'},
 ink:{title:'流體頁緣',idea:'保留完整內容面，柔軟頁緣隨加速拖曳與煞車改變曲率；整窗跟著頁面滑出邊界。'},
};
function descriptor(layer,key){
 const recipe=getWindowMotionRecipe(key),description=descriptions[key];
 const e={...recipe,id:'window-'+layer+'-'+key,title:description.title,layer,availability:'proposal',family:'proposal',autoPlay:false,
 trigger:'在框內使用滑鼠滾輪、觸控或鍵盤捲動。位置連續跟隨頁面；「進入畫面／滑出畫面」標示實際邊界。「輕推／快推」以不同捲動速度比較回饋。',
 logic:description.idea+' 原生捲動負責整窗位置，局部彈性回應速度與加減速；尾緣拖曳、煞車壓縮後回到目前位置。'+(layer==='3d'?'模型、相機、燈光固定，由承載 Canvas 的視窗表達受力。':'文字與 SVG 保持同一張完整閱讀面。')+' 同一配方也可切換至另一層比較。',end,source:sources};
 e.before=sampleKineticPose(e,createWindowMotion(e));e.visible={...WINDOW_REST_POSE};e.after=sampleKineticPose(e,createWindowMotion(e,{region:'after'}));return e;
}
export const windowEffects3D=['membrane','ink'].map(key=>descriptor('3d',key));
export const windowEffects2D=['membrane','ink'].map(key=>descriptor('2d',key));
export function sampleWindowTimeline(effect,value){
 const t=clamp(value);if(t===0)return {...effect.before};if(t===1)return {...effect.after};if(t>=.4&&t<=.6)return {...effect.visible};
 // Inspection gives the fast opening gesture more slider travel. Live playback
 // still uses real active seconds; this eased map is only a pose magnifier.
 const entry=t<.4,seconds=(entry?t/.4:(t-.6)/.4)**2.1*2.6,state=createWindowMotion(effect,{region:entry?'before':'inside'});retargetWindowMotion(state,entry?'inside':'after',{strength:.7});advanceWindowMotion(state,seconds);return sampleKineticPose(effect,state);
}
export function viewportRegion(progress,previous='before'){const p=clamp(progress);if(previous==='inside'&&p>=.16&&p<=.74)return 'inside';return p<.18?'before':p>.72?'after':'inside';}
