import assert from 'node:assert/strict';

export const PROJECT_SLUGS=['mode-s-of-making','entrance-installation-art','dot-based-3d-printing','hc3dp-caustics','special-assemblies','project-caschlatsch'];
const text=(value,name)=>assert(typeof value==='string'&&value.trim().length>0,`Missing project ${name}`);
export const PROJECT_MOTION_SPECS=Object.freeze({
  'mode-s-of-making':{id:'film-machine-simulation',chapter:'making',loop:true,width:4096,height:2304,sourceWidth:4096,sourceHeight:2304,frameCount:120,durationSeconds:4.8,file:'cube.mp4',bytes:3454875,sha256:'341abcbfbb58e3a3861bd1acfe8ffb904a65a260926a808ac4379c6363e3ed3e',finalTicks:2000,timeBase:'1/50000',posterFrame:60,remux:true,pixelFormat:'yuv420p',colorRange:'tv/limited'},
  'entrance-installation-art':{id:'installation-lighting-motion',chapter:'results',loop:true,width:540,height:960,sourceWidth:540,sourceHeight:960,frameCount:662,durationSeconds:22.066666666666666,file:'657032932.686244.mp4',bytes:5232787,sha256:'a14c83ff6d9d40d9f4c175121d483e2c21cc9c56c5f3de5a86738331a090fe7e',finalTicks:20,timeBase:'1/600',posterFrame:330,remux:true,pixelFormat:'yuvj420p',colorRange:'pc/full'},
  'dot-based-3d-printing':{id:'printing-process-motion',chapter:'making',loop:true,width:2500,height:1304,sourceWidth:2500,sourceHeight:1304,frameCount:27,durationSeconds:4.4,file:'image61.gif',bytes:40264322,sha256:'61a575b1c3863cb6b1becbef6cf9c7fa279778deccc94f3dfea30c26739fac68',finalTicks:13,timeBase:'1/100',posterFrame:0,remux:false,gifLoop:0,container:{file:'JosHsuan_Group01_PrintingArchitecture.pptx',bytes:131691431,sha256:'30f048ec92f7e539d5ffbc9fc51c54fa573674ee0424ed3d6b614aac3f68e117',slide:10,zipMember:'ppt/media/image61.gif',byteExactExtractedMember:true}},
  'hc3dp-caustics':{id:'fabrication-path-motion',chapter:'making',loop:true,width:2308,height:2500,sourceWidth:2307,sourceHeight:2500,frameCount:31,durationSeconds:2.17,file:'image68.gif',bytes:3033958,sha256:'f69592248ba9e63c044d87dc5ed5978f2c3acb57960d402361c4908509cdafc5',finalTicks:7,timeBase:'1/100',posterFrame:30,remux:false,gifLoop:0,container:{file:'Final Presentation Group-Red.pptx',bytes:112035652,sha256:'9016edfcd197cf268531f4074c6c26bd420fd581fb8783944e33b440c622ff55',slide:14,zipMember:'ppt/media/image68.gif',byteExactExtractedMember:true}},
  'special-assemblies':{id:'robot-assembly-motion',chapter:'making',loop:false,width:2508,height:1268,sourceWidth:2508,sourceHeight:1267,frameCount:108,durationSeconds:7.56,file:'animationfinal.gif',bytes:5945917,sha256:'34552b023b813144da97eb3b50acb5e066302110d6c4bba773f04ee23f6f02de',finalTicks:7,timeBase:'1/100',posterFrame:36,remux:false,gifLoop:null},
});

