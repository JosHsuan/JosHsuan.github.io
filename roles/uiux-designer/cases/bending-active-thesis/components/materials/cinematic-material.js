import {DoubleSide, MeshPhysicalMaterial, Vector3} from 'three';

const VERSION = 'artist3d-satin-brushed-metal-v2-three-0.186.1';
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
    cinematicGrain: {value: 1},
    cinematicMin: {value: new Vector3(...bounds.min)},
    cinematicSize: {value: new Vector3(...bounds.max).sub(new Vector3(...bounds.min)).max(new Vector3(.001, .001, .001))},
  };
  // Broad satin response rather than clearcoat/chrome. Authored, not a measured alloy.
  const material = new MeshPhysicalMaterial({
    color: '#929ea3', metalness: .96, roughness: .58, anisotropy: .35,
    anisotropyRotation: 0, clearcoat: 0, side: DoubleSide,
  });
  material.name = VERSION;
  material.customProgramCacheKey = () => VERSION;
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = inject(shader.vertexShader, '#include <common>', 'varying vec3 cinematicLocal; varying vec3 cinematicBrushView; varying vec3 cinematicFallbackView;');
    shader.vertexShader = inject(shader.vertexShader, '#include <worldpos_vertex>', `
vec4 cinematicPosition = vec4(transformed, 1.0);
#ifdef USE_BATCHING
cinematicPosition = batchingMatrix * cinematicPosition;
#endif
#ifdef USE_INSTANCING
cinematicPosition = instanceMatrix * cinematicPosition;
#endif
cinematicLocal = transformed;
cinematicBrushView = (modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz;
cinematicFallbackView = (modelViewMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz;
`);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <common>', `
varying vec3 cinematicLocal;
varying vec3 cinematicBrushView;
varying vec3 cinematicFallbackView;
uniform float cinematicProgress;
uniform float cinematicEmphasis;
uniform float cinematicGrain;
uniform vec3 cinematicMin;
uniform vec3 cinematicSize;
`);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <color_fragment>', `
// An authored source-local grain direction; no UVs or measured rolling direction exist.
// Derivative filtering removes unresolved strands, avoiding moire at reading scale.
float cinematicPhase = cinematicLocal.z * 2200.0 + cinematicLocal.x * 0.37;
float cinematicFootprint = fwidth(cinematicPhase);
float cinematicResolve = 1.0 - smoothstep(0.7, 2.8, cinematicFootprint);
float cinematicStrand = sin(cinematicPhase) * 0.62 + sin(cinematicPhase * 1.73) * 0.38;
float cinematicBrush = cinematicStrand * cinematicResolve * cinematicGrain;
diffuseColor.rgb *= 1.0 + cinematicBrush * 0.006;
`);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <roughnessmap_fragment>', `
roughnessFactor = clamp(roughnessFactor + cinematicBrush * 0.012 + cinematicEmphasis * 0.018, 0.32, 0.68);
`);
    shader.fragmentShader = inject(shader.fragmentShader, '#include <normal_fragment_begin>', `
#ifdef USE_ANISOTROPY
// The source has POSITION/NORMAL only. Replace the default UV-derived frame with
// a projected source-local axis in VIEW space, with a stable parallel-axis fallback.
vec3 cinematicAxis = normalize(cinematicBrushView);
vec3 cinematicTangent = cinematicAxis - normal * dot(normal, cinematicAxis);
if(dot(cinematicTangent, cinematicTangent) < 0.025){
  cinematicAxis = normalize(cinematicFallbackView);
  cinematicTangent = cinematicAxis - normal * dot(normal, cinematicAxis);
}
cinematicTangent = normalize(cinematicTangent);
tbn = mat3(cinematicTangent, normalize(cross(normal, cinematicTangent)), normal);
#endif
`);
  };

  let disposed = false, finish = 'satin';
  return {
    material,
    update({progress, emphasis, finish: requestedFinish} = {}) {
      if (disposed) return;
      uniforms.cinematicProgress.value = bounded(progress, uniforms.cinematicProgress.value);
      uniforms.cinematicEmphasis.value = bounded(emphasis, uniforms.cinematicEmphasis.value);
      if (requestedFinish !== undefined) {
        finish = requestedFinish === 'legacy' ? 'legacy' : 'satin';
        const satin = finish === 'satin';
        material.color.set(satin ? '#929ea3' : '#bdc2bf');
        material.metalness = satin ? .96 : .82; material.roughness = satin ? .58 : .39;
        // Keep the shader variant stable during diagnostic A/B; near-zero is isotropic.
        material.anisotropy = satin ? .35 : .0001; uniforms.cinematicGrain.value = satin ? 1 : 0;
      }
    },
    inspect() {
      return {
        version: VERSION,
        finish,
        progress: uniforms.cinematicProgress.value,
        emphasis: uniforms.cinematicEmphasis.value,
        bounds: {min: uniforms.cinematicMin.value.toArray(), size: uniforms.cinematicSize.value.toArray()},
        color: `#${material.color.getHexString()}`,
        metalness: material.metalness,
        roughness: material.roughness,
        anisotropy: material.anisotropy,
        grain: uniforms.cinematicGrain.value,
        grainSpace: 'authored source-local X tangent; no UV or fabrication-direction claim',
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
