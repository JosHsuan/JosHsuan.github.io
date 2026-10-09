export function createStoryInput() {
  let state = {u: 0, nativeU: 0, visualU: 0, stageU: .5/7, energy: 0, dwellWeight: 1, detail: 'full', pointer: {x: 0, y: 0}, reduced: false, hidden: false};
  const listeners = new Set();
  let presentation={controllerFrame:-1,chapterId:null};
  return {get: () => state, set(patch) {state = {...state, ...patch}; listeners.forEach(fn => fn());}, subscribe(fn) {listeners.add(fn); return () => listeners.delete(fn);},
    getPresentation:()=>presentation,
    // Renderer acknowledgment is passive: notifying subscribers here would
    // schedule another frame and prevent the paused scene from becoming idle.
    markPresented(controllerFrame,chapterId){presentation={controllerFrame,chapterId};}};
}
