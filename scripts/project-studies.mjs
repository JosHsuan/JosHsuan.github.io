import assert from 'node:assert/strict';

export const PROJECT_SLUGS=['mode-s-of-making','entrance-installation-art','dot-based-3d-printing','hc3dp-caustics','special-assemblies','project-caschlatsch'];
const text=(value,name)=>assert(typeof value==='string'&&value.trim().length>0,`Missing project ${name}`);
const freezeReview=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freezeReview);Object.freeze(value);}return value;};
const reviewedMotions=specs=>freezeReview(specs);
const motionIdentity=media=>JSON.stringify([media.projectId,media.id]);
export const PROJECT_MOTION_SPECS=Object.freeze({
  'mode-s-of-making':reviewedMotions([
    {"id":"film-machine-simulation","chapter":"making","loop":true,"width":1920,"height":1080,"frameCount":120,"durationSeconds":4.8,"kind":"simulation","sourceWidth":4096,"sourceHeight":2304,"file":"cube.mp4","bytes":3454875,"sha256":"341abcbfbb58e3a3861bd1acfe8ffb904a65a260926a808ac4379c6363e3ed3e","finalTicks":2000,"timeBase":"1/50000","posterFrame":60,"remux":false,"pixelFormat":"yuv420p","colorRange":"tv/limited","webDelivery":true,"outputBytes":498303,"outputSHA256":"522911028b4c3956b2376b1dad470534813f2d12c4ae20c7b73a4cc3ad3877eb","timestampRebase":{"offsetTicks":-2000,"timeBase":"1/50000"},"resize":{"from":[4096,2304],"to":[1920,1080],"method":"Lanczos","uniformScale":0.46875},"transcodeRecipe":{"encoder":"libx264","crf":21,"preset":"slow","profile":"High","level":41,"bFrames":3,"refs":4,"keyframeInterval":60,"minimumKeyframeInterval":30,"resize":[1920,1080]},"qualityReceipt":{"metric":"SSIM","comparedFrames":120,"mean":0.9996269583333334,"minimumFrame":0.999477,"maximumFrame":0.999786,"statsSHA256":"99286cf4a5df88f75c8ed29aea75ecd57512d0433e0483113bf9a11c63a04a2a","allFramesCompared":true,"reference":"Original source uniformly downsampled with the same Lanczos transform to the reviewed output size before SSIM. This is compression quality at 1080p, not a claim of native-4K pixel equality."},"sourceDecodePolicy":"ignore_editlist=1 to recover complete 120 original coded frames; original has an edit-list-discarded first frame. Constant PTS origin is normalized. Existing public remux already presents all 120 frames.","nativeFrameRate":"25/1","sourceColorSpace":"bt709","sourceColorTransfer":"bt709","sourceColorPrimaries":"bt709","posterSrc":"/assets/projects/mode-s-of-making/film-machine-motion-poster.webp","posterBytes":571200,"posterSHA256":"d059423c2fa4ce63eaad53f8630a7eab7c6a8442fce3822700ea73dc53a7b8e0"},
    {"id":"film-physical-cutting","chapter":"fabrication","loop":true,"width":1920,"height":1080,"frameCount":240,"durationSeconds":8.008,"kind":"recording","sourceWidth":1920,"sourceHeight":1080,"file":"RELAX.mov","bytes":766777591,"sha256":"54d91bf859b86b46bc5f9a4d19a16244ebcd0ff8f4b46e4d51ce22d778a9e789","finalTicks":1001,"timeBase":"1/30000","posterFrame":150,"remux":false,"pixelFormat":"yuv420p","colorRange":"tv/limited","webDelivery":true,"outputBytes":3167168,"outputSHA256":"6e520ca2063a839d7ec4fcd27011301971af0f587f737cb28b5814ee964b4ac1","timestampRebase":{"offsetTicks":-90090,"timeBase":"1/30000"},"resize":null,"transcodeRecipe":{"encoder":"libx264","crf":25,"preset":"slow","profile":"High","level":41,"bFrames":3,"refs":4,"keyframeInterval":60,"minimumKeyframeInterval":30,"resize":null},"qualityReceipt":{"metric":"SSIM","comparedFrames":240,"mean":0.990176625,"minimumFrame":0.985469,"maximumFrame":0.996902,"statsSHA256":"330cadc4bbcc5ec5d18045f3ddabbf24af8befbab24001dff305b30117f767e6","allFramesCompared":true,"reference":"Original native-size selected source frames."},"sourceDecodePolicy":"Default native input decoding.","nativeFrameRate":"30000/1001","sourceColorSpace":"bt709","sourceColorTransfer":"bt709","sourceColorPrimaries":"bt709","sourceInterval":{"startFrame":90,"endFrameExclusive":330,"sourceFrameCount":3603,"startPTSTicks":90090,"endPTSTicks":330330,"timeBase":"1/30000"},"posterSrc":"/assets/projects/mode-s-of-making/film-physical-cutting-poster.webp","posterBytes":336130,"posterSHA256":"69ac4d151f485784a6a56a3c9029fb1caf5c5a08a199842309c2acdf5264f6f9"},
    {"id":"prototype-cutting-operation","chapter":"cutting","loop":true,"width":1920,"height":1080,"frameCount":200,"durationSeconds":8.0,"kind":"recording","sourceWidth":1920,"sourceHeight":1080,"file":"MVI_9109.MOV","bytes":119726396,"sha256":"0dfff18451db42602266d07fbdce50ef24f3e7aa87f62ca0c54a344ff18c841b","finalTicks":1000,"timeBase":"1/25000","posterFrame":250,"remux":false,"pixelFormat":"yuvj420p","colorRange":"pc/full","webDelivery":true,"outputBytes":3176212,"outputSHA256":"dd5ad72944afc12d00fa6ab3456cf7369e003455ee242d0d7f4c0f9813e0209d","timestampRebase":{"offsetTicks":-150000,"timeBase":"1/25000"},"resize":null,"transcodeRecipe":{"encoder":"libx264","crf":23,"preset":"slow","profile":"High","level":41,"bFrames":3,"refs":4,"keyframeInterval":60,"minimumKeyframeInterval":30,"resize":null},"qualityReceipt":{"metric":"SSIM","comparedFrames":200,"mean":0.988161265,"minimumFrame":0.985489,"maximumFrame":0.992829,"statsSHA256":"50b71294a2642a23d7aa28ef89617f8203e9c3f78953b1350db7683d00ce8a3f","allFramesCompared":true,"reference":"Original native-size selected source frames."},"sourceDecodePolicy":"Default native input decoding.","nativeFrameRate":"25/1","sourceColorSpace":"smpte170m","sourceColorTransfer":"bt709","sourceColorPrimaries":"bt709","sourceInterval":{"startFrame":150,"endFrameExclusive":350,"sourceFrameCount":522,"startPTSTicks":150000,"endPTSTicks":350000,"timeBase":"1/25000"},"posterSrc":"/assets/projects/mode-s-of-making/prototype-cutting-operation-poster.webp","posterBytes":602534,"posterSHA256":"5aa9e9845fee86fbfc1f9ee90279a63d908d47118ab51445cc705844294eec2b"},
  ]),
  'entrance-installation-art':reviewedMotions([{id:'installation-lighting-motion',kind:'recording',chapter:'results',loop:true,width:540,height:960,sourceWidth:540,sourceHeight:960,frameCount:662,durationSeconds:22.066666666666666,file:'657032932.686244.mp4',bytes:5232787,sha256:'a14c83ff6d9d40d9f4c175121d483e2c21cc9c56c5f3de5a86738331a090fe7e',finalTicks:20,timeBase:'1/600',posterFrame:330,remux:true,pixelFormat:'yuvj420p',colorRange:'pc/full'}]),
  'dot-based-3d-printing':reviewedMotions([{id:'printing-process-motion',kind:'recording',chapter:'making',loop:true,width:2500,height:1304,sourceWidth:2500,sourceHeight:1304,frameCount:27,durationSeconds:4.4,file:'image61.gif',bytes:40264322,sha256:'61a575b1c3863cb6b1becbef6cf9c7fa279778deccc94f3dfea30c26739fac68',finalTicks:13,timeBase:'1/100',posterFrame:0,remux:false,gifLoop:0,container:{file:'JosHsuan_Group01_PrintingArchitecture.pptx',bytes:131691431,sha256:'30f048ec92f7e539d5ffbc9fc51c54fa573674ee0424ed3d6b614aac3f68e117',slide:10,zipMember:'ppt/media/image61.gif',byteExactExtractedMember:true}}]),
  'hc3dp-caustics':reviewedMotions([{id:'fabrication-path-motion',kind:'simulation',chapter:'making',loop:true,width:2308,height:2500,sourceWidth:2307,sourceHeight:2500,frameCount:31,durationSeconds:2.17,file:'image68.gif',bytes:3033958,sha256:'f69592248ba9e63c044d87dc5ed5978f2c3acb57960d402361c4908509cdafc5',finalTicks:7,timeBase:'1/100',posterFrame:30,remux:false,gifLoop:0,container:{file:'Final Presentation Group-Red.pptx',bytes:112035652,sha256:'9016edfcd197cf268531f4074c6c26bd420fd581fb8783944e33b440c622ff55',slide:14,zipMember:'ppt/media/image68.gif',byteExactExtractedMember:true}}]),
  'special-assemblies':reviewedMotions([{id:'robot-assembly-motion',kind:'simulation',chapter:'making',loop:false,width:2508,height:1268,sourceWidth:2508,sourceHeight:1267,frameCount:108,durationSeconds:7.56,file:'animationfinal.gif',bytes:5945917,sha256:'34552b023b813144da97eb3b50acb5e066302110d6c4bba773f04ee23f6f02de',finalTicks:7,timeBase:'1/100',posterFrame:36,remux:false,gifLoop:null}]),
});

