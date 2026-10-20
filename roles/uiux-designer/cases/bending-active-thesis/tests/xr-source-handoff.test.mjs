import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const assetRoot=new URL('../release/public/',import.meta.url);
const study=JSON.parse(await readFile(new URL('../release/xr-study.json',import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const sourceBounds={min:[-.6986924409866333,.008801741525530815,-3.6913561820983887],max:[.8051480054855347,1.6584364175796509,-2.1224451065063477]};
// Independently packed by a second read of the owner-designated original
// only_interior.3dm (SHA256
// 52a2c77039977c612afd05d1179410927cbe0a48b83439aa55ac98a9eaef666b),
// not copied from the release manifest or calculated from the derivative.
// All 352 meshes in the two complete native assembly groups are represented;
// original mm/Z-up coordinates convert exactly once to (x,z,-y) metres/Y-up.
const sourceBuffers={
 POSITION:'a8eaae85728b528c61b7f73527a2279fb50a21fbc180fe86409864bfe2c635c6',
 NORMAL:'867f0f5ec69a471cd31fe6da0e57ed07b4ea16df4f7c3d35dc5ae683e3fcee2a',
 indices:'a72605528356011fb28ec55cc4cc2a71a70c43353e911e72ace9e1936f374489',
};

function publicPath(value){assert.match(value,/^\/assets\/xr\/[a-z0-9-]+\.(glb|mp4|webp)$/);return new URL(value.slice(1),assetRoot);}
function parseGlb(bytes){
 assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
 const jsonLength=bytes.readUInt32LE(12);assert.equal(bytes.readUInt32LE(16),0x4e4f534a);
 const document=JSON.parse(bytes.toString('utf8',20,20+jsonLength)),binaryHeader=20+jsonLength;
 assert.equal(bytes.readUInt32LE(binaryHeader+4),0x004e4942);
 const length=bytes.readUInt32LE(binaryHeader),binary=bytes.subarray(binaryHeader+8,binaryHeader+8+length);
 assert.equal(binary.length,length);assert.equal(binaryHeader+8+length,bytes.length);assert.equal(document.buffers.length,1);
 assert.equal(document.buffers[0].byteLength,binary.length);
 return {document,binary};
}
function accessor(gltf,index){
 const a=gltf.document.accessors[index],view=gltf.document.bufferViews[a.bufferView];
 assert(a&&!a.sparse&&view.buffer===0);assert(!a.normalized);
 const components={SCALAR:1,VEC3:3,VEC4:4}[a.type],size={5126:4,5125:4,5123:2}[a.componentType];
 assert(components&&size);const width=components*size,stride=view.byteStride??width,start=(view.byteOffset??0)+(a.byteOffset??0);
 assert(stride>=width&&start>=0&&start+(a.count-1)*stride+width<=gltf.binary.length);
 const packed=Buffer.alloc(a.count*width);
 for(let i=0;i<a.count;i++)gltf.binary.copy(packed,i*width,start+i*stride,start+i*stride+width);
 const get=(i,c=0)=>a.componentType===5126?packed.readFloatLE((i*components+c)*size):a.componentType===5125?packed.readUInt32LE((i*components+c)*size):packed.readUInt16LE((i*components+c)*size);
 return {...a,components,packed,get};
}

function atoms(bytes,start=0,end=bytes.length){
 const found=[];let offset=start;
 while(offset<end){
  assert(offset+8<=end);let size=bytes.readUInt32BE(offset);const type=bytes.toString('ascii',offset+4,offset+8);let header=8;
  if(size===1){assert(offset+16<=end);size=Number(bytes.readBigUInt64BE(offset+8));header=16;}
  else if(size===0)size=end-offset;
  assert(Number.isSafeInteger(size)&&size>=header&&offset+size<=end,`Invalid ${type} atom`);
  found.push({type,offset,body:offset+header,end:offset+size});offset+=size;
 }
 assert.equal(offset,end);return found;
}
function child(bytes,parent,type){const result=atoms(bytes,parent.body,parent.end).filter(atom=>atom.type===type);assert.equal(result.length,1,`Expected one ${type}`);return result[0];}
function duration(bytes,atom){
 const v=bytes[atom.body];assert(v===0||v===1);
 const scale=bytes.readUInt32BE(atom.body+(v===0?12:20));
 const ticks=v===0?bytes.readUInt32BE(atom.body+16):Number(bytes.readBigUInt64BE(atom.body+24));
 assert(scale>0&&Number.isSafeInteger(ticks));return {scale,ticks,seconds:ticks/scale};
}
function inspectMp4(bytes){
 const top=atoms(bytes),moov=top.find(atom=>atom.type==='moov'),mdat=top.find(atom=>atom.type==='mdat');
 assert(moov&&mdat&&moov.offset<mdat.offset,'Native streaming requires moov before mdat');
 const movieDuration=duration(bytes,child(bytes,moov,'mvhd'));
 const tracks=atoms(bytes,moov.body,moov.end).filter(atom=>atom.type==='trak');assert.equal(tracks.length,1,'Selected original GIFs have one silent video track');
 const track=tracks[0],mdia=child(bytes,track,'mdia'),handler=child(bytes,mdia,'hdlr');
 assert.equal(bytes.toString('ascii',handler.body+8,handler.body+12),'vide');
 const mediaDuration=duration(bytes,child(bytes,mdia,'mdhd'));
 const tkhd=child(bytes,track,'tkhd'),trackVersion=bytes[tkhd.body],matrixOffset=tkhd.body+(trackVersion===0?40:52);
 assert.deepEqual(Array.from({length:9},(_,i)=>bytes.readInt32BE(matrixOffset+i*4)),[65536,0,0,0,65536,0,0,0,1073741824],'No rotation, scale or crop can be introduced in the display matrix');
 const trackWidth=bytes.readUInt32BE(matrixOffset+36)/65536,trackHeight=bytes.readUInt32BE(matrixOffset+40)/65536;
 const stbl=child(bytes,child(bytes,mdia,'minf'),'stbl'),stsd=child(bytes,stbl,'stsd');assert.equal(bytes.readUInt32BE(stsd.body+4),1);
 const entries=atoms(bytes,stsd.body+8,stsd.end);assert.equal(entries.length,1);assert.equal(entries[0].type,'avc1');
 const entry=entries[0],width=bytes.readUInt16BE(entry.body+24),height=bytes.readUInt16BE(entry.body+26);
 assert.equal(width,trackWidth);assert.equal(height,trackHeight);
 const avc=atoms(bytes,entry.body+78,entry.end).find(atom=>atom.type==='avcC');assert(avc);assert.equal(bytes[avc.body+1],100);assert.equal(bytes[avc.body+3],32);
 const stts=child(bytes,stbl,'stts'),count=bytes.readUInt32BE(stts.body+4),sampleDurations=[];let samples=0,ticks=0;
 for(let i=0;i<count;i++){const n=bytes.readUInt32BE(stts.body+8+i*8),delta=bytes.readUInt32BE(stts.body+12+i*8);assert(n>0&&delta>0);samples+=n;ticks+=n*delta;sampleDurations.push(delta/mediaDuration.scale);}
 const stsz=child(bytes,stbl,'stsz');assert.equal(bytes.readUInt32BE(stsz.body+8),samples);assert.equal(ticks,mediaDuration.ticks);
 return {width,height,samples,movieDuration,mediaDuration,sampleDurations};
}

function webpDimensions(bytes){
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.readUInt32LE(4)+8,bytes.length);assert.equal(bytes.toString('ascii',8,12),'WEBP');
 for(let offset=12;offset+8<=bytes.length;){const kind=bytes.toString('ascii',offset,offset+4),length=bytes.readUInt32LE(offset+4),body=offset+8;
  assert(body+length<=bytes.length);
  if(kind==='VP8X')return [1+bytes.readUIntLE(body+4,3),1+bytes.readUIntLE(body+7,3)];
  if(kind==='VP8 '){assert.equal(bytes.toString('hex',body+3,body+6),'9d012a');return [bytes.readUInt16LE(body+6)&0x3fff,bytes.readUInt16LE(body+8)&0x3fff];}
  if(kind==='VP8L'){assert.equal(bytes[body],0x2f);const bits=bytes.readUInt32LE(body+1);return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1];}
  offset=body+length+(length%2);
 }
 throw Error('Missing WebP image data');
}

test('selected XR assembly retains every independently pinned original CAD coordinate, normal and quad triangle',async()=>{
 const gltf=parseGlb(await readFile(publicPath(study.model.src))),d=gltf.document;
 assert.equal(d.meshes.length,1);assert.equal(d.meshes[0].primitives.length,1);
 const p=d.meshes[0].primitives[0],position=accessor(gltf,p.attributes.POSITION),normal=accessor(gltf,p.attributes.NORMAL),indices=accessor(gltf,p.indices);
 assert.equal(position.count,96312);assert.equal(normal.count,96312);assert.equal(indices.count,190320*3);assert.equal(position.type,'VEC3');assert.equal(normal.type,'VEC3');assert.equal(indices.type,'SCALAR');
 assert.equal(position.componentType,5126);assert.equal(normal.componentType,5126);assert.equal(indices.componentType,5125);
 assert.equal(sha(position.packed),sourceBuffers.POSITION);assert.equal(sha(normal.packed),sourceBuffers.NORMAL);assert.equal(sha(indices.packed),sourceBuffers.indices);
 assert.equal(p.attributes.COLOR_0,undefined);assert.equal(p.attributes.TEXCOORD_0,undefined,'The original selected source has no UV mapping; do not invent one');
 assert.equal(d.nodes.length,1);assert.equal(d.nodes[0].mesh,0);
 assert.equal(d.nodes[0].matrix,undefined);assert.deepEqual(d.nodes[0].translation??[0,0,0],[0,0,0]);assert.deepEqual(d.nodes[0].rotation??[0,0,0,1],[0,0,0,1]);assert.deepEqual(d.nodes[0].scale??[1,1,1],[1,1,1]);
 assert(!d.animations?.length&&!d.skins?.length);assert.equal(d.asset.extras.sourceUnits,'Millimeters');assert.equal(d.asset.extras.webUnits,'Metres');assert.equal(d.asset.extras.upAxis,'Y');
 assert.equal(study.model.vertices,96312);assert.equal(study.model.triangles,190320);assert.equal(study.model.sourceObjectCount,352);assert.equal(study.model.materialCount,1);
 assert.equal(study.model.sourceUnits,'Millimeters');assert.equal(study.model.webUnits,'Metres');
 assert.deepEqual(study.model.conversionMatrixRowMajor,[.001,0,0,0,0,0,.001,0,0,-.001,0,0,0,0,0,1]);
});

test('the complete CAD assembly has finite original topology, source proportions and documented source layer material',async()=>{
 const gltf=parseGlb(await readFile(publicPath(study.model.src))),d=gltf.document,p=d.meshes[0].primitives[0];
 const positions=accessor(gltf,p.attributes.POSITION),normals=accessor(gltf,p.attributes.NORMAL),indices=accessor(gltf,p.indices);
 assert.equal(normals.count,positions.count);const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
 for(let i=0;i<positions.count;i++){
  let normalLength=0;
  for(let axis=0;axis<3;axis++){const x=positions.get(i,axis),n=normals.get(i,axis);assert(Number.isFinite(x)&&Number.isFinite(n));bounds.min[axis]=Math.min(bounds.min[axis],x);bounds.max[axis]=Math.max(bounds.max[axis],x);normalLength+=n*n;}
  assert(Math.abs(normalLength-1)<1e-5);
 }
 assert.deepEqual(bounds,sourceBounds);assert.deepEqual(study.model.bounds,sourceBounds);
 assert.deepEqual(study.model.sourceNumericBounds,{min:[-698.6924277924354,2122.445103259912,8.801741500973304],max:[805.148010383042,3691.3561153468668,1658.436355634141]});
 for(let i=0;i<indices.count;i+=3){const face=[indices.get(i),indices.get(i+1),indices.get(i+2)];assert(face.every(index=>index>=0&&index<positions.count));assert.equal(new Set(face).size,3);
  const [a,b,c]=face.map(index=>[0,1,2].map(axis=>positions.get(index,axis))),u=b.map((v,k)=>v-a[k]),v=c.map((x,k)=>x-a[k]);
  const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];assert(cross.reduce((sum,x)=>sum+x*x,0)>1e-18);
 }
 assert.equal(d.materials.length,1);const material=d.materials[p.material];assert.equal(material.alphaMode??'OPAQUE','OPAQUE');assert.equal(material.doubleSided,true);assert.equal(material.pbrMetallicRoughness.metallicFactor,0);assert.equal(material.pbrMetallicRoughness.roughnessFactor,1);
 const toLinear=value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
 assert.deepEqual(material.pbrMetallicRoughness.baseColorFactor,[225,196,153].map(value=>toLinear(value/255)).concat(1),'Original source layer diffuse225/196/153 and opaque opacity are retained');
 assert.equal(material.pbrMetallicRoughness.baseColorTexture,undefined);assert.equal(d.textures,undefined);
});

