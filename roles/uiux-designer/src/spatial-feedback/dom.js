import { scaffold, node, control, range } from '../specimens/helpers.js';
import { createResponse } from './response.js';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
function surface(parent, className, text) { const element = node('div', text, { class: className }); parent.append(element); return element; }
function pressed(button, value) { button.setAttribute('aria-pressed', String(value)); }
function choice(controls, label, items, action) {
  const select = node('select', undefined, { 'aria-label': label });
  items.forEach(([value, text]) => select.append(node('option', text, { value })));
  const wrapper = node('label', label); wrapper.append(select); controls.append(wrapper);
  select.addEventListener('change', () => action(select.value)); return select;
}
/** Geometry moves inside stable hit regions. Pointer, focus and selected state are distinct. */
export default function mount(root, material, context) {
  const { stage, controls, status } = scaffold(root, material);
  stage.classList.add('feedback-stage', `feedback-${material.variant}`);
  stage.dataset.scheduler = 'idle';
  const events = new AbortController(); const cleanups = [];
  const listen = (target, type, handler) => target.addEventListener(type, handler, { signal: events.signal });
  const tell = text => { status.textContent = text; };
  function response(initial, render) {
    const r = createResponse({ initial, render, reduced: context.reduced, onActivity: moving => { stage.dataset.scheduler = moving ? 'active' : 'idle'; } }); cleanups.push(() => r.destroy()); return r;
  }
  let motion;
  if (material.variant === 'type') {
    const space = surface(stage, 'type-space');
    const words = ['FORM', 'SYSTEM', 'MAKE'].map((word, i) => {
      const button = node('button', undefined, { class: 'type-hit', 'aria-label': `Inspect ${word}` });
      const plane = surface(button, 'type-plane', word); plane.dataset.word = String(i);
      surface(plane, 'type-plane-edge'); space.append(button); return { button, plane };
    });
    let spread = false;
    motion = response({ open: 0, focus: -1 }, v => words.forEach(({ plane }, i) => {
      const local = clamp((v.open - i * .1) / .8, 0, 1), focus = Math.max(0, 1 - Math.abs(v.focus - i));
      plane.style.transform = `translate3d(${(i - 1) * local * 15}px,0,${local * (i - 1) * 32 + focus * 12}px) rotateY(${(i - 1) * local * 26}deg) rotateX(${local * 10}deg)`;
    }));
    words.forEach(({ button }, i) => {
      listen(button, 'pointerenter', e => { if (e.pointerType === 'mouse' && !context.reduced) motion.to({ focus: i }); });
      listen(button, 'pointerleave', () => { if (!button.matches(':focus-visible')) motion.to({ focus: -1 }); });
      listen(button, 'focus', () => motion.to({ focus: i })); listen(button, 'blur', () => motion.to({ focus: -1 }));
      listen(button, 'click', () => { tell(`${['FORM', 'SYSTEM', 'MAKE'][i]} selected. Each word keeps its own plane; the reading order is unchanged.`); });
    });
    const toggle = control(controls, 'Fan the word planes', () => { spread = !spread; pressed(toggle, spread); motion.to({ open: spread ? 1 : 0 }); tell(spread ? 'Three planes / shallow fan / selectable words.' : 'One reading plane / headings at rest.'); }); pressed(toggle, false);
    control(controls, 'Reset', () => { spread = false; pressed(toggle, false); motion.to({ open: 0, focus: -1 }); tell('Type planes reset.'); });
  } else if (material.variant === 'glyph') {
    const space = surface(stage, 'mechanism-space');
    const mechanism = surface(space, 'mechanism');
    const parts = Array.from({ length: 5 }, (_, i) => surface(mechanism, 'mechanism-part', i === 2 ? '+' : ''));
    let mode = 'form', opened = false;
    motion = response({ open: 0 }, v => {
      mechanism.dataset.mode = mode;
      parts.forEach((part, i) => {
        const n = i - 2, p = v.open;
        part.style.transform = mode === 'form' ? `translateZ(${n * p * 18}px) rotateX(${55 + n * p * 18}deg) rotateY(${n * p * 24}deg)` : mode === 'system' ? `translate3d(${n * 28}px,${Math.sin(i * 2) * p * 48}px,${n * p * 30}px) rotateY(${-n * p * 18}deg)` : `translate3d(${n * p * 22}px,${n * 14}px,${Math.abs(n) * p * 26}px) rotateY(${n * p * 18}deg)`;
      });
    });
    choice(controls, 'Object logic', [['form', 'FORM / gimbal'], ['system', 'SYSTEM / network'], ['make', 'MAKE / interlock']], value => { mode = value; motion.snap(); tell(`Identity mechanism: ${value}. The same five parts follow a different spatial rule.`); });
    const toggle = control(controls, 'Open mechanism', () => { opened = !opened; pressed(toggle, opened); motion.to({ open: opened ? 1 : 0 }); tell(opened ? `${mode.toUpperCase()} mechanism opened.` : 'Mechanism returned to its compact identity.'); }); pressed(toggle, false);
    control(controls, 'Reset', () => { opened = false; pressed(toggle, false); motion.to({ open: 0 }); tell('Mechanism reset.'); });
  } else if (material.variant === 'key') {
    const space = surface(stage, 'key-space'); const key = node('button', undefined, { class: 'depth-key', 'aria-label': 'Toggle surface representation', 'aria-pressed': 'false' });
    const rig = surface(key, 'key-rig'); const cap = surface(rig, 'key-cap'); const icon = node('img', undefined, { src: '/assets/icons/icons-lucide/layers.svg', alt: '' }); cap.append(icon, node('span', 'SURFACE')); space.append(key);
    const tile = surface(space, 'key-result'); surface(tile, 'key-result-grid');
    let filled = false, held = false, cancelled = false;
    motion = response({ press: 0, ready: 0 }, v => { cap.style.transform = `translateZ(${14 + v.ready * 5 - v.press * 16}px) rotateX(${v.press * 5}deg)`; });
    function release() { held = false; motion.to({ press: 0 }); }
    listen(key, 'pointerdown', e => { if (e.button !== 0) return; held = true; cancelled = false; key.setPointerCapture(e.pointerId); motion.to({ press: 1 }); });
    listen(key, 'pointerup', e => { const rect = key.getBoundingClientRect(); cancelled = e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom; release(); });
    listen(key, 'pointercancel', () => { cancelled = true; release(); }); listen(key, 'lostpointercapture', release);
    listen(key, 'pointerenter', e => { if (e.pointerType === 'mouse' && !context.reduced) motion.to({ ready: 1 }); });
    listen(key, 'pointerleave', () => { if (!held) motion.to({ ready: 0 }); });
    listen(key, 'keydown', e => { if ([' ', 'Enter'].includes(e.key)) motion.to({ press: 1 }); });
    listen(key, 'keyup', release); listen(key, 'blur', () => { if (!held) { release(); motion.to({ ready: 0 }); } });
    listen(window, 'blur', () => { cancelled = true; release(); motion.to({ ready: 0 }); });
    listen(key, 'focus', () => motion.to({ ready: 1 }));
    const toggle = () => { filled = !filled; pressed(key, filled); tile.dataset.filled = String(filled); tell(`Representation: ${filled ? 'surface' : 'wire'}. The key changes this specimen's actual tile.`); };
    listen(key, 'click', e => { if (e.detail === 0 || !cancelled) toggle(); cancelled = false; });
    control(controls, 'Reset', () => { filled = false; pressed(key, false); tile.dataset.filled = 'false'; motion.to({ press: 0, ready: 0 }); tell('Representation: wire.'); });
    surface(stage, 'feedback-caption', 'Press the key with a pointer, Enter or Space. The output changes immediately.');
  } else if (material.variant === 'card') {
    const hit = node('button', undefined, { class: 'card-hit', 'aria-label': 'Inspect the layered specimen', 'aria-pressed': 'false' }); stage.append(hit);
    const rig = surface(hit, 'card-rig'); const layers = ['RULE / 03', '', 'FIELD STUDY'].map((text, i) => surface(rig, `card-layer layer-${i}`, text));
    surface(layers[1], 'card-line-field'); surface(layers[2], 'card-label', 'Original generated specimen');
    let open = false;
    motion = response({ open: 0, x: 0, y: 0 }, v => {
      rig.style.transform = `rotateX(${-v.y * 9 + v.open * 9}deg) rotateY(${v.x * 12 - v.open * 12}deg)`;
      layers.forEach((part, i) => { part.style.transform = `translate3d(${(i - 1) * v.open * 12}px,${(i - 1) * v.open * -12}px,${i * (8 + v.open * 35)}px)`; });
    });
    listen(hit, 'pointermove', e => { if (e.pointerType !== 'mouse' || context.reduced) return; const b = hit.getBoundingClientRect(); motion.to({ x: clamp((e.clientX - b.left) / b.width * 2 - 1, -1, 1), y: clamp((e.clientY - b.top) / b.height * 2 - 1, -1, 1) }); });
    listen(hit, 'pointerleave', () => motion.to({ x: 0, y: 0 }));
    function toggle() { open = !open; pressed(hit, open); pressed(inspect, open); motion.to({ open: open ? 1 : 0, x: 0, y: 0 }); tell(open ? 'Layers separated: rule, generated field, editorial label.' : 'Layers assembled into one card.'); }
    listen(hit, 'click', toggle); const inspect = control(controls, 'Inspect layers', toggle); pressed(inspect, false);
    control(controls, 'Reset', () => { open = false; pressed(hit, false); pressed(inspect, false); motion.to({ open: 0, x: 0, y: 0 }); tell('Card reset.'); });
    surface(stage, 'feedback-caption', 'Pointer tilt is decorative. Tap the card or use Inspect layers for the same content.');
  } else if (material.variant === 'navigation') {
    const rail = surface(stage, 'depth-rail'); rail.setAttribute('role', 'group'); rail.setAttribute('aria-label', 'Study sections');
    const destinations = ['FORM', 'SYSTEM', 'MAKE']; const descriptions = ['Study the object and its silhouette.', 'Inspect the rules and relationships.', 'Read the assembly order and interfaces.'];
    const buttons = destinations.map((label, i) => { const b = node('button', undefined, { 'aria-pressed': String(i === 0) }); surface(b, 'rail-face', label); rail.append(b); return b; });
    const result = surface(stage, 'rail-content'); const title = node('h2', 'FORM'); const text = node('p', descriptions[0]); result.append(title, text);
    let selected = 0;
    motion = response({ active: 0, hover: -1 }, v => buttons.forEach((b, i) => { const active = Math.max(0, 1 - Math.abs(i - v.active)), hover = Math.max(0, 1 - Math.abs(i - v.hover)); b.firstElementChild.style.transform = `translateZ(${active * 28 + hover * 6}px) rotateX(${(1 - active) * 16}deg)`; }));
    const select = i => { selected = i; buttons.forEach((b, j) => pressed(b, i === j)); title.textContent = destinations[i]; text.textContent = descriptions[i]; motion.to({ active: i }); tell(`${destinations[i]} section selected. Content updates without waiting for motion.`); };
    buttons.forEach((b, i) => {
      listen(b, 'click', () => select(i));
      listen(b, 'pointerenter', e => { if (e.pointerType === 'mouse' && !context.reduced) motion.to({ hover: i }); }); listen(b, 'pointerleave', () => motion.to({ hover: -1 }));
      listen(b, 'focus', () => motion.to({ hover: i })); listen(b, 'blur', () => motion.to({ hover: -1 }));
    });
    control(controls, 'Next section', () => select((selected + 1) % 3)); control(controls, 'Reset', () => select(0));
  } else if (material.variant === 'panel') {
    const shell = surface(stage, 'hinge-shell');
    const doorLeft = surface(shell, 'hinge-door hinge-left', 'FORM'); const doorRight = surface(shell, 'hinge-door hinge-right', 'SYSTEM');
    doorLeft.setAttribute('aria-hidden', 'true'); doorRight.setAttribute('aria-hidden', 'true');
    const panel = node('div', undefined, { class: 'hinge-content', id: 'hinge-details', hidden: '' });
    panel.append(node('h2', 'Inside the assembly'), node('p', 'Two covers rotate around their outer edges. The drawing beneath stays in one reading plane.'), node('a', 'Inspect the 3D assembly study', { href: '/?material=feedback-assembly', target: '_top' })); stage.append(panel);
    let open = false;
    motion = response({ open: 0 }, v => { doorLeft.style.transform = `rotateY(${-v.open * 68}deg)`; doorRight.style.transform = `rotateY(${v.open * 68}deg)`; shell.dataset.open = String(open); });
    const button = control(controls, 'Open detail panel', () => { open = !open; panel.hidden = !open; button.setAttribute('aria-expanded', String(open)); button.textContent = open ? 'Close detail panel' : 'Open detail panel'; motion.to({ open: open ? 1 : 0 }); tell(open ? 'Detail panel open. Its text is immediately readable.' : 'Detail panel closed.'); }); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', panel.id);
  }
  if (motion) {
    if (!context.reduced) choice(controls, 'Response character', [['precise', 'Precise / settle'], ['elastic', 'Elastic / rebound']], value => { motion.feel(value); tell(`Response character: ${value}. Apply an interaction to compare.`); });
    const depth = range(controls, 'Perspective / px', 450, 1400, 50, 850, value => { stage.style.setProperty('--perspective', `${value}px`); });
    depth.input.setAttribute('aria-label', 'Perspective / px');
  }
  const guidance = node('p', context.reduced ? 'Reduced motion: direct state changes, no animated interpolation or pointer parallax.' : 'No autoplay. Change a state, reverse it mid-motion, or compare the response character.', { class: 'reduced-note' }); root.querySelector('.specimen').append(guidance);
  tell('Ready / spatial interaction study / no autoplay.');
  return () => { events.abort(); cleanups.forEach(cleanup => cleanup()); };
}
