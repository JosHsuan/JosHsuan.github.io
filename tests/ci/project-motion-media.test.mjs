import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertProjectStudies,assertProjectAssetRecord,assertProjectMotionSequence,assertProjectMotionEncoding,PROJECT_MOTION_SPECS} from '../../scripts/project-studies.mjs';

const release=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name+'.json',release),'utf8'));
const fixture=()=>({studies:read('project-studies'),assets:read('project-assets'),manifest:read('manifest')});
const validate=({studies,assets,manifest})=>{
  const images=assertProjectStudies(studies,manifest);
  assertProjectAssetRecord(assets,images,manifest,studies);
  return images;
};
const project=(fixture,id='mode-s-of-making')=>fixture.studies.projects.find(item=>item.id===id);
const motion=(fixture,projectId='mode-s-of-making',id='film-machine-simulation')=>project(fixture,projectId).motionMedia.find(item=>item.id===id);
const provenance=(fixture,projectId='mode-s-of-making',id='film-machine-simulation')=>fixture.assets.motionAssets.find(item=>item.projectId===projectId&&item.id===id);
const reject=change=>{const current=fixture();change(current);assert.throws(()=>validate(current));};
const originalPairs=[
  ['entrance-installation-art','installation-lighting-motion'],
  ['dot-based-3d-printing','printing-process-motion'],
  ['hc3dp-caustics','fabrication-path-motion'],
  ['special-assemblies','robot-assembly-motion'],
];

test('seven source motions and their posters have complete release provenance',()=>{
  const current=fixture(),images=validate(current);
  // Existing Mode/s and HC placements plus four three-case narrative primaries
  // reuse original sources: 60 placements, still 48 identities / 137 approvals.
  assert.equal(images.length,60);
  assert.equal(new Set(images.map(image=>image.src)).size,48);
  assert.equal(current.assets.motionAssets.length,7);
  // The original Dot MP4 is retained alongside its smaller delivery derivative.
  assert.equal(current.manifest.assets.length,137);
  assert.equal(project(current,'project-caschlatsch').motionMedia,undefined);
  assert.doesNotThrow(()=>assertProjectAssetRecord(current.assets,images,current.manifest));
});

test('the clip registry retains exactly the seven approved project and motion identities',()=>{
  const current=fixture(),pairs=[];
  assert(Object.isFrozen(PROJECT_MOTION_SPECS));
  for(const [projectId,specs] of Object.entries(PROJECT_MOTION_SPECS)){
    assert(Array.isArray(specs)&&Object.isFrozen(specs));
    for(const spec of specs){
      assert(Object.isFrozen(spec));assert(['recording','simulation'].includes(spec.kind));
      const selected=motion(current,projectId,spec.id),source=provenance(current,projectId,spec.id);
      assert(selected&&source);assert.equal(source.source.sha256,spec.sha256);
      assert.equal(selected.chapter,spec.chapter);assert.equal(source.src,selected.src);
      if(spec.kind==='simulation')assert.match(selected.caption,/simulation/i);
      pairs.push([projectId,spec.id]);
    }
  }
  assert.deepEqual(pairs,[
    ['mode-s-of-making','film-machine-simulation'],
    ['mode-s-of-making','film-physical-cutting'],
    ['mode-s-of-making','prototype-cutting-operation'],
    ['entrance-installation-art','installation-lighting-motion'],
    ['dot-based-3d-printing','printing-process-motion'],
    ['hc3dp-caustics','fabrication-path-motion'],
    ['special-assemblies','robot-assembly-motion'],
  ]);
  assert.equal(new Set(pairs.map(pair=>JSON.stringify(pair))).size,7);
  const physical=PROJECT_MOTION_SPECS['mode-s-of-making'].find(spec=>spec.id==='film-physical-cutting');
  const cutting=PROJECT_MOTION_SPECS['mode-s-of-making'].find(spec=>spec.id==='prototype-cutting-operation');
  assert(Object.isFrozen(physical.sourceInterval));assert(Object.isFrozen(cutting.transcodeRecipe));assert(Object.isFrozen(cutting.qualityReceipt));
});

