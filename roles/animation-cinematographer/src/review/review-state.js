import {role,studies} from './catalog.js';
import {uiuxIds} from '../uiux-reference.js';
export const empty=()=>({schemaVersion:2,role:role.id,saved:[],notes:{},uiuxBasis:null});
export function parseUIUX(value,sha256){
 if(value?.schemaVersion!==1||value.role!=='uiux-designer'||!Array.isArray(value.saved)||value.saved.length>100||typeof value.exportedAt!=='string')throw new Error('Use the original UIUX Export discussion choices JSON.');
 const saved=value.saved.map(s=>{if(typeof s.id!=='string'||s.id.length>150||typeof s.name!=='string'||typeof s.note!=='string'||s.note.length>5000)throw new Error('Invalid UIUX choice.');return{id:s.id,name:s.name,note:s.note,sources:Array.isArray(s.sources)?s.sources.filter(x=>typeof x==='string'):[],status:uiuxIds.includes(s.id)?'Known ID; treatment revision unconfirmed':'Unresolved historical ID'};});
 return{role:'uiux-designer',schemaVersion:1,exportedAt:value.exportedAt,saved,sourceOrigin:'http://127.0.0.1:4175/',sourceKey:'uiux-material-review-v1',sha256};
}
export function parseReview(value){
 if(value?.schemaVersion!==2||value.role!==role.id||!Array.isArray(value.saved)||value.saved.length>100||!value.notes||typeof value.notes!=='object'||Array.isArray(value.notes))throw new Error('This file belongs to a different role or review version.');
 const saved=value.saved.map(s=>{if(!studies.some(x=>x.id===s.id)||!['a','b'].includes(s.variant)||!Number.isFinite(s.u)||s.u<0||s.u>1||!['pointer','scroll'].includes(s.mode))throw new Error('Invalid saved comparison.');return{id:s.id,variant:s.variant,u:s.u,mode:s.mode};});
 if(new Set(saved.map(s=>s.id+':'+s.variant)).size!==saved.length)throw new Error('Duplicate choice.');
 const notes={};for(const s of studies)if(value.notes[s.id]!==undefined){if(typeof value.notes[s.id]!=='string'||value.notes[s.id].length>5000)throw new Error('Invalid note.');notes[s.id]=value.notes[s.id];}
 return{schemaVersion:2,role:role.id,saved,notes,uiuxBasis:value.uiuxBasis?parseUIUX(value.uiuxBasis,value.uiuxBasis.sha256):null};
}
export function load(){try{const value=localStorage.getItem(role.key);return{data:value?parseReview(JSON.parse(value)):empty(),blocked:false};}catch{return{data:empty(),blocked:true};}}
