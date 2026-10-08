import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {Matrix4, PerspectiveCamera, Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {sampleInspectionPose} from '../components/inspection-camera.mjs';
import {INSPECTION_FRAMING_SUPPORT} from '../components/inspection-framing-support.mjs';
import {INSPECTION_VIEWS} from '../components/inspection-state.mjs';
import {sampleSourceSeparation, SOURCE_LAYER_REVISION} from '../components/element-score.mjs';

const bounds = {min: [-1.38, -.01, -1.64], max: [1.25, .97, 1.73]};
const desktop = {left: .04, top: .13, width: .68, height: .78};
const mobile = {left: .04, top: .15, width: .92, height: .42};
const hash = value => createHash('sha256').update(value).digest('hex');

function cameraFor(pose, width, height) {
  const camera = new PerspectiveCamera(pose.fov, width / height, pose.near, pose.far);
  camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.lookAt(...pose.target);
  camera.setViewOffset(width, height, width * pose.viewOffsetNormalized.x, height * pose.viewOffsetNormalized.y, width, height);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  return camera;
}

test('inspection target projects to the actual unobscured viewport center', () => {
  for (const [width, height, viewport] of [[1440, 1000, desktop], [390, 844, mobile]]) {
    const pose = sampleInspectionPose({bounds, aspect: width / height, viewport});
    const projected = new Vector3(...pose.target).project(cameraFor(pose, width, height));
    const x = (projected.x + 1) / 2, y = (1 - projected.y) / 2;
    assert(Math.abs(x - viewport.left - viewport.width / 2) < 1e-10);
    assert(Math.abs(y - viewport.top - viewport.height / 2) < 1e-10);
    assert.equal(pose.sourcePresence, 1); assert.equal(pose.fov, 36);
  }
});

test('inspection pose is deterministic, bounds remain fixed and invalid inputs fail explicitly', () => {
  const original = structuredClone(bounds), viewport = {...desktop};
  const input = {bounds, aspect: 1.44, viewport, azimuth: 30, elevation: 30};
  const first = sampleInspectionPose(input);
  sampleInspectionPose({...input, azimuth: 100, elevation: 70});
  assert.deepEqual(sampleInspectionPose(input), first);
  assert.deepEqual(bounds, original); assert.deepEqual(viewport, desktop);
  const clamped = sampleInspectionPose({...input, azimuth: 900, elevation: -40});
  assert.equal(clamped.azimuth, 100); assert.equal(clamped.elevation, 12);
  for (const patch of [{aspect: 0}, {aspect: Infinity}, {bounds: {min: [0, 0, 0], max: [0, 0, 0]}}, {viewport: {...desktop, width: 0}}, {viewport: {...desktop, left: .8}}]) {
    assert.throws(() => sampleInspectionPose({...input, ...patch}), RangeError);
  }
});

test('measured framing rejects another source revision and preserves the current separation contract', () => {
  assert.equal(INSPECTION_FRAMING_SUPPORT.sourceSHA256, SOURCE_LAYER_REVISION);
  assert.equal(INSPECTION_FRAMING_SUPPORT.points.length, 514);
  assert.deepEqual(INSPECTION_FRAMING_SUPPORT.maxOffsets, sampleSourceSeparation(1).offsets);
  const supportBounds = {min: [0, 1, 2].map(i => Math.min(...INSPECTION_FRAMING_SUPPORT.points.map(point => point[i]))),
    max: [0, 1, 2].map(i => Math.max(...INSPECTION_FRAMING_SUPPORT.points.map(point => point[i])))};
  const input = {bounds: supportBounds, aspect: 390 / 844, viewport: mobile};
  const conservative = sampleInspectionPose(input), measured = sampleInspectionPose({...input, framingSupport: INSPECTION_FRAMING_SUPPORT});
  assert(measured.distance < conservative.distance * .8, 'Actual support should resolve the observed mobile overfit');
  assert.deepEqual(measured.target, conservative.target); assert.equal(measured.fov, conservative.fov);
  assert.throws(() => sampleInspectionPose({...input, framingSupport: {...INSPECTION_FRAMING_SUPPORT, sourceSHA256: 'different-source'}}), RangeError);
  assert.throws(() => sampleInspectionPose({...input, framingSupport: {...INSPECTION_FRAMING_SUPPORT, points: [[NaN, 0, 0], ...INSPECTION_FRAMING_SUPPORT.points]}}), RangeError);
});

test('all actual source vertices remain inside the inspection viewport at named views and control corners', async () => {
  const bytes = await readFile(new URL('../release/public/assets/source-layers.glb', import.meta.url));
  const metadata = JSON.parse(await readFile(new URL('../release/public/assets/source-layers.json', import.meta.url), 'utf8'));
  assert.equal(hash(bytes), SOURCE_LAYER_REVISION); assert.equal(metadata.revision, SOURCE_LAYER_REVISION);
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  gltf.scene.updateMatrixWorld(true);
  const point = new Vector3(), layers = [];
  try {
    gltf.scene.traverse(node => {
      if (!node.isMesh) return;
      const id = node.userData.role, record = metadata.layers.find(layer => layer.id === id);
      assert(record && !layers.some(layer => layer.id === id));
      const attribute = node.geometry.attributes.position;
      assert.equal(attribute.count, record.vertices); assert.equal((node.geometry.index?.count ?? attribute.count) / 3, record.triangles);
      const vertices = new Float64Array(attribute.count * 3), limits = {min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity]};
      for (let i = 0; i < attribute.count; i++) {
        point.fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld).toArray(vertices, i * 3);
        for (let axis = 0; axis < 3; axis++) {
          limits.min[axis] = Math.min(limits.min[axis], vertices[i * 3 + axis]);
          limits.max[axis] = Math.max(limits.max[axis], vertices[i * 3 + axis]);
        }
      }
      for (const end of ['min', 'max']) for (let axis = 0; axis < 3; axis++) assert(Math.abs(limits[end][axis] - record.bounds[end][axis]) < 1e-6);
      layers.push({id, vertices, bounds: limits, count: attribute.count});
    });
    assert.equal(layers.length, 3); assert.equal(layers.reduce((sum, layer) => sum + layer.count, 0), 172789);
    const maxOffsets = sampleSourceSeparation(1).offsets;
    const envelope = {
      min: [0, 1, 2].map(axis => Math.min(...layers.map(layer => layer.bounds.min[axis]))),
      max: [0, 1, 2].map(axis => Math.max(...layers.map(layer => layer.bounds.max[axis] + maxOffsets[layer.id][axis]))),
    };
    const views = [...Object.entries(INSPECTION_VIEWS).map(([name, view]) => ({name, ...view})),
      ...[-40, 100].flatMap(azimuth => [12, 70].map(elevation => ({name: `corner-${azimuth}-${elevation}`, azimuth, elevation})))];
    const viewports = [[1440, 1000, desktop], [1024, 900, desktop], [768, 1024, mobile], [390, 844, mobile], [844, 390, desktop]];
    const checks = [];
    for (const [width, height, viewport] of viewports) for (const view of views) {
      const pose = sampleInspectionPose({bounds: envelope, aspect: width / height, ...view, viewport, framingSupport: INSPECTION_FRAMING_SUPPORT});
      const camera = cameraFor(pose, width, height), projection = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      for (const separation of [0, .5, 1]) {
        const offsets = sampleSourceSeparation(separation).offsets;
        const limits = {min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity]};
        let outside = 0;
        for (const layer of layers) for (let i = 0; i < layer.count; i++) {
          point.fromArray(layer.vertices, i * 3);
          point.x += offsets[layer.id][0]; point.y += offsets[layer.id][1]; point.z += offsets[layer.id][2];
          point.applyMatrix4(projection);
          const x = (point.x + 1) / 2, y = (1 - point.y) / 2;
          if (![x, y, point.z].every(Number.isFinite) || x < viewport.left - 1e-8 || x > viewport.left + viewport.width + 1e-8
            || y < viewport.top - 1e-8 || y > viewport.top + viewport.height + 1e-8 || point.z < -1 || point.z > 1) outside++;
          for (const [axis, value] of [x, y, point.z].entries()) {limits.min[axis] = Math.min(limits.min[axis], value); limits.max[axis] = Math.max(limits.max[axis], value);}
        }
        const margins = {left: (limits.min[0] - viewport.left) / viewport.width, right: (viewport.left + viewport.width - limits.max[0]) / viewport.width,
          top: (limits.min[1] - viewport.top) / viewport.height, bottom: (viewport.top + viewport.height - limits.max[1]) / viewport.height};
        assert.equal(outside, 0, `${width}x${height} ${view.name} separation ${separation} clips actual source`);
        assert(Math.min(...Object.values(margins)) >= .03 - 1e-8, 'Actual source violates the three-percent viewport padding');
        checks.push({width, height, viewport, view: view.name, azimuth: pose.azimuth, elevation: pose.elevation, separation, marginsFractionOfViewport: margins, outside, pose});
      }
    }
    assert.equal(hash(bytes), SOURCE_LAYER_REVISION, 'Projection must not mutate source bytes');
    assert.equal(checks.length, 105);
    if (process.env.INSPECTION_FRAMING_REPORT) {
      const reportPath = process.env.INSPECTION_FRAMING_REPORT;
      await mkdir(dirname(reportPath), {recursive: true});
      await writeFile(reportPath, JSON.stringify({verifiedAt: new Date().toISOString(), sourceRevision: SOURCE_LAYER_REVISION,
        cameraHash: hash(await readFile(new URL('../components/inspection-camera.mjs', import.meta.url))),
        framingSupportHash: hash(await readFile(new URL('../components/inspection-framing-support.mjs', import.meta.url))), framingSupportPoints: INSPECTION_FRAMING_SUPPORT.points.length, envelope,
        method: 'Every source GLB vertex after its actual node transform and rigid source-layer offset; current perspective camera, full-Canvas view offset and measured-clearance contract. No renderer or convex hull shortcut.',
        checks: checks.length, verticesPerCheck: 172789, projectedVertices: checks.length * 172789,
        minimumMarginFraction: Math.min(...checks.flatMap(check => Object.values(check.marginsFractionOfViewport))), failures: 0, details: checks}, null, 2) + '\n');
    }
  } finally {
    gltf.scene.traverse(node => {node.geometry?.dispose(); if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());});
  }
});