function assertMotionSelection(media,projectId){
  const spec=PROJECT_MOTION_SPECS[projectId]?.find(spec=>spec.id===media.id);assert(spec,'Only the exact source-reviewed project and motion identity');
  for(const key of ['id','chapter','loop','width','height','frameCount'])assert.equal(media[key],spec[key],`Reviewed motion ${key}: ${projectId}`);
  assert.equal(media.src,`/assets/projects/${projectId}/${spec.id}.mp4`);
  assert(Number.isFinite(media.durationSeconds)&&Math.abs(media.durationSeconds-spec.durationSeconds)<1e-6,'Reviewed source-selection duration');
  for(const key of ['alt','caption','credit'])text(media[key],`motion ${key}`);
  if(spec.kind==='recording'&&(spec.sourceInterval||spec.transcodeRecipe))assert.equal(media.kind,spec.kind,'Reviewed photographic clips retain their recording classification');
  if(media.kind!==undefined)assert.equal(media.kind,spec.kind,'Explicit motion classification matches the reviewed source');
  if(spec.kind==='simulation')assert.match(media.caption,/simulation/i,'Source-authored simulation remains explicitly labelled');
  assert(media.poster&&media.poster.width===spec.sourceWidth&&media.poster.height===spec.sourceHeight,'Motion poster preserves native source dimensions');
  if(spec.webDelivery)assert.equal(media.poster.src,spec.posterSrc,'Reviewed source poster identity remains unchanged');
  return spec;
}