test('clip lookup rejects an unreviewed second source, cross-project identity and duplicate selection',()=>{
  reject(current=>motion(current).id='unreviewed-second-source');
  reject(current=>motion(current).id='installation-lighting-motion');
  reject(current=>project(current).motionMedia.push(structuredClone(motion(current))));
  reject(current=>{
    const other=structuredClone(motion(current));other.id='unreviewed-second-source';other.chapter='results';
    project(current).motionMedia.push(other);
  });
  reject(current=>provenance(current).id='installation-lighting-motion');
  reject(current=>provenance(current).projectId='entrance-installation-art');
  reject(current=>provenance(current).src=provenance(current,'entrance-installation-art','installation-lighting-motion').src);
});

test('motion selection rejects an omitted source or unreviewed chapter, loop and simulation claim',()=>{
  reject(current=>delete project(current).motionMedia);
  reject(current=>motion(current,'entrance-installation-art','installation-lighting-motion').chapter='making');
  reject(current=>motion(current,'special-assemblies','robot-assembly-motion').loop=true);
  reject(current=>project(current,'project-caschlatsch').motionMedia=[motion(current)]);
  reject(current=>motion(current,'hc3dp-caustics','fabrication-path-motion').caption='Verified physical optical result.');
  reject(current=>motion(current).caption='Physical prototype operation.');
});

test('one source model cannot leave and return in separated story chapters',()=>{
  const current=fixture(),mode=project(current);
  mode.model.chapters=['context','results'];
  mode.model.views={context:mode.model.views.context,results:structuredClone(mode.model.views.context)};
  assert.throws(()=>assertProjectStudies(current.studies,current.manifest),/one ordered, continuous chapter interval/);
});

test('motion metadata rejects dropped frames, retiming, resizing and changed native posters',()=>{
  reject(current=>motion(current).frameCount--);
  reject(current=>motion(current).durationSeconds=8);
  reject(current=>motion(current).width=640);
  reject(current=>motion(current).poster.width=640);
  reject(current=>{
    const src=motion(current).poster.src;
    current.manifest.assets=current.manifest.assets.filter(pin=>'/'+pin.path!==src);
  });
});

test('provenance rejects orphaned, duplicated, mismatched and unpinned motion assets',()=>{
  reject(current=>current.assets.motionAssets.pop());
  reject(current=>current.assets.motionAssets[1]=structuredClone(current.assets.motionAssets[0]));
  reject(current=>provenance(current).frameCount--);
  reject(current=>provenance(current).sha256='0'.repeat(64));
  reject(current=>current.manifest.assets.push(structuredClone(current.manifest.assets[0])));
});

test('all original sources and exact PPTX members cannot be silently substituted',()=>{
  reject(current=>provenance(current).source.sha256='0'.repeat(64));
  reject(current=>provenance(current,'dot-based-3d-printing','printing-process-motion').source.container.zipMember='ppt/media/image49.gif');
  reject(current=>provenance(current,'hc3dp-caustics','fabrication-path-motion').source.container.slide=18);
  reject(current=>provenance(current,'hc3dp-caustics','fabrication-path-motion').source.container.byteExactExtractedMember=false);
  reject(current=>provenance(current,'special-assemblies','robot-assembly-motion').source.intrinsicGIFLoopExtension=0);
});

test('the full native sequence forbids crop, trim, retime, enlargement and deformation',()=>{
  for(const [key,value] of [['crop',[0,0,100,100]],['trim',[0,1]],['retime',2],['resize',[640,360]],['upscaled',true],['geometryDeformation',true]]){
    reject(current=>provenance(current).processing[key]=value);
  }
  reject(current=>provenance(current,'hc3dp-caustics','fabrication-path-motion').processing.pad.rightPixels=2);
  reject(current=>provenance(current,'special-assemblies','robot-assembly-motion').processing.pad.sourcePixelBounds.height++);
});

