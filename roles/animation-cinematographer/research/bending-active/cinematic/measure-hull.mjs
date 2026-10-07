import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ConvexHull } from 'three/addons/math/ConvexHull.js';
import { handoffPrivateHull } from './handoff-private-hull.mjs';
const model = new URL('../../../../uiux-designer/cases/bending-active-thesis/public/assets/assembly.glb', import.meta.url);
const bytes = await readFile(model), modelSHA256 = createHash('sha256').update(bytes).digest('hex');
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
gltf.scene.updateMatrixWorld(true);
const points = [];
gltf.scene.traverse(node => { if (!node.isMesh) return; const positions = node.geometry.attributes.position; for (let i = 0; i < positions.count; i++) points.push(new Vector3().fromBufferAttribute(positions, i).applyMatrix4(node.matrixWorld)); });
const hull = new ConvexHull().setFromPoints(points), unique = new Set();
for (const face of hull.faces) { let edge = face.edge; do { unique.add(edge.head().point); edge = edge.next; } while (edge !== face.edge); }
const vertices = [...unique].map(point => point.toArray());
// ConvexHull represents the exact support of all input vertices for any linear
// plane test. Frustum containment checks later still project every GLB vertex.
const output = 'D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/cinema-review';
await mkdir(output, { recursive: true });
await writeFile(`${output}/convex-hull.json`, JSON.stringify({ modelSHA256, inputVertices: points.length, hullFaces: hull.faces.length, hullVertices: vertices.length, vertices }, null, 2) + '\n');
if (process.argv.includes('--embed')) {
  // Retained CLI flag: now prepares D: private data, then copies only to the two
  // explicitly gitignored local consumers. Never embeds geometry in public source.
  await handoffPrivateHull({ modelSHA256, vertices });
}
console.log(JSON.stringify({ modelSHA256, inputVertices: points.length, hullFaces: hull.faces.length, hullVertices: vertices.length }, null, 2));
