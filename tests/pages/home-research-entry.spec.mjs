import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';
const entered=async page=>{await expect.poll(()=>page.evaluate(()=>window.__site?.inspect().phase),{timeout:WAIT}).toBe('entered');await expect(page.locator('[data-site-loader]')).toBeHidden();};
const deck=page=>page.evaluate(()=>window.__globalBackground?.inspect().driver.homeDeck);
const wheelTo=async(page,y)=>{await page.mouse.move(page.viewportSize().width-3,page.viewportSize().height/2);await page.mouse.wheel(0,y-await page.evaluate(()=>scrollY));};

test('Home introduction cycles real source models on one bounded renderer with live lighting and lens changes',async({page},info)=>{
 test.setTimeout(scenarioTimeout(240000));const errors=[],hostEvidence={checkpoint:null,heartbeats:[]};page.on('pageerror',e=>errors.push(e.message));
 // Console delivery keeps the last completed observation outside the page. A
 // blocked renderer/evaluate cannot prevent finally from preserving evidence.
 page.on('console',message=>{const text=message.text();if(!text.startsWith('__home-loop-evidence__:'))return;const packet=JSON.parse(text.slice('__home-loop-evidence__:'.length));if(packet.checkpoint)hostEvidence.checkpoint=packet.checkpoint;hostEvidence.heartbeats.push(packet.sample);if(hostEvidence.heartbeats.length>256)hostEvidence.heartbeats.shift();});
 try{
 // Observe from document creation. Each receipt is captured in one browser
 // frame, so a normal source exchange cannot invalidate a host-side poll.
 // This watcher only reads diagnostics; it never advances or holds site time.
 await page.addInitScript(()=>{
  const record=window.__homeLoopEvidence={first:null,starts:[],lasts:[],receipts:[],sequence:[],maximumCanvases:0,failures:[],wrapped:false};let last=-Infinity,previousIndex=-1,lastHeartbeat=-Infinity,lastPhase='';
  const capture=state=>{
   const source=state.resource;
   return {kind:state.kind,index:state.index,project:state.project,time:state.time,duration:state.duration,canvasCount:state.canvasCount,
    successfulPaint:source.successfulPaint,sourceRevision:source.sourceRevision,vertices:source.vertices,triangles:source.triangles,
    drawnMeshes:source.drawnMeshes,expectedMeshes:source.expectedMeshes,sourceCalls:source.sourceCalls,pose:source.pose,shot:source.view.showcaseShot,firstDraw:source.firstDraw,
    appearance:{profileID:source.appearance.profileID,kind:source.appearance.kind,opticalModel:source.appearance.opticalModel,materials:source.appearance.materials?.map(({type,ior,opacity,transmission,forceSinglePass,depthWrite})=>({type,ior,opacity,transmission,forceSinglePass,depthWrite})),lighting:source.appearance.lighting,lights:source.appearance.lights?.map(({role,intensity})=>({role,intensity}))}};
  };
  const observe=now=>{
   if(now-last>=150){
    last=now;const state=window.__globalBackground?.inspect().driver.homeResearch;let checkpoint=false;
    const canvases=document.querySelectorAll('[data-home-showcase-surface] canvas').length;record.maximumCanvases=Math.max(record.maximumCanvases,canvases);
    if(state?.phase==='failed'){record.failures.push({index:state.index,reason:state.failureReason});checkpoint=true;}
    if(state?.phase==='ready'&&state.resource){
     const receipt=capture(state);record.first??=receipt;
     if(previousIndex!==state.index){record.sequence.push(state.index);previousIndex=state.index;checkpoint=true;}
     if(record.sequence.length<=7){record.starts[state.index]??=receipt;record.lasts[state.index]=receipt;if(state.time>state.duration*.55&&!record.receipts[state.index]){record.receipts[state.index]=receipt;checkpoint=true;}}
     if(record.receipts.filter(Boolean).length===7&&state.index===0&&record.sequence.length>=8){record.wrapped=true;record.wrap=receipt;checkpoint=true;}
    }
    const phase=`${state?.index}:${state?.phase}`;if(phase!==lastPhase){lastPhase=phase;checkpoint=true;}
    if(checkpoint||now-lastHeartbeat>=1000){lastHeartbeat=now;const sample={at:now,index:state?.index,phase:state?.phase,time:state?.time,duration:state?.duration,failureReason:state?.failureReason,draws:state?.resource?.draws,renderSubmit:state?.resource?.renderSubmit,canvasCount:canvases,received:record.receipts.map(receipt=>receipt?.index??null)};console.debug('__home-loop-evidence__:'+JSON.stringify({sample,...checkpoint?{checkpoint:record}:{}}));}
   }
   if(!record.wrapped&&!record.failures.length)requestAnimationFrame(observe);
  };
  requestAnimationFrame(observe);
 });
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await entered(page);
 await expect(page.locator('[data-home-introduction] h1')).toHaveText("Hi, I'm JosHsuan.");
 await expect(page.locator('[data-home-introduction] h2,[data-home-research-pause],[data-project-grid]')).toHaveCount(0);
 await expect(page.locator('[data-home-introduction] [data-introduction-statement]')).toBeVisible();
 const sequence=['entrance-installation-art','mode-s-of-making','project-caschlatsch','dot-based-3d-printing','special-assemblies','hc3dp-caustics','mode-s-of-making'];
 // Consume the same atomic browser receipts already delivered to the host.
 // A second evaluate can queue behind a slow draw and return an older false
 // after the required receipt has arrived; it adds no source-paint evidence.
 for(let index=0;index<sequence.length;index++){
  await expect.poll(()=>!!hostEvidence.checkpoint?.receipts[index]||!!hostEvidence.checkpoint?.failures.length,{timeout:40000}).toBe(true);
  expect(hostEvidence.checkpoint.failures).toEqual([]);
 }
 await expect.poll(()=>!!hostEvidence.checkpoint?.wrapped||!!hostEvidence.checkpoint?.failures.length,{timeout:40000}).toBe(true);
 const evidence=hostEvidence.checkpoint;
 await writeFile(info.outputPath('home-authored-loop.json'),JSON.stringify(evidence,null,2)+'\n');
 expect(evidence.failures).toEqual([]);expect(evidence.wrapped).toBe(true);expect(evidence.maximumCanvases).toBe(1);expect(evidence.sequence).toEqual([0,1,2,3,4,5,6,0]);
 expect(evidence.first.kind).toBe('project-showcase');expect(evidence.first.project).toBe(sequence[0]);expect(evidence.first.canvasCount).toBe(1);
 for(const [index,source]of evidence.receipts.entries()){
  expect(source.project).toBe(sequence[index]);expect(source.canvasCount).toBe(1);expect(source.successfulPaint).toBe(true);
  expect(source.firstDraw.composition).toBe('authored-showcase');expect(source.drawnMeshes).toBe(source.expectedMeshes);expect(source.sourceCalls).toBeGreaterThan(0);
  expect(source.shot.coverage).toBe('partial');expect(source.pose.compositionSpace).toBe('authored-showcase');expect(source.vertices).toBeGreaterThan(0);
  expect(evidence.lasts[index].pose.position).not.toEqual(evidence.starts[index].pose.position);expect(evidence.lasts[index].shot.focalLengthMm).not.toBe(evidence.starts[index].shot.focalLengthMm);
  if(source.appearance.kind!=='points')expect(evidence.lasts[index].appearance.lighting.revision).toBeGreaterThan(evidence.starts[index].appearance.lighting.revision);
  if(source.project==='hc3dp-caustics'){expect(source.appearance.opticalModel).toBe('single-pass-clear-shell-alpha');expect(source.appearance.materials).toEqual([expect.objectContaining({transmission:0,forceSinglePass:true,depthWrite:false})]);expect(source.sourceCalls).toBe(source.expectedMeshes);}
 }
 expect(evidence.wrap.canvasCount).toBe(1);expect(evidence.wrap.successfulPaint).toBe(true);expect(errors).toEqual([]);
 }finally{await writeFile(info.outputPath('home-loop-observation.json'),JSON.stringify({...hostEvidence,pageErrors:errors},null,2)+'\n');}
});