const originalClips=[{id:'adapt',width:666,height:1440,frames:130,seconds:13,frameSeconds:.1},{id:'assemble',width:534,height:1152,frames:312,seconds:24.96,frameSeconds:.08},{id:'join',width:666,height:1440,frames:203,seconds:20.3,frameSeconds:.1}];
for(const original of originalClips)test(`${original.id} MP4 preserves complete source GIF timing, frame count and native screen dimensions`,async()=>{
 const stage=study.phoneStages.find(item=>item.id===original.id);assert(stage);
 const movie=inspectMp4(await readFile(publicPath(stage.src)));
 assert.equal(movie.width,original.width);assert.equal(movie.height,original.height);assert.equal(movie.samples,original.frames);
 assert(Math.abs(movie.movieDuration.seconds-original.seconds)<.001);assert(Math.abs(movie.mediaDuration.seconds-original.seconds)<.001);
 assert(Math.abs(movie.mediaDuration.seconds/movie.samples-original.frameSeconds)<1e-9);
 assert(movie.sampleDurations.every(seconds=>Math.abs(seconds-original.frameSeconds)<1e-9),'Every encoded frame must retain its original GIF presentation duration');
 assert.equal(stage.width,original.width);assert.equal(stage.height,original.height);assert.equal(stage.durationSeconds,original.seconds);
 assert.deepEqual(webpDimensions(await readFile(publicPath(stage.poster.src))),[original.width,original.height]);
 assert.equal(stage.poster.width,original.width);assert.equal(stage.poster.height,original.height);
});

