import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { sampleCinematicPose, THESIS_MODEL_REVISION } from '../../../src/bending-active/cinematic-plan.mjs';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
document.querySelector('#stage').appendChild(renderer.domElement);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera();
const [gltf, hdr] = await Promise.all([new GLTFLoader().loadAsync('/assembly.glb'), new HDRLoader().loadAsync('/studio-small.hdr')]);
const pmrem = new THREE.PMREMGenerator(renderer), environment = pmrem.fromEquirectangular(hdr); hdr.dispose(); pmrem.dispose();
scene.environment = environment.texture; scene.environmentIntensity = 0.6;
const key = new THREE.DirectionalLight('#fff0dc', 1.5); key.position.set(3, 6, 2); scene.add(key);
const fill = new THREE.DirectionalLight('#bfd5dd', 0.75); fill.position.set(-3, 2, -3); scene.add(fill);
const material = new THREE.MeshStandardMaterial({ color: '#aeb5b8', metalness: 0.88, roughness: 0.38, side: THREE.DoubleSide });
let vertices = 0, triangles = 0;
gltf.scene.traverse(object => { if (!object.isMesh) return; for (const m of Array.isArray(object.material) ? object.material : [object.material]) m.dispose(); object.material = material; vertices += object.geometry.attributes.position.count; triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3; });
scene.add(gltf.scene); gltf.scene.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(gltf.scene), bounds = { min: box.min.toArray(), max: box.max.toArray() };
const labels = {
  overview: ['BENDING', 'ACTIVE', 'Metal panel deformation. Individual thesis.'],
  form: ['FORM', 'A continuous surface', 'A complete view of the selected assembled mesh.'],
  system: ['SYSTEM', 'From target to pattern', 'The recorded workflow connects Miura representation, openings and form conversion.'],
  pattern: ['PATTERN', 'Openings and curvature', 'Source samples remain evidence. This view does not rerun the original simulation.'],
  make: ['MAKE', 'Material meets connection', 'Construction photographs document opening sewing and panel joints.'],
  validation: ['EVIDENCE', 'Model and prototype', 'The CAD revision and the reported physical prototype are distinct records.'],
  credits: ['BENDING-ACTIVE THESIS', 'A complete view', 'Individual thesis · National Cheng Kung University · Prof. Kane Yanagawa'],
};
const imageMap = { system: 'workflow.webp', pattern: 'surface-studies.webp', make: 'connections.webp', validation: 'assembly.webp' };
let state, frames = 0;
function setView(u = 0.5 / 7, pointer = { x: 0, y: 0 }, reducedMotion = false) {
  renderer.setSize(innerWidth, innerHeight);
  const pose = sampleCinematicPose(u, innerWidth / innerHeight, pointer, { bounds, modelRevision: THESIS_MODEL_REVISION, reducedMotion });
  camera.position.fromArray(pose.position); camera.up.fromArray(pose.up); camera.lookAt(...pose.target);
  camera.fov = pose.fov; camera.aspect = pose.aspect; camera.near = pose.near; camera.far = pose.far;
  camera.setViewOffset(innerWidth, innerHeight, innerWidth * pose.viewOffsetNormalized.x, innerHeight * pose.viewOffsetNormalized.y, innerWidth, innerHeight);
  camera.updateProjectionMatrix(); renderer.render(scene, camera); frames++;
  renderer.domElement.style.opacity = pose.modelVisibility;
  const id = pose.chapter.id, title = labels[id], figure = document.querySelector('figure'), image = document.querySelector('figure img');
  document.body.dataset.chapter = id;
  document.querySelector('.eyebrow').textContent = title[0]; document.querySelector('h1').textContent = title[1]; document.querySelector('.description').textContent = title[2];
  figure.hidden = !imageMap[id]; if (imageMap[id]) image.src = '/' + imageMap[id];
  document.querySelector('.status').textContent = `Camera review · ${id} · u ${u.toFixed(3)}`;
  state = { u, pointer, reducedMotion, pose, bounds, vertices, triangles, frames, width: innerWidth, height: innerHeight };
  return state;
}
window.__cinematicReview = { setView, state: () => state, ready: true };
setView();