/** Interval permission comes from the source-reviewed registry, never from public processing claims. */
export function assertProjectMotionSequence(processing,spec){
  for(const key of ['crop','retime'])assert.equal(processing[key],null,`No motion ${key}`);
  assert.deepEqual(processing.resize,spec.webDelivery?spec.resize:null,'Only the exact reviewed proportional web resize');
  const interval=spec.sourceInterval;
  if(spec.webDelivery){
    assert.equal(processing.fullNativeSequence,!interval,'Reviewed excerpt/full-sequence identity');
    assert.deepEqual(processing.trim,interval??null,'Exact reviewed contiguous source-frame and PTS interval');
    assert.deepEqual(processing.timestampRebase,spec.timestampRebase,'Exact reviewed constant source-PTS origin normalization');
    assert.equal(processing.absolutePTSOriginUnchanged,false,'Normalized web timestamps do not claim an unchanged absolute origin');
    assert.equal(processing.allFramePTSExact,false,'Normalized web timestamps distinguish absolute from relative PTS');
    assert.equal(processing.allRelativeFramePTSExact,true,'Every reviewed relative source presentation timestamp remains exact');
    if(interval){
      assert.equal(interval.endFrameExclusive-interval.startFrame,spec.frameCount);
      const [n,d]=interval.timeBase.split('/').map(Number);
      assert.equal(interval.timeBase,spec.timeBase);
      assert(Math.abs((interval.endPTSTicks-interval.startPTSTicks)*n/d-spec.durationSeconds)<1e-6);
    }
  }else if(interval){
    assert.deepEqual(Object.keys(interval).sort(),['endFrameExclusive','endPTSTicks','sourceFrameCount','startFrame','startPTSTicks','timeBase'].sort(),'Exact reviewed source-interval fields');
    for(const key of ['startFrame','endFrameExclusive','sourceFrameCount','startPTSTicks','endPTSTicks'])assert(Number.isSafeInteger(interval[key]),`Integral source interval ${key}`);
    assert(interval.startFrame>=0&&interval.endFrameExclusive>interval.startFrame&&interval.endFrameExclusive<=interval.sourceFrameCount,'Source interval is inside the original sequence');
    assert(interval.startFrame>0||interval.endFrameExclusive<interval.sourceFrameCount,'A source interval is a proper reviewed excerpt');
    assert.equal(interval.endFrameExclusive-interval.startFrame,spec.frameCount,'Every reviewed interval frame is retained');
    assert(interval.startPTSTicks>0&&interval.endPTSTicks>interval.startPTSTicks,'Excerpt has an explicit positive original PTS origin');
    assert.match(interval.timeBase,/^[1-9]\d*\/[1-9]\d*$/,'Reviewed source time base');
    assert.equal(interval.timeBase,spec.timeBase,'Native excerpt time base is unchanged');
    assert.equal(spec.kind,'recording','A source interval must retain its reviewed physical-recording identity');
    assert.equal(spec.remux,true,'Reviewed source excerpts preserve the original encoded video');
    const [numerator,denominator]=interval.timeBase.split('/').map(Number);
    assert(Number.isSafeInteger(numerator)&&Number.isSafeInteger(denominator));
    assert(Math.abs((interval.endPTSTicks-interval.startPTSTicks)*numerator/denominator-spec.durationSeconds)<1e-6,'Reviewed interval duration matches native source ticks');
    assert.equal(processing.fullNativeSequence,false,'An excerpt must not claim the complete original sequence');
    assert.deepEqual(processing.trim,interval,'Only the exact reviewed source-frame and PTS interval may be selected');
    assert.deepEqual(processing.timestampRebase,{offsetTicks:-interval.startPTSTicks,timeBase:interval.timeBase},'Only the exact constant source-PTS offset is permitted');
    assert.equal(processing.absolutePTSOriginUnchanged,false,'Rebased excerpts must not claim an unchanged absolute PTS origin');
    assert.equal(processing.allFramePTSExact,false,'Rebased excerpts must distinguish absolute and relative frame PTS');
    assert.equal(processing.allRelativeFramePTSExact,true,'Every selected frame PTS is preserved relative to the reviewed origin');
    if(spec.remux){
      for(const key of ['allPacketPTSExact','allPacketDTSExact'])assert.equal(processing[key],false,'Rebased packet timestamps are not absolute source timestamps');
      for(const key of ['allRelativePacketPTSExact','allRelativePacketDTSExact'])assert.equal(processing[key],true,`Native interval remux preserves ${key}`);
    }
  }else{
    assert.equal(processing.fullNativeSequence,true);
    assert.equal(processing.trim,null,'No motion trim');
    assert.equal(processing.timestampRebase,undefined,'A complete native sequence cannot acquire an unreviewed timestamp rebase');
    for(const key of ['allFramePTSExact','absolutePTSOriginUnchanged'])assert.equal(processing[key],true,`Verified native motion ${key}`);
    if(spec.remux)for(const key of ['allPacketPTSExact','allPacketDTSExact'])assert.equal(processing[key],true,`Native remux preserves ${key}`);
  }
  for(const key of ['frameCountExact','allFrameDurationsExact','finalFrameDurationExact','faststartVerified','noChapterAdvanceOnEnded'])assert.equal(processing[key],true,`Verified native motion ${key}`);
  assert.equal(processing.finalFrameDurationTicks,spec.finalTicks);assert.equal(processing.finalFrameDurationTimeBase,spec.timeBase);
}

