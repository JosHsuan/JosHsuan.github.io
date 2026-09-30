// Input: Scan the World / Jonathan Beck, CC BY-SA 4.0. See public/licenses/thinker.md.
// The generated, simplified and Laplacian-smoothed mesh remains CC BY-SA 4.0.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

const input = await readFile('.asset-cache/thinker-source.stl')
if (createHash('sha1').update(input).digest('hex') !== '486307df3882858a36cbb5812beaf5f881b800c7') throw Error('Unexpected source scan')
let geometry = new STLLoader().parse(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength))
geometry.deleteAttribute('normal')
geometry = mergeVertices(geometry, 0.0001)
console.log('Source vertices:', geometry.attributes.position.count)
geometry = await new SimplifyModifier().modify(geometry, geometry.attributes.position.count - 26000)
geometry.rotateX(-Math.PI / 2)
geometry.computeBoundingBox()
console.log('Upright bounds:', geometry.boundingBox)
geometry.center()
const size = geometry.boundingBox.max.y - geometry.boundingBox.min.y
geometry.scale(2.5 / size, 2.5 / size, 2.5 / size)

// Explicit uniform Laplacian: x' = x + lambda * (mean(neighbours) - x).
// Mild volume loss is intentional: the source's small surface ridges soften.
const positions = geometry.attributes.position.array
const indices = geometry.index.array
const neighbours = Array.from({ length: positions.length / 3 }, () => new Set())
for (let i = 0; i < indices.length; i += 3) {
  const [a, b, c] = indices.slice(i, i + 3)
  neighbours[a].add(b).add(c); neighbours[b].add(a).add(c); neighbours[c].add(a).add(b)
}
const adjacency = neighbours.map(n => [...n])
const next = new Float32Array(positions.length)
for (let iteration = 0; iteration < 100; iteration++) {
  for (let v = 0; v < adjacency.length; v++) {
    for (let axis = 0; axis < 3; axis++) {
      let mean = 0
      for (const n of adjacency[v]) mean += positions[n * 3 + axis]
      next[v * 3 + axis] = adjacency[v].length ? positions[v * 3 + axis] + 0.48 * (mean / adjacency[v].length - positions[v * 3 + axis]) : positions[v * 3 + axis]
    }
  }
  positions.set(next)
}
geometry.computeVertexNormals(); geometry.computeBoundingBox()
const normals = geometry.attributes.normal.array
const index32 = new Uint32Array(indices)
const buffers = [positions, normals, index32].map(a => Buffer.from(a.buffer, a.byteOffset, a.byteLength))
let offset = 0
const views = buffers.map((b, i) => { const view = { buffer: 0, byteOffset: offset, byteLength: b.length, target: i === 2 ? 34963 : 34962 }; offset += b.length; return view })
const json = {
  asset: { version: '2.0', generator: 'Three.js SimplifyModifier + 100 explicit Laplacian iterations', copyright: 'Scan the World / Jonathan Beck; modified 2026-09-27; CC BY-SA 4.0' },
  scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: 'Laplacian Thinker' }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2 }] }],
  buffers: [{ byteLength: offset }], bufferViews: views,
  accessors: [
    { bufferView: 0, componentType: 5126, count: positions.length / 3, type: 'VEC3', min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray() },
    { bufferView: 1, componentType: 5126, count: normals.length / 3, type: 'VEC3' },
    { bufferView: 2, componentType: 5125, count: indices.length, type: 'SCALAR' },
  ],
}
let jsonBuffer = Buffer.from(JSON.stringify(json))
jsonBuffer = Buffer.concat([jsonBuffer, Buffer.alloc((4 - jsonBuffer.length % 4) % 4, 32)])
const binary = Buffer.concat(buffers)
const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + jsonBuffer.length + binary.length, 8)
const chunk = (length, type) => { const b = Buffer.alloc(8); b.writeUInt32LE(length); b.writeUInt32LE(type, 4); return b }
await mkdir('public/models', { recursive: true })
await writeFile('public/models/thinker-smoothed.glb', Buffer.concat([header, chunk(jsonBuffer.length, 0x4e4f534a), jsonBuffer, chunk(binary.length, 0x004e4942), binary]))
console.log(JSON.stringify({ vertices: positions.length / 3, triangles: indices.length / 3, bytes: binary.length, iterations: 100 }))
