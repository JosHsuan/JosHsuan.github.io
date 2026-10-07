const svgNS = 'http://www.w3.org/2000/svg';
export const defaultGeometry = Object.freeze({ separation: 35, fan: 18, selected: -1 });
export function geometryState(value) {
  return { separation: Math.max(0, Math.min(100, Number(value.separation) || 0)), fan: Math.max(-45, Math.min(45, Number(value.fan) || 0)), selected: Number.isInteger(value.selected) && value.selected >= 0 && value.selected < 9 ? value.selected : -1 };
}
function project(x, y, z) { return [300 + (x * .88 + z * .47) * 84, 215 - (y * .92 - z * .32 + x * .13) * 84]; }
export function ribPath(index, state) {
  const n = index - 4, z = n * (.15 + state.separation / 100 * .28), turn = n / 4 * state.fan * Math.PI / 180;
  const points = [];
  for (const [radius, reverse] of [[1.52, false], [1.16, true]]) {
    for (let j = 0; j <= 32; j++) {
      const step = reverse ? 32 - j : j, angle = .16 + (Math.PI - .32) * step / 32;
      const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius - .65 + (index === state.selected ? .4 : 0);
      points.push(project(x * Math.cos(turn), y, z - x * Math.sin(turn)));
    }
  }
  return `${points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')}Z`;
}
export function createProjection(host) {
  const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('viewBox', '0 0 600 360'); svg.setAttribute('xmlns', svgNS); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Original nine-rib geometric projection. Use the numbered controls to select a part.');
  const title = document.createElementNS(svgNS, 'title'); title.textContent = 'Curved ribs / actual parameter projection'; svg.append(title);
  const paths = Array.from({ length: 9 }, (_, i) => { const path = document.createElementNS(svgNS, 'path'); path.setAttribute('data-rib', String(i)); path.setAttribute('stroke-width', '1.2'); svg.append(path); return path; }); host.replaceChildren(svg);
  return { svg, draw(value) { const state = geometryState(value); paths.forEach((path, i) => { path.setAttribute('d', ribPath(i, state)); path.setAttribute('fill', i === state.selected ? '#ff7a45' : i % 2 ? '#506674' : '#738995'); path.setAttribute('stroke', i === state.selected ? '#ffb495' : '#c3d0d5'); }); svg.dataset.separation = state.separation.toFixed(2); svg.dataset.fan = state.fan.toFixed(2); svg.dataset.selected = String(state.selected); } };
}
