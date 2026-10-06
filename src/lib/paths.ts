export function validateBasePath(value: string): string {
  if (value !== '' && (!/^\/[A-Za-z0-9._-]+$/.test(value) || /^\/\.{1,2}$/.test(value))) {
    throw new Error('Base path must be empty or one /repository segment.');
  }
  return value;
}

export function publicAssetUrl(path: string, basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''): string {
  const base = validateBasePath(basePath);
  if (!/^\/(media|models|decoders|downloads)\/[A-Za-z0-9/_.,-]+$/.test(path) || path.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error(`Invalid local public asset path: ${path}`);
  }
  return `${base}${path}`;
}
