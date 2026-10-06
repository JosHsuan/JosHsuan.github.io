/** Import only from a local authoring surface. Production compilation rejects this module. */
export async function initializeStudio() {
  if (process.env.NODE_ENV !== 'development') throw new Error('Studio is only available during local development.');
  const { default: studio } = await import('@theatre/studio');
  studio.initialize();
  return studio;
}
