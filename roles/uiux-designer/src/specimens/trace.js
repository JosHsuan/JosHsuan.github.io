import { node, range, control, scaffold, svgNode } from './helpers.js';
import { feedbackControls } from '../applied-feedback/controls.js';
export default function trace(root, material, context) {
  const parts = scaffold(root, material); const { stage, controls, status } = parts; const stack = node('div', undefined, { class: 'trace-stack' }); const planes = ['guide', 'axis', 'drawing'].map(name => node('div', undefined, { class: `trace-plane ${name}`, ...(name === 'drawing' ? {} : { 'aria-hidden': 'true' }) })); stack.append(...planes); stage.append(stack);
  const svg = svgNode('svg', { viewBox: '0 0 440 270', role: 'img', 'aria-label': 'A closed folded section with an internal relationship line' });
  const path = svgNode('path', { d: 'M70 160L140 65L235 100L365 50L330 205L225 175L160 225Z M140 65L160 225M235 100L225 175M70 160L225 175L365 50', fill: 'none', stroke: '#ff7a45', 'stroke-width': '2' }); svg.append(path); planes[2].append(svg);
  // Construction axes are separate line elements, not a duplicate of the traced path.
  const axes = svgNode('svg', { viewBox: '0 0 440 270' }); for (const [x1, y1, x2, y2] of [[55, 225, 390, 225], [55, 225, 55, 35], [55, 225, 310, 35]]) axes.append(svgNode('line', { x1, y1, x2, y2, stroke: '#acbcc5' })); planes[1].append(axes);
  const feedback = feedbackControls(parts, context, { separation: .6 }, (value, spatial) => { planes.forEach((plane, i) => { plane.style.transform = spatial ? `translate3d(${(i - 1) * value.separation * 12}px,${(1 - i) * value.separation * 12}px,${i * value.separation * 30}px) rotateX(12deg) rotateY(-10deg)` : 'none'; }); });
  range(controls, 'Plane separation', 0, 1, .1, .6, value => feedback.to({ separation: value }));
  const length = path.getTotalLength(); path.style.strokeDasharray = length;
  let animation; let frame; const slider = range(controls, 'Manual progress / %', 0, 100, 1, 100, value => { animation?.cancel(); cancelAnimationFrame(frame); path.style.strokeDashoffset = length * (1 - value / 100); status.textContent = `Outline ${value}% drawn.`; });
  control(controls, 'Replay trace', () => {
    animation?.cancel(); cancelAnimationFrame(frame);
    if (context.reduced) { path.style.strokeDashoffset = 0; slider.input.value = '100'; slider.output.textContent = '100'; status.textContent = 'Reduced motion: complete outline shown.'; return; }
    animation = path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: 1000, easing: 'ease-in-out', fill: 'both' }); status.textContent = 'Illustrative outline playing.';
    const tick = () => { const progress = Math.min(100, Math.round(Number(animation.currentTime ?? 0) / 10)); slider.input.value = String(progress); slider.output.textContent = String(progress); if (animation.playState === 'running') frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick);
    animation.finished.then(() => { status.textContent = 'Complete outline. This is not a toolpath.'; }).catch(() => {});
  });
  control(controls, 'Reset', () => { animation?.cancel(); cancelAnimationFrame(frame); path.style.strokeDashoffset = 0; slider.input.value = '100'; slider.output.textContent = '100'; status.textContent = 'Complete static outline restored.'; });
  status.textContent = 'The outline is illustrative. Dragging progress changes the actual SVG stroke.';
  return () => { animation?.cancel(); cancelAnimationFrame(frame); feedback.destroy(); };
}