/** A reviewed photographic transcode is distinct from the existing GIF conversions and packet remuxes. */
export function assertProjectMotionEncoding(processing,spec){
  assert.equal(processing.videoCodec,'h264');assert.equal(processing.codecTag,'avc1');assert.equal(processing.transcoded,!spec.remux);
  assert.equal(processing.encodedVideoPacketsByteExact,spec.remux);assert.equal(processing.avcCExtradataByteExact,spec.remux);
  if(spec.webDelivery){
    for(const key of ['allPacketPTSExact','allPacketDTSExact','allPacketDurationsExact','decodedFramesByteExact'])assert.equal(processing[key],false,'Lossy reordered web samples cannot claim source packet/pixel identity');
    for(const key of ['allRelativePacketPTSExact','allRelativePacketDTSExact'])assert.equal(processing[key],undefined,'A reordered transcode cannot inherit an unreviewed packet-order proof');
    for(const key of ['identityTrackMatrixExact','sourceColorRangePreserved'])assert.equal(processing[key],true,`Reviewed web transcode preserves ${key}`);
    assert.deepEqual(processing.trackMatrix,[65536,0,0,0,65536,0,0,0,1073741824]);
    for(const key of ['pixelFormat','colorRange','nativeFrameRate','sourceColorSpace','sourceColorTransfer','sourceColorPrimaries','sourceDecodePolicy'])assert.equal(processing[key],spec[key],`Exact reviewed web transcode ${key}`);
    assert.deepEqual(processing.transcodeRecipe,spec.transcodeRecipe,'Exact reviewed web encoder and proportional resize recipe');
    assert.deepEqual(processing.quality,spec.qualityReceipt,'Exact reviewed all-frame source quality receipt');
    const quality=processing.quality;
    assert.equal(quality.comparedFrames,spec.frameCount);assert.equal(quality.allFramesCompared,true);assert.equal(quality.metric,'SSIM');
    assert([quality.minimumFrame,quality.mean,quality.maximumFrame].every(value=>Number.isFinite(value)&&value>0&&value<=1));
    assert(quality.minimumFrame<=quality.mean&&quality.mean<=quality.maximumFrame);
    assert.match(quality.statsSHA256,/^[a-f0-9]{64}$/);
    text(quality.reference,'measured web quality reference');
  }else if(spec.remux){
    for(const key of ['allPacketDurationsExact','identityTrackMatrixExact','sourceColorRangePreserved'])assert.equal(processing[key],true,`Native remux preserves ${key}`);
    assert.deepEqual(processing.trackMatrix,[65536,0,0,0,65536,0,0,0,1073741824]);
    assert.equal(processing.pixelFormat,spec.pixelFormat);assert.equal(processing.colorRange,spec.colorRange);
    assert.equal(processing.transcodeRecipe,undefined,'A native remux cannot acquire an encoding recipe');
  }else if(spec.transcodeRecipe){
    assert.equal(spec.kind,'recording','A photographic source transcode must retain its recording identity');
    assert.equal(processing.decodedFramesByteExact,false,'A lossy photographic transcode cannot claim decoded-pixel equality');
    assert.deepEqual(processing.transcodeRecipe,spec.transcodeRecipe,'Exact reviewed native-resolution encoding recipe');
    for(const key of ['allPacketPTSExact','allPacketDTSExact','allPacketDurationsExact','identityTrackMatrixExact','sourceColorRangePreserved'])assert.equal(processing[key],true,`Photographic transcode preserves ${key}`);
    assert.deepEqual(processing.trackMatrix,[65536,0,0,0,65536,0,0,0,1073741824]);
    assert.equal(processing.pixelFormat,spec.pixelFormat);assert.equal(processing.colorRange,spec.colorRange);
    const quality=processing.quality;
    assert(quality&&spec.qualityReceipt,'A photographic transcode requires a source-reviewed quality receipt');
    assert.deepEqual(quality,spec.qualityReceipt,'Exact reviewed all-frame source comparison');
    assert.equal(quality.metric,'SSIM');assert.equal(quality.comparedFrames,spec.frameCount);assert.equal(quality.allFramesCompared,true);
    assert([quality.mean,quality.minimumFrame,quality.maximumFrame].every(value=>Number.isFinite(value)&&value>0&&value<=1),'Measured native-frame SSIM scores');
    assert(quality.minimumFrame<=quality.mean&&quality.mean<=quality.maximumFrame,'Measured frame quality bounds contain the mean');
    assert.match(quality.statsSHA256,/^[a-f0-9]{64}$/,'Exact reviewed all-frame SSIM statistics hash');
  }else{
    assert.equal(processing.pixelFormat,'yuv420p');
    assert.equal(processing.transcodeRecipe,undefined,'An existing GIF conversion cannot acquire an unreviewed recording recipe');
  }
}

