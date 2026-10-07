import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { createBendingActiveCameraPlan, sampleBendingActivePose, sampleBendingActiveInspection, progressFromAnchors, boxCorners, fitBounds } from '../../src/bending-active/camera-plan.mjs';
import { measuredModel } from './actual-model-checkpoints.mjs';

const geometryCases = [
  { min: [-12, -2, -4], max: [8, 6, 3] },
  { min: [0, 0, 0], max: [1, 0.01, 22] },
  { min: [-200, 100, -150], max: [60, 600, 150] },
];
function assertInFrame(pose, bounds) {
  const camera = new PerspectiveCamera(pose.fov, pose.aspect, pose.near, pose.far);
  camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.lookAt(...pose.target);
  camera.updateMatrixWorld(); camera.updateProjectionMatrix();
  for (const point of boxCorners(bounds)) {
    const p = new Vector3(...point).project(camera);
    assert.ok(Math.abs(p.x) <= 1 + 1e-7, `horizontal clipping at ${p.x}`);
    assert.ok(Math.abs(p.y) <= 1 + 1e-7, `vertical clipping at ${p.y}`);
    assert.ok(p.z >= -1 && p.z <= 1, `depth clipping at ${p.z}`);
  }
}

test('full-model cameras preserve measured bounding corners across scroll, portrait, and nonzero pivots', () => {
  for (const bounds of geometryCases) for (const aspect of [0.5, 1, 16 / 9, 2.4]) {
    const plan = createBendingActiveCameraPlan({ bounds, aspect });
    for (let i = 0; i <= 100; i++) assertInFrame(sampleBendingActivePose(plan, i / 100), bounds);
  }
});
test('Rhino Z-up coordinates can be framed without modifying source geometry', () => {
  const bounds = geometryCases[2];
  const plan = createBendingActiveCameraPlan({ bounds, up: [0, 0, 1], forward: [0, -1, 0], aspect: 0.65 });
  for (const u of [0, 0.25, 0.5, 0.75, 1]) assertInFrame(sampleBendingActivePose(plan, u), bounds);
});
test('repeated and reverse progress are deterministic and do not mutate the plan', () => {
  const plan = createBendingActiveCameraPlan({ bounds: geometryCases[0], modelRevision: 'test-geometry' });
  const before = structuredClone(plan), a = sampleBendingActivePose(plan, 0.62);
  sampleBendingActivePose(plan, 1); sampleBendingActivePose(plan, 0);
  assert.deepEqual(sampleBendingActivePose(plan, 0.62), a);
  assert.deepEqual(plan, before);
  assert.equal(a.modelRevision, 'test-geometry');
});
test('reduced motion gives three static chapter compositions independent of progress', () => {
  const plan = createBendingActiveCameraPlan({ bounds: geometryCases[0] });
  for (const chapter of ['form', 'system', 'make']) {
    const a = sampleBendingActivePose(plan, 0.01, { reducedMotion: true, chapter });
    const b = sampleBendingActivePose(plan, 0.99, { reducedMotion: true, chapter });
    assert.deepEqual(a.position, b.position); assert.deepEqual(a.target, b.target);
    assert.equal(a.motionKind, 'static-chapter-pose'); assertInFrame(a, plan.bounds);
  }
});
test('a detail requires an inspected ID and internal bounds; absent evidence retains whole-model framing', () => {
  const bounds = geometryCases[0], detailBounds = { min: [-2, 1, -1], max: [1, 3, 1] };
  assert.throws(() => createBendingActiveCameraPlan({ bounds, detail: { bounds: detailBounds } }), /identifier/);
  assert.throws(() => createBendingActiveCameraPlan({ bounds, detail: { id: 'bad', bounds: { min: [-500, 0, 0], max: [0, 1, 1] } } }), /inside/);
  const plan = createBendingActiveCameraPlan({ bounds, detail: { id: 'inspected-fixture-01', bounds: detailBounds } });
  const end = sampleBendingActivePose(plan, 1);
  assert.deepEqual(end.focusBounds, detailBounds); assert.equal(end.detailId, 'inspected-fixture-01');
  assertInFrame(end, detailBounds);
  const fallback = sampleBendingActivePose(createBendingActiveCameraPlan({ bounds }), 1);
  assert.equal(fallback.detailStatus, 'whole-model-fallback'); assertInFrame(fallback, bounds);
});
test('inspection remains fully framed and declares a distinct owner', () => {
  const plan = createBendingActiveCameraPlan({ bounds: geometryCases[0], aspect: 0.55 });
  for (let i = 0; i <= 20; i++) {
    const pose = sampleBendingActiveInspection(plan, i / 20);
    assert.equal(pose.owner, 'procedural-inspection'); assertInFrame(pose, plan.bounds);
  }
});
test('actual unequal DOM reading intervals map continuously to chapter progress', () => {
  const anchors = [800, 1900, 3700, 4700];
  assert.deepEqual(anchors.map(y => progressFromAnchors(y, anchors)), [0, 0.3, 0.7, 1]);
  assert.ok(Math.abs(progressFromAnchors(2800, anchors) - 0.5) < 1e-12);
  assert.equal(progressFromAnchors(-100, anchors), 0); assert.equal(progressFromAnchors(9000, anchors), 1);
  assert.throws(() => progressFromAnchors(100, [0, 0, 10, 20]), /increasing/);
});
test('invalid geometry and optical inputs fail before a render callback', () => {
  assert.throws(() => createBendingActiveCameraPlan({ bounds: { min: [0, 0, 0], max: [0, 0, 0] } }), /positive/);
  assert.throws(() => createBendingActiveCameraPlan({ bounds: geometryCases[0], aspect: 0 }), /framing/);
  assert.throws(() => createBendingActiveCameraPlan({ bounds: geometryCases[0], forward: [0, 1, 0] }), /basis/);
  assert.throws(() => fitBounds(geometryCases[0], { direction: [0, 0, 0] }), /nonzero/);
});
test('selected real assembled-mesh bounds fit at all proposed front directions and review checkpoints', () => {
  const bounds = measuredModel.displayBounds;
  for (const frontDegrees of [0, 30, 45]) for (const aspect of [16 / 9, 0.7]) {
    const az = frontDegrees * Math.PI / 180;
    const plan = createBendingActiveCameraPlan({ bounds, aspect, forward: [Math.sin(az), 0, Math.cos(az)] });
    for (const u of [0, 0.3, 0.5, 0.7, 1]) assertInFrame(sampleBendingActivePose(plan, u), bounds);
  }
});
