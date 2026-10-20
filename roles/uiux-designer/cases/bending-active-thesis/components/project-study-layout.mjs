/** Discrete editorial composition only. Source transport, model projection and
 * animation time remain with their existing owners. */
export function projectStudyLayout(project,chapter){
 const opening=chapter==='overview',closing=chapter==='credits';
 const section=project.sections.find(item=>item.id===chapter);
 if(!opening&&!closing&&!section)throw new RangeError('A known project chapter is required');
 if(closing)return{composition:'closing',layout:'reading',sourceShape:'none',sourceRole:'none',readingDensity:'normal'};
 const motion=project.motionMedia?.find(item=>item.chapter===chapter);
 const image=opening?project.hero:section.media[0],source=motion??image;
 if(!source||!Number.isFinite(source.width)||!Number.isFinite(source.height)||source.width<=0||source.height<=0)throw new RangeError('A source with positive native dimensions is required');
 const ratio=source.width/source.height,sourceShape=ratio<.85?'portrait':ratio<1.65?'balanced':'wide';
 const model=project.model?.chapters.includes(chapter)??false;
 const composition=opening?'opening':motion?'recording':model?'model':'documentary';
 const sourceRole=motion?(motion.kind??'motion'):model?'model':image.purpose==='diagram'?'technical-plate':'photograph';
 const layout=opening||composition==='model'?'split':motion||sourceRole==='technical-plate'||sourceShape==='wide'?'broad':'split';
 return{composition,layout,sourceShape,sourceRole,readingDensity:(section?.paragraphs.length??0)>=4?'extended':'normal'};
}

/** Technical lettering and portrait photographs need one complete source per
 * row. A photograph can share a desktop row without changing source pixels. */
export function projectStudyEvidenceLayout(image){
 return image.purpose==='diagram'||image.width/image.height<.85?'full':'pair';
}
