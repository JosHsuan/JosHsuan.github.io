// Add one scalar attribute, preserving all existing geometry views byte-for-byte.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {MeshoptEncoder} from '../../../node_modules/.pnpm/meshoptimizer@1.1.1/node_modules/meshoptimizer/meshopt_encoder.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const [input,labelFile,output,receipt]=process.argv.slice(2);
assert(input&&labelFile&&output&&receipt,'Explicit original, labels, output and receipt required');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=await fs.readFile(input),labels=await fs.readFile(labelFile);
const familyRecord=JSON.parse(await fs.readFile(labelFile.replace(/\.[^.]+$/,'.json'),'utf8'));
const attribute=familyRecord.attribute??{name:'_SURFACE_FAMILY',type:'SCALAR',components:1},count=familyRecord.vertices,stride=attribute.components*4;
assert.equal(sha(original),familyRecord.originalSHA256??'3dbd3909d3eca07c765aa77f070231d3b0830b5de534f6520cce79138d86d382');
assert.equal(labels.length,count*stride);
const size=original.readUInt32LE(12),gltf=JSON.parse(original.subarray(20,20+size)),binary=original.subarray(28+size);
const originalViews=structuredClone(gltf.bufferViews),originalAccessors=structuredClone(gltf.accessors);
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const encoded=MeshoptEncoder.encodeGltfBuffer(labels,count,stride,'ATTRIBUTES',0),decoded=new Uint8Array(labels.length);
MeshoptDecoder.decodeGltfBuffer(decoded,count,stride,encoded,'ATTRIBUTES');assert.equal(Buffer.compare(labels,decoded),0);
const viewIndex=gltf.bufferViews.length,accessorIndex=gltf.accessors.length;
gltf.bufferViews.push({buffer:1,byteOffset:gltf.buffers[1].byteLength,byteLength:labels.length,target:34962,
 extensions:{EXT_meshopt_compression:{buffer:0,byteOffset:binary.length,byteLength:encoded.length,byteStride:stride,count,mode:'ATTRIBUTES'}}});
gltf.accessors.push({bufferView:viewIndex,componentType:5126,count,type:attribute.type,...(attribute.name==='_SURFACE_FAMILY'?{min:[0],max:[familyRecord.families.length-1]}:{})});
gltf.meshes[0].primitives[0].attributes[attribute.name]=accessorIndex;
gltf.meshes[0].extras=familyRecord.families?{surfaceFamilies:familyRecord.families,materialEvidence:'Photo-reviewed component families; no geometry alteration'}:{fiberAxes:familyRecord.fiberAxes,materialEvidence:'Photo-reviewed surface direction and families; no geometry alteration'};
gltf.materials[0].name=familyRecord.families?'Photo-reviewed machine component surfaces':'Photo-reviewed source-axis timber surface';
const body=Buffer.concat([binary,encoded,Buffer.alloc((-encoded.length>>>0)%4)]);
gltf.buffers[0].byteLength=body.length;gltf.buffers[1].byteLength+=labels.length;
assert.deepEqual(gltf.bufferViews.slice(0,viewIndex),originalViews);assert.deepEqual(gltf.accessors.slice(0,accessorIndex),originalAccessors);
assert.equal(Buffer.compare(body.subarray(0,binary.length),binary),0);
const json=Buffer.from(JSON.stringify(gltf)),jsonChunk=Buffer.concat([json,Buffer.alloc((-json.length>>>0)%4,32)]),header=Buffer.alloc(20),binHeader=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+jsonChunk.length+body.length,8);header.writeUInt32LE(jsonChunk.length,12);header.write('JSON',16);binHeader.writeUInt32LE(body.length);binHeader.write('BIN\0',4);
const result=Buffer.concat([header,jsonChunk,binHeader,body]);await fs.writeFile(output,result);
const proof=[];
for(const [i,view]of originalViews.entries()){
 const e=view.extensions.EXT_meshopt_compression,b=new Uint8Array(view.byteLength);
 MeshoptDecoder.decodeGltfBuffer(b,e.count,e.byteStride,binary.subarray(e.byteOffset,e.byteOffset+e.byteLength),e.mode);
 proof.push({bufferView:i,decodedSHA256:sha(b),compressedBytesUnchanged:true});
}
const record={passed:true,original:{bytes:original.length,sha256:sha(original)},derivative:{bytes:result.length,sha256:sha(result)},
 originalGeometryViewsAndAccessorsUnchanged:true,originalCompressedBodyUnchanged:true,originalSourceUnchanged:true,
 addedAttribute:{name:attribute.name,count,bytes:labels.length,encodedBytes:encoded.length,sha256:sha(labels),decodedByteExact:true},
 buffers:proof,...familyRecord};
await fs.writeFile(receipt,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
