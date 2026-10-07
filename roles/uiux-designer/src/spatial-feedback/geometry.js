import { ExtrudeGeometry, Shape } from 'three';
export const ribCount = 9;
/** Original unitless open arch, no claim of structural/fabrication validity. */
export function createRib() {
  const shape = new Shape();
  const start = .16, end = Math.PI - .16, outer = 1.52, inner = 1.16;
  shape.moveTo(Math.cos(start) * outer, Math.sin(start) * outer - .72);
  for (let i = 1; i <= 40; i++) { const a = start + (end - start) * i / 40; shape.lineTo(Math.cos(a) * outer, Math.sin(a) * outer - .72); }
  for (let i = 40; i >= 0; i--) { const a = start + (end - start) * i / 40; shape.lineTo(Math.cos(a) * inner, Math.sin(a) * inner - .72); }
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, { depth: .07, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .015, bevelThickness: .015, curveSegments: 32 }); geometry.translate(0, 0, -.035); return geometry;
}
export function ribPose(index, progress) {
  const n = index - 4;
  const local = Math.max(0, Math.min(1, (progress - index * .028) / .76));
  const eased = local * local * (3 - 2 * local);
  return { x: Math.sin(n * .32) * eased * .85, y: Math.abs(n) * eased * .09, z: n * (.145 + eased * .3), rx: n * eased * .045, ry: n * eased * .15 };
}
