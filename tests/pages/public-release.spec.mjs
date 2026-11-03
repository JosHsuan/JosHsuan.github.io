import {test, expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT, scenarioTimeout, centerStudy, holdModel, frames, settle, expectIdle} from './case-helpers.mjs';

async function entered(page){await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});}

test('published story, canonical metadata and every linked asset work without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4186/projects/bending-active/');
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveAccessibleName('Bending-Active Metal Panel Deformation');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('heading',{level:1,name:'Bending-Active Metal Panel Deformation'})).toBeVisible();
  await expect(page.locator('[data-entry-loader]')).toBeHidden();
  await expect(page.locator('[data-project-content]')).not.toHaveAttribute('inert','');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://joshsuan.github.io/projects/bending-active/');
  const assets = await page.locator('img, source, a[href^="/assets/"]').evaluateAll(elements => [...new Set(elements.flatMap(el => [el.getAttribute('src'),el.getAttribute('srcset'),el.getAttribute('href')]).filter(Boolean))]);
  for (const asset of assets) expect((await page.request.get('http://127.0.0.1:4186'+asset)).status(), asset).toBe(200);
  await expect(page.locator('body')).not.toContainText('Public release of the project and individual media remains pending');
  await context.close();
});

test('public model initializes in Full and preserves native navigation with continuous motion and no pause control', async ({page,isMobile},info) => {
  test.setTimeout(scenarioTimeout(120000));
  const errors=[],navigation=[]; page.on('pageerror', error=>errors.push(error.message));
  page.on('console',message=>{const text=message.text();if(text.startsWith('__public-card-input__:'))navigation.push(JSON.parse(text.slice('__public-card-input__:'.length)));});
  // Retain the actual trusted input target on both sides of native event
  // dispatch; a moving card's earlier locator box does not prove activation.
  await page.addInitScript(()=>{
    let count=0;
    const identify=node=>node?.nodeType===1?{tag:node.tagName,id:node.id||null,
      card:node.getAttribute('data-project-card')??node.getAttribute('data-deck-card'),
      information:node.getAttribute('data-information-window'),showcaseSurface:node.hasAttribute('data-home-showcase-surface'),backgroundField:node.hasAttribute('data-global-background-field')}:null;
    const observe=(event,phase)=>{
      // A missed native activation may target the scene or page underneath the
      // deck. Retain that real target too, without collecting document text.
      if(!document.querySelector('[data-home-deck]')||count>=48)return;count++;
      const anchor=event.target.closest('a[href]'),card=event.target.closest('[data-deck-card]'),deck=window.__globalBackground?.inspect().driver.homeDeck;
      console.debug('__public-card-input__:'+JSON.stringify({type:event.type,phase,trusted:event.isTrusted,defaultPrevented:event.defaultPrevented,
        point:{x:event.clientX,y:event.clientY},target:event.target.tagName,href:anchor?.getAttribute('href')??null,card:card?.dataset.deckCard??null,
        hit:identify(document.elementFromPoint(event.clientX,event.clientY)),path:event.composedPath().map(identify).filter(Boolean).slice(0,7),
        active:card?.hasAttribute('data-deck-active')??false,docY:scrollY,deck,sitePhase:window.__site?.inspect().phase}));
    };
    for(const type of ['pointerdown','pointerup','click']){
      window.addEventListener(type,event=>observe(event,'capture'),{capture:true,passive:true});
      window.addEventListener(type,event=>observe(event,'bubble'),{passive:true});
    }
  });
  try{
  // Exercise the visitor's real entry once in the public release baseline.
  // Other scene suites enter #overview directly to retain their focused scope.
  await page.goto('/');
  await expect(page.locator('[data-site-loader]')).toBeHidden({timeout:WAIT});
  await expect(page.locator('[data-home-introduction]')).toBeVisible();
  const projectLink=page.getByRole('link',{name:'Discover the work'});
  await expect(projectLink).toHaveAttribute('href','#projects');await projectLink.click();
  await expect(page.locator('[data-home-deck]')).toBeInViewport();
  await page.locator('[data-project-card="bending-active"]').click();
  await expect(page).toHaveURL(/\/projects\/bending-active\/$/);
  await page.waitForFunction(()=>window.__thesis?.inspect().ready&&window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});
  await page.evaluate(()=>document.fonts.ready);await settle(page);
  await expect(page.locator('[data-cinematic-stage]')).toHaveAttribute('data-presentation-context','project');
  // A visitor's real keyboard inspection holds the source while its Full
  // materials, resource policy and geometry are measured.
  await centerStudy(page,'form');await holdModel(page);
  const initial=await page.evaluate(()=>window.__thesis.inspect());
  expect(initial.source).toMatchObject({vertices:172789,triangles:227521,sourceObjects:51});
  expect(initial.material).toMatchObject({finish:'satin',roughness:.58,anisotropy:.35});
  expect(initial.exhibition).toMatchObject({sourceGeometry:false,areaLights:2,extraShadowMaps:0});
  expect(initial.detail).toBe('full');
  expect(initial.compositor.requestedSamples).toBe(isMobile?0:2);
  expect(initial.renderSuspended).toBe(false);
  await expect(page.getByRole('combobox',{name:'Visual detail',exact:true})).toHaveCount(0);
  const motion=page.locator('[data-bending-motion-toggle]');
  await expect(motion).toHaveCount(0);
  await page.locator('[data-chapter-link="system"]').click();
  // Native document input drives one visible reading plane and scene score.
  // Linux software rendering can exceed the default five-second assertion budget.
  await expect(page.locator('[data-chapter-link="system"]')).toHaveAttribute('aria-current', 'location', {timeout:30000});
  await centerStudy(page,'system');await holdModel(page,'system');
  await page.waitForFunction(() => {
    const story = window.__story?.inspect(), scene = window.__thesis?.inspect();
    return story?.settled && story.chapterId === 'system' && scene?.representation?.chapterId === 'system';
  }, null, {timeout:30000});
  expect(await page.evaluate(()=>window.__thesis.inspect().detail)).toBe('full');
  expect(await page.evaluate(()=>window.__thesis.inspect().compositor.requestedSamples)).toBe(isMobile?0:2);
  expect(await page.evaluate(()=>window.__thesis.inspect().compositor.mist.enabled)).toBe(true);
  await page.locator('[data-chapter-link="make"]').click();
  await settle(page);
  await page.waitForFunction(()=>{const story=window.__story?.inspect(),scene=window.__thesis?.inspect();return story?.settled&&story.chapterId==='make'&&story.canvasPlacement?.settled&&story.canvasPlacement.visible===false&&scene?.renderSuspended&&!scene.sourceVisible;},null,{timeout:30000});
  // An absent surface deliberately retains its previous rendered pose. Prove
  // that the live Canvas is suspended instead of requiring an invisible frame.
  const resting=await page.evaluate(()=>window.__thesis.inspect().frames);await frames(page,8);
  expect(await page.evaluate(()=>window.__thesis.inspect().frames)).toBe(resting);
  await page.locator('[data-chapter-link="form"]').click();
  await centerStudy(page,'form');
  await page.waitForFunction(()=>{const story=window.__story?.inspect(),scene=window.__thesis?.inspect();return story?.settled&&scene?.pose.chapter.id==='form'&&scene.sourceVisible&&!scene.renderSuspended&&scene.canvasPlacement?.visible;},null,{timeout:30000});
  expect(await page.evaluate(()=>window.__thesis.inspect().frames)).toBeGreaterThan(resting);
  const runningTime=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().playback.activeSeconds),{timeout:WAIT}).toBeGreaterThan(runningTime);
  const live=await page.evaluate(()=>({time:window.__story.inspect().playback.activeSeconds,y:scrollY}));await page.emulateMedia({reducedMotion:'reduce'});await settle(page);await frames(page,5);
  expect(await page.evaluate(()=>({y:scrollY,paused:window.__thesis.inspect().motionPaused,reduced:window.__thesis.inspect().systemReduced}))).toEqual({y:live.y,paused:false,reduced:false});
  expect(await page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBeGreaterThan(live.time);
  await holdModel(page);await expectIdle(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
  }finally{
    const path=info.outputPath('public-card-native-input.json');await writeFile(path,JSON.stringify(navigation,null,2)+'\n');
    await info.attach('public-card-native-input',{path,contentType:'application/json'});
  }
});

