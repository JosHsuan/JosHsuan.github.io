import test from 'node:test'
import assert from 'node:assert/strict'
import { cameraAt, expansionAt, panelRect } from '../src/opening/choreography.ts'
import { createInkSeeds, inkFrameAt, inkLifeAt } from '../src/opening/arrival.ts'

test('ink has a finite emission window and is fully gone before reading expansion', () => {
  const { origins, timing } = createInkSeeds(65536)
  let aliveAtWriting = 0
  for (let i = 0; i < timing.length; i += 4) {
    const birth = timing[i], life = timing[i + 1]
    assert.ok(birth >= 0.06 && birth < 0.37)
    assert.ok(birth + life < 0.85)
    assert.equal(inkLifeAt(0, birth, life), 0)
    assert.equal(inkLifeAt(0.85, birth, life), 0)
    if (inkLifeAt(0.3, birth, life) > 0) aliveAtWriting++
  }
  assert.ok(aliveAtWriting > 50000)
  assert.ok(origins.every(Number.isFinite))
  assert.equal(expansionAt(0), 0)
  assert.equal(expansionAt(1), 1)
})

test('reconstruction uses repeatable seeds and clamps scroll sample indices', () => {
  assert.deepEqual(createInkSeeds(4096), createInkSeeds(4096))
  assert.equal(inkFrameAt(-1), 0)
  assert.equal(inkFrameAt(0.3), 48)
  assert.equal(inkFrameAt(2), 160)
})

test('camera settles before final dissipation with continuous braking', () => {
  assert.deepEqual(cameraAt(0.6), cameraAt(1))
  cameraAt(0.6 - 0.0001).forEach((n, i) => assert.ok(Math.abs(n - cameraAt(1)[i]) < 1e-6))
})

test('window remains inside desktop, narrow, and landscape viewports', () => {
  for (const [width, height] of [[1440, 900], [390, 844], [768, 600], [844, 390], [320, 568]]) {
    for (const p of [0, 0.85, 0.9, 0.95, 1]) {
      const r = panelRect(p, width, height)
      assert.ok(r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0)
      assert.ok(r.x + r.w <= width && r.y + r.h <= height)
    }
  }
})

test('the static background requires no empty lead-in before expansion', () => {
  assert.ok(expansionAt(0.1) > 0)
  assert.ok(expansionAt(0.5) > expansionAt(0.1))
  assert.equal(expansionAt(-1), 0)
  assert.equal(expansionAt(2), 1)
})