test('native frame, end and final-delay proofs cannot be removed or weakened',()=>{
  for(const key of ['frameCountExact','allFramePTSExact','allFrameDurationsExact','finalFrameDurationExact','absolutePTSOriginUnchanged','faststartVerified','noChapterAdvanceOnEnded']){
    reject(current=>provenance(current,'dot-based-3d-printing','printing-process-motion').processing[key]=false);
  }
  reject(current=>provenance(current,'dot-based-3d-printing','printing-process-motion').processing.finalFrameDurationTicks=16);
  reject(current=>provenance(current,'special-assemblies','robot-assembly-motion').processing.loopPolicy='Automatically restart at the first frame.');
  reject(current=>{
    const src=motion(current,'special-assemblies','robot-assembly-motion').poster.src;
    current.assets.assets.find(asset=>asset.src===src).processing.selectedFrame=107;
  });
});

test('native remux proofs preserve encoded packets, range, identity matrix and silent private-data boundary',()=>{
  for(const key of ['encodedVideoPacketsByteExact','avcCExtradataByteExact','allPacketPTSExact','allPacketDTSExact','allPacketDurationsExact','identityTrackMatrixExact','sourceColorRangePreserved']){
    reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing[key]=false);
  }
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.trackMatrix[0]=0);
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.colorRange='tv/limited');
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.pixelFormat='yuv420p');
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.colorRange='tv/limited');
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.pixelFormat='yuv420p');
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.audio='Source audio retained.');
  reject(current=>provenance(current).source.privatePath='D:\\private\\source.mp4');
  reject(current=>provenance(current).source.privatePath='d:\\private\\source.mp4');
});

// Synthetic contract fixtures, not selected or source-reviewed project footage.
const intervalFixture=()=>{
  const sourceInterval={startFrame:20,endFrameExclusive:26,sourceFrameCount:100,startPTSTicks:20020,endPTSTicks:26026,timeBase:'1/30000'};
  return {
    spec:{kind:'recording',frameCount:6,durationSeconds:.2002,finalTicks:1001,timeBase:'1/30000',remux:true,sourceInterval},
    processing:{
      fullNativeSequence:false,crop:null,trim:structuredClone(sourceInterval),retime:null,resize:null,
      timestampRebase:{offsetTicks:-20020,timeBase:'1/30000'},absolutePTSOriginUnchanged:false,
      frameCountExact:true,allFramePTSExact:false,allRelativeFramePTSExact:true,allFrameDurationsExact:true,
      finalFrameDurationExact:true,finalFrameDurationTicks:1001,finalFrameDurationTimeBase:'1/30000',
      allPacketPTSExact:false,allPacketDTSExact:false,allRelativePacketPTSExact:true,allRelativePacketDTSExact:true,
      faststartVerified:true,noChapterAdvanceOnEnded:true,
    },
  };
};
const rejectInterval=change=>{const current=intervalFixture();change(current);assert.throws(()=>assertProjectMotionSequence(current.processing,current.spec));};

test('a reviewed interval keeps every selected source frame and only a constant timestamp-origin shift',()=>{
  const {processing,spec}=intervalFixture();
  assert.doesNotThrow(()=>assertProjectMotionSequence(processing,spec));
  assert.equal(spec.sourceInterval.endFrameExclusive-spec.sourceInterval.startFrame,spec.frameCount);
});

test('web excerpt permission cannot weaken the four unaffected complete-native sequence contracts',()=>{
  for(const [projectId,id] of originalPairs){
    const spec=PROJECT_MOTION_SPECS[projectId].find(item=>item.id===id);
    const current=fixture(),media=provenance(current,projectId,spec.id);
    assert.doesNotThrow(()=>assertProjectMotionSequence(media.processing,spec));
    media.processing.fullNativeSequence=false;
    media.processing.trim=structuredClone(intervalFixture().spec.sourceInterval);
    assert.throws(()=>validate(current));
  }
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.timestampRebase={offsetTicks:0,timeBase:'1/50000'});
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.allFramePTSExact=false);
  reject(current=>provenance(current,'entrance-installation-art','installation-lighting-motion').processing.allPacketPTSExact=false);
});