test('Home reveals all eight cards in native forward and reverse order with half-screen section joins',async({page},info)=>{
 test.setTimeout(scenarioTimeout(120000));
 // A rounded final scrollY can be observed before the compositor completes a
 // smooth section join. Observe native completion before starting a new gesture;
 // no delay, repeated wheel delivery or application-clock control is involved.
 await page.addInitScript(()=>{
  const evidence=window.__homeNativeScroll={last:null,end:null};
  for(const type of ['scroll','scrollend'])window.addEventListener(type,()=>{
   const sample={y:scrollY,time:performance.now()};if(type==='scroll')evidence.last=sample;else evidence.end=sample;
  },{passive:true});
 });
 const joined=async y=>{
  await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeCloseTo(y,0);
  await page.waitForFunction(()=>{const {last,end}=window.__homeNativeScroll;return end&&end.y===scrollY&&end.time>=(last?.time??0);},null,{timeout:WAIT});
 };
 await page.goto('/');await entered(page);
 await expect(page.locator('[data-home-deck]')).toHaveAttribute('data-deck-ready','');
 const range=await deck(page);expect(range.count).toBe(8);
 await page.evaluate(()=>{window.__deckEvents=[];for(const type of ['portfolio:card-enter','portfolio:card-leave'])document.querySelector('[data-home-deck]').addEventListener(type,event=>window.__deckEvents.push({type,id:event.target.dataset.deckCard,index:event.detail.index}));});
 await wheelTo(page,Math.round(range.top-range.viewport*.49));
 await joined(range.top);
 const seen=[];
 for(const i of [...Array(8).keys(),...Array.from({length:8},(_,j)=>7-j)]){
  const y=Math.round(range.top+i*(range.height-range.viewport)/7);await wheelTo(page,y);
  await expect.poll(async()=>(await deck(page)).index,{timeout:WAIT}).toBe(i);
  await expect.poll(async()=>Math.abs((await deck(page)).position-i),{timeout:WAIT}).toBeLessThan(.002);
  const active=page.locator('[data-deck-card][data-deck-active]');expect(await active.count()).toBe(1);
  const dimensions=await active.evaluate(node=>({width:node.offsetWidth,height:node.offsetHeight}));expect(Math.abs(dimensions.width-dimensions.height)).toBeLessThanOrEqual(1);
  await expect(active).not.toHaveAttribute('inert','');await expect(active.locator('a')).toBeInViewport();seen.push(await active.getAttribute('data-deck-card'));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 expect(seen.slice(0,8)).toEqual([...seen.slice(8)].reverse());expect(new Set(seen).size).toBe(8);
 const events=await page.evaluate(()=>window.__deckEvents);expect(events.filter(event=>event.type==='portfolio:card-enter').map(event=>event.index)).toEqual([1,2,3,4,5,6,7,6,5,4,3,2,1,0]);
 expect(events.length).toBe(28);
 const end=range.top+range.height-range.viewport;
 await wheelTo(page,end+range.viewport*.51);await joined(end+range.viewport);
 await expect(page.locator('[data-portfolio-contact]')).toBeInViewport();
 await wheelTo(page,end+range.viewport*.49);await joined(end);
 await expect.poll(async()=>(await deck(page)).index).toBe(7);
 await wheelTo(page,range.top);await expect.poll(async()=>(await deck(page)).index).toBe(0);
 await wheelTo(page,range.top-range.viewport*.51);await joined(0);
 await page.screenshot({path:info.outputPath('home-returned.png')});
});

test('Home source failure leaves introduction and native project navigation usable through history',async({page})=>{
 await page.route('**/*.glb',route=>route.abort());await page.goto('/');await entered(page);
 await expect(page.locator('[data-home-introduction] h1')).toBeVisible();
 await page.getByRole('link',{name:'Discover the work'}).click();
 const card=page.locator('[data-deck-card][data-deck-active] a');await expect(card).toHaveAttribute('href','/projects/bending-active/');
 // A project route owns its own failure boundary, independent of Home resources.
 await page.locator('[data-home-deck] a[href="/projects/"]').click();await entered(page);
 await expect(page.locator('[data-project-card]')).toHaveCount(8);await expect(page.locator('[data-home-showcase]')).toHaveCount(0);
 await page.goBack();await entered(page);await expect(page.locator('[data-home-deck]')).toHaveAttribute('data-deck-ready','');
 await expect(page.locator('[data-deck-card]')).toHaveCount(8);
});

for(const viewport of [{name:'short landscape',width:844,height:390},{name:'200-percent desktop effective viewport',width:720,height:500}])test(`square discovery cards remain compact and usable in ${viewport.name}`,async({page},info)=>{
 // 1440x1000 at 200% exposes 720x500 CSS pixels. This verifies reflow at that
 // effective viewport; it does not claim to change physical browser chrome zoom.
 await page.setViewportSize({width:viewport.width,height:viewport.height});
 await page.goto('/');await entered(page);await page.getByRole('link',{name:'Discover the work'}).click();
 const range=await deck(page);await wheelTo(page,Math.round(range.top+3*(range.height-range.viewport)/7));
 await expect.poll(async()=>(await deck(page)).index,{timeout:WAIT}).toBe(3);
 await expect.poll(async()=>Math.abs((await deck(page)).position-3),{timeout:WAIT}).toBeLessThan(.002);
 const facts=await page.locator('[data-deck-card]').evaluateAll(cards=>{
  const active=cards.findIndex(card=>card.hasAttribute('data-deck-active'));
  const read=node=>{const box=node.getBoundingClientRect();return{x:box.x,y:box.y,width:box.width,height:box.height,right:box.right,bottom:box.bottom};};
  return{active:read(cards[active]),next:read(cards[active+1]),native:{width:cards[active].offsetWidth,height:cards[active].offsetHeight},title:read(cards[active].querySelector('h3')),action:read(cards[active].querySelector('a')),overflow:document.documentElement.scrollWidth>innerWidth};
 });
 expect(Math.abs(facts.native.width-facts.native.height)).toBeLessThanOrEqual(1);
 expect(Math.abs(facts.next.x+facts.next.width/2-facts.active.x-facts.active.width/2)).toBeLessThan(facts.active.width*.4);
 expect(facts.title.y).toBeGreaterThanOrEqual(facts.active.y);expect(facts.title.bottom).toBeLessThanOrEqual(facts.active.bottom);
 expect(facts.active.y).toBeGreaterThan(40);expect(facts.active.bottom).toBeLessThan(viewport.height-35);
 expect(facts.action.width).toBeGreaterThanOrEqual(44);expect(facts.action.height).toBeGreaterThanOrEqual(44);expect(facts.overflow).toBe(false);
 await page.screenshot({path:info.outputPath('compact-square-deck.png')});
});
