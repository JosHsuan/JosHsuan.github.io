import {windowEffects2D,windowEffects3D} from './window-transitions.mjs';
import {mountWindow} from './window-specimen.mjs';
const $=selector=>document.querySelector(selector),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const layer=location.pathname.startsWith('/2d/')?'2d':'3d';
const all=layer==='3d'?windowEffects3D:windowEffects2D;
let instance=null,current=null,token=0,requestedPlaying=false,lastValueWrite=0,lastStatus='',errorCount=0,suspendedPlaying=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const notesKey='animation-desk-discussion-v1';let notes={};try{notes=JSON.parse(localStorage.getItem(notesKey)||'{}');}catch{}
// Retired research notes remain exportable, but never register a selectable effect.
function loadNote(){const note=notes[current.id]??{};$('#decision').value=note.decision??'unreviewed';$('#note').value=note.note??'';$('#save-status').textContent='只儲存在這個瀏覽器。';}
function saveNote(){if(!current)return;notes[current.id]={layer,title:current.title,decision:$('#decision').value,note:$('#note').value,updatedAt:new Date().toISOString()};try{localStorage.setItem(notesKey,JSON.stringify(notes));$('#save-status').textContent='已在此瀏覽器儲存；討論標記不代表發布核准。';}catch{$('#save-status').textContent='瀏覽器無法儲存，請使用匯出。';}}
$('#decision').addEventListener('change',saveNote);$('#note').addEventListener('input',saveNote);$('#export-notes').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),notes},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='animation-discussion.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
function text(value){if(Array.isArray(value))return value.map(text).join('\n');if(value&&typeof value==='object')return JSON.stringify(value,null,2);return String(value??'');}
function fail(error){errorCount++;$('#error').hidden=false;$('#error').textContent='此效果未完成：'+error.message;$('#status').textContent='請查看錯誤；目前畫面不作成功呈現的證據。';}
function filtered(){const query=$('#search').value.trim().toLowerCase();return all.filter(effect=>!query||JSON.stringify(effect).toLowerCase().includes(query));}
function renderList(){const rows=filtered();$('#count').textContent=`${rows.length} / ${all.length} RECIPES`;$('#effects').innerHTML=rows.length?rows.map(effect=>`<button class="effect-item" data-id="${esc(effect.id)}" ${current?.id===effect.id?'aria-current="true"':''}><small>${esc(effect.id)}</small>${esc(effect.title)}</button>`).join(''):'<p class="empty">沒有符合搜尋的配方。</p>';$('#effects').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>select(button.dataset.id).catch(fail)));}
async function select(id){
 const effect=all.find(item=>item.id===id);if(!effect)return;
 const own=++token;requestedPlaying=false;suspendedPlaying=false;instance?.dispose();instance=null;current=effect;lastStatus='';lastValueWrite=0;
 loadNote();
 history.replaceState(null,'',`#${encodeURIComponent(id)}`);renderList();$('#effect-id').textContent=effect.id;$('#effect-title').textContent=effect.title;$('#trigger').textContent=text(effect.trigger);$('#logic').textContent=text(effect.logic);$('#ending').textContent=text(effect.end);
 $('#source').replaceChildren();for(const item of Array.isArray(effect.source)?effect.source:[effect.source]){const p=document.createElement('p');if(item?.url&&/^https:\/\//.test(item.url)){const a=document.createElement('a');a.href=item.url;a.textContent=item.label;a.target='_blank';a.rel='noopener noreferrer';p.append(a);}else p.textContent=text(item);$('#source').append(p);}
 $('.phase-label').firstChild.textContent='檢討用捲動位置 ';$('#event-label').textContent='SCROLL RESPONSE';$('#trigger-label').textContent='如何觸發';$('#source-label').textContent='概念參考來源';
 $('#mode').textContent='共用配方 · 獨立展示';$('#availability').hidden=false;$('#availability').textContent='壓力開口與流體頁緣共用 runtime 的純數學。此舞台獨立比較模型 Canvas 與 2D 資訊；參考連結提供概念，使用既有核准素材。';
 $('#status').textContent='準備效果…';$('#values').textContent='—';$('#error').hidden=true;$('#phase').value='0';$('#phase-value').textContent='0%';$('#phase').disabled=true;
 const stage=$('#stage');stage.dataset.window='true';stage.replaceChildren();const mount=document.createElement('div');mount.className='effect-mount';stage.append(mount);
 const hooks={reducedQuery:reduced,report(status,state){
  if(own!==token)return;
  if(status&&status!==lastStatus){lastStatus=status;$('#status').textContent=text(status);}
  // The position control reports native travel, including the final settled
  // sample. Writing its value does not dispatch input or seek the specimen.
  if(Number.isFinite(state?.scrollProgress)){const percent=Math.round(state.scrollProgress*100);$('#phase').value=String(percent);$('#phase-value').textContent=percent+'%';}
  if(state&&performance.now()-lastValueWrite>100){lastValueWrite=performance.now();try{$('#values').textContent=JSON.stringify(state,null,2);}catch{$('#values').textContent=text(state);}}
 }};
 let mounted;
 try{mounted=await mountWindow(mount,effect,hooks);if(own!==token){mounted?.dispose();return;}instance=mounted;$('#phase').disabled=typeof instance.seek!=='function';if(instance.ready)await instance.ready;if(own!==token){mounted.dispose();return;}
  if(effect.autoPlay===false){const initialPhase=instance.inspect?.().phase??.5;$('#phase').value=String(Math.round(initialPhase*100));$('#phase-value').textContent=Math.round(initialPhase*100)+'%';}
  if(!reduced.matches&&effect.autoPlay!==false){requestedPlaying=true;instance.play();}else if(reduced.matches)$('#status').textContent='系統已減少動態；按播放鍵可明確重演此效果。';
 }catch(error){if(own===token)fail(error);mounted?.dispose();}
}
function play(){if(!instance)return;requestedPlaying=true;instance.play();}
function pause(){requestedPlaying=false;instance?.pause();}
function reset(){requestedPlaying=false;instance?.reset();$('#phase').value='0';$('#phase-value').textContent='0%';}
function seek(value){requestedPlaying=false;instance?.pause();instance?.seek?.(value);$('#phase').value=String(Math.round(value*100));$('#phase-value').textContent=Math.round(value*100)+'%';}
$('#play').addEventListener('click',play);$('#pause').addEventListener('click',pause);$('#reset').addEventListener('click',reset);
$('#phase').addEventListener('input',event=>seek(Number(event.target.value)/100));
$('#search').addEventListener('input',renderList);
for(const [button,delta] of [['#previous',-1],['#next',1]])$(button).addEventListener('click',()=>{const rows=filtered();if(!rows.length)return;const index=rows.indexOf(current);select(rows[(index+delta+rows.length)%rows.length].id).catch(fail);});
window.addEventListener('hashchange',()=>select(decodeURIComponent(location.hash.slice(1))).catch(fail));
document.addEventListener('visibilitychange',()=>{if(document.hidden){const d=instance?.inspect?.()??{},m=d.motion??d;suspendedPlaying=!!(m.state==='running'||m.scheduled||d.playing||d.cssAnimations?.some(a=>a.playState==='running'));if(suspendedPlaying)instance?.pause();}else{if(suspendedPlaying&&!reduced.matches)instance?.play();suspendedPlaying=false;}});
window.addEventListener('pagehide',()=>{token++;instance?.dispose();instance=null;});
reduced.addEventListener('change',()=>{if(instance?.applyMotionPreference){requestedPlaying=false;instance.applyMotionPreference();}else if(reduced.matches)pause();});
document.body.dataset.layer=layer;
document.querySelector(`[data-layer="${layer}"]`).setAttribute('aria-current','page');
$('#page-title').textContent=layer==='3d'?'模型 Canvas：兩種視窗配方':'2D 資訊：兩種視窗配方';
$('#page-summary').textContent=layer==='3d'?'壓力開口與流體頁緣：Canvas 視窗跟著頁面捲動，局部彈性回應力道；繼續捲動便滑出畫面。':'壓力開口與流體頁緣：完整資訊面隨頁面捲動，停止後保持可讀；向上捲可帶回滑出的視窗。';
window.__effectDesk={catalog:()=>all.map(effect=>({...effect})),inspect:()=>({layer,id:current?.id,requestedPlaying,errorCount,status:$('#status').textContent,canvasCount:$('#stage').querySelectorAll('canvas').length,detail:instance?.inspect?.()??null}),select,play,pause,reset,seek};
const initial=all.find(effect=>effect.id===decodeURIComponent(location.hash.slice(1)))??all[0];select(initial.id).catch(fail);
