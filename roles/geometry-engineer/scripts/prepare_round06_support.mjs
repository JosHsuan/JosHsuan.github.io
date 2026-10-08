// Explicit offline preparation only. Read the verified sanitized GLB, never CAD.
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, sep} from 'node:path';
import {Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ConvexHull} from 'three/addons/math/ConvexHull.js';

const prepared = resolve(process.argv[2] ?? '');
const root = resolve('D:/JosHsuan_Website/_work/bending-active-thesis/round-06');
if (!prepared.startsWith(root + sep)) throw new Error('Prepare source support only inside the authorized D-first workspace.');
const bytes = await readFile(resolve(prepared, 'source-diagrams.glb'));
const metadataPath = resolve(prepared, 'source-diagrams.json');
const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
if (hash(bytes) !== metadata.revision) throw new Error('Source diagram handoff hash differs.');
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
gltf.scene.updateMatrixWorld(true);
const reports = [];
try {
  for (const record of metadata.representations) {
    const mesh = gltf.scene.getObjectByName(record.id);
    if (!mesh?.isMesh || mesh.geometry.attributes.position.count !== record.vertices) throw new Error('Missing verified source node.');
    const position = mesh.geometry.attributes.position;
    const points = Array.from({length: position.count}, (_, i) => new Vector3().fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld));
    const hull = new ConvexHull().setFromPoints(points), support = new Map();
    for (const face of hull.faces) {
      let edge = face.edge;
      do {const p = edge.head().point; support.set(p.toArray().join(','), p.toArray()); edge = edge.next;} while (edge !== face.edge);
    }
    const selected = [...support.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    const outside = points.filter(point => !hull.containsPoint(point)).length;
    if (outside) throw new Error(`${record.id} hull excludes an original prepared vertex.`);
    record.framingSupport = {assetSHA256: metadata.revision, geometrySHA256: record.geometrySHA256,
      method: 'Exact convex support from every prepared source vertex; no rounding, sampling or geometry reduction.', points: selected};
    reports.push({id: record.id, originalVertices: points.length, supportPoints: selected.length, hullFaces: hull.faces.length, outside});
  }
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
  const result = {assetSHA256: metadata.revision, metadataSHA256: hash(await readFile(metadataPath)), nodes: reports};
  await writeFile(resolve(root, 'geometry-inspection', 'diagram-support.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
} finally {
  gltf.scene.traverse(node => {node.geometry?.dispose(); if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());});
}
