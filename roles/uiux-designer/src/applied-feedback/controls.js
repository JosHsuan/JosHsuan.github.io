import { node } from '../specimens/helpers.js';
import { createResponse } from '../spatial-feedback/response.js';

/** The same comparison contract for every material; each material owns its object mapping. */
export function feedbackControls({ container, controls, stage }, context, initial, draw) {
  container.classList.add('applied-feedback');
  let spatial = true;
  const label = node('label', 'Feedback'); const select = node('select', undefined, { 'aria-label': 'Feedback' });
  select.append(node('option', 'Spatial', { value: 'spatial' }), node('option', 'Baseline', { value: 'baseline' })); label.append(select); controls.append(label);
  const response = createResponse({ initial, reduced: context.reduced, render: value => { draw(value, spatial); }, onActivity: active => { stage.dataset.moving = String(active); } });
  stage.dataset.feedback = 'spatial';
  stage.dataset.moving = 'false';
  select.addEventListener('change', () => { spatial = select.value === 'spatial'; stage.dataset.feedback = select.value; response.snap(); });
  return { to: value => spatial ? response.to(value) : response.snap(value), snap: value => response.snap(value), get spatial() { return spatial; }, destroy: () => response.destroy() };
}

/** Pointer/key compression owns only an inner rig; native activation stays on its wrapper. */
export function pressFeedback(button, change) {
  let pointer = null, cancelled = false;
  button.addEventListener('pointerdown', event => { if (event.button !== 0) return; cancelled = false; pointer = event.pointerId; button.setPointerCapture(pointer); change(1); });
  const release = () => { pointer = null; change(0); };
  button.addEventListener('pointerup', event => { const box = button.getBoundingClientRect(); cancelled = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom; release(); }); button.addEventListener('pointercancel', () => { cancelled = true; release(); }); button.addEventListener('lostpointercapture', release);
  button.addEventListener('click', event => { if (cancelled) { event.preventDefault(); event.stopImmediatePropagation(); cancelled = false; } }, true);
  button.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key) && !event.repeat) { cancelled = false; change(1); } });
  button.addEventListener('keyup', event => { if (['Enter', ' '].includes(event.key)) change(0); });
  button.addEventListener('blur', () => { if (pointer === null) change(0); });
}
