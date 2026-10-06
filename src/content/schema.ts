import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = z.string().trim().min(1);
const safeUrl = z.url().refine((value) => new URL(value).protocol === 'https:', 'Use an HTTPS URL.');

const publishedEntry = z.object({
  status: z.literal('published'),
  id: slug,
  slug,
  title: text,
  summary: text,
  year: z.number().int().min(1900).max(2200),
  categories: z.array(text),
  role: text,
  contributions: z.array(text),
  methods: z.array(text),
  outcomes: z.array(text),
  limitations: z.array(text),
  credits: z.array(z.object({ name: text, role: text, url: safeUrl.optional() }).strict()),
  media: z.array(slug),
  sections: z.array(z.object({ heading: text, paragraphs: z.array(text) }).strict()),
  sceneId: slug.optional(),
}).strict();

export const entrySchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('draft'), id: slug, slug, title: text.optional() }).strict(),
  publishedEntry,
]);

export const assetSchema = z.object({
  id: slug,
  path: z.string().regex(/^\/(media|models|decoders|downloads)\/[A-Za-z0-9/_.,-]+$/),
  revision: text,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  approved: z.literal(true),
  alt: text,
  credit: text,
}).strict();

export const profileSchema = z.object({
  name: text,
  summary: text,
  biography: z.array(text),
  email: z.email().optional(),
  links: z.array(z.object({ label: text, url: safeUrl }).strict()),
  cvAssetId: slug.optional(),
}).strict().nullable();

export const snapshotSchema = z.object({
  schemaVersion: z.literal(1),
  projects: z.array(publishedEntry),
  research: z.array(publishedEntry),
  profile: profileSchema,
  assets: z.array(assetSchema),
}).strict();

export type PublishedEntry = z.infer<typeof publishedEntry>;
export type PublicSnapshot = z.infer<typeof snapshotSchema>;

export function createPublicSnapshot(input: { projects: unknown; research: unknown; profile: unknown; assets: unknown }, sceneIds: readonly string[] = []): PublicSnapshot {
  const projects = z.array(entrySchema).parse(input.projects);
  const research = z.array(entrySchema).parse(input.research);
  const assets = z.array(assetSchema).parse(input.assets);
  for (const entries of [projects, research]) {
    for (const key of ['id', 'slug'] as const) {
      if (new Set(entries.map((entry) => entry[key])).size !== entries.length) throw new Error(`Duplicate ${key}.`);
    }
  }
  if (new Set(assets.map((asset) => asset.id)).size !== assets.length) throw new Error('Duplicate asset ID.');
  if (new Set(assets.map((asset) => asset.path)).size !== assets.length) throw new Error('Duplicate asset path.');
  const snapshot = snapshotSchema.parse({
    schemaVersion: 1,
    projects: projects.filter((entry) => entry.status === 'published'),
    research: research.filter((entry) => entry.status === 'published'),
    profile: profileSchema.parse(input.profile),
    assets,
  });
  const assetIds = new Set(assets.map((asset) => asset.id));
  for (const entry of [...snapshot.projects, ...snapshot.research]) {
    for (const id of entry.media) if (!assetIds.has(id)) throw new Error(`Unknown asset: ${id}`);
    if (entry.sceneId && !sceneIds.includes(entry.sceneId)) throw new Error(`Unknown scene: ${entry.sceneId}`);
  }
  if (snapshot.profile?.cvAssetId && !assetIds.has(snapshot.profile.cvAssetId)) throw new Error('Unknown CV asset.');
  return snapshot;
}
