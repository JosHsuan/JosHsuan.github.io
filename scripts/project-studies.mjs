import assert from 'node:assert/strict';

export const PROJECT_SLUGS=['mode-s-of-making','entrance-installation-art','dot-based-3d-printing','hc3dp-caustics','special-assemblies','project-caschlatsch'];
const text=(value,name)=>assert(typeof value==='string'&&value.trim().length>0,`Missing project ${name}`);

/** Selected public records only. The build never traverses preparation sources. */
export function assertProjectStudies(record,manifest){
  assert.equal(record.schemaVersion,1);
  assert.deepEqual(record.projects.map(project=>project.slug),PROJECT_SLUGS,'Exactly the six owner-selected studies, in their requested order');
  const pins=new Map(manifest.assets.map(asset=>['/'+asset.path,asset]));
  const images=[];
  for(const project of record.projects){
    assert.equal(project.id,project.slug);
    for(const key of ['title','shortTitle','subtitle','summary','category','metadataTitle','metadataDescription','context','yearLabel','role','sourceNote'])text(project[key],key);
    assert.equal(project.sections.length,4,'Four evidence-backed chapters plus opening and credits');
    const ids=project.sections.map(section=>section.id);
    assert.equal(new Set(ids).size,ids.length);
    for(const section of project.sections){
      assert.match(section.id,/^[a-z][a-z-]+$/);assert(!['overview','credits'].includes(section.id));
      for(const key of ['label','kind','title'])text(section[key],key);
      assert(['form','system','make'].includes(section.kind));
      assert(section.paragraphs.length>0);section.paragraphs.forEach(paragraph=>text(paragraph,'paragraph'));
      assert(section.media.length>0,'Every chapter has actual source evidence');
    }
    for(const image of [project.hero,...project.sections.flatMap(section=>section.media)]){
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
      for(let i=0;i<3;i++)assert(Number.isFinite(model.bounds.min[i])&&Number.isFinite(model.bounds.max[i])&&model.bounds.max[i]>model.bounds.min[i]);
      assert([project.hero,...project.sections.flatMap(section=>section.media)].some(image=>image.src===model.poster.src),'Model fallback uses this project\'s selected source image');
    }
  }
  const publicText=JSON.stringify(record);
  assert(!/portfolio-preparation|[A-Z]:[\\/]|sourceObjectId|NDA|\.3dm\b|\.psd\b/.test(publicText),'No private preparation or native source payload');
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
  assert(!/portfolio-preparation|[A-Z]:[\\/]/.test(JSON.stringify(record)),'No private source paths in public provenance');
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
