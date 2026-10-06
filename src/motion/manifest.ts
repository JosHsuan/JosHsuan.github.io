import { z } from 'zod';
const vector = z.object({ x: z.number(), y: z.number(), z: z.number() }).strict();
export const motionManifestSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: z.string().min(1),
  sheetId: z.string().min(1),
  stateRevision: z.string().regex(/^[a-f0-9]{64}$/),
  authoredWith: z.object({ core: z.literal('0.7.2'), studio: z.literal('0.7.2') }).strict(),
  testedRuntime: z.literal('0.7.2'),
  modelAssetId: z.string().min(1),
  modelRevision: z.string().min(1),
  clips: z.record(z.string(), z.object({ start: z.number().nonnegative(), end: z.number().positive() }).strict().refine((clip) => clip.end > clip.start)),
  requiredBindings: z.array(z.string()).min(1),
  layoutVariant: z.enum(['shared', 'desktop', 'mobile']),
  staticPose: z.object({ camera: z.object({ position: vector, target: vector, fov: z.number().min(10).max(100) }).strict(), assemblyProgress: z.number().min(0).max(1) }).strict(),
}).strict();
