import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
// Independent deployed bb602416 baseline; exact Home-only approved blocks.
export const homeResearchReplacements=[
  [
    "",
    "import HomeResearchStage from './HomeResearchStage';\n"
  ],
  [
    "  return <section id=\"about\" tabIndex={-1} className={styles.introduction} data-home-introduction aria-labelledby=\"home-title\">\n    <div className={styles.introductionInner}>\n      <div className={styles.introductionCopy}>\n",
    "  return <section id=\"about\" tabIndex={-1} className={`${styles.introduction} ${styles.researchStory}`} data-home-introduction data-home-research-story aria-labelledby=\"home-title\">\n    <div className={`${styles.introductionInner} ${styles.researchLayout}`}>\n      <div className={styles.introductionCopy} data-home-research-origin>\n"
  ],
  [
    "      <div className={styles.notation} data-portfolio-notation aria-hidden=\"true\"><span>FORM</span><span>SYSTEM</span><span>MAKE</span></div>\n      <span className={styles.signature} data-portfolio-signature aria-hidden=\"true\">DESIGN INFORMATION INTO FABRICATION</span>\n",
    "      <div className={styles.researchVisual} data-home-research-visual>\n        <HomeResearchStage poster={projects[0].image} className={styles.researchStage}/>\n        <p className={styles.researchCaption}><span data-portfolio-signature>ORIGINAL RESEARCH GEOMETRY</span><span data-portfolio-notation>FORM / SYSTEM / MAKE</span></p>\n      </div>\n      <div className={styles.researchEntry} data-home-research-entry>\n        <p className={styles.eyebrow}>FEATURED RESEARCH / BENDING-ACTIVE</p>\n        <h2>{review.title}</h2>\n        <p>Geometric representation, metal-panel openings and physical assembly.</p>\n        <a href=\"/projects/bending-active/\" className={styles.researchLink} data-home-research-link><span>Explore Bending-Active</span><Arrow diagonal/></a>\n        <p className={styles.researchNote}>An original digital model of the research assembly. Scroll to examine its form, then enter the project.</p>\n      </div>\n"
  ],
  [
    "          {project.id==='bending-active'\n",
    "          {project.id==='bending-active'&&standalone\n"
  ]
];
export function originalHomeSource(source){
 let result=source;
 for(const [before,after] of homeResearchReplacements){assert.equal(result.split(after).length,2,'Each approved Home block occurs once');result=result.replace(after,before);}
 assert.equal(createHash('sha256').update(result).digest('hex'),'18acfe66aed4baf3fc1e0950e71c9247a1c4297620ddafd2ff602c4b1d9b7179','All other Home source bytes retain the deployed baseline');return result;
}
