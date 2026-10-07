import { svgNode } from './helpers.js';
export function sectionDrawing(container) {
  const svg = svgNode('svg', { viewBox: '0 0 440 300', role: 'img', 'aria-label': 'Nine generated section panels; an illustrative assembly relationship' });
  const parts = [];
  for (let i = 8; i >= 0; i--) {
    const group = svgNode('g'); const inspection = svgNode('g', { 'data-section': i }); const shape = svgNode('path', { d: 'M100 110L220 76L340 110L220 144Z', fill: i === 4 ? '#ff7a45' : '#52616a', stroke: '#c5ced0', 'stroke-width': '1', 'data-face': 'top' }); const edge = svgNode('path', { d: 'M100 110L220 144L340 110L340 118L220 152L100 118Z', fill: '#233846', stroke: '#8da4b3', 'stroke-width': '1', 'data-face': 'edge' }); inspection.append(edge, shape); group.append(inspection); svg.append(group); parts.push({ group, inspection, edge, shape, index: i });
  }
  container.append(svg);
  const apply = progress => { parts.forEach(({ group, index }) => { const offset = (index - 4) * (12 + progress * 13); group.setAttribute('transform', `translate(0,${offset + 38})`); }); };
  const inspect = (values, spatial) => { parts.forEach(({ inspection, edge, shape, index }) => { const amount = values[`part${index}`] ?? 0; inspection.setAttribute('transform', `translate(${spatial ? amount * 34 : 0},${spatial ? amount * -15 : 0})`); edge.style.display = spatial ? '' : 'none'; shape.setAttribute('stroke-width', amount > .5 ? '3' : '1'); shape.setAttribute('stroke', amount > .5 ? '#ffad84' : '#c5ced0'); }); };
  apply(0); return { svg, apply, inspect };
}
