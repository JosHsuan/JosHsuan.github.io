import {test,expect} from '@playwright/test';
import {WAIT,loadScene,settle,frames,pause} from './case-helpers.mjs';

test('IBM Plex, rounded shadowboxes and orange photos retain an accessible original',async({page,isMobile})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 const fonts=await page.evaluate(async()=>{await document.fonts.load('400 16px "IBM Plex Mono"');await document.fonts.load('italic 400 16px "IBM Plex Serif"');return{sans:document.fonts.check('400 16px "IBM Plex Sans"'),mono:document.fonts.check('400 16px "IBM Plex Mono"'),serif:document.fonts.check('italic 400 16px "IBM Plex Serif"'),body:getComputedStyle(document.body).fontFamily};});expect(fonts).toMatchObject({sans:true,mono:true,serif:true});expect(fonts.body).toContain('IBM Plex Sans');
 const photo=page.locator('#make [data-media-kind="photo"] img'),link=page.locator('#make [data-inspect-figure]');await link.scrollIntoViewIfNeeded();
 expect(await photo.evaluate(el=>getComputedStyle(el).filter)).toContain('invert(1)');expect(await link.evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThanOrEqual(16);
 if(!isMobile){await link.hover();expect(await photo.evaluate(el=>getComputedStyle(el).filter)).toBe('none');}else{await link.focus();expect(await photo.evaluate(el=>getComputedStyle(el).filter)).toBe('none');}
 await link.press('Enter');await expect(page.locator('[data-source-comparison] img')).toBeVisible();expect(await page.locator('[data-source-comparison] img').evaluate(el=>getComputedStyle(el).filter)).toBe('none');await page.getByRole('button',{name:'Close source comparison'}).click();await expect(link).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('original SVG paths support accessible curve and workflow selections with static failure fallbacks',async({page})=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 for(const [kind,count]of [['miura',3],['library',11],['workflow',4]]){const diagram=page.locator(`[data-source-diagram="${kind}"]`);await diagram.scrollIntoViewIfNeeded();await expect(diagram.locator('svg')).toBeVisible({timeout:WAIT});expect(await diagram.locator('svg path').count()).toBeGreaterThan(10);const buttons=diagram.locator('button[data-diagram-index]');await expect(buttons).toHaveCount(count);await buttons.last().focus();await page.keyboard.press('Enter');await expect(buttons.last()).toHaveAttribute('aria-pressed','true');await expect(diagram.locator('[data-diagram-caption]')).not.toBeEmpty();
  // Every authored caption must fit without changing the reading stop plan.
  // Selection shares the same paint path as autonomous presentation changes.
  await page.evaluate(()=>document.fonts.ready);
  const heights=await diagram.evaluate(async el=>{const values=[];for(const button of el.querySelectorAll('button[data-diagram-index]')){button.click();await new Promise(requestAnimationFrame);values.push({figure:el.getBoundingClientRect().height,document:document.documentElement.scrollHeight});}return values;});
  for(const value of heights){expect(Math.abs(value.figure-heights[0].figure)).toBeLessThan(.01);expect(value.document).toBe(heights[0].document);}
  await diagram.getByRole('button',{name:'Follow chapter'}).click();}
 await page.route('**/assets/diagrams/*.json',r=>r.abort());await page.reload();for(const kind of ['miura','library','workflow']){const img=page.locator(`[data-source-diagram="${kind}"] img`);await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);}
});

test('zero-wheel chapter loops advance field and diagram selections while Pause holds the shared clock',async({page})=>{
 test.setTimeout(120000);await loadScene(page);await page.locator('[data-source-diagram="workflow"]').scrollIntoViewIfNeeded();await settle(page);await page.mouse.move(10,130);await frames(page,4);
 const first=await page.evaluate(()=>({time:window.__story.inspect().playback.activeSeconds,field:window.__thesis.inspect().compositor.field.time,phase:document.querySelector('[data-source-diagram="workflow"]').style.getPropertyValue('--diagram-phase'),y:scrollY}));
 await page.waitForFunction(before=>{const story=window.__story.inspect(),scene=window.__thesis.inspect();return story.playback.activeSeconds>before.time&&scene.compositor.field.time>before.field&&document.querySelector('[data-source-diagram="workflow"]').style.getPropertyValue('--diagram-phase')!==before.phase;},first,{timeout:WAIT});const second=await page.evaluate(()=>({time:window.__story.inspect().playback.activeSeconds,field:window.__thesis.inspect().compositor.field.time,phase:document.querySelector('[data-source-diagram="workflow"]').style.getPropertyValue('--diagram-phase'),y:scrollY,foreground:window.__thesis.inspect().compositor.foreground}));expect(second.y).toBe(first.y);expect(second.time).toBeGreaterThan(first.time);expect(second.field).toBeGreaterThan(first.field);expect(second.phase).not.toBe(first.phase);expect(second.foreground.missingMasks).toBe(false);
 const workflow=page.locator('[data-source-diagram="workflow"]');await workflow.locator('button[data-diagram-index="2"]').click();await settle(page);expect(await page.evaluate(()=>window.__story.inspect().sourceSelection?.chapterId)).toBe('system');
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();await settle(page);const frozen=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);await frames(page,10);expect(await page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBe(frozen);
});


test('foreground Canvas preserves the rendered pixels of essential reading cores',async({page})=>{
 test.setTimeout(120000);await loadScene(page);await pause(page);
 const heading=page.locator('[data-source-diagram="workflow"] figcaption[data-protect]');await heading.scrollIntoViewIfNeeded();await settle(page);await frames(page,4);
 // Force one final renderer frame after DOM settlement; the GPU is demand-driven.
 const beforeFrame=await page.evaluate(()=>window.__thesis.inspect().frames);await page.evaluate(()=>window.__thesis.setOverrides({}));await page.waitForFunction(n=>window.__thesis.inspect().frames>n,beforeFrame);await frames(page,2);
 const before=await heading.screenshot();await page.locator('[data-cinematic-stage]').evaluate(el=>{el.style.visibility='hidden';});const after=await heading.screenshot();await page.locator('[data-cinematic-stage]').evaluate(el=>{el.style.visibility='visible';});
 // A detached test-only canvas decodes pixels in WebKit, which lacks OffscreenCanvas here.
 const diff=await page.evaluate(async([a,b])=>{const decode=async text=>{const image=await createImageBitmap(await(await fetch('data:image/png;base64,'+text)).blob());const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const context=canvas.getContext('2d');context.drawImage(image,0,0);return context.getImageData(0,0,image.width,image.height).data;};const x=await decode(a),y=await decode(b);let changed=0;for(let i=0;i<x.length;i+=4)if(Math.max(Math.abs(x[i]-y[i]),Math.abs(x[i+1]-y[i+1]),Math.abs(x[i+2]-y[i+2]))>10)changed++;return changed/(x.length/4);},[before.toString('base64'),after.toString('base64')]);expect(diff).toBeLessThan(.005);
});
