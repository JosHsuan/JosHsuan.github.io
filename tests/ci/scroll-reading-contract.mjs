import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {relative,resolve} from 'node:path';

const root=fileURLToPath(new URL('../../',import.meta.url));
export const scrollReadingDeltas=JSON.parse(await readFile(new URL('./scroll-reading-approved-deltas.json',import.meta.url),'utf8'));
/** Strict historical normalization, never a replacement baseline. Every exact
 * current block must exist once before its reviewed predecessor can be restored.
 * The old independent pins then protect every non-authorized byte. Raw-source
 * tests separately assert the new product, not this historical projection.
 * No runtime git, generated baseline, regex stripping or asset transformation. */
export function reverseScrollReadingDelta(path,source){
 const record=scrollReadingDeltas[path];if(!record)return source;
 let original=source;
 for(const {before,after}of [...record.blocks].reverse()){
  assert.ok(after.length>0,path+': reviewed current block cannot be empty');
  assert.equal(original.split(after).length,2,path+': exact reviewed scroll-reading block must occur once');
  original=original.replace(after,before);
 }
 return original;
}
export async function readReviewedFile(path,options){
 const value=await readFile(path,options),absolute=path instanceof URL?fileURLToPath(path):resolve(path),name=relative(root,absolute).replaceAll('\\','/');
 if(!scrollReadingDeltas[name])return value;
 const original=reverseScrollReadingDelta(name,value.toString());
 return typeof value==='string'?original:Buffer.from(original);
}
