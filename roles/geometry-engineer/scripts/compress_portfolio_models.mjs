// Offline, explicit source-to-output conversion. No simplification or reorder.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {MeshoptEncoder} from '../../../node_modules/.pnpm/meshoptimizer@1.1.1/node_modules/meshoptimizer/meshopt_encoder.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';

const [input, output, metadataPath, receiptPath] = process.argv.slice(2);
assert(input && output && metadataPath && receiptPath, 'Explicit input, output, metadata and receipt paths required');
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const raw = await fs.readFile(input), jsonSize = raw.readUInt32LE(12);
const gltf = JSON.parse(raw.subarray(20, 20 + jsonSize));
assert(!gltf.extensionsUsed, 'Expected raw reviewed GLB input');
const binary = raw.subarray(28 + jsonSize), parts = [], proof = [];
let size = 0;
for (let i = 0; i < gltf.bufferViews.length; i++) {
  const view = gltf.bufferViews[i], original = binary.subarray(view.byteOffset, view.byteOffset + view.byteLength);
  const stride = [12, 12, 4, 8][i], mode = i === 2 ? 'INDICES' : 'ATTRIBUTES', count = original.length / stride;
  assert(Number.isSafeInteger(count));
  const encoded = MeshoptEncoder.encodeGltfBuffer(original, count, stride, mode, 0);
  const decoded = new Uint8Array(original.length);
  MeshoptDecoder.decodeGltfBuffer(decoded, count, stride, encoded, mode);
  assert.equal(Buffer.compare(original, decoded), 0, 'Every decoded original byte must match, including index order');
  const extension = {buffer: 0, byteOffset: size, byteLength: encoded.length, byteStride: stride, count, mode};
  const padding = Buffer.alloc((-encoded.length >>> 0) % 4);
  parts.push(encoded, padding); size += encoded.length + padding.length;
  proof.push({bufferView: i, mode, bytes: original.length, encodedBytes: encoded.length, decodedByteExact: true,
    sha256: crypto.createHash('sha256').update(original).digest('hex')});
  view.buffer = 1; view.extensions = {EXT_meshopt_compression: extension};
}
gltf.extensionsUsed = ['EXT_meshopt_compression']; gltf.extensionsRequired = ['EXT_meshopt_compression'];
gltf.buffers = [{byteLength: size}, {byteLength: binary.length, extensions: {EXT_meshopt_compression: {fallback: true}}}];
const json = Buffer.from(JSON.stringify(gltf)), jsonPadding = Buffer.alloc((-json.length >>> 0) % 4, 32);
const body = Buffer.concat(parts), jsonChunk = Buffer.concat([json, jsonPadding]);
const header = Buffer.alloc(20); header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + jsonChunk.length + body.length, 8); header.writeUInt32LE(jsonChunk.length, 12); header.write('JSON', 16);
const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(body.length); binHeader.write('BIN\0', 4);
const result = Buffer.concat([header, jsonChunk, binHeader, body]);
const sha256 = crypto.createHash('sha256').update(result).digest('hex');
await fs.writeFile(output, result);
const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
metadata.bytes = result.length; metadata.sha256 = sha256;
metadata.processing.compression = {encoding: 'EXT_meshopt_compression v0', decodedByteExact: true, quantization: false, reorder: false};
await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
await fs.writeFile(receiptPath, JSON.stringify({passed: true, encoder: 'meshoptimizer 1.1.1', decoder: 'Three 0.186.1 bundled MeshoptDecoder',
  originalBytes: raw.length, compressedBytes: result.length, sha256, noQuantization: true, noReorder: true, buffers: proof}, null, 2) + '\n');
console.log(JSON.stringify({output, originalBytes: raw.length, compressedBytes: result.length, sha256, allBuffersByteExact: true}));
