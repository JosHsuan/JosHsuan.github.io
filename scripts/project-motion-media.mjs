import assert from 'node:assert/strict';

export const projectMotionMedia=record=>record.projects.flatMap(project=>(project.motionMedia??[]).map(media=>({...media,projectId:project.id})));

/** Read the actual ISO BMFF tables, without invoking a native decoder or
 * trusting filename/manifest dimensions. Browser acceptance still proves that
 * the pinned H264 samples really decode and advance on native media time. */
function boxes(bytes,start=0,end=bytes.length){
  const result=[];let at=start;
  while(at<end){
    assert(at+8<=end,'Complete MP4 box header');
    let size=bytes.readUInt32BE(at),header=8;
    if(size===1){assert(at+16<=end);const large=bytes.readBigUInt64BE(at+8);assert(large<=BigInt(Number.MAX_SAFE_INTEGER));size=Number(large);header=16;}
    if(size===0)size=end-at;
    assert(size>=header&&at+size<=end,'Complete bounded MP4 box');
    result.push({type:bytes.toString('ascii',at+4,at+8),start:at,payload:at+header,end:at+size});at+=size;
  }
  assert.equal(at,end);return result;
}
function child(bytes,parent,type){const found=boxes(bytes,parent.payload,parent.end).filter(box=>box.type===type);assert.equal(found.length,1,`One MP4 ${type} box`);return found[0];}
function uint64(bytes,offset){const value=bytes.readBigUInt64BE(offset);assert(value<=BigInt(Number.MAX_SAFE_INTEGER));return Number(value);}

export function readProjectVideo(bytes){
  const top=boxes(bytes),ftyp=top.filter(box=>box.type==='ftyp'),movies=top.filter(box=>box.type==='moov'),data=top.filter(box=>box.type==='mdat');
  assert.equal(ftyp.length,1);assert.equal(movies.length,1);assert(data.length>0,'Actual encoded video payload');
  assert(movies[0].start<data[0].start,'Faststart metadata precedes native samples');
  const tracks=boxes(bytes,movies[0].payload,movies[0].end).filter(box=>box.type==='trak');assert.equal(tracks.length,1,'One silent video track; no audio or private data track');
  const track=tracks[0],mdia=child(bytes,track,'mdia'),handler=child(bytes,mdia,'hdlr');
  assert.equal(bytes.toString('ascii',handler.payload+8,handler.payload+12),'vide','A native video track');
  const header=child(bytes,mdia,'mdhd'),version=bytes[header.payload];assert(version===0||version===1);
  const timescale=bytes.readUInt32BE(header.payload+(version===1?20:12));
  const durationTicks=version===1?uint64(bytes,header.payload+24):bytes.readUInt32BE(header.payload+16);assert(timescale>0&&durationTicks>0);
  const table=child(bytes,child(bytes,mdia,'minf'),'stbl'),description=child(bytes,table,'stsd');
  assert.equal(bytes.readUInt32BE(description.payload+4),1,'One native sample description');
  const entries=boxes(bytes,description.payload+8,description.end);assert.equal(entries.length,1);
  const entry=entries[0];assert(['avc1','avc3'].includes(entry.type),'Portable H264 source derivative');assert(entry.payload+78<=entry.end);
  assert.equal(bytes.readUInt16BE(entry.payload+6),1,'Self-contained sample data');
  const width=bytes.readUInt16BE(entry.payload+24),height=bytes.readUInt16BE(entry.payload+26);assert(width>0&&height>0);
  const configs=boxes(bytes,entry.payload+78,entry.end).filter(box=>box.type==='avcC');assert.equal(configs.length,1);assert.equal(bytes[configs[0].payload],1);
  const timing=child(bytes,table,'stts'),timingCount=bytes.readUInt32BE(timing.payload+4);assert.equal(timing.payload+8+timingCount*8,timing.end);
  let frameCount=0,totalTicks=0;
  for(let i=0;i<timingCount;i++){const offset=timing.payload+8+i*8,count=bytes.readUInt32BE(offset),delta=bytes.readUInt32BE(offset+4);assert(count>0&&delta>0);frameCount+=count;totalTicks+=count*delta;}
  assert.equal(totalTicks,durationTicks,'Complete source timing, including the final frame');
  const sizes=child(bytes,table,'stsz'),sampleSize=bytes.readUInt32BE(sizes.payload+4),sampleCount=bytes.readUInt32BE(sizes.payload+8);
  assert.equal(sampleCount,frameCount,'Every timed frame has one encoded sample');
  if(!sampleSize)assert.equal(sizes.payload+12+4*sampleCount,sizes.end);
  const offsets=boxes(bytes,table.payload,table.end).filter(box=>['stco','co64'].includes(box.type));assert.equal(offsets.length,1);
  const offsetBox=offsets[0],chunks=bytes.readUInt32BE(offsetBox.payload+4),stride=offsetBox.type==='co64'?8:4;assert(chunks>0);assert.equal(offsetBox.payload+8+chunks*stride,offsetBox.end);
  for(let i=0;i<chunks;i++){const at=offsetBox.payload+8+i*stride,offset=stride===8?uint64(bytes,at):bytes.readUInt32BE(at);assert(data.some(box=>offset>=box.payload&&offset<box.end),'Every chunk points inside encoded media');}
  const reference=child(bytes,child(bytes,mdia,'minf'),'dinf'),dref=child(bytes,reference,'dref');
  const references=boxes(bytes,dref.payload+8,dref.end);assert.equal(bytes.readUInt32BE(dref.payload+4),1);assert.equal(references.length,1);assert.equal(references[0].type,'url ');assert.equal(bytes.readUInt32BE(references[0].payload)&1,1,'No external sample URL');
  return{width,height,frameCount,timescale,durationTicks,durationSeconds:durationTicks/timescale,codec:entry.type,tracks:tracks.length};
}

export function assertProjectVideo(bytes,media){
  const actual=readProjectVideo(bytes);
  assert.deepEqual([actual.width,actual.height],[media.width,media.height],`Actual motion dimensions: ${media.src}`);
  assert.equal(actual.frameCount,media.frameCount,`Every authored frame retained: ${media.src}`);
  assert(Math.abs(actual.durationSeconds-media.durationSeconds)<=.000001,`Native timing retained: ${media.src}`);
  return actual;
}
