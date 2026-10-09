import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrameScheduler} from '../components/runtime-scheduler.mjs';
import {createDOMPublisher} from '../components/dom-publisher.mjs';

function harness(onFrame = () => {}) {
  const pending = new Map(), delivered = []; let next = 0;
  const scheduler = createFrameScheduler({request: callback => {pending.set(++next, callback); return next;}, cancel: id => pending.delete(id), onFrame: now => {delivered.push(now); onFrame();}});
  return {scheduler, pending, delivered, run(now) {const [id, callback] = pending.entries().next().value; pending.delete(id); callback(now);}};
}

test('repeated invalidations schedule one frame and a frame can request its successor', () => {
  const state = harness(() => state.scheduler.schedule());
  for (let i = 0; i < 100; i++) state.scheduler.schedule();
  assert.equal(state.pending.size, 1);
  state.run(10); assert.deepEqual(state.delivered, [10]); assert.equal(state.pending.size, 1);
  state.run(20); assert.deepEqual(state.delivered, [10, 20]); assert.equal(state.pending.size, 1);
  state.scheduler.dispose(); assert.equal(state.pending.size, 0);
});

test('page-cache, visibility and freeze reasons cannot resume each other', () => {
  const state = harness(); state.scheduler.schedule();
  state.scheduler.suspend('page', true); state.scheduler.suspend('visibility', true); state.scheduler.suspend('freeze', true);
  assert.equal(state.pending.size, 0);
  state.scheduler.suspend('page', false); state.scheduler.schedule(); assert.equal(state.pending.size, 0);
  state.scheduler.suspend('freeze', false); state.scheduler.schedule(); assert.equal(state.pending.size, 0);
  state.scheduler.suspend('visibility', false); assert.equal(state.pending.size, 0);
  state.scheduler.schedule(); state.run(10000); assert.deepEqual(state.delivered, [10000]);
});

test('a queued browser callback after suspension or disposal cannot run application work', () => {
  for (const action of ['suspend', 'dispose']) {
    const state = harness(); state.scheduler.schedule(); const callback = [...state.pending.values()][0];
    if (action === 'suspend') state.scheduler.suspend('page', true); else state.scheduler.dispose();
    callback(20); state.scheduler.schedule();
    assert.deepEqual(state.delivered, []); assert.equal(state.pending.size, 0);
  }
});

test('a stale callback cannot consume or duplicate the new resume frame', () => {
  const state = harness(); state.scheduler.schedule(); const stale = [...state.pending.values()][0];
  state.scheduler.suspend('page', true); state.scheduler.suspend('page', false); state.scheduler.schedule();
  stale(1); assert.equal(state.scheduler.inspect().scheduled, true); assert.equal(state.pending.size, 1); assert.deepEqual(state.delivered, []);
  state.run(1000); assert.deepEqual(state.delivered, [1000]); assert.equal(state.scheduler.inspect().scheduled, false);
});

test('unchanged DOM publication performs no write and external discrete replacement is reconciled', () => {
  const style = new Map(), attributes = new Map(); let writes = 0, text = '';
  const node = {style: {getPropertyValue: name => style.get(name) ?? '', setProperty(name, value) {style.set(name, value); writes++;}},
    getAttribute: name => attributes.get(name) ?? null, setAttribute(name, value) {attributes.set(name, value); writes++;}, removeAttribute(name) {attributes.delete(name); writes++;},
    get textContent() {return text;}, set textContent(value) {text = value; writes++;}};
  const publisher = createDOMPublisher();
  for (let frame = 0; frame < 120; frame++) {publisher.style(node, '--rest', '0px'); publisher.attribute(node, 'aria-current', 'location'); publisher.text(node, '02 / 07');}
  assert.equal(writes, 3); assert.equal(publisher.inspect().unchanged, 357);
  node.setAttribute('aria-current', 'false'); publisher.attribute(node, 'aria-current', 'location'); assert.equal(node.getAttribute('aria-current'), 'location');
  publisher.attribute(node, 'aria-current', null); publisher.attribute(node, 'aria-current', null); assert.equal(node.getAttribute('aria-current'), null);
  assert.equal(writes, 6);
});