test('interval provenance rejects missing, changed, enlarged or out-of-bounds source selection',()=>{
  rejectInterval(current=>delete current.processing.trim);
  rejectInterval(current=>current.processing.trim.startFrame--);
  rejectInterval(current=>current.processing.trim.endFrameExclusive++);
  rejectInterval(current=>current.processing.trim.startPTSTicks++);
  rejectInterval(current=>current.processing.trim.timeBase='1/25');
  rejectInterval(current=>current.spec.sourceInterval.endFrameExclusive=101);
  rejectInterval(current=>current.spec.sourceInterval.startFrame=-1);
  rejectInterval(current=>current.spec.sourceInterval.sourceFrameCount=25);
  rejectInterval(current=>current.spec.sourceInterval.startFrame=.5);
  rejectInterval(current=>current.spec.sourceInterval.unreviewedSelection=true);
  rejectInterval(current=>current.spec.frameCount--);
  rejectInterval(current=>current.spec.durationSeconds=.24);
  rejectInterval(current=>current.spec.sourceInterval.endPTSTicks++);
  rejectInterval(current=>current.spec.sourceInterval.timeBase='0/30000');
  rejectInterval(current=>current.spec.timeBase='1/15000');
  rejectInterval(current=>current.spec.remux=false);
  rejectInterval(current=>current.spec.kind='simulation');
});

test('interval timestamp and duration proofs reject retiming and false absolute-native claims',()=>{
  rejectInterval(current=>current.processing.fullNativeSequence=true);
  rejectInterval(current=>current.processing.absolutePTSOriginUnchanged=true);
  rejectInterval(current=>current.processing.allFramePTSExact=true);
  rejectInterval(current=>current.processing.allPacketPTSExact=true);
  rejectInterval(current=>current.processing.allPacketDTSExact=true);
  rejectInterval(current=>current.processing.timestampRebase.offsetTicks++);
  rejectInterval(current=>current.processing.timestampRebase.timeBase='1/25');
  rejectInterval(current=>current.processing.timestampRebase.extraOffset=1);
  for(const key of ['allRelativeFramePTSExact','allRelativePacketPTSExact','allRelativePacketDTSExact','frameCountExact','allFrameDurationsExact','finalFrameDurationExact','faststartVerified','noChapterAdvanceOnEnded']){
    rejectInterval(current=>current.processing[key]=false);
  }
  rejectInterval(current=>current.processing.finalFrameDurationTicks=1000);
  rejectInterval(current=>current.processing.finalFrameDurationTimeBase='1/25');
  for(const [key,value] of [['crop',[0,0,100,100]],['retime',2],['resize',[640,360]]])rejectInterval(current=>current.processing[key]=value);
});

const transcodeFixture=()=>{
  const transcodeRecipe={encoder:'libx264',crf:16,preset:'slow',profile:'High',level:41,bFrames:0,refs:4};
  const qualityReceipt={metric:'SSIM',comparedFrames:12,allFramesCompared:true,mean:.995,minimumFrame:.99,maximumFrame:.999,statsSHA256:'f'.repeat(64)};
  return {
    spec:{kind:'recording',remux:false,frameCount:12,pixelFormat:'yuvj420p',colorRange:'pc/full',transcodeRecipe,qualityReceipt},
    processing:{
      videoCodec:'h264',codecTag:'avc1',transcoded:true,encodedVideoPacketsByteExact:false,avcCExtradataByteExact:false,
      decodedFramesByteExact:false,transcodeRecipe:structuredClone(transcodeRecipe),
      allPacketPTSExact:true,allPacketDTSExact:true,allPacketDurationsExact:true,
      identityTrackMatrixExact:true,trackMatrix:[65536,0,0,0,65536,0,0,0,1073741824],
      sourceColorRangePreserved:true,pixelFormat:'yuvj420p',colorRange:'pc/full',quality:structuredClone(qualityReceipt),
    },
  };
};
const rejectTranscode=change=>{const current=transcodeFixture();change(current);assert.throws(()=>assertProjectMotionEncoding(current.processing,current.spec));};

