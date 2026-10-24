import {originalHomeSource} from './home-research-contract.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/components/',import.meta.url);
const hash=value=>createHash('sha256').update(value).digest('hex');
// Independently read from deployed ce12d682b75c4c1867f67250550996114196b004.
// These twelve exact block substitutions are the entire approved markup delta.
// Exact occurrence checks avoid stripping unrelated ARIA or matching the two
// generic image-link names ambiguously. No git/generated baseline at test time.
const cases={
  "PortfolioHome.jsx": {
    "baseline": "336f22d87de1e70daa7886a8f591d9ba25e91ffaa4226eb5ecc072dea85ea9b0",
    "replacements": [
      [
        "      <nav className={styles.socialLinks} aria-label=\"Public profiles\" data-contact-social-links>{contact.socialLinks.map(link=><a key={link.id} href={link.href} target=\"_blank\" rel=\"noreferrer\">{link.label}<Arrow diagonal/></a>)}</nav>\n",
        "      <nav className={styles.socialLinks} aria-label=\"Public profiles\" data-contact-social-links>{contact.socialLinks.map(link=><a key={link.id} href={link.href} target=\"_blank\" rel=\"noreferrer\" aria-label={`${link.label} (new tab)`}>{link.label}<Arrow diagonal/></a>)}</nav>\n"
      ]
    ]
  },
  "ProjectCaseStudy.jsx": {
    "baseline": "baf719e6c92e079819e5499901c863225b162902dbfe12187996e5ff27af227b",
    "replacements": [
      [
        " return <a className={styles.sourceLink} href={image.src} target=\"_blank\" rel=\"noreferrer\">View full image <span aria-hidden=\"true\">↗</span></a>;\n",
        " return <a className={styles.sourceLink} href={image.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`View full image (new tab): ${image.alt}`}>View full image <span aria-hidden=\"true\">↗</span></a>;\n"
      ],
      [
        "    <a className={styles.sourceLink} data-project-motion-source href={motion.src} target=\"_blank\" rel=\"noreferrer\">{motion.kind==='recording'?'View recording':'View animation'} <span aria-hidden=\"true\">↗</span></a>\n",
        "    <a className={styles.sourceLink} data-project-motion-source href={motion.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`${motion.kind==='recording'?'View recording':'View animation'} (new tab): ${motion.alt}`}>{motion.kind==='recording'?'View recording':'View animation'} <span aria-hidden=\"true\">↗</span></a>\n"
      ],
      [
        "  <a className={styles.evidenceImage} data-information-window=\"evidence-image\" data-information-motion-surface=\"plane\" data-home-scroll-window=\"project-evidence\" href={image.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`View full image: ${image.alt}`}><InformationSkin/><img data-project-evidence-image src={image.src} width={image.width} height={image.height} alt={image.alt} loading=\"lazy\" decoding=\"async\"/></a>\n",
        "  <a className={styles.evidenceImage} data-information-window=\"evidence-image\" data-information-motion-surface=\"plane\" data-home-scroll-window=\"project-evidence\" href={image.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`View full image (new tab): ${image.alt}`}><InformationSkin/><img data-project-evidence-image src={image.src} width={image.width} height={image.height} alt={image.alt} loading=\"lazy\" decoding=\"async\"/></a>\n"
      ]
    ]
  },
  "XRProject.jsx": {
    "baseline": "bd7b2e0eeee34ed4c836fceb491ec3c27f8c3a2dbb612dfc755c870b79d8a82a",
    "replacements": [
      [
        "    <a className={styles.mediaFrame} data-information-window=\"evidence-image\" data-information-motion-surface=\"plane\" href={item.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`View full image: ${item.alt}`}>\n",
        "    <a className={styles.mediaFrame} data-information-window=\"evidence-image\" data-information-motion-surface=\"plane\" href={item.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`View full image (new tab): ${item.alt}`}>\n"
      ],
      [
        "        <a className={styles.recordingLink} href={stage.src} target=\"_blank\" rel=\"noreferrer\">Open full recording <span aria-hidden=\"true\">↗</span></a>\n",
        "        <a className={styles.recordingLink} href={stage.src} target=\"_blank\" rel=\"noreferrer\" aria-label=\"Open full recording (new tab)\">Open full recording <span aria-hidden=\"true\">↗</span></a>\n"
      ],
      [
        "          <div className={styles.recordingSource}><a className={styles.recordingLink} href={study.media.motion.src} target=\"_blank\" rel=\"noreferrer\">Original presentation excerpt <span aria-hidden=\"true\">↗</span></a><p>{study.media.motion.caption}</p><p className={styles.credit}>{study.media.motion.credit}</p></div>\n",
        "          <div className={styles.recordingSource}><a className={styles.recordingLink} href={study.media.motion.src} target=\"_blank\" rel=\"noreferrer\" aria-label=\"Original presentation excerpt (new tab)\">Original presentation excerpt <span aria-hidden=\"true\">↗</span></a><p>{study.media.motion.caption}</p><p className={styles.credit}>{study.media.motion.credit}</p></div>\n"
      ]
    ]
  },
  "EntranceDiagramFocus.jsx": {
    "baseline": "8dc573359bf6eb7140dd82c1d3c65bef8f8070252d7282832d1e8e08932571ef",
    "replacements": [
      [
        "  <a className={styles.source} href={image.src} target=\"_blank\" rel=\"noreferrer\">Open complete source image <span aria-hidden=\"true\">↗</span></a>\n",
        "  <a className={styles.source} href={image.src} target=\"_blank\" rel=\"noreferrer\" aria-label={`Open complete source image (new tab): ${image.alt}`}>Open complete source image <span aria-hidden=\"true\">↗</span></a>\n"
      ]
    ]
  },
  "BendingProject.jsx": {
    "baseline": "a7fc21a835b3e640bc34701419952eabc69202d0ecfb0d6f9e2abbf2d73c6790",
    "replacements": [
      [
        "  return <figure className={[styles.evidence, className].join(' ')} data-story-media data-media-kind={kind} style={{'--evidence-aspect-ratio':item.width/item.height}}>\n",
        "  return <figure className={[styles.evidence, className].join(' ')} data-story-media data-media-kind={kind} style={{'--evidence-aspect-ratio':item.width/item.height}}>\n    <span id={`evidence-interaction-${evidence.indexOf(item)}`} hidden>Opens an inline source comparison when available; otherwise opens the original in a new tab.</span>\n"
      ],
      [
        "    <a className={styles.mediaFrame} data-information-window=\"evidence-image\" data-information-motion-surface=\"plane\" data-inspect-figure={evidence.indexOf(item)} href={item.source} target=\"_blank\" rel=\"noreferrer\" aria-label={`Inspect original source: ${item.figure}`}><InformationSkin/><span className={styles.mediaPlane} data-protect data-choreography={kind === 'photo' ? 'photo' : 'diagram'} data-feedback-plane><span className={styles.frameCorner} aria-hidden=\"true\"/><img src={item.src} width={item.width} height={item.height} alt={item.alt} loading=\"lazy\" /></span><span className={styles.mediaAction}>Inspect evidence <span aria-hidden=\"true\">↗</span></span></a>\n",
        "    <a className={styles.mediaFrame} data-information-window=\"evidence-image\" data-information-motion-surface=\"plane\" data-inspect-figure={evidence.indexOf(item)} href={item.source} target=\"_blank\" rel=\"noreferrer\" aria-label={`Inspect evidence: ${item.figure}`} aria-describedby={`evidence-interaction-${evidence.indexOf(item)}`}><InformationSkin/><span className={styles.mediaPlane} data-protect data-choreography={kind === 'photo' ? 'photo' : 'diagram'} data-feedback-plane><span className={styles.frameCorner} aria-hidden=\"true\"/><img src={item.src} width={item.width} height={item.height} alt={item.alt} loading=\"lazy\" /></span><span className={styles.mediaAction}>Inspect evidence <span aria-hidden=\"true\">↗</span></span></a>\n"
      ],
      [
        "              <div className={styles.sourceLinks} aria-label=\"Original research figures\">{Object.values(story.media).map(item => <a key={item.figure} href={item.source} target=\"_blank\" rel=\"noreferrer\">{item.figure} <span aria-hidden=\"true\">↗</span></a>)}</div>\n",
        "              <div className={styles.sourceLinks} aria-label=\"Original research figures\">{Object.values(story.media).map(item => <a key={item.figure} href={item.source} target=\"_blank\" rel=\"noreferrer\" aria-label={`${item.figure} (new tab)`}>{item.figure} <span aria-hidden=\"true\">↗</span></a>)}</div>\n"
      ]
    ]
  },
  "EvidenceInspector.jsx": {
    "baseline": "72a08058601d2646f55de1cf636bc870201fc5f3a62b04485961aa8c749a9f32",
    "replacements": [
      [
        "    <a href={item.source} target=\"_blank\" rel=\"noreferrer\">Open original source ↗</a>\n",
        "    <a href={item.source} target=\"_blank\" rel=\"noreferrer\" aria-label={`Open original source ↗ (new tab): ${item.figure}`}>Open original source ↗</a>\n"
      ]
    ]
  }
};
function verify(source,contract){
 let original=contract===cases['PortfolioHome.jsx']?originalHomeSource(source):source;
 for(const [before,after]of contract.replacements){
  assert.equal(original.split(after).length,2,'Each exact approved replacement occurs once');
  original=original.replace(after,before);
 }
 assert.equal(hash(original),contract.baseline,'All remaining bytes equal the independent deployed baseline');
}

