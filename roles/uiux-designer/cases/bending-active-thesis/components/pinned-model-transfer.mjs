/** Read decoded response bytes into the declared source allocation. HTTP gzip
 * size is not the GLB byte count. Native body chunks are progress, never proof
 * of the source hash, successful parsing or first draw. */
export async function readPinnedModelResponse(response,{bytes,signal,onProgress=()=>{}}){
 if(!Number.isSafeInteger(bytes)||bytes<=0)throw RangeError('A pinned model byte count is required');
 signal.throwIfAborted();
 if(!response.body){
  const buffer=await response.arrayBuffer();signal.throwIfAborted();
  if(buffer.byteLength!==bytes)throw Error('Project model byte count differs');
  onProgress(buffer.byteLength);return buffer;
 }
 const reader=response.body.getReader();let completed=false;
 try{
  const buffer=new Uint8Array(bytes);let loaded=0;
  while(true){
   signal.throwIfAborted();
   const {done,value}=await reader.read();signal.throwIfAborted();
   if(done)break;
   if(loaded+value.byteLength>bytes)throw Error('Project model byte count differs');
   if(!value.byteLength)continue;
   buffer.set(value,loaded);loaded+=value.byteLength;onProgress(loaded);
  }
  if(loaded!==bytes)throw Error('Project model byte count differs');
  completed=true;return buffer.buffer;
 }finally{
  if(!completed)try{await reader.cancel();}catch{/* The fetch may already be aborted. */}
  reader.releaseLock();
 }
}