/** Selected public records only. The build never traverses preparation sources. */
export function assertProjectStudies(record,manifest){
  assert.equal(record.schemaVersion,1);
  assert.deepEqual(record.projects.map(project=>project.slug),PROJECT_SLUGS,'Exactly the six owner-selected studies, in their requested order');
  assert.equal(new Set(manifest.assets.map(asset=>asset.path)).size,manifest.assets.length,'Unique release pins');
  const pins=new Map(manifest.assets.map(asset=>['/'+asset.path,asset]));
  const images=[];
  for(const project of record.projects){
    assert.equal(project.id,project.slug);
    for(const key of ['title','shortTitle','subtitle','summary','category','metadataTitle','metadataDescription','context','yearLabel','role','sourceNote'])text(project[key],key);
    assert(project.sections.length>=4&&project.sections.length<=6,'Four to six source-backed story chapters plus opening and credits');
    const ids=project.sections.map(section=>section.id);
    assert.equal(new Set(ids).size,ids.length);
    for(const section of project.sections){
      assert.match(section.id,/^[a-z][a-z-]+$/);assert(!['overview','credits'].includes(section.id));
      for(const key of ['label','kind','title'])text(section[key],key);
      assert(['form','system','make'].includes(section.kind));
      assert(section.paragraphs.length>0);section.paragraphs.forEach(paragraph=>text(paragraph,'paragraph'));
      assert(section.media.length>0,'Every chapter has actual source evidence');
    }
    const motions=project.motionMedia??[];
    assert(Array.isArray(motions));
    const expectedMotions=PROJECT_MOTION_SPECS[project.id]??[];
    assert.deepEqual(motions.map(media=>media.id).sort(),expectedMotions.map(spec=>spec.id).sort(),'Exactly the reviewed motion identities for this project');
    for(const key of ['id','src','chapter'])assert.equal(new Set(motions.map(media=>media[key])).size,motions.length,`Unique project motion ${key}`);
    for(const media of motions){
      const spec=assertMotionSelection(media,project.id);
      assert(ids.includes(media.chapter),'Motion belongs to an actual source chapter');
      const pin=pins.get(media.src);assert(pin&&Number.isInteger(pin.bytes)&&pin.bytes>0&&/^[a-f0-9]{64}$/.test(pin.sha256),'Selected motion has a release pin');
      if(spec.webDelivery){assert.equal(pin.bytes,spec.outputBytes,'Exact reviewed compact video bytes');assert.equal(pin.sha256,spec.outputSHA256,'Exact reviewed compact video hash');assert(pin.bytes<=4000000,'Each Mode/s web video is at most 4 MB');assert(media.durationSeconds<=10,'Each Mode/s web video is at most ten seconds');const posterPin=pins.get(media.poster.src);assert(posterPin&&posterPin.bytes===spec.posterBytes&&posterPin.sha256===spec.posterSHA256,'Original Mode/s poster bytes remain pinned');}

    }
    if(project.id==='mode-s-of-making')assert(motions.reduce((sum,media)=>sum+pins.get(media.src).bytes,0)<=8000000,'All Mode/s web videos total at most 8 MB');
    for(const image of [project.hero,...project.sections.flatMap(section=>section.media),...motions.map(media=>media.poster)]){
      assert(image.src.startsWith(`/assets/projects/${project.slug}/`));
      assert.match(image.src,/^\/assets\/projects\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/);
      assert(Number.isInteger(image.width)&&image.width>0&&Number.isInteger(image.height)&&image.height>0);
      for(const key of ['alt','caption','credit'])text(image[key],key);
      assert(pins.has(image.src),'Selected project image is approved: '+image.src);
      images.push(image);
    }
    assert(project.credits.length>0);
    for(const credit of project.credits){text(credit.role,'credit role');text(credit.names,'credit names');}
    assert.match(project.related.href,/^\/projects\/[a-z0-9-]+\/$/);text(project.related.title,'related title');
    if(project.model){
      const model=project.model;
      assert.equal(model.src,`/assets/projects/${project.slug}/model.glb`);
      const pin=pins.get(model.src);assert(pin&&pin.bytes===model.bytes&&pin.sha256===model.sha256,'Approved project geometry: '+model.src);
      assert(['triangles','points'].includes(model.primitive??'triangles'));
      assert.equal(model.webUnits,'meters');assert.equal(model.upAxis,'Y');text(model.sourceUnits,'source units');text(model.alt,'model description');
      for(const key of ['vertices','meshes'])assert(Number.isInteger(model[key])&&model[key]>0);
      assert(Number.isInteger(model.triangles)&&model.triangles>=0);
      assert((model.primitive==='points')?model.triangles===0:model.triangles>0);
      assert(model.chapters.length>0&&new Set(model.chapters).size===model.chapters.length);
      model.chapters.forEach(id=>assert(['overview',...ids,'credits'].includes(id),'Known model chapter'));
      const order=['overview',...ids,'credits'],positions=model.chapters.map(id=>order.indexOf(id));
      assert(positions.every((position,index)=>index===0||position===positions[index-1]+1),'A model has one ordered, continuous chapter interval; it cannot return after a different background');
      if(model.views){
        assert.deepEqual(Object.keys(model.views).sort(),[...model.chapters].sort(),'Every model chapter has one reviewed camera view');
        for(const view of Object.values(model.views)){
          assert([view.yaw,view.pitch,view.fov,view.zoom].every(Number.isFinite),'Finite reviewed camera view');
          assert(Math.abs(view.yaw)<=Math.PI&&view.pitch>=-.1&&view.pitch<=1.15&&view.fov>1&&view.fov<175);
          assert(view.zoom>=1,'Reviewed camera fitting cannot crop the complete original source');
        }
      }
      for(let i=0;i<3;i++)assert(Number.isFinite(model.bounds.min[i])&&Number.isFinite(model.bounds.max[i])&&model.bounds.max[i]>model.bounds.min[i]);
      assert([project.hero,...project.sections.flatMap(section=>section.media)].some(image=>image.src===model.poster.src),'Model fallback uses this project\'s selected source image');
    }
  }
  const publicText=JSON.stringify(record);
  assert(!/portfolio-preparation|(?:^|[^A-Za-z0-9])[A-Za-z]:[\\/]|sourceObjectId|NDA|\.3dm\b|\.psd\b/.test(publicText),'No private preparation or native source payload');
  return images;
}

