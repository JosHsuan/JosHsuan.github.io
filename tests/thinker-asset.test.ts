import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('the generated Thinker GLB has finite, indexed geometry and usable normals', () => {
  const bytes = readFileSync(new URL('../public/models/thinker-smoothed.glb', import.meta.url))
  assert.equal(bytes.readUInt32LE(0), 0x46546c67)
  assert.equal(bytes.readUInt32LE(8), bytes.length)
  const jsonSize = bytes.readUInt32LE(12)
  const gltf = JSON.parse(bytes.subarray(20, 20 + jsonSize).toString())
  const binaryOffset = 28 + jsonSize
  const vertexCount = gltf.accessors[0].count
  assert.ok(vertexCount > 20000 && vertexCount < 30000)
  for (let attribute = 0; attribute < 2; attribute++) {
    const view = gltf.bufferViews[attribute]
    for (let v = 0; v < vertexCount; v++) {
      const vector = [0, 1, 2].map(axis => bytes.readFloatLE(binaryOffset + view.byteOffset + (v * 3 + axis) * 4))
      assert.ok(vector.every(Number.isFinite))
      if (attribute === 1) assert.ok(Math.abs(Math.hypot(...vector) - 1) < 0.00001)
    }
  }
  const indices = gltf.bufferViews[2]
  for (let i = 0; i < gltf.accessors[2].count; i++) assert.ok(bytes.readUInt32LE(binaryOffset + indices.byteOffset + i * 4) < vertexCount)
  assert.match(gltf.asset.copyright, /CC BY-SA 4.0/)
})
