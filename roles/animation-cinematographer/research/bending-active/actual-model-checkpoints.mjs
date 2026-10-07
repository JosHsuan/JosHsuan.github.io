import { writeFile } from 'node:fs/promises';
import { createBendingActiveCameraPlan, sampleBendingActivePose } from '../../src/bending-active/camera-plan.mjs';

// Measured and supplied by the conversion owner on 7 October 2026.
// This identifies the selected assembled mesh, not the entire 10k-object 3dm.
export const measuredModel = {
  sourceObjectId: '03aa204e-af4c-4e84-9007-ac16d19c1ecc',
  sourceUnits: 'millimeters',
  sourceBounds: {
    min: [-10900.048828125, -4758.4638671875, 8.087958335876465],
    max: [-8523.8388671875, -1658.038330078125, 732.9448852539062],
  },
  displayBounds: {
    min: [-1.18810498046875, 0, -1.5502127685546875],
    max: [1.18810498046875, 0.7248569269180298, 1.5502127685546875],
  },
  transform: 'Translate original X/Y center and ground minZ; scale millimeters by 0.001; map (x,y,z) to (x,z,-y).',
  evidenceStatus: 'Conversion-owner measurements; geometry and visual framing must be validated against the resulting asset.',
};

export function actualModelCheckpoints() {
  return {
    role: 'Animation Cinematographer',
    generatedAt: new Date().toISOString(),
    measuredModel,
    status: 'Mathematical framing checkpoints; not rendered-image evidence.',
    variants: [0, 30, 45].flatMap(frontDegrees => [16 / 9, 0.7].map(aspect => {
      const az = frontDegrees * Math.PI / 180;
      const plan = createBendingActiveCameraPlan({ bounds: measuredModel.displayBounds, aspect, forward: [Math.sin(az), 0, Math.cos(az)], modelRevision: `source-object:${measuredModel.sourceObjectId}` });
      return { frontDegrees, aspect, checkpoints: [0, 0.3, 0.5, 0.7, 1].map(u => sampleBendingActivePose(plan, u)) };
    })),
  };
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/actual-model-checkpoints.mjs')) {
  const destination = new URL('./actual-model-checkpoints.json', import.meta.url);
  await writeFile(destination, JSON.stringify(actualModelCheckpoints(), null, 2) + '\n');
  process.stdout.write(`Wrote ${destination.pathname}\n`);
}