test('a reviewed photographic transcode preserves native range and packet timing without claiming byte equality',()=>{
  const {processing,spec}=transcodeFixture();
  assert.doesNotThrow(()=>assertProjectMotionEncoding(processing,spec));
  for(const [projectId,id] of originalPairs){
    const original=PROJECT_MOTION_SPECS[projectId].find(item=>item.id===id);
    const current=fixture(),source=provenance(current,projectId,original.id);
    source.processing.transcodeRecipe=structuredClone(spec.transcodeRecipe);
    assert.throws(()=>validate(current));
  }
});

test('photographic transcode rejects changed encoding, range, timing or identity matrix',()=>{
  for(const key of ['transcoded','allPacketPTSExact','allPacketDTSExact','allPacketDurationsExact','identityTrackMatrixExact','sourceColorRangePreserved']){
    rejectTranscode(current=>current.processing[key]=false);
  }
  for(const key of ['encodedVideoPacketsByteExact','avcCExtradataByteExact','decodedFramesByteExact'])rejectTranscode(current=>current.processing[key]=true);
  rejectTranscode(current=>current.processing.transcodeRecipe.crf=23);
  rejectTranscode(current=>current.processing.transcodeRecipe.preset='fast');
  rejectTranscode(current=>current.processing.transcodeRecipe.bFrames=3);
  rejectTranscode(current=>current.processing.transcodeRecipe.level=52);
  rejectTranscode(current=>current.processing.pixelFormat='yuv420p');
  rejectTranscode(current=>current.processing.colorRange='tv/limited');
  rejectTranscode(current=>current.processing.trackMatrix[0]=0);
  rejectTranscode(current=>current.spec.kind='simulation');
});

test('photographic transcode requires the reviewed comparison of every native frame',()=>{
  rejectTranscode(current=>delete current.processing.quality);
  rejectTranscode(current=>current.processing.quality.metric='PSNR');
  rejectTranscode(current=>current.processing.quality.comparedFrames--);
  rejectTranscode(current=>current.processing.quality.allFramesCompared=false);
  rejectTranscode(current=>current.processing.quality.mean=1);
  rejectTranscode(current=>current.processing.quality.minimumFrame=.5);
  rejectTranscode(current=>current.processing.quality.maximumFrame=1);
  rejectTranscode(current=>current.processing.quality.statsSHA256='0'.repeat(64));
  rejectTranscode(current=>{current.spec.qualityReceipt.mean=NaN;current.processing.quality.mean=NaN;});
  rejectTranscode(current=>{current.spec.qualityReceipt.minimumFrame=0;current.processing.quality.minimumFrame=0;});
  rejectTranscode(current=>{current.spec.qualityReceipt.minimumFrame=1;current.processing.quality.minimumFrame=1;});
  rejectTranscode(current=>{current.spec.qualityReceipt.maximumFrame=.9;current.processing.quality.maximumFrame=.9;});
  rejectTranscode(current=>{current.spec.qualityReceipt.statsSHA256='not-a-hash';current.processing.quality.statsSHA256='not-a-hash';});
});

test('the physical RELAX excerpt cannot substitute animation, a different interval or false native origin claims',()=>{
  const id='film-physical-cutting';
  reject(current=>motion(current,'mode-s-of-making',id).chapter='making');
  reject(current=>provenance(current,'mode-s-of-making',id).source.file='cube.mp4');
  reject(current=>provenance(current,'mode-s-of-making',id).processing.trim.startFrame=1800);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.trim.endFrameExclusive=410);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.trim.sourceFrameCount=300);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.timestampRebase.offsetTicks=0);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.fullNativeSequence=true);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.absolutePTSOriginUnchanged=true);
});

