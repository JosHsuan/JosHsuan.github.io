import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PROJECT_MOTION_SPECS} from '../../scripts/project-studies.mjs';
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

test('all three compact Mode/s outputs retain reviewed 1080p frames and exact final-frame duration',async()=>{
  for(const [id,frames,timescale,frameTicks,durationTicks] of [
    ['film-physical-cutting',240,30000,1001,240240],
    ['prototype-cutting-operation',200,25000,1000,200000],
    ['film-machine-simulation',120,50000,2000,240000],
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


// Inspect actual composition/edit tables as well as decode durations. B-frame
// reordering changes sample DTS and ctts; it must not retime displayed frames.
function boundedBoxes(bytes,start=0,end=bytes.length){
  const result=[];let at=start;
  while(at<end){
    assert(at+8<=end);const size=bytes.readUInt32BE(at);assert(size>=8&&at+size<=end);
    result.push({type:bytes.toString('ascii',at+4,at+8),payload:at+8,end:at+size});at+=size;
  }
  assert.equal(at,end);return result;
}
function oneBox(bytes,parent,type){
  const boxes=boundedBoxes(bytes,parent.payload,parent.end).filter(box=>box.type===type);
  assert.equal(boxes.length,1,'One reviewed '+type+' box');return boxes[0];
}
function actualWebPresentation(bytes,{variableFrameRate=false}={}){
  const actual=readProjectVideo(bytes),moov=boundedBoxes(bytes).find(box=>box.type==='moov');
  const track=oneBox(bytes,moov,'trak'),mdia=oneBox(bytes,track,'mdia'),table=oneBox(bytes,oneBox(bytes,mdia,'minf'),'stbl');
  const timing=oneBox(bytes,table,'stts'),composition=variableFrameRate?boundedBoxes(bytes,table.payload,table.end).find(box=>box.type==='ctts'):oneBox(bytes,table,'ctts'),edit=oneBox(bytes,oneBox(bytes,track,'edts'),'elst');
  if(composition)assert.equal(bytes[composition.payload],0,'Reviewed nonnegative composition-offset table');
  assert.equal(bytes[edit.payload],0);assert.equal(bytes.readUInt32BE(edit.payload+4),1,'One native edit origin');
  assert.equal(edit.payload+20,edit.end);assert.equal(bytes.readInt16BE(edit.payload+16),1);assert.equal(bytes.readInt16BE(edit.payload+18),0,'Unit native edit rate');
  const mediaOrigin=bytes.readInt32BE(edit.payload+12),durations=[],offsets=[];
  for(let i=0,count=bytes.readUInt32BE(timing.payload+4);i<count;i++){
    const at=timing.payload+8+i*8,frames=bytes.readUInt32BE(at),delta=bytes.readUInt32BE(at+4);
    for(let frame=0;frame<frames;frame++)durations.push(delta);
  }
  const entries=composition?bytes.readUInt32BE(composition.payload+4):0;if(composition)assert.equal(composition.payload+8+entries*8,composition.end);
  else offsets.push(...Array(actual.frameCount).fill(0));
  for(let i=0;i<entries;i++){
    const at=composition.payload+8+i*8,frames=bytes.readUInt32BE(at),offset=bytes.readUInt32BE(at+4);
    for(let frame=0;frame<frames;frame++)offsets.push(offset);
  }
  assert.equal(durations.length,actual.frameCount);assert.equal(offsets.length,actual.frameCount);
  let dts=0;const frames=durations.map((duration,i)=>{const frame={pts:dts+offsets[i]-mediaOrigin,duration};dts+=duration;return frame;}).sort((a,b)=>a.pts-b.pts);
  // With reordered VFR, stts describes decode intervals, not display holds.
  // Display intervals are successive composition timestamps and the edit end.
  if(variableFrameRate)for(let i=0;i<frames.length;i++)frames[i].duration=(frames[i+1]?.pts??actual.durationTicks)-frames[i].pts;
  assert.equal(frames[0].pts,0,'Native presentation begins at the reviewed normalized origin');
  for(let i=1;i<frames.length;i++)assert.equal(frames[i].pts,frames[i-1].pts+frames[i-1].duration,'Every native presentation-frame interval is continuous');
  assert.equal(frames.at(-1).pts+frames.at(-1).duration,actual.durationTicks,'The final displayed frame retains its entire duration');
  return{...actual,frames,mediaOrigin,composition,edit,reordered:new Set(offsets).size>1};
}

test('actual compact H264 tables retain every normalized source presentation timestamp through B-frame reordering',async()=>{
  let total=0;
  for(const spec of PROJECT_MOTION_SPECS['mode-s-of-making']){
    const source=media.find(value=>value.projectId==='mode-s-of-making'&&value.id===spec.id),bytes=await load(source.src),actual=actualWebPresentation(bytes);
    assert.equal(bytes.length,spec.outputBytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),spec.outputSHA256);
    assert(bytes.length<=4000000);assert(actual.durationSeconds<=10);total+=bytes.length;
    assert.equal(actual.reordered,true,'The selected H264 actually uses composition reordering');
    assert.equal(actual.mediaOrigin,spec.finalTicks*2,'The reviewed encoder delay is normalized by the native edit origin');
    for(let i=0;i<actual.frames.length;i++)assert.deepEqual(actual.frames[i],{pts:i*spec.finalTicks,duration:spec.finalTicks});
    assert.deepEqual([actual.width,actual.height],[1920,1080]);assert.equal(actual.width/actual.height,spec.sourceWidth/spec.sourceHeight,'Source display shape is retained');
    const entry=bytes.indexOf(Buffer.from('avcC'));assert(entry>0);assert.equal(bytes[entry+5],100,'Reviewed High profile');assert.equal(bytes[entry+7],41,'Reviewed level 4.1');
    const wrongComposition=Buffer.from(bytes);wrongComposition.writeUInt32BE(wrongComposition.readUInt32BE(actual.composition.payload+12)+1,actual.composition.payload+12);
    assert.throws(()=>actualWebPresentation(wrongComposition),/presentation|interval|displayed/);
    const wrongOrigin=Buffer.from(bytes);wrongOrigin.writeInt32BE(actual.mediaOrigin+spec.finalTicks,actual.edit.payload+12);
    assert.throws(()=>actualWebPresentation(wrongOrigin),/presentation/);
  }
  assert.equal(total,6841683);assert(total<=8000000);
});


test('Dot delivery preserves every native VFR presentation interval and retains its original input',async()=>{
  const spec=PROJECT_MOTION_SPECS['dot-based-3d-printing'][0],delivery=spec.deliveryDerivative;
  const bytes=await load(delivery.src),original=await load(delivery.input.src);
  for(const [data,pin] of [[bytes,delivery],[original,delivery.input]]){
    assert.equal(data.length,pin.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'),pin.sha256);
  }
  assert(bytes.length<original.length*.55,'At least 45 percent fewer requested video bytes');
  const actual=actualWebPresentation(bytes,{variableFrameRate:true}),input=actualWebPresentation(original,{variableFrameRate:true});
  const pts=[0,16,31,46,60,75,91,108,125,141,157,173,189,205,221,238,255,271,288,304,320,338,354,371,388,406,427];
  const expected=pts.map((value,i)=>({pts:value/100,duration:((pts[i+1]??440)-value)/100}));
  const receipt=JSON.parse(await readFile(new URL('dot-web-delivery.json',release)));
  const rational=value=>{const [n,d=1]=value.split('/').map(Number);return n/d;};
  assert.equal(receipt.input.sha256,delivery.input.sha256);assert.equal(receipt.output.sha256,delivery.sha256);
  assert.deepEqual(receipt.timeline.presentationSecondsExactFractions.map(rational),expected.map(frame=>frame.pts));
  assert.deepEqual(receipt.timeline.durationSecondsExactFractions.map(rational),expected.map(frame=>frame.duration));
  for(const video of [actual,input]){
    assert.deepEqual([video.width,video.height,video.frameCount],[2500,1304,27]);
    assert.deepEqual(video.frames.map(frame=>({pts:frame.pts/video.timescale,duration:frame.duration/video.timescale})),expected);
  }
});
