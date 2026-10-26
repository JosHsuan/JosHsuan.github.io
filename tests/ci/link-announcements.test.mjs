import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/components/',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');

function assertNativeReading(source,name){
 assert.doesNotMatch(source,/<a\b[^>]*href=(?:"#|\{`#|\{(?:image|item|motion|stage)\.(?:src|source)\})/,name+' does not turn reading or evidence into a link');
 assert.doesNotMatch(source,/<(?:button|input|select|details|summary)\b|role="(?:button|radio|tab)"|data-evidence-source-link|data-inspect-figure/,name+' has no optional click-mode surface');
 assert.doesNotMatch(source,/\b(?:onClick|onKeyDown|onPointerDown)=/,name+' leaves native reading keys untouched');
}
test('generic reading has passive chapter labels and only intentional page-navigation links',async()=>{
 for(const name of ['ProjectCaseStudy.jsx','EditorialProjectStudy.jsx','ProjectStudyChrome.jsx','ProjectCaseStudyControls.jsx','EntranceDiagramFocus.jsx'])assertNativeReading(await read(name),name);
 const chrome=await read('ProjectStudyChrome.jsx');
 assert.match(chrome,/<span key=\{item.id\}[^>]*data-project-chapter-link=/,'Existing semantic chapter hooks are passive spans');
 assert.doesNotMatch(chrome,/tabIndex=|aria-current=|Skip to content/);
 for(const href of ['/about/','/projects/','/contact/'])assert.ok(chrome.includes(`href="${href}"`),href+' remains native page navigation');
 const controls=await read('ProjectCaseStudyControls.jsx');
 assert.match(controls,/data-project-chapter-count/);assert.doesNotMatch(controls,/Pause|Resume|Skip|Full|Inspect|aria-pressed/);
});
test('remaining public-profile links keep explicit new-tab declarations and secure native semantics',async()=>{
 const source=await read('PortfolioHome.jsx');
 assert.match(source,/<nav[^>]*data-contact-social-links>\{contact.socialLinks.map\(link=><a key=\{link.id\} href=\{link.href\} target="_blank" rel="noreferrer" aria-label=\{`\$\{link.label\} \(new tab\)`\}/);
 assert.doesNotMatch(source,/<a\b[^>]*onClick=/,'Public links are not application-intercepted actions');
});
test('native-reading guard rejects returned anchors, choice controls and key interception',async()=>{
 const source=await read('ProjectStudyChrome.jsx');
 for(const mutation of ['<a href="#context">Context</a>','<a href={image.src}>Source</a>','<button>Pause motion</button>','<span role="radio">Mode</span>','<div onKeyDown={trap}>Read</div>'])assert.throws(()=>assertNativeReading(source+mutation,'mutation'));
});
