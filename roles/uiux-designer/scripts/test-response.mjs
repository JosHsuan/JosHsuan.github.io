import test from 'node:test';
import assert from 'node:assert/strict';
import { createResponse } from '../src/spatial-feedback/response.js';
test('Response is interruptible, settles at varied frame rates, and releases scheduled work', () => {
  const original = { document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame };
  try {
    for (const hz of [24, 60, 144]) {
      const document = new EventTarget(); document.hidden = false; globalThis.document = document;
      let id = 0, time = 0; const queued = new Map(); let rendered;
      globalThis.requestAnimationFrame = callback => { queued.set(++id, callback); return id; };
      globalThis.cancelAnimationFrame = handle => queued.delete(handle);
      const step = () => { const callbacks = [...queued.values()]; queued.clear(); time += 1000 / hz; callbacks.forEach(callback => callback(time)); };
      const response = createResponse({ initial: { x: 0 }, render: value => { rendered = value.x; } });
      response.feel('elastic'); response.to({ x: 1 }); for (let i = 0; i < Math.ceil(hz * .17); i++) step();
      assert(rendered > 0 && rendered < 1.3); response.to({ x: -.5 });
      for (let i = 0; i < hz * 5 && queued.size; i++) step();
      assert.equal(rendered, -.5, `${hz}Hz reaches the reversed target`); assert.equal(queued.size, 0, `${hz}Hz stops at rest`);
      response.to({ x: 1 }); step(); document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
      assert.equal(rendered, 1); assert.equal(queued.size, 0, 'hidden document snaps and stops');
      response.to({ x: .2 }); response.destroy(); assert.equal(queued.size, 0, 'disposal cancels scheduled work'); response.to({ x: 9 }); assert.equal(queued.size, 0);
      const reduced = createResponse({ initial: { x: 0 }, reduced: true, render: value => { rendered = value.x; } }); reduced.to({ x: 1 }); assert.equal(rendered, 1); assert.equal(queued.size, 0); reduced.destroy();
    }
  } finally { Object.assign(globalThis, original); }
});
