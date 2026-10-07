import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PerspectiveCamera, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CINEMATIC_CHAPTERS, THESIS_MODEL_REVISION, THESIS_MODEL_BOUNDS, THESIS_FRAMING_HULL, sampleCinematicPose, cinematicChapter, cinematicProgressFromAnchors } from '../../../src/bending-active/cinematic-plan.mjs';
const mid = index => (index + 0.5) / 7;
const cameraFields = p => ({ position: p.position, target: p.target, up: p.up, fov: p.fov, near: p.near, far: p.far, compositionNDC: p.compositionNDC });
function makeCamera(pose) {
  const camera = new PerspectiveCamera(pose.fov, pose.aspect, pose.near, pose.far);
  camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.lookAt(...pose.target);
  const w = 1000 * pose.aspect, h = 1000;
  camera.setViewOffset(w, h, w * pose.viewOffsetNormalized.x, h * pose.viewOffsetNormalized.y, w, h);
  camera.updateMatrixWorld(); camera.updateProjectionMatrix();
  return camera;
}
function project(pose, point) { return new Vector3(...point).project(makeCamera(pose)); }
test('chapter IDs and unequal real-section intervals retain one semantic progress', () => {
  const offsets = [0, 1000, 2600, 3600, 5300, 6700, 7900, 9200];
  for (let i = 0; i < 7; i++) {
    const progress = cinematicProgressFromAnchors((offsets[i] + offsets[i + 1]) / 2, offsets);
    assert.ok(Math.abs(progress - mid(i)) < 1e-12);
    assert.equal(cinematicChapter(progress).id, CINEMATIC_CHAPTERS[i]);
  }
  assert.equal(cinematicProgressFromAnchors(15000, offsets), 1);
  assert.throws(() => cinematicProgressFromAnchors(100, [0, 1]), /seven/);
});
test('reading holds are fixed and every chapter boundary has a continuous camera', () => {
  for (let i = 0; i < 7; i++) assert.deepEqual(cameraFields(sampleCinematicPose((i + 0.25) / 7, 16 / 9)), cameraFields(sampleCinematicPose((i + 0.75) / 7, 16 / 9)));
  for (let i = 1; i < 7; i++) {
    const a = sampleCinematicPose(i / 7 - 1e-9, 16 / 9), b = sampleCinematicPose(i / 7 + 1e-9, 16 / 9);
    assert.ok(a.position.every((v, j) => Math.abs(v - b.position[j]) < 1e-5));
    assert.ok(a.compositionNDC.every((v, j) => Math.abs(v - b.compositionNDC[j]) < 1e-5));
  }
});
test('optical principal point lands the camera target at the requested offcenter location', () => {
  for (let i = 0; i < 7; i++) {
    const pose = sampleCinematicPose(mid(i), 16 / 9), point = project(pose, pose.target);
    assert.ok(Math.abs(point.x - pose.compositionNDC[0]) < 1e-10);
    assert.ok(Math.abs(point.y - pose.compositionNDC[1]) < 1e-10);
  }
});
test('whole-model ending holds remain framed on desktop and mobile, including extreme pointer decoration', () => {
  const bounds = THESIS_MODEL_BOUNDS;
  const corners = Array.from({ length: 8 }, (_, mask) => bounds.min.map((v, i) => mask & (1 << i) ? bounds.max[i] : v));
  for (const aspect of [0.46, 0.7, 1, 16 / 9, 2.3]) for (const index of [6]) for (const pointer of [{ x: -1, y: -1 }, { x: 1, y: 1 }, { x: 0, y: 0 }]) {
    const pose = sampleCinematicPose(mid(index), aspect, pointer);
    for (const p of corners.map(point => project(pose, point))) {
      assert.ok(Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1, `Unintended whole-model clipping at aspect ${aspect}, chapter ${index}: ${p.toArray()}`);
      assert.ok(p.z >= -1 && p.z <= 1);
    }
  }
});
test('closer FORM framing retains every one of the actual GLB vertices at five aspects and extreme pointer angles', async () => {
  const source = await readFile(new URL('../../../../uiux-designer/cases/bending-active-thesis/public/assets/assembly.glb', import.meta.url));
  assert.equal(createHash('sha256').update(source).digest('hex'), THESIS_MODEL_REVISION);
  assert.equal(THESIS_FRAMING_HULL.length, 446);
  const gltf = await new GLTFLoader().parseAsync(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength), '');
  gltf.scene.updateMatrixWorld(true);
  const points = [];
  gltf.scene.traverse(node => { if (!node.isMesh) return; const p = node.geometry.attributes.position; for (let i = 0; i < p.count; i++) points.push(new Vector3().fromBufferAttribute(p, i).applyMatrix4(node.matrixWorld)); });
  assert.equal(points.length, 84626);
  const projected = new Vector3();
  for (const aspect of [0.46, 0.7, 1, 16 / 9, 2.3]) for (const pointer of [{ x: -1, y: -1 }, { x: 1, y: 1 }, { x: 0, y: 0 }]) {
    const pose = sampleCinematicPose(mid(1), aspect, pointer), camera = makeCamera(pose);
    assert.equal(pose.framingEvidence, 'audited-real-mesh-convex-support');
    for (const point of points) {
      projected.copy(point).project(camera);
      assert.ok(Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1 && projected.z >= -1 && projected.z <= 1, `Actual silhouette clipped at aspect ${aspect}`);
    }
  }
});
test('unmatched revision or bounds never reuses the measured hull', () => {
  const unknown = sampleCinematicPose(mid(1), 16 / 9, {}, { modelRevision: 'another-revision' });
  assert.equal(unknown.framingEvidence, 'conservative-bounding-box');
  const changed = sampleCinematicPose(mid(1), 16 / 9, {}, { bounds: { min: [-2, 0, -2], max: [2, 1, 2] } });
  assert.equal(changed.framingEvidence, 'conservative-bounding-box');
});
test('pointer decoration is bounded below two degrees and never changes semantic progress or chapter', () => {
  for (let i = 0; i < 7; i++) {
    const a = sampleCinematicPose(mid(i), 16 / 9), b = sampleCinematicPose(mid(i), 16 / 9, { x: 900, y: -200 });
    assert.equal(a.progress, b.progress); assert.deepEqual(a.chapter, b.chapter); assert.equal(a.surfaceEmphasis, b.surfaceEmphasis);
    assert.ok(Math.hypot(...b.pointerDegrees) < 2); assert.notDeepEqual(a.position, b.position);
  }
});
test('reduced motion never moves camera on scroll or pointer, and disables analytical sweep', () => {
  const initial = sampleCinematicPose(0, 16 / 9, { x: -1, y: -1 }, { reducedMotion: true });
  for (let i = 0; i <= 30; i++) {
    const pose = sampleCinematicPose(i / 30, 16 / 9, { x: 1, y: 1 }, { reducedMotion: true });
    assert.deepEqual(cameraFields(pose), cameraFields(initial)); assert.equal(pose.surfaceEmphasis, 0);
  }
});
test('reverse seeking is exact, all sampled poses are finite, and data is immutable', () => {
  const before = JSON.stringify(THESIS_MODEL_BOUNDS), a = sampleCinematicPose(0.35, 0.7);
  sampleCinematicPose(1, 0.7); sampleCinematicPose(0, 0.7);
  assert.deepEqual(sampleCinematicPose(0.35, 0.7), a);
  for (let i = 0; i <= 200; i++) {
    const p = sampleCinematicPose(i / 200, 0.7);
    assert.ok([...p.position, ...p.target, p.fov, p.near, p.far].every(Number.isFinite)); assert.ok(p.near > 0 && p.far > p.near);
  }
  assert.equal(JSON.stringify(THESIS_MODEL_BOUNDS), before);
});
