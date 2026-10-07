/** Original illustrative GLSL, no measured engineering data. */
export const hatchVertex = `
varying vec2 vUv;
varying vec3 vWorldNormal;
void main() {
  vUv = uv;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
export const hatchFragment = `
uniform float uDensity;
uniform float uFocus;
uniform float uHighlight;
varying vec2 vUv;
varying vec3 vWorldNormal;
void main() {
  float coordinate = (vUv.x + vUv.y * 0.55) * uDensity;
  float antialias = max(fwidth(coordinate), 0.001);
  float line = 1.0 - smoothstep(0.035 - antialias, 0.035 + antialias, abs(fract(coordinate) - 0.5));
  float light = 0.45 + 0.55 * max(dot(normalize(vWorldNormal), normalize(vec3(0.5, 0.8, 0.35))), 0.0);
  vec3 color = mix(vec3(0.48, 0.56, 0.59) * light, vec3(0.025, 0.035, 0.045), line);
  float reference = 1.0 - smoothstep(0.005, 0.015 + uHighlight * 0.045, abs(vUv.y - uFocus));
  color = mix(color, vec3(1.0, 0.19, 0.045), reference);
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