test('inline evidence and method disclosure preserve native reading without an image inspection interface', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  // This scenario owns disclosure and image reading. Native chapter navigation
  // is exercised above; enter this chapter directly within the same 60s bound.
  await page.goto('/projects/bending-active/#system');await entered(page);
  const step=page.locator('#system details').first();
  await step.locator('summary').click();
  await expect(step).toHaveAttribute('open','');
  await expect(step).toContainText('desired surface geometry');
  const evidence=page.locator('#system [data-story-media]').first();await expect(evidence).toHaveCount(1);await evidence.scrollIntoViewIfNeeded();await settle(page);await expect(evidence.locator('img')).toBeVisible();await evidence.locator('img').click();
  await expect(page.locator('[data-inspect-figure],[data-source-comparison],dialog[open]')).toHaveCount(0);await expect(evidence.locator('button,a')).toHaveCount(0);expect(await evidence.getAttribute('tabindex')).toBeNull();
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('OS preferences retain live presentation while an actually unavailable model keeps public reading usable', async ({browser}) => {
  const context = await browser.newContext({reducedMotion:'reduce'});
  const page = await context.newPage(); const sceneRequests=[];
  page.on('request', request=>{if(/\.(glb|hdr)(\?|$)/.test(request.url()))sceneRequests.push(request.url());});
  await page.goto('http://127.0.0.1:4186/projects/bending-active/#overview');
  await entered(page);
  await expect(page.getByRole('button',{name:'Enable 3D',exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>({reason:window.__story.inspect().entry.reason,ready:window.__thesis.inspect().ready,reduced:window.__thesis.inspect().systemReduced}))).toEqual({reason:'',ready:true,reduced:false});
  expect(sceneRequests.some(url=>url.includes('source-layers.glb'))).toBe(true);
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await context.close();
  const fallback = await browser.newContext(); const failedPage = await fallback.newPage();
  await failedPage.route('**/source-layers.glb', route=>route.abort());
  await failedPage.goto('http://127.0.0.1:4186/projects/bending-active/#overview');await entered(failedPage);
  await expect(failedPage.locator('[data-scene-fallback]')).toContainText('3D unavailable');
  expect(await failedPage.evaluate(()=>window.__story.inspect().entry.reason)).toBe('scene-unavailable');
  await expect(failedPage.locator('[data-story-chapter]')).toHaveCount(7);
  await fallback.close();
});
