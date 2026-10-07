import { gsap } from 'gsap';
import { node, range, control, scaffold } from './helpers.js';
import { feedbackControls } from '../applied-feedback/controls.js';
export default function reflow(root, material, context) {
  const shell = scaffold(root, material); const { stage, controls, status } = shell; const field = node('div', undefined, { class: 'part-field' }); stage.append(field);
  const faces = []; const parts = Array.from({ length: 6 }, () => { const part = node('div', undefined, { class: 'part-block', 'aria-hidden': 'true' }); const face = node('span', undefined, { class: 'part-face' }); part.append(face); faces.push(face); return part; }); parts.forEach(part => field.append(part));
  const feedback = feedbackControls(shell, context, { open: 0, ...Object.fromEntries(faces.map((_, i) => [`part${i}`, 0])) }, (value, spatial) => { faces.forEach((face, i) => { const inspected = value[`part${i}`]; face.style.transform = spatial ? `translateZ(${inspected * 30 + value.open * 8}px) rotateX(${-value.open * 24 - inspected * 12}deg) rotateY(${(i % 2 ? 1 : -1) * (value.open * 10 + inspected * 9)}deg)` : 'none'; }); });
  let selected = -1; const selection = node('div', undefined, { class: 'part-selection', role: 'group', 'aria-label': 'Inspect a reflow part' }); const selectors = faces.map((face, i) => { const button = control(selection, String(i + 1), () => { selected = selected === i ? -1 : i; selectors.forEach((b, index) => { b.setAttribute('aria-pressed', String(selected === index)); faces[index].dataset.selected = String(selected === index); }); feedback.to(Object.fromEntries(faces.map((_, index) => [`part${index}`, Number(selected === index)]))); }); button.setAttribute('aria-label', `Inspect part ${i + 1}`); button.setAttribute('aria-pressed', 'false'); return button; }); controls.before(selection);
  let exploded = false; let separation = 1; let tween;
  function arrange(immediate = false) {
    tween?.kill();
    feedback.to({ open: Number(exploded) });
    const width = parts[0].offsetWidth; const center = field.clientWidth / 2 - width / 2; const gap = Math.max(0, Math.min(70 * separation, center - 10));
    const properties = { x: i => exploded ? center + (i % 2 ? gap : -gap) : center, y: i => exploded ? 20 + Math.floor(i / 2) * 80 : 28 + i * 25, rotation: i => exploded ? i % 2 ? 7 : -7 : 0 };
    if (immediate || context.reduced) gsap.set(parts, properties);
    else tween = gsap.to(parts, { ...properties, duration: .65, ease: 'power2.inOut', overwrite: true, onComplete: () => { status.textContent = exploded ? 'Separated reading.' : 'Packed reading.'; } });
    status.textContent = `${exploded ? 'Separated' : 'Packed'} layout${context.reduced ? ' / reduced motion, direct state change' : ''}.`;
  }
  control(controls, 'Packed', () => { exploded = false; arrange(); }); control(controls, 'Separated', () => { exploded = true; arrange(); });
  const separationControl = range(controls, 'Separation', .6, 1.5, .1, 1, value => { separation = value; arrange(); }); control(controls, 'Reset', () => { exploded = false; separation = 1; selected = -1; selectors.forEach((b, i) => { b.setAttribute('aria-pressed', 'false'); faces[i].dataset.selected = 'false'; }); feedback.snap(Object.fromEntries(faces.map((_, i) => [`part${i}`, 0]))); separationControl.input.value = '1'; separationControl.output.textContent = '1'; arrange(true); });
  const resize = new ResizeObserver(() => arrange(true)); resize.observe(field); arrange(true);
  return () => { feedback.destroy(); resize.disconnect(); tween?.kill(); gsap.killTweensOf(parts); };
}
