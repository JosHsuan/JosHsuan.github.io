import { node, range, control, scaffold } from './helpers.js';
import { feedbackControls } from '../applied-feedback/controls.js';
export default function reveal(root, material, context) {
  const parts = scaffold(root, material); const { stage, controls, status } = parts; stage.classList.add('aperture-stage'); const shell = node('div', undefined, { class: 'aperture-shell' }); const title = node('div', 'A rule becomes form.', { class: 'aperture-title' }); const leaves = [node('span', undefined, { class: 'aperture-leaf', 'aria-hidden': 'true' }), node('span', undefined, { class: 'aperture-leaf right', 'aria-hidden': 'true' })]; shell.append(...leaves, title); stage.append(shell);
  let duration = 700; let animation; let frame = 0;
  const feedback = feedbackControls(parts, context, { progress: 1 }, (value, spatial) => { leaves.forEach((leaf, i) => { leaf.style.transform = `rotateY(${(i ? 1 : -1) * (spatial ? value.progress * 72 : 0)}deg)`; }); stage.dataset.aperture = value.progress.toFixed(3); });
  const sync = () => { feedback.snap({ progress: Math.max(0, Math.min(1, Number(animation?.currentTime ?? duration) / duration)) }); if (animation?.playState === 'running') frame = requestAnimationFrame(sync); };
  range(controls, 'Duration / ms', 400, 1200, 100, duration, value => { duration = value; });
  control(controls, 'Play reveal', () => {
    animation?.cancel(); cancelAnimationFrame(frame);
    if (context.reduced) { feedback.snap({ progress: 1 }); status.textContent = 'Reduced motion: readable final state shown.'; return; }
    animation = title.animate([{ clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-12px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' }], { duration, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
    frame = requestAnimationFrame(sync); status.textContent = 'Reveal playing.'; animation.finished.then(() => { feedback.snap({ progress: 1 }); status.textContent = 'Reveal complete.'; }).catch(() => {});
  });
  control(controls, 'Pause', () => { animation?.pause(); cancelAnimationFrame(frame); status.textContent = 'Reveal paused.'; }); control(controls, 'Reset', () => { animation?.cancel(); cancelAnimationFrame(frame); feedback.snap({ progress: 1 }); status.textContent = 'Readable initial state restored.'; });
  status.textContent = context.reduced ? 'Reduced motion active: final state available.' : 'No autoplay. The heading is readable before any effect.';
  return () => { animation?.cancel(); cancelAnimationFrame(frame); feedback.destroy(); };
}
