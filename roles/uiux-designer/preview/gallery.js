const catalog = await fetch('/catalog/materials.json').then(response => response.json());
const manifest = await fetch('/catalog/assets.manifest.json').then(response => response.json());
const byId = new Map(catalog.materials.map(material => [material.id, material]));
let stored = {};
try { const value = JSON.parse(localStorage.getItem('uiux-material-review-v1') ?? '{}'); if (value && typeof value === 'object' && !Array.isArray(value)) stored = value; } catch { /* An empty local review remains usable. */ }
let saved = new Set((Array.isArray(stored.saved) ? stored.saved : []).filter(id => byId.has(id)));
const notes = stored.notes && typeof stored.notes === 'object' ? stored.notes : {};
const compared = new Set();
let category = ({ 'spatial-feedback': 'Spatial feedback', 'applied-feedback': 'Applied feedback' })[new URL(location).searchParams.get('collection')] ?? 'All';
let savedOnly = false;
let active = null;
let detailOpener;
const $ = selector => document.querySelector(selector);
function el(tag, attributes = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) { if (key === 'class') node.className = value; else if (key === 'text') node.textContent = value; else node.setAttribute(key, value); }
  for (const child of children) node.append(child);
  return node;
}
function button(text, action, pressed) {
  const node = el('button', { text });
  if (pressed !== undefined) node.setAttribute('aria-pressed', String(pressed));
  node.addEventListener('click', action); return node;
}
function persist() { try { localStorage.setItem('uiux-material-review-v1', JSON.stringify({ saved: [...saved], notes })); } catch { notify('Choices remain in this tab; browser storage is unavailable.'); } }
let toastTimer;
function notify(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500); }
function refreshCounts() { $('#saved-count').textContent = saved.size; $('#compare-count').textContent = compared.size; }
function refreshDetailActions(id) {
  if (active !== id) return;
  const actionsNode = document.querySelector('#detail-body .detail-info .material-actions');
  if (actionsNode) actionsNode.replaceWith(actions(byId.get(id), false));
}
function toggleSave(id) { if (saved.has(id)) saved.delete(id); else saved.add(id); persist(); render(); refreshDetailActions(id); }
function toggleCompare(id) {
  if (compared.has(id)) compared.delete(id);
  else if (compared.size < 3) compared.add(id);
  else { notify('Compare up to three materials. Remove one to add another.'); return; }
  render(); refreshDetailActions(id);
}
function visual(material) {
  const box = el('div', { class: 'visual', 'aria-label': `${material.name} still preview` });
  if (material.thumbnail) {
    box.classList.add('rendered-preview'); box.append(el('img', { src: `/${material.thumbnail}`, alt: `Captured local specimen: ${material.name}. Capture pose is recorded in the preview manifest.` }));
  } else if (material.demo === 'font') {
    const specimen = el('div', { class: 'font-card', text: material.cssFamily.includes('Mono') ? 'Aa 01' : 'Form into\nsystem' });
    specimen.style.fontFamily = `'${material.cssFamily}', sans-serif`;
    specimen.append(el('small', { text: material.cssFamily.includes('Mono') ? 'x: 0.25 / y: 1.00' : 'Geometry. Computation. Making.' })); box.append(specimen);
  } else if (material.demo === 'icons') {
    const grid = el('div', { class: 'icon-grid', 'aria-hidden': 'true' });
    material.assets.slice(0, 12).forEach(file => { const icon = el('span', { class: 'masked-icon' }); icon.style.maskImage = `url('/${file}')`; grid.append(icon); }); box.append(grid);
  } else if (material.demo === 'glyphs') {
    box.append(el('div', { class: 'static-glyphs' }, material.assets.map(file => el('img', { src: `/${file}`, alt: '' }))));
  } else if (material.demo === 'palette') {
    const row = el('div', { class: 'swatches', 'aria-label': 'Graphite, surface, muted gray, paper and orange' });
    ['#0b0d10', '#14181d', '#a7adb5', '#f2f0ea', '#ff7a45'].forEach(color => { const chip = el('span'); chip.style.background = color; row.append(chip); }); box.append(row);
  } else if (material.demo === 'focus') {
    box.append(el('div', { class: 'nav-mini' }, ['Home', 'Work', 'Lab'].map(text => el('span', { text }))));
  } else if (material.demo === 'command') {
    box.append(el('div', { class: 'command-mini' }, [el('span', { text: '> view outline' }), el('p', { text: 'One state. Two ways to act.' })]));
  } else if (material.demo === 'reveal') box.append(el('div', { class: 'aperture', text: 'A rule\nbecomes form.' }));
  else if (material.demo === 'ascii') {
    const lines = Array.from({ length: 15 }, (_, y) => Array.from({ length: 35 }, (_, x) => ' .:-=+*#%@'[Math.floor((Math.sin(x * .22) * Math.cos(y * .28) + 1) * 4.5)]).join('')).join('\n');
    box.append(el('pre', { text: lines, 'aria-hidden': 'true' }));
  } else {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 320 200'); svg.setAttribute('aria-hidden', 'true');
    if (material.demo === 'trace') {
      svg.setAttribute('viewBox', '0 0 440 270');
      const line = document.createElementNS(svg.namespaceURI, 'path'); line.setAttribute('d', 'M70 160L140 65L235 100L365 50L330 205L225 175L160 225Z M140 65L160 225M235 100L225 175M70 160L225 175L365 50'); line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#ff7a45'); line.setAttribute('stroke-width', '2'); svg.append(line);
    } else if (material.demo === 'reflow') {
      for (let i = 0; i < 6; i++) { const part = document.createElementNS(svg.namespaceURI, 'rect'); part.setAttribute('x', '100'); part.setAttribute('y', String(22 + i * 24)); part.setAttribute('width', '120'); part.setAttribute('height', '22'); part.setAttribute('fill', i === 2 ? '#ff7a45' : '#626e76'); part.setAttribute('stroke', '#a7adb5'); svg.append(part); }
    } else if (['wirefield', 'hatch'].includes(material.demo)) {
      for (let i = 0; i < 15; i++) {
        const line = document.createElementNS(svg.namespaceURI, 'path');
        line.setAttribute('d', Array.from({ length: 24 }, (_, j) => `${j ? 'L' : 'M'}${20 + j * 12},${45 + i * 7 + Math.sin(j / 4 + i / 6) * 22}`).join(' '));
        line.setAttribute('fill', 'none'); line.setAttribute('stroke', i === 7 ? '#ff7a45' : '#a7adb5'); line.setAttribute('stroke-width', material.demo === 'hatch' ? '.8' : '1'); svg.append(line);
      }
    } else {
      for (let i = 8; i >= 0; i--) {
        const part = document.createElementNS(svg.namespaceURI, 'path'); part.setAttribute('d', `M70 ${35 + i * 13}l90-24 90 24-90 24Z`); part.setAttribute('fill', i === 4 ? '#ff7a45' : '#45515b'); part.setAttribute('stroke', '#a7adb5'); svg.append(part);
      }
    }
    box.append(svg);
  }
  return box;
}
function actions(material, includeOpen = true) { return el('div', { class: 'material-actions' }, [...(includeOpen ? [button('Open specimen', () => openDetail(material.id))] : []), button(saved.has(material.id) ? 'Saved' : 'Save', () => toggleSave(material.id), saved.has(material.id)), button(compared.has(material.id) ? 'In comparison' : 'Compare', () => toggleCompare(material.id), compared.has(material.id))]); }
function render() {
  refreshCounts();
  const query = $('#search').value.trim().toLowerCase();
  const filtered = catalog.materials.filter(material => (category === 'All' || category === 'Applied feedback' && material.appliedFeedback || material.category === category) && (!savedOnly || saved.has(material.id)) && `${material.name} ${material.description} ${material.proposal} ${material.dependency}`.toLowerCase().includes(query));
  if (category === 'Applied feedback') { const order = ['Icons', 'Interface', 'Motion', 'Spatial', 'Identity', 'Typography']; filtered.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category)); }
  $('#result-note').textContent = `${filtered.length} of ${catalog.materials.length} materials${savedOnly ? ' / saved choices' : ''}. Open an individual specimen to try its controls.`;
  const nodes = filtered.map(material => el('article', { class: 'material', 'data-material': material.id }, [
    el('div', { class: 'material-top' }, [el('span', { text: material.category + (material.appliedFeedback ? ' / applied depth' : '') }), el('span', { class: 'recommendation', text: material.recommendation })]),
    visual(material), el('h3', { text: material.name }), el('p', { text: material.description }), actions(material),
  ]));
  $('#materials').replaceChildren(...(nodes.length ? nodes : [el('p', { class: 'empty', text: 'No materials match. Choose All or clear the search.' })]));
  $('#saved-filter').setAttribute('aria-pressed', String(savedOnly));
  [...$('#categories').children].forEach(node => node.setAttribute('aria-pressed', String(node.textContent === category)));
}
function metadata(term, description) { return el('div', {}, [el('dt', { text: term }), el('dd', { text: description })]); }
function populateDetail(material) {
  const preservedFrame = $('#detail-body iframe');
  const stage = el('div', { class: 'specimen-stage' });
  const frame = preservedFrame?.dataset.material === material.id ? preservedFrame : el('iframe', { src: `/specimen.html?id=${material.id}&motion=${$('#motion').value}`, title: `${material.name} working specimen`, sandbox: 'allow-scripts allow-same-origin allow-downloads', 'data-material': material.id });
  stage.append(frame);
  const bytes = manifest.filter(asset => asset.materialId === material.id && asset.kind !== 'license').reduce((sum, asset) => sum + asset.bytes, 0);
  const info = el('div', { class: 'detail-info' }, [el('h2', { text: material.name }), el('p', { text: material.description }), el('p', { class: 'proposal', lang: 'zh-Hant', text: material.proposal }), actions(material, false), el('dl', { class: 'detail-meta' }, [metadata('Recommendation', material.recommendation), metadata('Motion / property owner', material.dependency), metadata('Tradeoff', material.tradeoff), metadata('Fallback', material.fallback), metadata('Reduced motion', material.reducedMotion), metadata('License', material.license), metadata('Local asset bytes', bytes ? `${(bytes / 1024).toFixed(1)} KiB, before web subsetting/optimization` : 'Original code specimen; no external media payload'), metadata('Integration status', material.integration)])]);
  const sourceList = el('ul', { class: 'source-list' });
  if (material.appliedFeedback) info.append(el('h3', { text: `Applied feedback / ${material.appliedFeedback.name}` }), el('p', { text: material.appliedFeedback.ownership }), el('p', { class: 'scope', text: 'Compare Baseline and Spatial in the specimen. This new treatment is a proposal; your original Saved record is retained.' }), el('p', { class: 'scope', text: `Vocabulary: ${material.appliedFeedback.basis.map(id => byId.get(id).name).join('; ')}` }));
  material.sources.forEach(source => sourceList.append(el('li', {}, [el('a', { href: source.url, target: '_blank', rel: 'noopener', text: source.title })])));
  material.notices.forEach(file => sourceList.append(el('li', {}, [el('a', { href: `/${file}`, target: '_blank', text: 'Original license / copyright notice' })])));
  material.assets.forEach(file => sourceList.append(el('li', {}, [el('a', { href: `/${file}`, download: file.split('/').at(-1), text: `Download ${file.split('/').at(-1)}` })])));
  material.sourceFiles.forEach(file => sourceList.append(el('li', {}, [el('a', { href: `/samples/${file}`, download: file.split('/').at(-1), text: `Reusable source: ${file.split('/').at(-1)}` })])));
  info.append(el('h3', { text: 'Inspect the source' }), sourceList);
  const note = el('textarea', { class: 'review-note', rows: '3', 'aria-label': `Discussion note for ${material.name}`, placeholder: 'What should change before this is selected?' }); note.value = notes[material.id] ?? '';
  note.addEventListener('input', () => { notes[material.id] = note.value; persist(); });
  info.append(el('label', { text: 'Discussion note' }, [note]));
  $('#detail-body').replaceChildren(el('div', { class: 'detail-grid' }, [stage, info]));
  $('#detail-context').textContent = `${material.category} / individual specimen`;
}
function openDetail(id, updateUrl = true) {
  const material = byId.get(id); if (!material) return;
  if (active === id && $('#detail').open) return;
  detailOpener = document.activeElement;
  if ($('#compare').open) $('#compare').close();
  active = id; populateDetail(material);
  if (!$('#detail').open) $('#detail').showModal();
  $('#detail-close').focus();
  if (updateUrl) { const url = new URL(location); url.searchParams.set('material', id); history.replaceState(null, '', url); }
}
function closeDetail() {
  $('#detail').close();
}
$('#detail').addEventListener('close', () => {
  const id = active;
  $('#detail-body iframe')?.remove(); $('#detail-body').replaceChildren(); active = null;
  const url = new URL(location); url.searchParams.delete('material'); history.replaceState(null, '', url);
  const target = detailOpener?.isConnected ? detailOpener : document.querySelector(`[data-material='${id}'] .material-actions button`) ?? $('#search');
  if (!$('#compare').open) target?.focus();
});
$('#detail-close').addEventListener('click', closeDetail);
$('#detail-share').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); notify('Specimen link copied.'); } catch { notify(`Copy this address: ${location.href}`); } });
$('#compare-open').addEventListener('click', () => {
  if (compared.size < 2) { notify('Choose two or three materials to compare.'); return; }
  if ($('#detail').open) closeDetail();
  const grid = el('div', { class: 'compare-grid' }); grid.style.setProperty('--count', compared.size);
  compared.forEach(id => { const material = byId.get(id); grid.append(el('article', { class: 'compare-column' }, [el('h2', { text: material.name }), visual(material), el('p', { class: 'proposal', lang: 'zh-Hant', text: material.proposal }), el('p', { text: material.tradeoff }), el('p', { text: `License: ${material.license}` }), button('Open working specimen', () => openDetail(id)), button('Remove from comparison', () => { compared.delete(id); $('#compare').close(); render(); })])); });
  $('#compare-body').replaceChildren(el('p', { class: 'result-note', text: 'Still previews for comparison. Open a working specimen to inspect its parameters.' }), grid); $('#compare').showModal(); $('#compare-close').focus();
});
$('#compare-close').addEventListener('click', () => $('#compare').close());
$('#search').addEventListener('input', render);
$('#saved-filter').addEventListener('click', () => { savedOnly = !savedOnly; render(); });
$('#explore-spatial').addEventListener('click', () => { category = 'Spatial feedback'; savedOnly = false; $('#search').value = ''; render(); const url = new URL(location); url.searchParams.set('collection', 'spatial-feedback'); history.replaceState(null, '', url); $('#materials').focus(); $('#materials').scrollIntoView(); });
$('#start-spatial').addEventListener('click', () => openDetail('feedback-assembly'));
$('#explore-applied').addEventListener('click', () => { category = 'Applied feedback'; savedOnly = false; $('#search').value = ''; render(); const url = new URL(location); url.searchParams.set('collection', 'applied-feedback'); history.replaceState(null, '', url); $('#materials').focus(); $('#materials').scrollIntoView(); });
['All', 'Applied feedback', ...catalog.categories].forEach(name => $('#categories').append(button(name, () => { category = name; render(); }, name === category)));
$('#motion').addEventListener('change', () => { const frame = $('#detail-body iframe'); if (frame && active) frame.src = `/specimen.html?id=${active}&motion=${$('#motion').value}`; });
window.addEventListener('message', event => {
  const frame = $('#detail-body iframe');
  if (event.origin !== location.origin || !frame || event.source !== frame.contentWindow || event.data?.type !== 'uiux-specimen-height' || !Number.isFinite(event.data.height)) return;
  frame.style.height = `${Math.max(280, Math.min(3000, event.data.height))}px`;
});
$('#print').addEventListener('click', () => window.print());
$('#export-review').addEventListener('click', () => {
  const review = { schemaVersion: 1, role: catalog.role, purpose: 'Discussion shortlist; not publication approval', exportedAt: new Date().toISOString(), saved: [...saved].map(id => ({ id, name: byId.get(id).name, note: notes[id] ?? '', sources: byId.get(id).sources })), notes };
  const url = URL.createObjectURL(new Blob([JSON.stringify(review, null, 2)], { type: 'application/json' })); const link = el('a', { href: url, download: 'uiux-discussion-choices.json' }); link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Discussion choices exported.');
});
document.addEventListener('keydown', event => { const target = event.target; if (event.key !== '/' || event.isComposing || target.closest('input,textarea,select,[contenteditable="true"]') || $('#detail').open || $('#compare').open) return; event.preventDefault(); $('#search').focus(); });
render();
const requested = new URL(location).searchParams.get('material'); if (requested && byId.has(requested)) openDetail(requested, false);
