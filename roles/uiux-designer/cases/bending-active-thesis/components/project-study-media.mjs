/** A source shown by the background (including its policy/failure poster) does
 * not also become an information-layer photograph. Captions and source links
 * remain independent. Repeated supporting images have one editorial placement. */
export function projectStudyEvidence(project){
 const motions=new Map((project.motionMedia??[]).map(media=>[media.chapter,media]));
 const background=new Set([motions.get('overview')?.poster.src??project.hero.src,project.model?.poster.src,
  ...project.sections.map(section=>motions.get(section.id)?.poster.src??section.media[0]?.src)].filter(Boolean));
 const shown=new Set();
 return new Map(project.sections.map(section=>{
  const motion=project.motionMedia?.some(media=>media.chapter===section.id);
  const candidates=motion?section.media:section.media.slice(1);
  const evidence=candidates.filter(image=>{
   if(background.has(image.src)||shown.has(image.src))return false;
   shown.add(image.src);return true;
  });
  return[section.id,evidence];
 }));
}