test('the reviewed physical prototype excerpt cannot change frames, origin, range, compression or identity claims',()=>{
  const id='prototype-cutting-operation';
  reject(current=>motion(current,'mode-s-of-making',id).frameCount=522);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.trim={startFrame:0,endFrameExclusive:300});
  reject(current=>provenance(current,'mode-s-of-making',id).processing.allFramePTSExact=true);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.allRelativeFramePTSExact=false);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.allPacketDurationsExact=true);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.colorRange='tv/limited');
  reject(current=>provenance(current,'mode-s-of-making',id).processing.decodedFramesByteExact=true);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.quality.comparedFrames=522);
  reject(current=>provenance(current,'mode-s-of-making',id).processing.transcodeRecipe.crf=16);
});

test('both physical selections and provenance retain the reviewed recording classification',()=>{
  for(const id of ['film-physical-cutting','prototype-cutting-operation']){
    reject(current=>motion(current,'mode-s-of-making',id).kind='simulation');
    reject(current=>delete motion(current,'mode-s-of-making',id).kind);
    reject(current=>provenance(current,'mode-s-of-making',id).kind='simulation');
    reject(current=>delete provenance(current,'mode-s-of-making',id).kind);
  }
});


test('Mode/s has exactly three reviewed compact web outputs while all original poster pins remain exact',()=>{
  const current=fixture();validate(current);
  const specs=PROJECT_MOTION_SPECS['mode-s-of-making'];let bytes=0;
  for(const spec of specs){
    assert.equal(spec.webDelivery,true);assert(Object.isFrozen(spec.transcodeRecipe));assert(Object.isFrozen(spec.qualityReceipt));
    const source=provenance(current,'mode-s-of-making',spec.id);bytes+=source.bytes;
    assert(source.bytes<=4000000);assert(source.durationSeconds<=10);
    assert.equal(source.bytes,spec.outputBytes);assert.equal(source.sha256,spec.outputSHA256);
    assert.equal(source.processing.transcodeRecipe.bFrames,3);
    assert.equal(source.processing.encodedVideoPacketsByteExact,false);assert.equal(source.processing.avcCExtradataByteExact,false);assert.equal(source.processing.decodedFramesByteExact,false);
    const poster=current.manifest.assets.find(pin=>'/'+pin.path===spec.posterSrc);
    assert.equal(poster.bytes,spec.posterBytes);assert.equal(poster.sha256,spec.posterSHA256);
  }
  assert.equal(bytes,6841683);assert(bytes<=8000000);
});

test('reviewed compact web delivery rejects wrong budget, source interval, timestamp or encoding facts',()=>{
  for(const id of ['film-machine-simulation','film-physical-cutting','prototype-cutting-operation']){
    for(const key of ['file','bytes','sha256'])reject(current=>{const source=provenance(current,'mode-s-of-making',id).source;source[key]=key==='bytes'?source[key]+1:'unreviewed';});
    reject(current=>motion(current,'mode-s-of-making',id).durationSeconds=10.01);
    reject(current=>{const media=provenance(current,'mode-s-of-making',id);media.bytes=4000001;current.manifest.assets.find(pin=>pin.path===media.path).bytes=4000001;});
    reject(current=>{const media=provenance(current,'mode-s-of-making',id);media.sha256='0'.repeat(64);current.manifest.assets.find(pin=>pin.path===media.path).sha256=media.sha256;});
    for(const [key,value] of [['crop',[0,0,1280,720]],['retime',2],['upscaled',true],['geometryDeformation',true]])reject(current=>provenance(current,'mode-s-of-making',id).processing[key]=value);
    for(const key of ['allFramePTSExact','absolutePTSOriginUnchanged','allPacketPTSExact','allPacketDTSExact','allPacketDurationsExact','allRelativePacketPTSExact','allRelativePacketDTSExact','encodedVideoPacketsByteExact','avcCExtradataByteExact','decodedFramesByteExact'])reject(current=>provenance(current,'mode-s-of-making',id).processing[key]=true);
    for(const key of ['allRelativeFramePTSExact','allFrameDurationsExact','finalFrameDurationExact','identityTrackMatrixExact','sourceColorRangePreserved'])reject(current=>provenance(current,'mode-s-of-making',id).processing[key]=false);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.timestampRebase.offsetTicks++);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.transcodeRecipe.bFrames=0);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.transcodeRecipe.crf++);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.transcodeRecipe.keyframeInterval=120);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.quality.mean=1);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.quality.comparedFrames--);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.quality.allFramesCompared=false);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.quality.statsSHA256='0'.repeat(64));
    reject(current=>provenance(current,'mode-s-of-making',id).processing.quality.reference='Claimed original pixel identity.');
    reject(current=>provenance(current,'mode-s-of-making',id).processing.trackMatrix[0]=0);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.sourceColorSpace='bt2020nc');
    reject(current=>{const spec=PROJECT_MOTION_SPECS['mode-s-of-making'].find(s=>s.id===id);current.manifest.assets.find(pin=>'/'+pin.path===spec.posterSrc).sha256='0'.repeat(64);});
  }
  for(const id of ['film-physical-cutting','prototype-cutting-operation']){
    reject(current=>provenance(current,'mode-s-of-making',id).processing.trim.startFrame--);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.trim.endFrameExclusive++);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.trim.sourceFrameCount--);
    reject(current=>provenance(current,'mode-s-of-making',id).processing.resize={from:[1920,1080],to:[1280,720],method:'Lanczos',uniformScale:2/3});
    reject(current=>provenance(current,'mode-s-of-making',id).processing.fullNativeSequence=true);
  }
});

