export function node(tag, text, attributes = {}) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}
export function range(controls, label, min, max, step, initial, callback) {
  const wrapper = node('label', label); const input = node('input', undefined, { type: 'range', min, max, step, value: initial }); const output = node('output', String(initial), { class: 'value' });
  wrapper.append(input, output); controls.append(wrapper);
  input.addEventListener('input', () => { output.textContent = input.value; callback(Number(input.value)); });
  return { input, output };
}
export function control(controls, label, action) { const button = node('button', label); button.addEventListener('click', action); controls.append(button); return button; }
export function scaffold(root, material) {
  const container = node('section', undefined, { class: 'specimen' });
  const stage = node('div', undefined, { class: 'stage' }); const controls = node('div', undefined, { class: 'controls' }); const status = node('p', '', { class: 'specimen-status', role: 'status' });
  container.append(node('h1', material.name), node('p', material.description, { class: 'explanation' }), stage, controls, status); root.replaceChildren(container);
  return { container, stage, controls, status };
}
export function svgNode(tag, attributes = {}) { const node = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value)); return node; }
