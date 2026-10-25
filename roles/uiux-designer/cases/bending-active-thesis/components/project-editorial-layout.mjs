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
