import {studies,base,controlSpecs} from './catalog.js';
import {uiuxIds} from './uiux-reference.js';
export const storageKey='artist3d-review-v1';
export const emptyReview=()=>({schemaVersion:1,role:'3d-artist',saved:[],notes:{},uiuxBasis:null});
export function parseReview(value){
  if(!value || value.schemaVersion!==1 || value.role!=='3d-artist' || !Array.isArray(value.saved) || value.saved.length>100 || !value.notes || typeof value.notes!=='object') throw new Error('Not a 3D Artist review export.');
  const saved=value.saved.map(entry=>{
    if(!studies.some(s=>s.id===entry.id))throw new Error('Unknown 3D study ID.');
    const params={...base};
    for(const [key,spec]of Object.entries(controlSpecs)){const n=entry.params?.[key];if(n!==undefined){if(!Number.isFinite(n)||n<spec[1]||n>spec[2])throw new Error('Invalid saved parameter.');params[key]=n;}}
    if(entry.params?.projection && !['perspective','orthographic'].includes(entry.params.projection))throw new Error('Invalid projection.');
    params.projection=entry.params?.projection??'perspective';
    return{id:entry.id,params,savedAt:typeof entry.savedAt==='string'?entry.savedAt:null,variant:entry.variant==='b'?'b':'a'};
  });
  if(new Set(saved.map(s=>s.id)).size!==saved.length)throw new Error('Duplicate saved study.');
  const notes={};for(const study of studies){if(value.notes[study.id]!==undefined){if(typeof value.notes[study.id]!=='string'||value.notes[study.id].length>5000)throw new Error('Invalid note.');notes[study.id]=value.notes[study.id];}}
  const uiuxBasis=value.uiuxBasis?parseUIUX(value.uiuxBasis):null;
  return{schemaVersion:1,role:'3d-artist',saved,notes,uiuxBasis};
}
export function parseUIUX(value){
  if(value?.schemaVersion!==1 || value.role!=='uiux-designer' || !Array.isArray(value.saved) || value.saved.length>100 || typeof value.exportedAt!=='string')throw new Error('Use the real UIUX “Export discussion choices” JSON.');
  const saved=value.saved.map(entry=>{if(typeof entry.id!=='string'||entry.id.length>150||typeof entry.name!=='string'||typeof entry.note!=='string')throw new Error('Invalid UIUX entry.');return{id:entry.id,name:entry.name,note:entry.note,idStatus:uiuxIds.includes(entry.id)?'known catalog ID; treatment revision unconfirmed':'unresolved historical ID',sources:Array.isArray(entry.sources)?entry.sources.filter(x=>typeof x==='string'):[]};});
  return{schemaVersion:1,role:'uiux-designer',exportedAt:value.exportedAt,saved,notes:Object.fromEntries(saved.map(s=>[s.id,s.note])),sourceOrigin:'http://127.0.0.1:4175/',sourceKey:'uiux-material-review-v1',importedAt:value.importedAt??new Date().toISOString(),fileSha256:value.fileSha256??null};
}
export function readReview(){try{const text=localStorage.getItem(storageKey);return{text:text?parseReview(JSON.parse(text)):emptyReview(),error:null};}catch{return{text:emptyReview(),error:'Browser storage could not be read. Existing data was not overwritten; use an export backup.'};}}
