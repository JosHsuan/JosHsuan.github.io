// CPU-only projection of every actual source-layer vertex. No renderer/browser.
// Keep geometry and detailed witnesses in the private working evidence directory.
import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PerspectiveCamera, Matrix4, Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {sampleCinematicPose} from '../components/vendor/cinematic-plan.mjs';
import {sampleOpticalScore} from '../components/optical-score.mjs';
import {sampleElementPose, SOURCE_LAYER_REVISION} from '../components/element-score.mjs';

const tabletCheck = process.argv.includes('--tablet');
const output = `D:/JosHsuan_Website/_work/bending-active-thesis/round-03/verification/source-framing${tabletCheck ? '-tablet' : ''}.json`;
const modelURL = new URL('../release/public/assets/source-layers.glb', import.meta.url);
const metadataURL = new URL('../release/public/assets/source-layers.json', import.meta.url);
const bytes = await readFile(modelURL), meta = JSON.parse(await readFile(metadataURL, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(bytes), SOURCE_LAYER_REVISION, 'Actual GLB is not the pinned source-layer revision');
assert.equal(meta.revision, SOURCE_LAYER_REVISION);
assert.equal(meta.viewerUnits, 'meters'); assert.equal(meta.upAxis, 'Y');
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
gltf.scene.updateMatrixWorld(true);
const point = new Vector3(), layers = [];
gltf.scene.traverse(node => {
  if (!node.isMesh) return;
  const id = node.userData.role, record = meta.layers.find(layer => layer.id === id);
  assert(record && !layers.some(layer => layer.id === id), 'Unexpected/duplicate source layer');
  const positions = node.geometry.attributes.position;
  assert.equal(positions.count, record.vertices);
  assert.equal((node.geometry.index?.count ?? positions.count) / 3, record.triangles);
  const vertices = new Float64Array(positions.count * 3);
  const bounds = {min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity]};
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i).applyMatrix4(node.matrixWorld).toArray(vertices, i * 3);
    for (let axis = 0; axis < 3; axis++) {
      bounds.min[axis] = Math.min(bounds.min[axis], vertices[i * 3 + axis]);
      bounds.max[axis] = Math.max(bounds.max[axis], vertices[i * 3 + axis]);
    }
  }
  for (const end of ['min', 'max']) for (let axis = 0; axis < 3; axis++) {
    assert(Math.abs(bounds[end][axis] - record.bounds[end][axis]) < 1e-6, `${id} source bounds differ from actual vertices`);
  }
  layers.push({id, vertices, vertexCount: positions.count, bounds});
});
assert.equal(layers.length, 3);
assert.equal(layers.reduce((sum, layer) => sum + layer.vertexCount, 0), meta.vertices);

