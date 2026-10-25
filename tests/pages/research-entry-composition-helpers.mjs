import {expect} from '@playwright/test';
// Serialize this self-contained DOM reader into the pre-navigation observer;
// it observes real image geometry, never modifies presentation or readiness.
export function readEntryComposition(frame){
 const rect=r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height});
 const image=frame.querySelector('[data-research-entry-backdrop] img'),backdrop=image.closest('[data-research-entry-backdrop]'),css=getComputedStyle(image),r=image.getBoundingClientRect(),b=backdrop.getBoundingClientRect();
 const nw=image.naturalWidth,nh=image.naturalHeight,scale=Math.min(r.width/nw,r.height/nh),width=nw*scale,height=nh*scale;
 const content={left:r.left+(r.width-width)/2,top:r.top+(r.height-height)/2,width,height};content.right=content.left+width;content.bottom=content.top+height;
 const mobile=new URL(image.currentSrc||image.src).pathname.endsWith('model-poster-mobile.webp');
 // UX-reviewed conservative shell/base QA envelopes, not runtime crops.
 const source=mobile?[96,500,226,224]:[700,360,530,440];
 const subject={left:content.left+source[0]*scale,top:content.top+source[1]*scale,width:source[2]*scale,height:source[3]*scale};subject.right=subject.left+subject.width;subject.bottom=subject.top+subject.height;
 const forced=matchMedia('(forced-colors:active)').matches;
 const palette=element=>{let background=null,opaque=true;for(let n=element;n;n=n.parentElement){const c=getComputedStyle(n);opaque&&=Number(c.opacity)===1;const parts=c.backgroundColor.match(/[\d.]+/g)?.map(Number);if(!background){opaque&&=c.backgroundImage==='none';if(!parts||parts.length<3)opaque=false;else if((parts[3]??1)===1){background=c.backgroundColor;opaque&&=c.backgroundImage==='none';}else if((parts[3]??1)!==0)opaque=false;}}return{foreground:getComputedStyle(element).color,background,opaque};};
 const text=[];const owner=frame.querySelector('[data-research-entry-content]'),walker=document.createTreeWalker(owner,NodeFilter.SHOW_TEXT);
 for(let node=walker.nextNode();node;node=walker.nextNode())if(node.textContent.trim()){const style=getComputedStyle(node.parentElement);if(style.display==='none'||style.visibility==='hidden')continue;const range=document.createRange();range.selectNodeContents(node);for(const line of range.getClientRects())if(line.width&&line.height)text.push({text:node.textContent.trim().slice(0,160),...(forced?{palette:palette(node.parentElement)}:{}),...rect(line)});}
 return{src:image.getAttribute('src'),currentSrc:new URL(image.currentSrc||image.src).pathname,natural:[nw,nh],complete:image.complete,fit:css.objectFit,position:css.objectPosition,transform:css.transform,image:rect(r),backdrop:rect(b),frame:rect(frame.getBoundingClientRect()),content,subject,text,backdropDisplay:getComputedStyle(backdrop).display,viewport:{width:innerWidth,height:innerHeight},shortLandscape:matchMedia('(max-height:600px) and (orientation:landscape)').matches,forced:matchMedia('(forced-colors:active)').matches};
}
export function assertEntryComposition(fact){
 expect(fact.text.length).toBeGreaterThan(0);
 for(const line of fact.text){expect(line.left).toBeGreaterThanOrEqual(-1);expect(line.right).toBeLessThanOrEqual(fact.viewport.width+1);}
 if(fact.forced){expect(fact.backdropDisplay).toBe('none');for(const line of fact.text){expect(line.palette.opaque).toBe(true);const luminance=color=>{expect(color).not.toBeNull();const values=color.match(/[\d.]+/g)?.map(Number);expect(values?.length).toBeGreaterThanOrEqual(3);expect(values[3]??1).toBe(1);return values.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};const a=luminance(line.palette.foreground),b=luminance(line.palette.background);expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05),line.text).toBeGreaterThanOrEqual(4.5);}return;}
 expect(fact.complete).toBe(true);expect(fact.fit).toBe('contain');expect(fact.position).toBe('50% 50%');expect(fact.transform).toBe('none');
 const mobile=fact.viewport.width<=780;expect(fact.currentSrc).toBe(`/assets/cinematic/model-poster${mobile?'-mobile':''}.webp`);expect(fact.natural).toEqual(mobile?[390,844]:[1440,1000]);
 for(const key of ['left','top'])expect(fact.content[key]).toBeGreaterThanOrEqual(fact.backdrop[key]-1);
 for(const key of ['right','bottom'])expect(fact.content[key]).toBeLessThanOrEqual(fact.backdrop[key]+1);
 for(const line of fact.text){expect(line.left).toBeGreaterThanOrEqual(-1);expect(line.right).toBeLessThanOrEqual(fact.viewport.width+1);const s=fact.subject;expect(Math.max(0,Math.min(line.right,s.right)-Math.max(line.left,s.left))*Math.max(0,Math.min(line.bottom,s.bottom)-Math.max(line.top,s.top)),line.text).toBe(0);}
}
export function expectMatchingEntry(a,b){
 expect(b.currentSrc).toBe(a.currentSrc);expect(b.natural).toEqual(a.natural);
 for(const area of ['image','content','subject','frame'])for(const key of ['left','top','width','height'])expect(Math.abs(b[area][key]-a[area][key]),`${area}.${key}`).toBeLessThanOrEqual(1);
}
