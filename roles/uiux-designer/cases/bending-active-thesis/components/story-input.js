export function createStoryInput() {
  let state = {u: 0, pointer: {x: 0, y: 0}, reduced: false, hidden: false};
  const listeners = new Set();
  return {get: () => state, set(patch) {state = {...state, ...patch}; listeners.forEach(fn => fn());}, subscribe(fn) {listeners.add(fn); return () => listeners.delete(fn);}};
}
