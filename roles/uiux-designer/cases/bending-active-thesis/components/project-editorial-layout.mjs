/** Explicit presentation roles; source objects and research prose stay authoritative. */
const CAS_SCENES = Object.freeze({
 context: ['portfolio-tower-on-site.webp', 'portrait'],
 system: ['portfolio-timber-model.webp', 'landscape'],
 'xr-guidance': ['portfolio-xr-workshop.webp', 'workshop'],
 making: ['portfolio-robotic-assembly.webp', 'landscape'],
 results: ['portfolio-timber-interior.webp', 'landscape'],
});
export function editorialProjectLayout(project) {
 if (project.id !== 'project-caschlatsch') return null;
 if (project.model || project.motionMedia?.length) throw new Error('Editorial scenes require the reviewed Caschlatsch still-source policy.');
 return project.sections.map(section => {
  const role = CAS_SCENES[section.id];
  if (!role) throw new Error(`Unreviewed editorial chapter: ${section.id}`);
  const scene = section.media.find(image => image.src.endsWith(`/${role[0]}`));
  if (!scene) throw new Error(`Missing original editorial source: ${role[0]}`);
  const remaining = section.media.filter(image => image !== scene);
  return {section, scene, composition: role[1], evidence: remaining.filter(image => image.purpose === 'diagram'), references: remaining.filter(image => image.purpose !== 'diagram')};
 });
}

/** Reviewed mixed ownership: documentary stills leave the leased model/video intact. */
export function hybridProjectLayout(project) {
 if (project.id === 'mode-s-of-making') {
  const results = project.sections.find(section => section.id === 'results');
  const films = [['film-machine-simulation','making','simulation',4.8,120],['film-physical-cutting','fabrication','recording',8.008,240],['prototype-cutting-operation','cutting','recording',8,200]];
  if (!project.model || project.model.chapters.join(',') !== 'context,system' ||
      !project.hero.src.endsWith('/mode-s-of-making/film-assembly-hero.webp') || project.hero.width !== 1920 || project.hero.height !== 1080 ||
      results?.media.length !== 1 || results.media[0].src !== project.hero.src ||
      project.motionMedia?.length !== 3 || films.some(([id,chapter,kind,duration,frames]) => {
       const film = project.motionMedia.find(media => media.id === id);
       return !film || film.chapter !== chapter || film.kind !== kind || film.loop !== true ||
        film.durationSeconds !== duration || film.frameCount !== frames || film.width !== 1920 || film.height !== 1080 ||
        !film.src.endsWith(`/mode-s-of-making/${id}.mp4`);
      })) {
   throw new Error('Hybrid scenes require the reviewed Mode/s simulation and recording roles.');
  }
  // The opening is a simulation still; Results keeps its original assembly-study return.
  return {nativeChapters:['overview','credits'],results:null};
 }
 if (project.id === 'entrance-installation-art') {
  const motion = project.motionMedia?.[0];
  const guides = [['context','pattern-development.webp',4],['system','panel-system.webp',5],['making','fabrication-drawings.webp',2]];
  if (!project.model || project.model.chapters.join(',') !== 'context,system' ||
      !project.hero.src.endsWith('/entrance-installation-art/hero.webp') || project.hero.width !== 2400 || project.hero.height !== 3200 ||
      project.motionMedia?.length !== 1 || motion.chapter !== 'results' || motion.kind !== 'recording' || motion.loop !== true ||
      motion.durationSeconds !== 22.066666666666666 || motion.frameCount !== 662 || motion.width !== 540 || motion.height !== 960 ||
      !motion.src.endsWith('/entrance-installation-art/installation-lighting-motion.mp4') ||
      guides.some(([id,name,count]) => { const guide = project.sections.find(section => section.id === id)?.diagramFocus; return !guide?.source.endsWith(`/entrance-installation-art/${name}`) || guide.steps.length !== count; })) {
   throw new Error('Hybrid scenes require the reviewed Entrance source roles.');
  }
  // Results retains its real night recording; the existing source guide flow is unchanged.
  return {nativeChapters:['overview','credits'],results:null};
 }
 if (project.id === 'dot-based-3d-printing') {
  const results = project.sections.find(section => section.id === 'results');
  const names = ['prototype-family.webp', 'translucent-prototypes.webp'];
  const motion = project.motionMedia?.[0];
  if (!project.model || project.model.chapters.join(',') !== 'system' ||
      project.model.primitive !== 'points' || project.model.vertices !== 14810 || project.model.triangles !== 0 ||
      project.motionMedia?.length !== 1 || motion.chapter !== 'making' ||
      motion.loop !== true || motion.kind !== 'recording' || motion.durationSeconds !== 4.4 ||
      !motion.src.endsWith('/dot-based-3d-printing/printing-process-motion-web.mp4') ||
      !project.hero.src.endsWith('/dot-based-3d-printing/hero.webp') ||
      results?.media.length !== 2 || results.media.some((image,index) => !image.src.endsWith(`/dot-based-3d-printing/${names[index]}`))) {
   throw new Error('Hybrid scenes require the reviewed Dot source roles.');
  }
  return {nativeChapters:['overview','results','credits'],results:{section:results,scene:results.media[0],evidence:[results.media[1]]}};
 }
 if (project.id === 'hc3dp-caustics') {
  const results = project.sections.find(section => section.id === 'results');
  const names = ['hero.webp', 'overinflation.webp'];
  const motion = project.motionMedia?.[0];
  if (!project.model || project.model.chapters.join(',') !== 'context,system' ||
      project.motionMedia?.length !== 1 || motion.chapter !== 'making' ||
      motion.loop !== true || motion.kind !== 'simulation' || motion.durationSeconds !== 2.17 ||
      !motion.src.endsWith('/hc3dp-caustics/fabrication-path-motion.mp4') ||
      !project.hero.src.endsWith('/hc3dp-caustics/caustic-observation.webp') ||
      results?.media.length !== 2 || results.media.some((image,index) => !image.src.endsWith(`/hc3dp-caustics/${names[index]}`))) {
   throw new Error('Hybrid scenes require the reviewed HC3DP source roles.');
  }
  return {nativeChapters:['overview','results','credits'],results:{section:results,scene:results.media[0],evidence:[results.media[1]]}};
 }
 if (project.id !== 'special-assemblies') return null;
 const results = project.sections.find(section => section.id === 'results');
 const names = ['front-prototype.webp', 'assembly-detail.webp'];
 if (!project.model || project.model.chapters.join(',') !== 'context,system' ||
     project.motionMedia?.length !== 1 || project.motionMedia[0].chapter !== 'making' ||
     project.motionMedia[0].loop !== false || project.motionMedia[0].kind !== 'simulation' ||
     !project.hero.src.endsWith('/special-assemblies/hero.webp') ||
     results?.media.length !== 2 || results.media.some((image,index) => !image.src.endsWith(`/special-assemblies/${names[index]}`))) {
  throw new Error('Hybrid scenes require the reviewed Special Assemblies source roles.');
 }
 return {nativeChapters:['overview','results','credits'],results:{section:results,scene:results.media[0],evidence:[results.media[1]]}};
}
