export function createStoryInput() {
  let state = {u: 0, nativeU: 0, visualU: 0, stageU: .5/7, energy: 0, dwellWeight: 1, detail: 'full', protectedRects: [], pointer: {x: 0, y: 0}, reduced: false, hidden: false};
  const listeners = new Set();
  return {get: () => state, set(patch) {state = {...state, ...patch}; listeners.forEach(fn => fn());}, subscribe(fn) {listeners.add(fn); return () => listeners.delete(fn);}};
}
