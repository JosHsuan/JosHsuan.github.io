/** Original procedural presentation set. None of these meshes is thesis geometry.
 * Broad LTC area lights shape the source metal; visible practical apertures are
 * separate set decoration, not emissive GI or a measured photographic studio.
 */
import * as T from 'three';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {RectAreaLightTexturesLib} from 'three/addons/lights/RectAreaLightTexturesLib.js';
import {resolveSceneStage, sampleSceneDirection} from './scene-direction.mjs';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const ltcKeys = ['LTC_FLOAT_1', 'LTC_FLOAT_2', 'LTC_HALF_1', 'LTC_HALF_2'];
let ltcUsers = 0, ownedLtc = null;

// Three's addon allocates new data textures on init. Share them across concurrent
// mounts and release only this module's allocation after its last stage unmounts.
function acquireLtc() {
  if (ltcUsers === 0 && !ltcKeys.every(key => T.UniformsLib[key]?.isTexture)) {
    const previous = Object.fromEntries(ltcKeys.map(key => [key, {uniform: T.UniformsLib[key], library: RectAreaLightTexturesLib[key]}]));
    RectAreaLightUniformsLib.init();
    ownedLtc = ltcKeys.map(key => ({key, texture: T.UniformsLib[key], previous: previous[key]}));
  }
  ltcUsers++;
}

function releaseLtc() {
  ltcUsers--;
  if (ltcUsers || !ownedLtc) return;
  for (const {key, texture, previous} of ownedLtc) {
    if (T.UniformsLib[key] === texture) {
      if (previous.uniform === undefined) delete T.UniformsLib[key];
      else T.UniformsLib[key] = previous.uniform;
    }
    if (RectAreaLightTexturesLib[key] === texture) RectAreaLightTexturesLib[key] = previous.library;
    texture.dispose();
  }
  ownedLtc = null;
}

function makeCyclorama() {
  // One continuous ground-to-wall sweep. Elevated points remain farther than
  // the source sphere's rear tangent; the flat floor extends under the model.
  // No separate disc, horizon seam, ceiling or side walls.
  const profile = Array.from({length: 9}, (_, index) => {
    const angle = index / 8 * Math.PI / 2;
    return [.38 * (1 - Math.cos(angle)), -1.55 - .38 * Math.sin(angle)];
  });
  profile.unshift([0, 4.0]);
  profile.push([2.35, -1.93]);
  const positions = [], uv = [], indices = [], columns = 16;
  for (let row = 0; row < profile.length; row++) {
    for (let column = 0; column <= columns; column++) {
      const x = (column / columns - .5) * 5.6;
      positions.push(x, profile[row][0], profile[row][1] - x * x * .035);
      uv.push(column / columns, row / (profile.length - 1));
      if (row && column) {
        const d = row * (columns + 1) + column, c = d - 1, b = d - columns - 1, a = b - 1;
        indices.push(a, b, c, b, d, c);
      }
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  return geometry;
}

function softenStageSurface(material) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = `varying vec3 vExhibitionPosition;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nvExhibitionPosition = position;');
    shader.fragmentShader = `varying vec3 vExhibitionPosition;\n${shader.fragmentShader}`.replace('#include <color_fragment>', `#include <color_fragment>
      // Lower floor reflectance gradually through the continuous curved sweep.
      diffuseColor.rgb *= mix(0.28, 1.0, smoothstep(0.04, 0.45, vExhibitionPosition.y));
      float sideFade = 1.0 - smoothstep(1.55, 2.8, abs(vExhibitionPosition.x));
      float frontFade = 1.0 - smoothstep(1.20, 3.9, vExhibitionPosition.z);
      float topFade = 1.0 - smoothstep(0.95, 2.30, vExhibitionPosition.y);
      diffuseColor.a *= sideFade * frontFade * topFade;
    `);
  };
  material.customProgramCacheKey = () => 'exhibition-continuous-feather-v1';
}

function softenPractical(material) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = `varying vec2 vPracticalUv;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nvPracticalUv = uv;');
    shader.fragmentShader = `varying vec2 vPracticalUv;\n${shader.fragmentShader}`.replace('#include <color_fragment>', `#include <color_fragment>
      vec2 edge = abs(vPracticalUv - 0.5) * 2.0;
      diffuseColor.a *= (1.0 - smoothstep(0.12, 1.0, edge.x)) * (1.0 - smoothstep(0.55, 1.0, edge.y));
    `);
  };
  material.customProgramCacheKey = () => 'exhibition-practical-feather-v1';
}

/**
 * @param {{bounds: {min: number[], max: number[]}}} options Original combined
 * source bounds, never animated separation bounds. Source objects are not read,
 * reparented or modified. Add group directly to the existing scene/root.
 * update() reads the final camera and writes only this group's objects.
 */
