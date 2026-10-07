import {DoubleSide, MeshStandardMaterial, Vector3} from 'three';

const VERSION = 'artist3d-cinematic-metal-v1-three-0.186.1';
const bounded = (value, fallback) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;

function inject(source, marker, addition) {
  if (!source.includes(marker)) throw new Error(`Cinematic material shader chunk missing: ${marker}`);
  return source.replace(marker, `${marker}\n${addition}`);
}

/** Owns only appearance. Bounds describe the final rendered world coordinate system. */
export function createCinematicMaterial({bounds} = {}) {
  if (!bounds || !Array.isArray(bounds.min) || !Array.isArray(bounds.max)
    || bounds.min.length !== 3 || bounds.max.length !== 3
    || ![...bounds.min, ...bounds.max].every(Number.isFinite)
    || bounds.max.some((value, index) => value < bounds.min[index])) {
    throw new Error('Cinematic material requires finite, ordered world bounds');
  }

  const uniforms = {
    cinematicProgress: {value: 0},
    cinematicEmphasis: {value: 0},
    cinematicMin: {value: new Vector3(...bounds.min)},
    cinematicSize: {value: new Vector3(...bounds.max).sub(new Vector3(...bounds.min)).max(new Vector3(.001, .001, .001))},
  };
  // A restrained presentation finish, not a measured alloy or physical calibration.
  const material = new MeshStandardMaterial({
    color: '#bdc2bf', metalness: .82, roughness: .39, side: DoubleSide,
  });
  material.name = VERSION;
  material.customProgramCacheKey = () => VERSION;
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = inject(shader.vertexShader, '#include <common>', 'varying vec3 cinematicWorld;');
    shader.vertexShader = inject(shader.vertexShader, '#include <worldpos_vertex>', `
vec4 cinematicPosition = vec4(transformed, 1.0);
#ifdef USE_BATCHING
cinematicPosition = batchingMatrix * cinematicPosition;
#endif
#ifdef USE_INSTANCING
cinematicPosition = instanceMatrix * cinematicPosition;
#endif
cinematicWorld = (modelMatrix * cinematicPosition).xyz;
`);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <common>', `
varying vec3 cinematicWorld;
uniform float cinematicProgress;
uniform float cinematicEmphasis;
uniform vec3 cinematicMin;
uniform vec3 cinematicSize;
`);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <color_fragment>', `
vec3 cinematicP = (cinematicWorld - cinematicMin) / cinematicSize;
float cinematicLevel = cinematicP.y * 11.0;
float cinematicFootprint = max(fwidth(cinematicLevel), 0.008);
float cinematicLine = 1.0 - smoothstep(0.028, 0.028 + cinematicFootprint, abs(fract(cinematicLevel) - 0.5));
// Suppress unresolved fine lines as their footprint approaches a whole period.
cinematicLine *= 1.0 - smoothstep(0.18, 0.55, cinematicFootprint);
float cinematicFocus = exp(-pow((cinematicP.x - cinematicProgress) * 5.5, 2.0));
diffuseColor.rgb *= 1.0 - cinematicLine * cinematicEmphasis * 0.24;
// This warm band is an attention cue; it does not encode simulation data.
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.64, 0.49, 0.32), cinematicFocus * cinematicEmphasis * 0.16);
`);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <roughnessmap_fragment>', `
roughnessFactor = clamp(roughnessFactor - cinematicFocus * cinematicEmphasis * 0.035, 0.35, 0.43);
`);
  };

  let disposed = false;
  return {
    material,
    update({progress, emphasis} = {}) {
      if (disposed) return;
      uniforms.cinematicProgress.value = bounded(progress, uniforms.cinematicProgress.value);
      uniforms.cinematicEmphasis.value = bounded(emphasis, uniforms.cinematicEmphasis.value);
    },
    inspect() {
      return {
        version: VERSION,
        progress: uniforms.cinematicProgress.value,
        emphasis: uniforms.cinematicEmphasis.value,
        bounds: {min: uniforms.cinematicMin.value.toArray(), size: uniforms.cinematicSize.value.toArray()},
        color: `#${material.color.getHexString()}`,
        metalness: material.metalness,
        roughness: material.roughness,
        disposed,
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      material.dispose();
    },
  };
}