const viewports = tabletCheck ? [[1024, 900]] : [[1920, 1080], [1440, 1000], [1024, 768], [768, 1024], [390, 844]];
const pointers = [-1, 0, 1].flatMap(x => [-1, 0, 1].map(y => ({x, y})));
const chapters = ['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits'];
const samples = chapters.flatMap((chapter, index) => pointers.map(pointer => ({chapter, slot: index, pointer, hold: true})));
for (let index = 0; index < 6; index++) for (const fraction of [.25, .5, .75]) samples.push({chapter: `${chapters[index]}→${chapters[index + 1]}`, slot: index + fraction, pointer: {x: 0, y: 0}, hold: false});
const checks = [], failures = [];
for (const {chapter, slot, pointer, hold} of samples) for (const [width, height] of viewports) {
  const stageU = (slot + .5) / 7, aspect = width / height;
  const elements = sampleElementPose(stageU);
  const bounds = {
    min: [0, 1, 2].map(i => Math.min(...meta.layers.map(layer => layer.bounds.min[i] + elements.offsets[layer.id][i]))),
    max: [0, 1, 2].map(i => Math.max(...meta.layers.map(layer => layer.bounds.max[i] + elements.offsets[layer.id][i]))),
  };
  const pose = sampleCinematicPose(stageU, aspect, pointer, {bounds, modelRevision: meta.revision, sharedStage: true});
  const optics = sampleOpticalScore({stageU, visualU: stageU, aspect, energy: 0, dwellWeight: 1}, pose, {bounds});
  const camera = new PerspectiveCamera();
  // Match the integrated single camera writer, including film gauge and view offset.
  camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.aspect = aspect; camera.zoom = 1;
  camera.near = pose.near; camera.far = pose.far; camera.filmGauge = optics.filmGaugeMm; camera.setFocalLength(optics.focalLengthMm);
  camera.setViewOffset(width, height, width * pose.viewOffsetNormalized.x, height * pose.viewOffsetNormalized.y, width, height);
  camera.lookAt(...pose.target); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  const projection = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const projectedLayers = [];
  for (const layer of layers) {
    const limits = {min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity]};
    const witnesses = {min: [null, null, null], max: [null, null, null]};
    const offset = elements.offsets[layer.id]; let outsideVertices = 0, depthClippedVertices = 0;
    for (let i = 0; i < layer.vertexCount; i++) {
      point.fromArray(layer.vertices, i * 3); point.x += offset[0]; point.y += offset[1]; point.z += offset[2]; point.applyMatrix4(projection);
      const ndc = [point.x, point.y, point.z];
      if (ndc.some(value => !Number.isFinite(value) || value < -1 - 1e-7 || value > 1 + 1e-7)) outsideVertices++;
      if (!Number.isFinite(ndc[2]) || ndc[2] < -1 - 1e-7 || ndc[2] > 1 + 1e-7) depthClippedVertices++;
      for (let axis = 0; axis < 3; axis++) for (const end of ['min', 'max']) {
        if (end === 'min' ? ndc[axis] < limits[end][axis] : ndc[axis] > limits[end][axis]) {
          limits[end][axis] = ndc[axis];
          witnesses[end][axis] = {vertexIndex: i, world: [...layer.vertices.slice(i * 3, i * 3 + 3)].map((value, axis) => value + offset[axis]), ndc: [...ndc]};
        }
      }
    }
    projectedLayers.push({id: layer.id, vertexCount: layer.vertexCount, ndc: limits, outsideVertices, depthClippedVertices, witnesses});
  }
  const min = [0, 1, 2].map(axis => Math.min(...projectedLayers.map(layer => layer.ndc.min[axis])));
  const max = [0, 1, 2].map(axis => Math.max(...projectedLayers.map(layer => layer.ndc.max[axis])));
  const marginsPx = {left: (1 + min[0]) * width / 2, right: (1 - max[0]) * width / 2, top: (1 - max[1]) * height / 2, bottom: (1 + min[1]) * height / 2};
  const outsideVertices = projectedLayers.reduce((sum, layer) => sum + layer.outsideVertices, 0);
  const depthClippedVertices = projectedLayers.reduce((sum, layer) => sum + layer.depthClippedVertices, 0);
  const fullyOutsideSide = max[0] < -1 || min[0] > 1 || max[1] < -1 || min[1] > 1;
  const requirement = pose.framingIntent === 'held-source' ? 'all actual vertices in frustum' : pose.sourcePresence === 0 ? 'explicit source visibility off; hold also projects entirely off-frame' : 'editorial viewport crop allowed; near/far clipping forbidden';
  const check = {chapter, hold, width, height, aspect, pointer, stageU, requirement, framingIntent: pose.framingIntent, sourcePresence: pose.sourcePresence, camera: {...pose, finalFov: camera.fov, focalLengthMm: optics.focalLengthMm}, offsets: elements.offsets, ndc: {min, max}, marginsPx, nearNdcMargin: min[2] + 1, farNdcMargin: 1 - max[2], outsideVertices, depthClippedVertices, fullyOutsideSide, layers: projectedLayers};
  checks.push(check);
  if (pose.framingIntent === 'held-source' && outsideVertices || pose.sourcePresence > 0 && depthClippedVertices || pose.sourcePresence === 0 && hold && !fullyOutsideSide) failures.push({chapter, width, height, pointer, outsideVertices, depthClippedVertices, fullyOutsideSide, requirement});
}
const summary = viewports.flatMap(([width, height]) => chapters.map(chapter => {
  const matching = checks.filter(check => check.chapter === chapter && check.width === width && check.height === height);
  return {chapter, width, height, pointerSamples: matching.length,
    minimumMarginsPx: Object.fromEntries(['left', 'right', 'top', 'bottom'].map(edge => [edge, Math.min(...matching.map(check => check.marginsPx[edge]))])),
    framingIntent: matching[0].framingIntent, sourcePresence: matching[0].sourcePresence,
    maximumOutsideFraction: Math.max(...matching.map(check => check.outsideVertices / meta.vertices)),
    depthClippedVertices: matching.reduce((sum, check) => sum + check.depthClippedVertices, 0)};
}));
const codeHashes = {};
for (const path of ['../components/vendor/cinematic-plan.mjs', '../components/optical-score.mjs', '../components/element-score.mjs', '../components/CinematicScene.jsx']) codeHashes[path] = hash(await readFile(new URL(path, import.meta.url)));
await mkdir(new URL('.', `file:///${output}`), {recursive: true});
await writeFile(output, JSON.stringify({verifiedAt: new Date().toISOString(),sourceRevision: meta.revision,verticesPerCheck: meta.vertices,triangles: meta.triangles,
  method: 'Every decoded GLB vertex transformed by its actual node matrix and scored rest offset, then the current sharedStage camera plus optical lens and view offset; CPU Three matrices, no convex-hull shortcut and no GPU work.',
  scope: `Round03: seven hold centres × ${viewports.length} viewport ratios × nine pointer samples, plus three interior samples per transition × ${viewports.length} ratios. FORM/CREDITS must contain all vertices, intentional crops are measured, and absent evidence holds must be source-hidden and project outside the viewport. DOM collisions and physical-device performance require separate checks. The old Round02 90-check proof remains historical.`,
  codeHashes,checks: checks.length,projectedVertices: checks.length * meta.vertices,failures,summary,details: checks}, null, 2) + '\n');
gltf.scene.traverse(node => {node.geometry?.dispose(); if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());});
console.log(JSON.stringify({report: output,checks: checks.length,projectedVertices: checks.length * meta.vertices,failures,heldSource: summary.filter(check => check.framingIntent === 'held-source'),intentionalCrop: summary.filter(check => check.framingIntent !== 'held-source').map(({chapter,width,height,framingIntent,sourcePresence,maximumOutsideFraction}) => ({chapter,width,height,framingIntent,sourcePresence,maximumOutsideFraction}))}, null, 2));
assert.equal(failures.length, 0, 'Source framing violates its declared shot intent');