function assertMotionSelection(media,projectId){
  const spec=PROJECT_MOTION_SPECS[projectId];assert(spec,'Only five source-reviewed project motions');
  for(const key of ['id','chapter','loop','width','height','frameCount'])assert.equal(media[key],spec[key],`Reviewed motion ${key}: ${projectId}`);
  assert.equal(media.src,`/assets/projects/${projectId}/${spec.id}.mp4`);
  assert(Number.isFinite(media.durationSeconds)&&Math.abs(media.durationSeconds-spec.durationSeconds)<1e-6,'Reviewed complete motion duration');
  for(const key of ['alt','caption','credit'])text(media[key],`motion ${key}`);
  if(['mode-s-of-making','hc3dp-caustics','special-assemblies'].includes(projectId))assert.match(media.caption,/simulation/i,'Source-authored simulation remains explicitly labelled');
  assert(media.poster&&media.poster.width===spec.sourceWidth&&media.poster.height===spec.sourceHeight,'Motion poster preserves native source dimensions');
  return spec;
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
    assert.equal(motions.length,PROJECT_MOTION_SPECS[project.id]?1:0,'One selected motion per approved project; Caschlatsch stays still');
    for(const media of motions){
      assertMotionSelection(media,project.id);
      assert(ids.includes(media.chapter),'Motion belongs to an actual source chapter');
      const pin=pins.get(media.src);assert(pin&&Number.isInteger(pin.bytes)&&pin.bytes>0&&/^[a-f0-9]{64}$/.test(pin.sha256),'Selected motion has a release pin');
    }
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
  assert.equal(motions.length,5,'Exactly five reviewed source-motion provenance rows');
  assert.equal(new Set(motions.map(media=>media.src)).size,5,'Unique motion provenance');
  assert.deepEqual(motions.map(media=>media.projectId).sort(),Object.keys(PROJECT_MOTION_SPECS).sort(),'Exactly the five selected motion sources');
  if(selectedMotion)assert.deepEqual(motions.map(media=>media.src).sort(),selectedMotion.map(media=>media.src).sort(),'Selected motion and provenance correspond one to one');
  for(const media of motions){
    const selected=selectedMotion?.find(item=>item.src===media.src),expected=PROJECT_MOTION_SPECS[media.projectId];
    const spec=assertMotionSelection(selected??{...media,poster:{width:expected?.sourceWidth,height:expected?.sourceHeight}},media.projectId);
    assert.equal(media.src,'/'+media.path);
    const pin=pins.get(media.path);assert(pin&&pin.bytes===media.bytes&&pin.sha256===media.sha256,'Motion provenance matches release pin');
    for(const key of ['id','chapter','width','height','frameCount','durationSeconds','loop'])assert.equal(media[key],(selected??spec)[key],`Motion provenance ${key} matches selection`);
    const source=media.source,processing=media.processing;
    for(const key of ['file','bytes','sha256'])assert.equal(source[key],spec[key],`Reviewed original motion source ${key}`);
    text(source.sourceMeaning,'motion source meaning');assert.equal(source.sourceUnchangedSHA256BeforeAfter,true);
    assert.deepEqual(source.container,spec.container,'Exact reviewed PPTX container and member');
    assert.equal(source.intrinsicGIFLoopExtension,spec.gifLoop??null);
    text(source.loopPolicy,'source loop policy');text(media.credit,'motion attribution');text(media.rightsBasis,'scoped motion authorization');
    assert.equal(processing.fullNativeSequence,true);
    for(const key of ['crop','trim','retime','resize'])assert.equal(processing[key],null,`No motion ${key}`);
    assert.equal(processing.upscaled,false);assert.equal(processing.geometryDeformation,false);
    const right=spec.width-spec.sourceWidth,bottom=spec.height-spec.sourceHeight;
    assert([right,bottom].every(value=>value===0||value===1),'Only a bounded one-pixel codec pad');
    assert.deepEqual(processing.pad,{rightPixels:right,bottomPixels:bottom,color:right||bottom?'white':null,sourcePixelBounds:{x:0,y:0,width:spec.sourceWidth,height:spec.sourceHeight}},'Complete native pixel bounds preserved');
    for(const key of ['frameCountExact','allFramePTSExact','allFrameDurationsExact','finalFrameDurationExact','absolutePTSOriginUnchanged','faststartVerified','noChapterAdvanceOnEnded'])assert.equal(processing[key],true,`Verified native motion ${key}`);
    assert.equal(processing.finalFrameDurationTicks,spec.finalTicks);assert.equal(processing.finalFrameDurationTimeBase,spec.timeBase);
    assert.equal(processing.loop,spec.loop);text(processing.loopPolicy,'motion presentation loop policy');
    if(!spec.loop)assert.match(processing.loopPolicy,/hold last frame; manual replay/,'Finite source motion holds its final frame and permits replay');
    assert.match(processing.audio,/omitted/i);assert.match(processing.metadata,/omitted/i);
    assert.equal(processing.videoCodec,'h264');assert.equal(processing.codecTag,'avc1');assert.equal(processing.transcoded,!spec.remux);
    assert.equal(processing.encodedVideoPacketsByteExact,spec.remux);assert.equal(processing.avcCExtradataByteExact,spec.remux);
    if(spec.remux){
      for(const key of ['allPacketPTSExact','allPacketDTSExact','allPacketDurationsExact','identityTrackMatrixExact','sourceColorRangePreserved'])assert.equal(processing[key],true,`Native remux preserves ${key}`);
      assert.deepEqual(processing.trackMatrix,[65536,0,0,0,65536,0,0,0,1073741824]);
      assert.equal(processing.pixelFormat,spec.pixelFormat);assert.equal(processing.colorRange,spec.colorRange);
    }else assert.equal(processing.pixelFormat,'yuv420p');
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