test('latest-portfolio visual and all selected full-frame research figures agree with their actual public image headers',async()=>{
 assert.equal(study.schemaVersion,2);assert.equal(study.title,'An Extended-Reality App Using Motion Capture for Bending-Active Structure');
 assert.equal(study.hero.src,'/assets/xr/portfolio-main-visual.webp');assert.deepEqual(webpDimensions(await readFile(publicPath(study.hero.src))),[2000,1125]);
 assert.equal(study.model.poster.src,'/assets/xr/xr-research-assembly-poster.webp');
 assert.equal(sha(await readFile(publicPath(study.model.poster.src))),'c5297673fdbe7316157e1b21b76127c05eb9129fc3f3298d30bbb3ba329f4c59','Approved source-derived poster has the same handedness as the live Three view');
 assert.equal(study.model.poster.sha256,'c5297673fdbe7316157e1b21b76127c05eb9129fc3f3298d30bbb3ba329f4c59');
 for(const item of [study.hero,...['adaptiveMethod','communication','dataCategories','physicalCapture','physicalAssembly','physicalResult'].map(key=>study.media[key]),study.model.poster]){
  assert(item.alt);assert.deepEqual(webpDimensions(await readFile(publicPath(item.src))),[item.width,item.height]);
 }
 assert.deepEqual(study.phoneStages.map(item=>item.id),['adapt','assemble','join']);
 assert.deepEqual(study.authors,['Chia-Hsuan Chao','Wataru Nomura']);
 assert.match(study.sourceNote,/\bI\b/);assert.match(study.sourceNote,/Wataru Nomura/);
 assert.doesNotMatch(study.sourceNote,/portfolio|VerFacade|Individual media authorship is not assigned/i,'Public prose states the reviewed contribution and collaborators directly');
});
