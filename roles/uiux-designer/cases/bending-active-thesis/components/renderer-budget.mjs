import {resolveRenderBudget} from './render-budget.mjs';

/** Install before Fiber configures its renderer. Fiber's stored viewport DPR can
 * be stale during resize; this renderer boundary is the allocation authority.
 * The case uses Three's ordinary output buffer (no setEffects) and no XR.
 * getPolicy supplies the current detail, deviceDpr and optional densityScale. */
export function createRendererBudget(renderer, getPolicy) {
  const canvas = renderer.domElement;
  const original = {setSize: renderer.setSize, setPixelRatio: renderer.setPixelRatio, setDrawingBufferSize: renderer.setDrawingBufferSize};
  const size = {x: 0, y: 0, set(x, y) {this.x = x; this.y = y; return this;}};
  let last = null, disposed = false, allocations = 0, intermediateShrinks = 0;

  function apply(width, height, updateStyle, resetViewport) {
    if (disposed) throw Error('Renderer budget guard has been disposed');
    const policy = getPolicy();
    const budget = resolveRenderBudget({maxTextureSize: renderer.capabilities.maxTextureSize, ...policy, width, height});
    renderer.getSize(size);
    const changed = size.x !== width || size.y !== height || renderer.getPixelRatio() !== budget.dpr
      || canvas.width !== budget.width || canvas.height !== budget.height;
    if (changed) {
      // Three's combined API avoids setPixelRatio -> setSize using OLD logical
      // dimensions. Its native width/height assignments are still sequential:
      // a wide new width beside a tall old height must never exceed the cap.
      if (budget.width * canvas.height > budget.pixelBudget) {
        canvas.height = Math.max(1, Math.min(canvas.height, budget.height,
          Math.floor(budget.pixelBudget / Math.max(1, canvas.width, budget.width))));
        intermediateShrinks++;
      }
      original.setDrawingBufferSize.call(renderer, width, height, budget.dpr);
      allocations++;
    } else if (resetViewport) renderer.setViewport(0, 0, width, height);
    if (updateStyle === true && canvas.style) {
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    }
    last = {...budget, viewportWidth: width, viewportHeight: height,
      detail: policy.detail ?? 'full', deviceDpr: policy.deviceDpr ?? 1, densityScale: policy.densityScale ?? 1};
    return last;
  }

  const guardedSize = (width, height, updateStyle = true) => {
    if (renderer.xr?.isPresenting) return;
    apply(width, height, updateStyle, true);
  };
  const guardedRatio = value => {
    if (value === undefined || renderer.xr?.isPresenting) return;
    renderer.getSize(size);
    // The call is a sizing notification; stale or oversized caller DPR cannot
    // override the currently selected product policy.
    apply(size.x, size.y, false, true);
  };
  const guardedDrawingBuffer = (width, height) => apply(width, height, false, true);
  renderer.setSize = guardedSize;
  renderer.setPixelRatio = guardedRatio;
  renderer.setDrawingBufferSize = guardedDrawingBuffer;
  return {
    sync(width, height) {return apply(width, height, false, false);},
    inspect() {return {budget: last ? {...last} : null, allocations, intermediateShrinks, disposed};},
    dispose() {
      if (disposed) return; disposed = true;
      if (renderer.setSize === guardedSize) renderer.setSize = original.setSize;
      if (renderer.setPixelRatio === guardedRatio) renderer.setPixelRatio = original.setPixelRatio;
      if (renderer.setDrawingBufferSize === guardedDrawingBuffer) renderer.setDrawingBufferSize = original.setDrawingBufferSize;
    },
  };
}