export function assertProjectImage(bytes,image){
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(bytes.readUInt32LE(4)+8,bytes.length);
  let dimensions=null;
  for(let offset=12;offset+8<=bytes.length;){
    const kind=bytes.toString('ascii',offset,offset+4),length=bytes.readUInt32LE(offset+4),start=offset+8;
    assert(start+length<=bytes.length);
    assert(!['EXIF','XMP ','ANIM','ANMF'].includes(kind),'No private metadata or animated replacement');
    if(kind==='VP8X')dimensions=[bytes.readUIntLE(start+4,3)+1,bytes.readUIntLE(start+7,3)+1];
    if(kind==='VP8L'){const bits=bytes.readUInt32LE(start+1);dimensions=[(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1];}
    if(kind==='VP8 '){assert.equal(bytes.toString('hex',start+3,start+6),'9d012a');dimensions=[bytes.readUInt16LE(start+6)&0x3fff,bytes.readUInt16LE(start+8)&0x3fff];}
    offset=start+length+length%2;
  }
  assert.deepEqual(dimensions,[image.width,image.height],'Actual source image dimensions: '+image.src);
}

export function assertProjectAssetRecord(record,images,manifest,studies){
  assert.equal(record.schemaVersion,1);
  assert.equal(record.primaryReference.sha256,'61f51b38fdccf712f3e9460c5fdde2b9d117d6d2bd14d6e94b4ae3f9aa08c290');
  assert.equal(record.primaryReference.pages,86);
  const selected=new Set(images.map(image=>image.src)),pins=new Map(manifest.assets.map(pin=>[pin.path,pin]));
  assert.equal(new Set(record.assets.map(asset=>asset.src)).size,record.assets.length,'Unique selected image provenance');
  assert.deepEqual([...selected].sort(),record.assets.map(asset=>asset.src).sort(),'Every published project image has provenance, with no unrelated files');
  for(const asset of record.assets){
    assert(PROJECT_SLUGS.includes(asset.projectId));assert.equal(asset.src,'/'+asset.path);
    const pin=pins.get(asset.path);assert(pin&&pin.bytes===asset.bytes&&pin.sha256===asset.sha256,'Image provenance matches release pin');
    for(const image of images.filter(image=>image.src===asset.src))assert.deepEqual([asset.width,asset.height],[image.width,image.height],'Selected image dimensions match provenance');
    assert.match(asset.source.sha256,/^[a-f0-9]{64}$/);text(asset.credit,'image attribution');
    assert.equal(asset.processing.upscaled,false,'Do not manufacture resolution by enlargement');
    const [width,height]=asset.processing.preResizePixels;
    assert(asset.width<=width&&asset.height<=height,'Output cannot exceed the selected original pixels');
    assert(Math.abs(asset.width/asset.height-width/height)<=1/asset.height+1/height,'Proportional source dimensions');
    assert(!asset.processing.metadata.includes('retained'),'Native private metadata is omitted');
  }
  const models=record.models??[];
  if(studies)assert.deepEqual(models.map(model=>model.src).sort(),studies.projects.filter(project=>project.model).map(project=>project.model.src).sort(),'Every selected model has provenance');
  assert.equal(new Set(models.map(model=>model.src)).size,models.length);
  for(const model of models){
    assert(PROJECT_SLUGS.includes(model.projectId));assert.equal(model.src,`/assets/projects/${model.projectId}/model.glb`);
    const pin=pins.get(model.src.slice(1));assert(pin&&pin.bytes===model.bytes&&pin.sha256===model.sha256,'Model provenance matches pin');
    assert.match(model.source.sha256,/^[a-f0-9]{64}$/);text(model.selection,'geometry selection');text(model.credit,'geometry attribution');
    assert.equal(model.processing.decimation,false);assert.equal(model.processing.deformation,false);
    assert.equal(model.processing.compression.decodedByteExact,true);assert.equal(model.processing.compression.quantization,false);
    assert(Number.isFinite(model.processing.maxFloat32PositionErrorMeters)&&model.processing.maxFloat32PositionErrorMeters>=0);
  }
  const motions=record.motionAssets??[],selectedMotion=studies?.projects.flatMap(project=>(project.motionMedia??[]).map(media=>({...media,projectId:project.id})));
  const expectedMotions=Object.entries(PROJECT_MOTION_SPECS).flatMap(([projectId,specs])=>specs.map(spec=>({...spec,projectId})));
  assert.equal(motions.length,expectedMotions.length,'Exactly the reviewed source-motion provenance rows');
  assert.equal(new Set(motions.map(media=>media.src)).size,motions.length,'Unique motion provenance');
  assert.equal(new Set(motions.map(motionIdentity)).size,motions.length,'Unique project and motion provenance identities');
  assert.deepEqual(motions.map(motionIdentity).sort(),expectedMotions.map(motionIdentity).sort(),'Exactly the reviewed project and motion source pairs');
  if(selectedMotion){
    assert.deepEqual(motions.map(motionIdentity).sort(),selectedMotion.map(motionIdentity).sort(),'Selected motion and provenance identities correspond one to one');
    assert.deepEqual(motions.map(media=>media.src).sort(),selectedMotion.map(media=>media.src).sort(),'Selected motion and provenance sources correspond one to one');
  }
  for(const media of motions){
    const selected=selectedMotion?.find(item=>motionIdentity(item)===motionIdentity(media)),expected=PROJECT_MOTION_SPECS[media.projectId]?.find(spec=>spec.id===media.id);
    const spec=assertMotionSelection(selected??{...media,poster:{src:expected?.posterSrc,width:expected?.sourceWidth,height:expected?.sourceHeight}},media.projectId);
    assert.equal(media.src,'/'+media.path);
    const pin=pins.get(media.path);assert(pin&&pin.bytes===media.bytes&&pin.sha256===media.sha256,'Motion provenance matches release pin');
    for(const key of ['id','chapter','width','height','frameCount','durationSeconds','loop'])assert.equal(media[key],(selected??spec)[key],`Motion provenance ${key} matches selection`);
    if(spec.kind==='recording'&&(spec.sourceInterval||spec.transcodeRecipe))assert.equal(media.kind,spec.kind,'Reviewed photographic provenance retains its recording classification');
    if(media.kind!==undefined)assert.equal(media.kind,spec.kind,'Explicit provenance classification matches the reviewed source');
    if(spec.webDelivery){assert.equal(media.bytes,spec.outputBytes,'Reviewed web output bytes');assert.equal(media.sha256,spec.outputSHA256,'Reviewed web output hash');assert(media.bytes<=4000000&&media.durationSeconds<=10,'Reviewed web delivery budget');}
    const source=media.source,processing=media.processing;
    for(const key of ['file','bytes','sha256'])assert.equal(source[key],spec[key],`Reviewed original motion source ${key}`);
    text(source.sourceMeaning,'motion source meaning');assert.equal(source.sourceUnchangedSHA256BeforeAfter,true);
    assert.deepEqual(source.container,spec.container,'Exact reviewed PPTX container and member');
    assert.equal(source.intrinsicGIFLoopExtension,spec.gifLoop??null);
    text(source.loopPolicy,'source loop policy');text(media.credit,'motion attribution');text(media.rightsBasis,'scoped motion authorization');
    assertProjectMotionSequence(processing,spec);
    assert.equal(processing.upscaled,false);assert.equal(processing.geometryDeformation,false);
    const right=spec.webDelivery?0:spec.width-spec.sourceWidth,bottom=spec.webDelivery?0:spec.height-spec.sourceHeight;
    assert([right,bottom].every(value=>value===0||value===1),'Only a bounded one-pixel codec pad');
    assert.deepEqual(processing.pad,{rightPixels:right,bottomPixels:bottom,color:right||bottom?'white':null,sourcePixelBounds:{x:0,y:0,width:spec.sourceWidth,height:spec.sourceHeight}},'Complete native pixel bounds preserved');
    assert.equal(processing.loop,spec.loop);text(processing.loopPolicy,'motion presentation loop policy');
    if(!spec.loop)assert.match(processing.loopPolicy,/hold last frame; manual replay/,'Finite source motion holds its final frame and permits replay');
    assert.match(processing.audio,/omitted/i);assert.match(processing.metadata,/omitted/i);
    assertProjectMotionEncoding(processing,spec);
    const poster=selected?.poster;
    if(poster){
      const provenance=record.assets.find(asset=>asset.src===poster.src);assert(provenance,'Reviewed motion poster provenance');
      assert.equal(provenance.processing.selectedFrame,spec.posterFrame,'Exact reviewed native poster frame');
    }
  }
  assert(!/portfolio-preparation|(?:^|[^A-Za-z0-9])[A-Za-z]:[\\/]/.test(JSON.stringify(record)),'No private source paths in public provenance');
}

export function assertProjectModel(bytes,model){
  assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
  assert.equal(bytes.readUInt32LE(16),0x4e4f534a);
  const gltf=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
  assert(!gltf.buffers.some(buffer=>buffer.uri),'Self-contained model buffers');
  assert(!(gltf.images??[]).some(image=>image.uri),'Self-contained model textures');
  let vertices=0,triangles=0,renderables=0;
  for(const node of gltf.nodes){
    if(node.mesh===undefined)continue;
    for(const primitive of gltf.meshes[node.mesh].primitives){
      const count=gltf.accessors[primitive.attributes.POSITION].count;vertices+=count;renderables++;
      if((primitive.mode??4)===4)triangles+=(primitive.indices===undefined?count:gltf.accessors[primitive.indices].count)/3;
      else assert.equal(primitive.mode,0,'Only approved source triangle or point data');
    }
  }
  assert.equal(vertices,model.vertices,'Real model position count');assert.equal(triangles,model.triangles,'Real model triangle count');assert.equal(renderables,model.meshes,'Real model renderables');
}
