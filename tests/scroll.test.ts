import test from 'node:test'
import assert from 'node:assert/strict'
import { scrollDestination } from '../src/opening/scroll.ts'

const expanded = { delta: -100, inTerminal: true, contentTop: 200, completed: true, sceneGesture: false, reduced: false }

test('expanded content reads upward before its top hands input back to the opening', () => {
  assert.equal(scrollDestination(expanded), 'native')
  assert.equal(scrollDestination({ ...expanded, contentTop: 0 }), 'opening')
  assert.equal(scrollDestination({ ...expanded, contentTop: 0, delta: 100 }), 'native')
})

test('background can reverse the full expansion independently of the reading position', () => {
  assert.equal(scrollDestination({ ...expanded, inTerminal: false }), 'opening')
  assert.equal(scrollDestination({ ...expanded, inTerminal: false, delta: 100 }), 'content')
})

test('background gestures keep ownership when the expanding window crosses the pointer', () => {
  assert.equal(scrollDestination({ ...expanded, completed: false, sceneGesture: true }), 'opening')
  assert.equal(scrollDestination({ ...expanded, completed: false, sceneGesture: false }), 'native')
})

test('reduced motion leaves the workspace expanded and routes background input to reading', () => {
  assert.equal(scrollDestination({ ...expanded, contentTop: 0, reduced: true }), 'native')
  assert.equal(scrollDestination({ ...expanded, inTerminal: false, reduced: true }), 'content')
})
