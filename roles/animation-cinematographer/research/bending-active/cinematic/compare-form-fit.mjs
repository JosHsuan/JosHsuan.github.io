import { readFile, writeFile } from 'node:fs/promises';
import { PerspectiveCamera, Vector3 } from 'three';
const root = 'D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/cinema-review';
const read = async name => JSON.parse(await readFile(`${root}/${name}`, 'utf8'));
const [before, after, hull] = await Promise.all([read('before-form-fit-captures.json'), read('captures.json'), read('convex-hull.json')]);
function bounds(record) {
  const pose = record.pose, camera = new PerspectiveCamera(pose.fov, pose.aspect, pose.near, pose.far);
  camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.lookAt(...pose.target);
  camera.setViewOffset(record.width, record.height, record.width * pose.viewOffsetNormalized.x, record.height * pose.viewOffsetNormalized.y, record.width, record.height);
  camera.updateMatrixWorld(); camera.updateProjectionMatrix();
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const vertex of hull.vertices) {
    const p = new Vector3(...vertex).project(camera), x = (p.x + 1) / 2 * record.width, y = (1 - p.y) / 2 * record.height;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}
const report = { generatedAt: new Date().toISOString(), modelSHA256: hull.modelSHA256, method: 'Project exact GLB convex support vertices through recorded perspective cameras; values are silhouette support extents, not a pixel segmentation.', views: [] };
for (const file of ['shots/desktop-1.png', 'shots/mobile-1.png']) {
  const old = bounds(before.captures.find(c => c.file === file)), next = bounds(after.captures.find(c => c.file === file));
  report.views.push({ file, before: old, after: next, widthScale: next.width / old.width, heightScale: next.height / old.height });
}
await writeFile(`${root}/form-fit-comparison.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
