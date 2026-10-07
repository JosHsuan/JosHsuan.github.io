import { createResponse } from '../spatial-feedback/response.js';
import { createProjection, defaultGeometry, geometryState } from './geometry.js';

const $ = selector => document.querySelector(selector);
const make = (tag, text, attrs = {}) => { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value); return element; };
const action = (label, callback, attrs) => { const b = make('button', label, { type: 'button', ...attrs }); b.addEventListener('click', callback); return b; };
const catalog = await fetch('/catalog/materials.json').then(r => { if (!r.ok) throw new Error('Catalog unavailable'); return r.json(); });
const studies = catalog.materials.filter(m => m.collection === 'spatial-feedback-v1');
const byId = new Map(catalog.materials.map(m => [m.id, m]));
const medium = matchMedia('(prefers-reduced-motion: reduce)');
const patterns = {
  'feedback-type': ['Word planes', 'Short editorial headings; body copy stays still.'],
  'feedback-glyph': ['Identity mechanisms', 'The opening diagram expresses context, object and reading planes.'],
  'feedback-key': ['Tactile input', 'Filter, parameter and annotation controls answer a press locally.'],
  'feedback-card': ['Separated layers', 'Selected index covers advance; image inspection and anatomy reveal layers.'],
  'feedback-navigation': ['Depth detents', 'Chapter location stays consistent across the method reader.'],
  'feedback-panel': ['Hinged disclosure', 'Interaction anatomy expands without covering the reading plane.'],
  'feedback-assembly': ['Spatial score', 'A dedicated Theatre score remains opt-in; parameters drive the workbench.'],
};
let saved = new Set(), savedNotes = {}, preferenceReadable = true;
let selected = 'feedback-assembly', filter = 'all', compare = [], timer, disposed = false;
const objectRecord = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
let ownReview = {}; try { ownReview = objectRecord(JSON.parse(localStorage.getItem('uiux-feature-review-v1') ?? '{}')); } catch { /* Defaults remain explicit. */ }
$('#presentation').value = ownReview.presentation === 'flat' ? 'flat' : 'spatial';
$('#motion-preference').value = ownReview.motion === 'reduce' ? 'reduce' : 'system';
const responses = new Set(); const motionOff = () => $('#presentation').value === 'flat' || $('#motion-preference').value === 'reduce' || medium.matches;
const enabled = id => $('#presentation').value !== 'flat' && (saved.size === 0 || saved.has(id));
const notify = text => { const el = $('#announcement'); el.textContent = text; el.dataset.visible = 'true'; clearTimeout(timer); timer = setTimeout(() => { el.dataset.visible = 'false'; }, 3200); };
function persist() { try { localStorage.setItem('uiux-feature-review-v1', JSON.stringify({ presentation: $('#presentation').value, motion: $('#motion-preference').value, comparison: compare })); } catch { notify('This session remains usable; preferences could not be saved.'); } }
function readBasis() {
  preferenceReadable = true; let source = {};
  try { source = objectRecord(JSON.parse(localStorage.getItem('uiux-material-review-v1') ?? '{}')); } catch { preferenceReadable = false; }
  saved = new Set((Array.isArray(source.saved) ? source.saved : []).filter(id => byId.has(id)));
  savedNotes = source.notes && typeof source.notes === 'object' ? source.notes : {};
  const count = [...saved].filter(id => patterns[id]).length;
  $('#basis-status').textContent = !preferenceReadable ? 'Saved choices could not be read. Showing an explicitly proposed exploration preset.' : saved.size ? `${saved.size} existing Saved choices in this browser; ${count} selected spatial principles carried into these features.` : 'No Saved choices found in this browser. Showing an exploration preset, not an inferred owner preference.';
  const list = make('ul');
  for (const id of Object.keys(patterns)) {
    const [name, use] = patterns[id]; const item = make('li'); item.append(make('strong', `${saved.has(id) ? 'Selected' : saved.size ? 'Not selected' : 'Proposed'}: ${name}. `), make('span', use));
    if (saved.has(id) && typeof savedNotes[id] === 'string' && savedNotes[id]) item.append(make('p', savedNotes[id], { class: 'preferences-note' }));
    list.append(item);
  }
  const other = [...saved].filter(id => !patterns[id]); if (other.length) list.append(make('li', `Other saved materials: ${other.map(id => byId.get(id).name).join(', ')}. Those material choices remain available in the original desk.`));
  $('#basis-list').replaceChildren(list);
  syncPreferences();
}
function syncPreferences() {
  document.body.dataset.presentation = $('#presentation').value;
  document.body.dataset.reduced = String(motionOff());
  for (const [id, key] of Object.entries({ 'feedback-type': 'type', 'feedback-glyph': 'identity', 'feedback-key': 'key', 'feedback-card': 'layers', 'feedback-navigation': 'navigation', 'feedback-panel': 'panel', 'feedback-assembly': 'assembly' })) document.body.dataset[key] = String(enabled(id));
  for (const response of responses) response.snap();
  renderIndex();
}
function managedResponse(initial, render) {
  const r = createResponse({ initial, render }); responses.add(r);
  return { to: value => motionOff() ? r.snap(value) : r.to(value), snap: value => r.snap(value), destroy: () => { responses.delete(r); r.destroy(); } };
}
let cardResponses = [];
function renderIndex() {
  cardResponses.forEach(r => r.destroy()); cardResponses = [];
  const query = $('#study-search').value.trim().toLowerCase();
  const matches = studies.filter(m => (filter === 'all' || (['glyph', undefined].includes(m.variant) ? 'object' : 'interface') === filter) && `${m.name} ${m.description}`.toLowerCase().includes(query));
  $('#index-status').textContent = `${matches.length} of ${studies.length} original studies. Open a study to update the reader.`;
  const cards = matches.map(material => {
    const card = make('article', undefined, { class: 'study-card', 'data-study': material.id, 'data-selected': String(selected === material.id) });
    const link = make('a', undefined, { href: `?study=${material.id}#reader`, class: 'study-link' });
    const picture = make('div', undefined, { class: 'study-picture' }); picture.append(make('img', undefined, { src: `/${material.thumbnail}`, alt: `Captured ${material.name} specimen`, loading: 'lazy' }));
    link.append(make('span', saved.has(material.id) ? 'Saved direction' : 'Original study', { class: 'study-label' }), picture, make('h3', material.name), make('p', material.description));
    const depth = enabled('feedback-card') ? 1 : 0;
    const response = managedResponse({ lift: selected === material.id ? 1 : 0, hover: 0 }, v => { picture.style.transform = `translateZ(${(v.lift * 16 + v.hover * 7) * depth}px) rotateX(${v.hover * -3 * depth}deg)`; }); cardResponses.push(response);
    link.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') response.to({ hover: 1 }); }); link.addEventListener('pointerleave', () => response.to({ hover: 0 }));
    link.addEventListener('focus', () => response.to({ hover: 1 })); link.addEventListener('blur', () => response.to({ hover: 0 }));
    link.addEventListener('click', event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return; event.preventDefault(); selectStudy(material.id, true); $('#reader-title').focus({ preventScroll: true }); $('#reader').scrollIntoView(); });
    const button = action(compare.includes(material.id) ? 'Remove from comparison' : 'Add to comparison', () => toggleCompare(material.id), { 'aria-pressed': String(compare.includes(material.id)) }); card.append(link, button); return card;
  });
  if (!cards.length) { const empty = make('div', undefined, { class: 'empty-index' }); empty.append(make('p', 'No studies match. Clear the search and filters to continue.'), action('Clear search and filters', () => { $('#study-search').value = ''; filter = 'all'; syncFilters(); renderIndex(); })); cards.push(empty); }
  $('#study-index').replaceChildren(...cards);
}
const methods = {
  type: 'Each word has its own local plane. Fan and focus targets move the decorative plane while the original button remains a stable hit region. The three words remain in document reading order.',
  glyph: 'Five original parts follow one of three explicit rules: gimbal, network or interlock. The chosen rule changes their axes and spacing; opening and closing changes their depth relationship.',
  key: 'A fixed button owns native activation. Its inner keycap compresses on pointer-down or keyboard press, and releases on up or cancellation. The adjacent tile changes its real representation state.',
  card: 'One outer hit region contains three visual planes: rule, drawing and label. A pointer can add bounded orientation, while click or tap separates the layers. The same action is available from a visible button.',
  navigation: 'Persistent selection and temporary focus are different states. The chosen chapter plate advances and its content updates immediately; focus uses a smaller temporary elevation.',
  panel: 'Two decorative covers rotate about their outer pivots. A conventional expanded-state button shows real document content below. The motion never delays reading or keyboard access.',
  assembly: 'A genuine Theatre export contains assembly progress and three camera tracks. The application adapter evaluates that score. Individual part feedback and inspection turn own separate nested groups, and selection pauses authored playback.',
};
const annotations = {
  form: 'Form: the captured image shows the actual local specimen at its documented inspection pose.',
  system: 'System: ordinary controls choose state; a single visual owner maps that state to a spatial response.',
  make: 'Make: source modules and retained asset notices are available from the original specimen. This is a UI study, not a fabrication output.',
};
function selectStudy(id, record = false) {
  const material = studies.find(m => m.id === id) ?? studies.find(m => m.id === 'feedback-assembly'); selected = material.id;
  $('#reader-title').textContent = material.name; $('#reader-summary').textContent = material.description;
  $('#reader-image').src = `/${material.thumbnail}`; $('#reader-image').alt = `Actual local capture of ${material.name}`;
  $('#reader-caption').textContent = 'Original UI/UX specimen. Captured inspection pose; open the original specimen for its full controls.';
  $('#reader-purpose').textContent = material.description; $('#reader-method').textContent = methods[material.variant ?? 'assembly'];
  $('#reader-evidence-copy').textContent = `Inspectable parameters: ${material.parameters.join('; ')}. The image is captured from the working specimen, and its source modules and license information are linked below.`;
  $('#reader-limit-copy').textContent = `${material.tradeoff} ${material.fallback}`;
  const sources = material.sourceFiles.slice(0, 3).map(file => make('a', `Read ${file.split('/').at(-1)}`, { href: `/samples/${file}`, target: '_blank', rel: 'noopener' }));
  $('#reader-sources').replaceChildren(...sources); $('#open-original').href = `/?material=${selected}`;
  $('#annotation-copy').textContent = annotations.form; document.querySelectorAll('[data-annotation]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.annotation === 'form')));
  if (record) { const url = new URL(location); url.searchParams.set('study', selected); url.hash = 'reader'; history.pushState(null, '', url); }
  renderIndex();
}
function toggleCompare(id) {
  if (compare.includes(id)) compare = compare.filter(value => value !== id);
  else if (compare.length < 2) compare.push(id);
  else { notify('Two studies are already aligned. Remove one before adding another.'); return; }
  persist(); renderComparison(); renderIndex();
  document.querySelector(`[data-study="${id}"] button`)?.focus({ preventScroll: true });
}
function renderComparison() {
  $('#comparison-items').replaceChildren(...compare.map(id => { const token = make('div', undefined, { class: 'compare-token' }); token.append(make('span', byId.get(id).name), action('Remove', () => toggleCompare(id), { 'aria-label': `Remove ${byId.get(id).name}` })); return token; }));
  updateLocations(); $('#tray-summary').textContent = `${compare.length} of 2 studies selected`; $('#clear-compare').disabled = !compare.length;
  if (compare.length < 2) { $('#comparison-result').replaceChildren(make('p', compare.length ? 'Add one more study from the index to align the same criteria.' : 'No comparison selected. Add two studies from the index above.', { class: 'small' })); return; }
  const table = make('table'); const head = make('thead'), header = make('tr'); header.append(make('th', 'Criterion', { scope: 'col' }), ...compare.map(id => make('th', byId.get(id).name, { scope: 'col' }))); head.append(header); table.append(head);
  const body = make('tbody');
  for (const [label, property] of [['Captured pose', 'thumbnail'], ['Purpose', 'description'], ['Motion owner', 'dependency'], ['Tradeoff', 'tradeoff'], ['Fallback', 'fallback'], ['Reduced motion', 'reducedMotion']]) {
    const row = make('tr'); row.append(make('th', label, { scope: 'row' }));
    for (const id of compare) { const material = byId.get(id), cell = make('td'); if (property === 'thumbnail') cell.append(make('img', undefined, { src: `/${material.thumbnail}`, alt: `${material.name} inspection pose` })); else cell.textContent = material[property]; row.append(cell); }
    body.append(row);
  }
  table.append(body); const region = make('div', undefined, { class: 'comparison-table', tabindex: '0', role: 'region', 'aria-label': 'Study comparison; scroll horizontally on small screens' }); region.append(table); $('#comparison-result').replaceChildren(region);
}
const dialogOpeners = new Map();
function openDialog(dialog, opener) { dialogOpeners.set(dialog, opener ?? document.activeElement); dialog.showModal(); dialog.querySelector('button')?.focus(); }
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => { if (dialog.id === 'authored-dialog') $('#authored-host').replaceChildren(); const target = dialogOpeners.get(dialog); if (target?.isConnected) target.focus({ preventScroll: true }); }));
$('#inspect-media').addEventListener('click', () => {
  const material = byId.get(selected); $('#media-title').textContent = material.name; $('#inspection-image').src = `/${material.thumbnail}`; $('#inspection-image').alt = `Actual captured inspection pose of ${material.name}`;
  $('#inspection-caption').textContent = `${material.description} This is a captured image; operate the original specimen for live parameters.`;
  $('#image-download').href = `/${material.thumbnail}`; $('#image-download').download = `${material.id}.png`; resetImage(); openDialog($('#media-dialog'), $('#inspect-media'));
});
function resetImage() { $('#image-zoom').value = '100'; $('#image-zoom-value').textContent = '100%'; $('#inspection-image').style.width = '100%'; $('#image-viewport').scrollTo(0, 0); }
$('#image-zoom').addEventListener('input', event => { $('#inspection-image').style.width = `${event.target.value}%`; $('#image-zoom-value').textContent = `${event.target.value}%`; }); $('#image-reset').addEventListener('click', resetImage);
$('#toggle-anatomy').addEventListener('click', event => { const opened = $('#anatomy').hidden; $('#anatomy').hidden = !opened; event.currentTarget.setAttribute('aria-expanded', String(opened)); event.currentTarget.textContent = opened ? 'Close the interaction anatomy' : 'Open the interaction anatomy'; });
document.querySelectorAll('[data-annotation]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-annotation]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); $('#annotation-copy').textContent = annotations[button.dataset.annotation]; $('#reader-image').dataset.annotation = button.dataset.annotation; }));

const projection = createProjection($('#workbench-drawing')); let state = { ...defaultGeometry }, historyStates = [{ ...state }], cursor = 0;
const drawingResponse = managedResponse({ separation: state.separation, fan: state.fan }, value => projection.draw({ ...state, ...value }));
function showGeometry(immediate = false) {
  $('#separation').value = String(state.separation); $('#separation-value').textContent = `${state.separation}%`; $('#fan').value = String(state.fan); $('#fan-value').textContent = `${state.fan}°`;
  document.querySelectorAll('[data-part]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.part) === state.selected)));
  $('#undo').disabled = cursor <= 0; $('#redo').disabled = cursor >= historyStates.length - 1;
  $('#geometry-summary').textContent = `9 ribs · separation ${state.separation}% · fan ${state.fan}° · ${state.selected < 0 ? 'no selection' : `rib ${state.selected + 1} selected`}`;
  if (immediate || !enabled('feedback-assembly')) drawingResponse.snap({ separation: state.separation, fan: state.fan }); else drawingResponse.to({ separation: state.separation, fan: state.fan });
}
function commitGeometry(next) {
  state = geometryState(next);
  if (JSON.stringify(historyStates[cursor]) !== JSON.stringify(state)) { historyStates = historyStates.slice(0, cursor + 1); historyStates.push({ ...state }); if (historyStates.length > 30) historyStates.shift(); cursor = historyStates.length - 1; }
  showGeometry();
}
for (let i = 0; i < 9; i++) $('.part-picker').append(action(String(i + 1).padStart(2, '0'), () => commitGeometry({ ...state, selected: state.selected === i ? -1 : i }), { 'data-part': String(i), 'aria-label': `Select workbench rib ${i + 1}`, 'aria-pressed': 'false' }));
for (const name of ['separation', 'fan']) { const input = $(`#${name}`); input.addEventListener('input', () => { state = geometryState({ ...state, [name]: Number(input.value) }); showGeometry(); }); input.addEventListener('change', () => commitGeometry(state)); }
$('#reset-geometry').addEventListener('click', () => { commitGeometry(defaultGeometry); notify('Geometry reset. Undo can restore your previous arrangement.'); });
$('#undo').addEventListener('click', () => { if (cursor > 0) { state = { ...historyStates[--cursor] }; showGeometry(); } }); $('#redo').addEventListener('click', () => { if (cursor < historyStates.length - 1) { state = { ...historyStates[++cursor] }; showGeometry(); } });
function download(text, type, filename) { const url = URL.createObjectURL(new Blob([text], { type })); const link = make('a', undefined, { href: url, download: filename }); link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
$('#download-svg').addEventListener('click', () => { showGeometry(true); const clone = projection.svg.cloneNode(true); clone.removeAttribute('role'); clone.removeAttribute('aria-label'); download(new XMLSerializer().serializeToString(clone), 'image/svg+xml', 'curved-ribs-current.svg'); notify('Current geometric projection downloaded as SVG.'); });
$('#download-json').addEventListener('click', () => { showGeometry(true); download(JSON.stringify({ schemaVersion: 1, kind: 'original-uiux-geometry-study', geometryRevision: 'spatial-editorial-v1', unitless: true, ribCount: 9, ...state, limitations: 'Illustrative geometry; no structural analysis or fabrication toolpath.' }, null, 2), 'application/json', 'curved-ribs-parameters.json'); notify('Current geometry parameters downloaded.'); });
$('#load-authored').addEventListener('click', () => { const iframe = make('iframe', undefined, { title: 'Original authored spatial score', src: `/specimen.html?id=feedback-assembly&motion=${motionOff() ? 'reduce' : 'system'}`, sandbox: 'allow-scripts allow-same-origin allow-downloads' }); $('#authored-host').replaceChildren(iframe); openDialog($('#authored-dialog'), $('#load-authored')); });
window.addEventListener('message', event => { const frame = $('#authored-host iframe'); if (event.origin === location.origin && frame && event.source === frame.contentWindow && event.data?.type === 'uiux-specimen-height' && Number.isFinite(event.data.height)) frame.style.height = `${Math.min(2600, Math.max(400, event.data.height))}px`; });

const commands = [
  ['Search studies', () => { $('#study-search').focus(); $('#index').scrollIntoView(); }],
  ['Compare selected studies', () => { location.hash = 'compare'; $('#compare-title').setAttribute('tabindex', '-1'); $('#compare-title').focus(); }],
  ['Go to geometry experiment', () => { location.hash = 'workbench'; $('#separation').focus(); }],
  ['Reset geometry', () => { commitGeometry(defaultGeometry); $('#reset-geometry').focus(); notify('Geometry reset.'); }],
  ['Use flat presentation', () => { $('#presentation').value = 'flat'; syncPreferences(); showGeometry(true); persist(); $('#presentation').focus(); notify('Flat presentation applied.'); }],
  ['Reduce motion', () => { $('#motion-preference').value = 'reduce'; syncPreferences(); showGeometry(true); persist(); $('#motion-preference').focus(); notify('Reduced motion applied.'); }],
];
function renderCommands() { const query = $('#command-query').value.toLowerCase().trim(); const choices = commands.filter(([label]) => label.toLowerCase().includes(query)); $('#command-results').replaceChildren(...choices.map(([label, run]) => action(label, () => { const dialog = $('#command-dialog'); dialogOpeners.delete(dialog); dialog.close(); run(); }))); $('#command-status').textContent = choices.length ? `${choices.length} available actions.` : 'No matching action. Clear the search to see available actions.'; }
$('#open-commands').addEventListener('click', () => { $('#command-query').value = ''; renderCommands(); openDialog($('#command-dialog'), $('#open-commands')); $('#command-query').focus(); }); $('#command-query').addEventListener('input', renderCommands);
$('#command-query').addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); $('#command-dialog').close(); } else if (event.key === 'ArrowDown') { event.preventDefault(); $('#command-results button')?.focus(); } else if (event.key === 'Enter') { event.preventDefault(); $('#command-results button')?.click(); } });
document.addEventListener('keydown', event => { if (event.key === '/' && !event.isComposing && !event.target.closest('input,textarea,select,[contenteditable=true]') && !document.querySelector('dialog[open]')) { event.preventDefault(); $('#open-commands').click(); } });
$('#export-feature-review').addEventListener('click', () => download(JSON.stringify({ schemaVersion: 1, role: 'uiux-designer', purpose: 'Feature direction discussion; not publication approval', basis: { source: 'uiux-material-review-v1 on this browser origin', readable: preferenceReadable, saved: [...saved], notes: Object.fromEntries([...saved].filter(id => typeof savedNotes[id] === 'string').map(id => [id, savedNotes[id]])) }, proposedFeatures: ['study-index', 'method-reader', 'media-inspection', 'comparison', 'geometry-workbench', 'shared-actions'], selectedStudy: selected, comparison: compare, presentation: $('#presentation').value, motion: $('#motion-preference').value, currentGeometry: state }, null, 2), 'application/json', 'uiux-feature-review.json'));
function syncFilters() { document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter))); }
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; syncFilters(); renderIndex(); })); $('#study-search').addEventListener('input', renderIndex);
$('#clear-compare').addEventListener('click', () => { compare = []; persist(); renderComparison(); renderIndex(); });
$('#refresh-basis').addEventListener('click', () => { readBasis(); showGeometry(true); notify('Saved choices refreshed from this browser.'); });
for (const id of ['presentation', 'motion-preference']) $(`#${id}`).addEventListener('change', () => { syncPreferences(); showGeometry(true); persist(); const frame = $('#authored-host iframe'); if (frame) frame.src = `/specimen.html?id=feedback-assembly&motion=${motionOff() ? 'reduce' : 'system'}`; });
medium.addEventListener('change', () => { syncPreferences(); showGeometry(true); const frame = $('#authored-host iframe'); if (frame) frame.src = `/specimen.html?id=feedback-assembly&motion=${motionOff() ? 'reduce' : 'system'}`; });
window.addEventListener('storage', event => { if (event.key === 'uiux-material-review-v1') { readBasis(); showGeometry(true); } });
const initialStudy = () => studies.find(m => saved.has(m.id))?.id ?? 'feedback-assembly';
window.addEventListener('popstate', () => selectStudy(new URL(location).searchParams.get('study') ?? initialStudy()));
let locationFrame = 0;
function updateLocations() {
  const line = $('.site-header').getBoundingClientRect().bottom + 80;
  const current = [...document.querySelectorAll('main>.feature-section')].filter(section => section.getBoundingClientRect().top <= line).at(-1)?.id;
  document.querySelectorAll('.site-header nav a').forEach(a => a.setAttribute('aria-current', a.hash === `#${current}` ? 'location' : 'false'));
  const chapter = [...document.querySelectorAll('.reader-copy section')].filter(section => section.getBoundingClientRect().top <= line + 60).at(-1)?.id ?? 'reader-context';
  document.querySelectorAll('.chapter-nav a').forEach(a => a.setAttribute('aria-current', a.hash === `#${chapter}` ? 'location' : 'false'));
  $('#comparison-tray').hidden = !compare.length || !['index', 'reader'].includes(current);
}
const scheduleLocation = () => { if (!locationFrame) locationFrame = requestAnimationFrame(() => { locationFrame = 0; updateLocations(); }); };
addEventListener('scroll', scheduleLocation, { passive: true }); addEventListener('resize', scheduleLocation);
addEventListener('pagehide', () => { disposed = true; responses.forEach(r => r.destroy()); removeEventListener('scroll', scheduleLocation); removeEventListener('resize', scheduleLocation); cancelAnimationFrame(locationFrame); clearTimeout(timer); $('#authored-host').replaceChildren(); }, { once: true });
// Recreate disposed response owners if the browser restores a cached document.
addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
compare = (Array.isArray(ownReview.comparison) ? ownReview.comparison : []).filter(id => studies.some(m => m.id === id)).slice(0, 2);
readBasis(); selectStudy(new URL(location).searchParams.get('study') ?? initialStudy()); renderComparison(); showGeometry(true);
if (!disposed) document.body.dataset.ready = 'true';
