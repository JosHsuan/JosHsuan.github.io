import test from 'node:test'
import assert from 'node:assert/strict'
import { OpeningController } from '../src/opening/controller.ts'

function clockHarness(run: (controller: OpeningController, step: (ms?: number) => void, pending: () => number) => void) {
  let time = performance.now(), nextId = 0
  const callbacks = new Map<number, FrameRequestCallback>()
  const previousRaf = globalThis.requestAnimationFrame, previousCancel = globalThis.cancelAnimationFrame
  globalThis.requestAnimationFrame = callback => { const id = ++nextId; callbacks.set(id, callback); return id }
  globalThis.cancelAnimationFrame = id => { callbacks.delete(id) }
  const controller = new OpeningController()
  const step = (ms = 1000 / 60) => {
    time += ms
    const queue = [...callbacks.values()]
    callbacks.clear()
    queue.forEach(callback => callback(time))
  }
  try { run(controller, step, () => callbacks.size) }
  finally {
    controller.stop()
    globalThis.requestAnimationFrame = previousRaf
    globalThis.cancelAnimationFrame = previousCancel
  }
}

test('input smoothing settles exactly and stops requesting frames', () => clockHarness((controller, step, pending) => {
  controller.seek(0.44)
  for (let i = 0; i < 80; i++) step()
  assert.equal(controller.progress, 0.44)
  assert.equal(pending(), 0)
  step(10000)
  assert.equal(controller.progress, 0.44)
  assert.equal(controller.getSnapshot().completed, false)
}))

test('reverse input interrupts an unfinished approach', () => clockHarness((controller, step) => {
  controller.seek(0.72)
  for (let i = 0; i < 4; i++) step()
  controller.seek(0.2)
  for (let i = 0; i < 80; i++) step()
  assert.equal(controller.progress, 0.2)
  assert.equal(controller.getSnapshot().completed, false)
}))

test('full expansion can reverse and complete repeatedly without replay', () => clockHarness((controller, step, pending) => {
  for (let cycle = 0; cycle < 3; cycle++) {
    controller.seek(1)
    for (let i = 0; i < 80; i++) step()
    assert.equal(controller.getSnapshot().completed, true)
    controller.seek(0)
    step()
    assert.ok(controller.progress < 1)
    assert.equal(controller.getSnapshot().completed, false)
    for (let i = 0; i < 80; i++) step()
    assert.equal(controller.progress, 0)
    assert.equal(pending(), 0)
  }
}))

test('direct expansion also remains reversible', () => clockHarness((controller, step) => {
  controller.finish()
  assert.equal(controller.progress, 1)
  controller.seek(.7)
  for (let i = 0; i < 80; i++) step()
  assert.equal(controller.progress, .7)
  assert.equal(controller.getSnapshot().completed, false)
}))

test('reduced motion resolves immediately and prevents review playback', () => clockHarness((controller, step, pending) => {
  controller.seek(0.5)
  step()
  controller.setReduced(true)
  assert.equal(controller.progress, 1)
  assert.equal(pending(), 0)
  controller.replay()
  assert.equal(controller.progress, 1)
  controller.seek(0)
  step()
  assert.equal(controller.progress, 1)
  assert.equal(pending(), 0)
}))
