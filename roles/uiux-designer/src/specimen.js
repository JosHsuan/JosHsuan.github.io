import { font, icons, glyphs, palette } from './specimens/assets.js';
const id = new URL(location).searchParams.get('id');
const catalog = await fetch('/catalog/materials.json').then(response => response.json());
const material = catalog.materials.find(item => item.id === id);
const root = document.querySelector('#specimen');
const reduced = new URL(location).searchParams.get('motion') === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.dataset.reduce = String(reduced);
const heightObserver = new ResizeObserver(() => { parent.postMessage({ type: 'uiux-specimen-height', height: Math.ceil(root.getBoundingClientRect().height) + 4 }, location.origin); });
heightObserver.observe(root);
const context = { reduced };
let dispose;
if (!material) root.textContent = 'This material is not in the UIUX proposal catalog.';
else {
  document.title = `${material.name} / specimen`;
  const assets = { font, icons, glyphs, palette };
  if (assets[material.demo]) dispose = assets[material.demo](root, material, context);
  else {
    try {
      const loaders = {
        focus: () => import('./specimens/focus.js'), command: () => import('./specimens/command.js'),
        reveal: () => import('./specimens/reveal.js'), trace: () => import('./specimens/trace.js'), reflow: () => import('./specimens/reflow.js'),
        ascii: () => import('./specimens/ascii.js'), theatre: () => import('./motion/theatre/specimen.js'),
        wirefield: () => import('./specimens/spatial.jsx'), hatch: () => import('./specimens/spatial.jsx'),
        feedback: () => import('./spatial-feedback/dom.js'), assembly: () => import('./spatial-feedback/assembly.jsx'),
      };
      const loaded = await loaders[material.demo](); dispose = loaded.default(root, material, context);
    } catch { root.textContent = 'This interactive specimen could not initialize. Close it to keep reviewing its still preview and source information.'; }
  }
}
addEventListener('pagehide', () => { heightObserver.disconnect(); dispose?.(); }, { once: true });