export function createExhibitionStage({bounds} = {}) {
  const layout = resolveSceneStage(bounds), radius = layout.radius;
  const source = structuredClone(bounds), center = new T.Vector3().fromArray(layout.center);
  const group = new T.Group();
  group.name = 'editorial-exhibition-not-source-geometry';
  group.userData = {role: 'editorial-stage', sourceGeometry: false};
  group.position.set(center.x, source.min[1], center.z);
  const geometries = new Set(), materials = new Set();
  const mesh = (name, geometry, material) => {
    geometries.add(geometry); materials.add(material);
    const object = new T.Mesh(geometry, material);
    object.name = name; object.userData = {role: 'editorial-stage', sourceGeometry: false};
    object.castShadow = false; group.add(object); return object;
  };
  const backdrop = mesh('editorial-continuous-gallery-not-source-base', makeCyclorama(), new T.MeshStandardMaterial({color: 0x151e24, roughness: .93, metalness: 0, side: T.FrontSide, transparent: true, opacity: 1, alphaTest: .005, depthWrite: true}));
  softenStageSurface(backdrop.material);
  backdrop.scale.setScalar(radius); backdrop.position.y = -.001; backdrop.receiveShadow = true;
  const apertureGeometry = new T.PlaneGeometry(1, 1);
  const apertures = [-1, 1].map(side => {
    const aperture = mesh(`editorial-practical-${side < 0 ? 'left' : 'right'}`, apertureGeometry, new T.MeshBasicMaterial({color: 0xffffff, fog: true, transparent: true, opacity: .18, depthWrite: false}));
    softenPractical(aperture.material); return aperture;
  });
  const lights = {key: new T.RectAreaLight(), rim: new T.RectAreaLight()};
  for (const [id, light] of Object.entries(lights)) {light.name = `exhibition-area-${id}`; group.add(light);}
  const localTarget = new T.Vector3(0, (source.max[1] - source.min[1]) * .55, 0);
  const up = new T.Vector3(0, 1, 0), lookMatrix = new T.Matrix4();
  let disposed = false;
  acquireLtc();

  function update({direction = sampleSceneDirection(1, {reducedMotion: true}), camera, quality = 'full', reducedMotion = direction.reducedMotion, lightSweep = 0} = {}) {
    if (disposed) throw Error('Exhibition stage has been disposed');
    if (!camera?.position || ![camera.position.x, camera.position.y, camera.position.z].every(Number.isFinite)) throw new RangeError('Expected a finite final camera position');
    const spec = direction.exhibition;
    if (!spec || spec.units !== 'source-radius') throw new RangeError('Expected the Round 03 exhibition score');
    const full = quality !== 'light' && !reducedMotion;
    const sweep = full && Number.isFinite(lightSweep) ? clamp(lightSweep, -1, 1) : 0;
    const x = camera.position.x - center.x, z = camera.position.z - center.z;
    // A view-conditioned editorial set, explicitly not a fixed architectural
    // location. No pitch/roll following: the floor remains the source Y datum.
    if (Math.hypot(x, z) > 1e-9) group.rotation.y = Math.atan2(x, z);
    for (const id of ['key', 'rim']) {
      const light = lights[id], score = spec[id];
      light.position.fromArray(score.position).multiplyScalar(radius);
      light.position.x += sweep * radius * (id === 'key' ? .12 : -.08);
      light.width = score.size[0] * radius; light.height = score.size[1] * radius;
      light.color.fromArray(score.color); light.intensity = score.intensity * (1 + Math.abs(sweep) * .08);
      light.quaternion.setFromRotationMatrix(lookMatrix.lookAt(light.position, localTarget, up));
    }
    backdrop.material.color.fromArray(spec.backdrop.color); backdrop.material.roughness = spec.backdrop.roughness;
    const portraitScale = Number.isFinite(camera.aspect) && camera.aspect < .8 ? .65 : 1;
    apertures.forEach((aperture, index) => {
      const side = index === 0 ? -1 : 1;
      aperture.visible = full;
      aperture.position.set(side * spec.aperture.spread * radius, radius * (index ? .92 : .78), -1.88 * radius);
      aperture.scale.set(radius * (index ? .13 : .09), radius * (index ? 1.22 : .94), 1);
      aperture.material.color.fromArray(spec.aperture.color).multiplyScalar(spec.aperture.radiance * (index ? 1 : .38) * portraitScale);
    });
    group.updateMatrixWorld(true);
    return {owner: 'exhibition-stage', sourceGeometry: false, radius, meshDraws: full ? 3 : 1, areaLights: 2, extraShadowMaps: 0, lightSweep: sweep};
  }

  function dispose() {
    if (disposed) return;
    disposed = true; group.removeFromParent();
    geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose());
    Object.values(lights).forEach(value => value.dispose());
    group.clear(); releaseLtc();
  }
  return {group, update, dispose};
}