test('only the reviewed simulation may downsample uniformly and its complete source/poster remains documented',()=>{
  const current=fixture(),source=provenance(current);validate(current);
  assert.deepEqual(source.processing.resize,{from:[4096,2304],to:[1920,1080],method:'Lanczos',uniformScale:.46875});
  assert.equal(source.processing.trim,null);assert.equal(source.processing.fullNativeSequence,true);
  assert.equal(source.source.file,'cube.mp4');assert.deepEqual([motion(current).poster.width,motion(current).poster.height],[4096,2304]);
  for(const change of [
    x=>x.processing.resize=null,x=>x.processing.resize.to[0]=1922,x=>x.processing.resize.from[0]=3840,
    x=>x.processing.resize.method='Bilinear',x=>x.processing.resize.uniformScale=.5,
    x=>x.processing.transcodeRecipe.resize=[1280,720],x=>x.processing.fullNativeSequence=false,
    x=>x.processing.sourceDecodePolicy='Default native input decoding.',
  ])reject(value=>change(provenance(value)));
});

test('Caschlatsch active evidence is exactly the ten original portfolio extracts with complete XR and voxel plates',()=>{
  const current=fixture();validate(current);const p=project(current,'project-caschlatsch');
  const images=[p.hero,...p.sections.flatMap(section=>section.media)];
  assert.equal(images.length,12);assert.equal(new Set(images.map(image=>image.src)).size,10);
  assert(images.every(image=>image.src.includes('/portfolio-')));
  assert(images.every(image=>!image.src.endsWith('/workflow.webp')&&!image.caption.includes('Design, fabrication and assembly')));
  assert.deepEqual(p.sections.map(section=>[section.id,section.media.length]),[['context',1],['system',3],['xr-guidance',4],['making',2],['results',1]]);
  for(const name of ['portfolio-voxel-framework','portfolio-module-infill','portfolio-xr-assembly-sequence','portfolio-xr-data-exchange','portfolio-xr-interface'])assert(images.some(image=>image.src.endsWith('/'+name+'.webp')));
});

test('Dot second-generation delivery cannot lose input, quality or lossy provenance',()=>{
 const id='dot-based-3d-printing',clip='printing-process-motion';
 reject(current=>{provenance(current,id,clip).processing.inputDerivative.sha256='0'.repeat(64);});
 reject(current=>{provenance(current,id,clip).processing.quality.reference='Original GIF';});
 reject(current=>{provenance(current,id,clip).processing.decodedFramesByteExact=true;});
 reject(current=>{provenance(current,id,clip).processing.transcodeRecipe.resize=[1280,668];});
 reject(current=>{current.manifest.assets=current.manifest.assets.filter(asset=>!asset.path.endsWith('/printing-process-motion.mp4'));});
});
