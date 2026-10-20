import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projectMotionMedia,assertProjectVideo,readProjectVideo} from '../../scripts/project-motion-media.mjs';

const release=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const studies=JSON.parse(await readFile(new URL('project-studies.json',release)));
const media=projectMotionMedia(studies);
const load=source=>readFile(new URL('public'+source,release));

test('all seven selected source sequences retain their real dimensions, frame count and final-frame duration',async()=>{
  assert.equal(media.length,7);
  for(const source of media){
    const actual=assertProjectVideo(await load(source.src),source);
    assert.equal(actual.tracks,1);
    assert.equal(actual.codec,'avc1');
    assert(actual.frameCount>1);
  }
});

test('both physical recordings retain every reviewed native 1080p frame and exact final-frame duration',async()=>{
  for(const [id,frames,timescale,frameTicks,durationTicks] of [
    ['film-physical-cutting',300,30000,1001,300300],
    ['prototype-cutting-operation',522,25000,1000,522000],
  ]){
    const source=media.find(value=>value.projectId==='mode-s-of-making'&&value.id===id);
    assert(source,'The exact reviewed physical clip is selected');
    const bytes=await load(source.src),actual=assertProjectVideo(bytes,source);
    assert.deepEqual([actual.width,actual.height,actual.frameCount,actual.timescale,actual.durationTicks],[1920,1080,frames,timescale,durationTicks]);
    const at=bytes.indexOf(Buffer.from('stts'));
    assert(at>0&&at<bytes.indexOf(Buffer.from('mdat')));
    assert.equal(bytes.readUInt32BE(at+8),1,'One unchanged native constant-frame-duration entry');
    assert.equal(bytes.readUInt32BE(at+12),frames,'Every selected source frame is timed');
    assert.equal(bytes.readUInt32BE(at+16),frameTicks,'The final native frame has the same complete duration');
    assert.throws(()=>assertProjectVideo(bytes,{...source,frameCount:frames-1}),/frame/);
    assert.throws(()=>assertProjectVideo(bytes,{...source,width:1280,height:720}),/dimensions/);
    assert.throws(()=>assertProjectVideo(bytes,{...source,durationSeconds:source.durationSeconds-.04}),/timing/);
  }
});

// Mutate actual, pinned container tables: a manifest claim or a valid filename
// cannot make truncated, externally referenced or mistimed samples acceptable.
test('source timing/dimensions cannot be replaced by incorrect declared metadata',async()=>{
  const source=media.find(value=>value.projectId==='dot-based-3d-printing');
  const bytes=await load(source.src);
  assert.throws(()=>assertProjectVideo(bytes,{...source,width:source.width+2}),/dimensions/);
  assert.throws(()=>assertProjectVideo(bytes,{...source,frameCount:source.frameCount-1}),/frame/);
  assert.throws(()=>assertProjectVideo(bytes,{...source,durationSeconds:source.durationSeconds-.13}),/timing/);
  const changed=Buffer.from(bytes),at=changed.indexOf(Buffer.from('stts'));
  assert(at>0&&at<bytes.indexOf(Buffer.from('mdat')));
  changed.writeUInt32BE(changed.readUInt32BE(at+16)+1,at+16);
  assert.throws(()=>readProjectVideo(changed),/timing/);
});

test('truncation, external sample URLs and out-of-payload chunk pointers fail before release',async()=>{
  const source=media.find(value=>value.projectId==='dot-based-3d-printing');
  const bytes=await load(source.src);
  assert.throws(()=>readProjectVideo(bytes.subarray(0,bytes.length-1)),/bounded MP4/);
  const external=Buffer.from(bytes),url=external.indexOf(Buffer.from('url '));
  assert(url>0&&url<bytes.indexOf(Buffer.from('mdat')));
  external.writeUInt32BE(0,url+4);
  assert.throws(()=>readProjectVideo(external),/external sample URL/);
  const redirected=Buffer.from(bytes),chunk=redirected.indexOf(Buffer.from('stco'));
  assert(chunk>0&&chunk<bytes.indexOf(Buffer.from('mdat')));
  redirected.writeUInt32BE(0,chunk+12);
  assert.throws(()=>readProjectVideo(redirected),/inside encoded media/);
});
