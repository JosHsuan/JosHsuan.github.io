import { node, scaffold } from './helpers.js';
import { feedbackControls } from '../applied-feedback/controls.js';
export default function focus(root, material, context) {
  const parts = scaffold(root, material); const { stage, status } = parts; const nav = node('nav', undefined, { class: 'focus-links', 'aria-label': 'Sample navigation states' }); const buttons = [], rigs = [];
  const feedback = feedbackControls(parts, context, { Home: 0, Work: 1, Lab: 0, About: 0 }, (value, spatial) => { rigs.forEach((rig, i) => { const depth = spatial ? value[['Home', 'Work', 'Lab', 'About'][i]] : 0; rig.style.transform = `translateZ(${depth * 28}px) rotateX(${spatial ? -15 + depth * 15 : 0}deg)`; }); });
  for (const label of ['Home', 'Work', 'Lab', 'About']) { const button = node('button', undefined, { 'aria-pressed': String(label === 'Work') }); const rig = node('span', label, { class: 'detent-rig' }); button.append(rig); rigs.push(rig); button.addEventListener('click', () => { buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button))); feedback.to(Object.fromEntries(['Home', 'Work', 'Lab', 'About'].map(name => [name, name === label ? 1 : 0]))); status.textContent = `Selected state: ${label}. No production route is changed.`; }); buttons.push(button); nav.append(button); }
  stage.append(nav); status.textContent = 'Try Tab, Enter and pointer hover. Each visible label keeps a 44px target.';
  feedback.snap(); return () => feedback.destroy();
}
