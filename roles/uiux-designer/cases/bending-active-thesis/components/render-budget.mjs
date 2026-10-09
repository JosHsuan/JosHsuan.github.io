// Bound allocations by physical pixel area, not DPR alone. These are product
// budgets, not estimates of a browser's available VRAM or a device classifier.
export const RENDER_PIXEL_BUDGET = Object.freeze({full: 1_600_000, light: 1_200_000});

export function resolveRenderBudget({width, height, deviceDpr = 1, detail = 'full', maxTextureSize = 4096, densityScale = 1}) {
  if (![width, height, deviceDpr, maxTextureSize].every(value => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Finite positive viewport, DPR and texture dimension required');
  }
  if (!Object.hasOwn(RENDER_PIXEL_BUDGET, detail)) throw new RangeError('Unknown render detail');
  if (!Number.isFinite(densityScale) || densityScale <= 0 || densityScale > 1) throw new RangeError('Density scale must be in (0, 1]');
  const pixelBudget = RENDER_PIXEL_BUDGET[detail];
  const requestedDpr = Math.min(deviceDpr, detail === 'light' ? 1 : 1.25);
  const baseDpr = Math.min(requestedDpr, Math.sqrt(pixelBudget / (width * height)), maxTextureSize / Math.max(width, height));
  const dpr = baseDpr * densityScale;
  const targetWidth = Math.max(1, Math.floor(width * dpr));
  const targetHeight = Math.max(1, Math.floor(height * dpr));
  return {dpr, baseDpr, requestedDpr, densityScale, width: targetWidth, height: targetHeight,
    pixels: targetWidth * targetHeight, pixelBudget,
    bounded: dpr < requestedDpr, policy: 'physical-pixel-area-and-dimension-cap'};
}