test('link announcements change only twelve approved name/description changes in six components',async()=>{
 assert.equal(Object.keys(cases).length,6);
 assert.equal(Object.values(cases).reduce((sum,item)=>sum+item.replacements.length,0),12);
 for(const [name,contract]of Object.entries(cases))verify(await readFile(new URL(name,root),'utf8'),contract);
});
test('announcement contract rejects changed source, target, interception, text and unapproved ARIA',async()=>{
 for(const [name,contract]of Object.entries(cases)){
  const source=await readFile(new URL(name,root),'utf8');
  for(const [before,after]of contract.replacements){
   if(!after.includes('<a ')){
    assert.throws(()=>verify(source.replace(after,before),contract));
    assert.throws(()=>verify(source.replace(after,after.replace(' hidden>','>')),contract));
    continue;
   }
   for(const replacement of [before,after.replace('target="_blank"','target="_self"'),after.replace('href={','href={false&&'),after.replace('<a ','<a onClick={openModal} '),after.replace('aria-label=','aria-hidden="true" aria-label=')]){
    assert.notEqual(replacement,after,'Mutation must really alter an approved anchor');
    assert.throws(()=>verify(source.replace(after,replacement),contract));
   }
  }
  assert.throws(()=>verify(source+'\n// Unreviewed change\n',contract));
 }
});
test('Bending remains conditional inline comparison while the inspector source is a native new-tab action',async()=>{
 const source=await readFile(new URL('BendingProject.jsx',root),'utf8');
 assert.ok(source.includes('aria-label={`Inspect evidence: ${item.figure}`} aria-describedby={`evidence-interaction-${evidence.indexOf(item)}`}'));
 assert.ok(source.includes('data-inspect-figure={evidence.indexOf(item)} href={item.source} target="_blank"'));
 assert.ok(source.includes('<span id={`evidence-interaction-${evidence.indexOf(item)}`} hidden>Opens an inline source comparison when available; otherwise opens the original in a new tab.</span>'));
 assert.ok(!source.includes('aria-haspopup="dialog"'));
 assert.ok(!source.includes('aria-description='));
 const inspector=await readFile(new URL('EvidenceInspector.jsx',root),'utf8');
 assert.ok(inspector.includes('aria-label={`Open original source ↗ (new tab): ${item.figure}`}'));
});
