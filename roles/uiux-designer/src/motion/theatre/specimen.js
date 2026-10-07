import { createTheatreController } from '@/motion/theatre/createController';
import { control, range, scaffold, node } from '../../specimens/helpers.js';
import { sectionDrawing } from '../../specimens/section-geometry.js';
import state from './motion.state.json';
import pose from './pose.json';
import manifest from './motion.manifest.json';
import { feedbackControls } from '../../applied-feedback/controls.js';

export default function theatre(root, material, context) {
  const shell = scaffold(root, material); const { stage, controls, status } = shell; const drawing = sectionDrawing(stage); const amount = node('p', 'Layer separation: 0%', { class: 'value' }); stage.append(amount);
  const feedback = feedbackControls(shell, context, Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`part${i}`, 0])), drawing.inspect);
  const controller = createTheatreController({ projectId: manifest.projectId, sheetId: manifest.sheetId, stateRevision: manifest.stateRevision, state, clips: manifest.clips, staticPose: pose, applyPose: value => { drawing.apply(value.assemblyProgress); amount.textContent = `Layer separation: ${Math.round(value.assemblyProgress * 100)}%`; }, invalidate: () => {} });
  let generation = 0; let disposed = false;
  let selected = -1; const selection = node('div', undefined, { class: 'part-selection', role: 'group', 'aria-label': 'Inspect a section panel' }); const selectors = Array.from({ length: 9 }, (_, i) => { const button = control(selection, String(i + 1), () => { generation++; controller.pause(); selected = selected === i ? -1 : i; selectors.forEach((b, index) => b.setAttribute('aria-pressed', String(index === selected))); feedback.to(Object.fromEntries(Array.from({ length: 9 }, (_, index) => [`part${index}`, Number(index === selected)]))); status.textContent = selected < 0 ? 'Panel returned; authored sequence paused.' : `Panel ${selected + 1} inspected; authored sequence paused.`; }); button.setAttribute('aria-label', `Inspect section ${i + 1}`); button.setAttribute('aria-pressed', 'false'); return button; }); controls.before(selection);
  const play = control(controls, 'Replay authored sequence', async () => { const current = ++generation; controller.setMode(context.reduced ? 'static' : 'story'); status.textContent = 'Authored sequence playing.'; try { const result = await controller.play('assembly'); if (!disposed && generation === current) status.textContent = `Authored sequence ${result}.`; } catch { if (!disposed) status.textContent = 'Motion failed. The static diagram remains available.'; } });
  control(controls, 'Pause', () => { generation++; controller.pause(); status.textContent = 'Authored sequence paused.'; });
  const seek = range(controls, 'Manual sequence position / %', 0, 100, 1, 0, value => { generation++; controller.setMode('story'); controller.seek('assembly', value / 100); status.textContent = `Manual sequence position: ${value}%.`; });
  control(controls, 'Reset', () => { generation++; selected = -1; selectors.forEach(b => b.setAttribute('aria-pressed', 'false')); feedback.snap(Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`part${i}`, 0]))); controller.applyStaticPose(); seek.input.value = '0'; seek.output.textContent = '0'; status.textContent = 'Static initial pose restored.'; });
  play.disabled = true;
  controller.ready.then(() => { if (disposed) return; controller.setMode(context.reduced ? 'static' : 'story'); controller.seek('assembly', 0); play.disabled = context.reduced; status.textContent = context.reduced ? 'Reduced motion: explicit playback disabled, still poses remain inspectable.' : 'Theatre Core ready / genuine Studio state / no autoplay.'; }).catch(() => { if (!disposed) { drawing.apply(0); status.textContent = 'Motion could not initialize. Static pose retained.'; } });
  return () => { disposed = true; generation++; feedback.destroy(); controller.dispose(); };
}
