import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,settle} from './case-helpers.mjs';

const home=page=>page.locator('[data-home-introduction]');
const projectLink=page=>page.locator('[data-home-project-link]');
const homeLink=page=>page.locator('[data-home-link]');
const stage=page=>page.locator('[data-cinematic-stage]');

async function introduction(page){
 await expect(page.getByRole('main')).toHaveCount(1);
 await expect(page.locator('h1')).toHaveCount(1);
 await expect(home(page)).toHaveAttribute('id','home');
 await expect(home(page).getByRole('heading',{level:1})).toHaveText('Hi, I’m JosHsuan.');
 await expect(home(page)).toContainText(/design|geometry|fabrication/i);
 await expect(home(page)).toBeVisible();
 await expect(projectLink(page)).toHaveAttribute('href','#overview');
 await expect(projectLink(page)).toHaveAccessibleName(/\S/);
 await expect(homeLink(page)).toHaveAttribute('href','#home');
 expect(await home(page).evaluate(element=>!!element.closest('[inert]')),'The personal introduction must remain outside the project entry gate').toBe(false);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
}

test('the personal introduction and original study remain native links without JavaScript',async({browser},testInfo)=>{
 const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',baseURL:'http://127.0.0.1:4186',viewport:testInfo.project.use.viewport});
 try{
  const page=await context.newPage();await page.goto('/');await introduction(page);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://joshsuan.github.io/');
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await expect(page.getByRole('heading',{level:2,name:'Bending-Active Metal Panel Deformation'})).toBeVisible();
  await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
  await projectLink(page).click();await expect(page).toHaveURL(/\/#overview$/);
  await expect(page.locator('#overview')).toBeInViewport();
  await homeLink(page).click();await expect(page).toHaveURL(/\/#home$/);
  await expect(home(page)).toBeInViewport();
  await page.goBack();await expect(page).toHaveURL(/\/#overview$/);
  await expect(page.locator('#overview')).toBeInViewport();
  await page.goForward();await expect(page).toHaveURL(/\/#home$/);
  await expect(home(page)).toBeInViewport();
 }finally{await context.close();}
});

test('Reduced home and study navigation preserve keyboard access, history and direct chapter links',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(120000));
 const requests=[],errors=[];
 page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await introduction(page);
 await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});await settle(page);
 await expect(stage(page)).toHaveAttribute('data-presentation-context','home');
 if(isMobile){const box=await projectLink(page).boundingBox();expect(box.height,'Mobile project-link hit target').toBeGreaterThanOrEqual(44);}
 const originalStage=await stage(page).elementHandle();
 await projectLink(page).focus();await expect(projectLink(page)).toBeFocused();await page.keyboard.press('Enter');await settle(page);
 await expect(page).toHaveURL(/\/#overview$/);await expect(stage(page)).toHaveAttribute('data-presentation-context','project');
 await expect(page.locator('#overview')).toBeFocused();
 await expect(page.locator('[data-story-navigation] [data-chapter-link]')).toHaveCount(7);
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
 await homeLink(page).click();await settle(page);
 await expect(page).toHaveURL(/\/#home$/);await expect(stage(page)).toHaveAttribute('data-presentation-context','home');
 await expect(home(page)).toBeInViewport();await introduction(page);
 await page.goBack();await settle(page);await expect(page).toHaveURL(/\/#overview$/);
 await expect(stage(page)).toHaveAttribute('data-presentation-context','project');
 await page.goForward();await settle(page);await expect(page).toHaveURL(/\/#home$/);
 await expect(stage(page)).toHaveAttribute('data-presentation-context','home');
 expect(await stage(page).evaluate((element,original)=>element===original,originalStage),'Native introduction navigation must retain the single stage').toBe(true);
 await originalStage.dispose();
 await page.goto('/#pattern');
 await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});await settle(page);
 await expect(page).toHaveURL(/\/#pattern$/);await expect(stage(page)).toHaveAttribute('data-presentation-context','project');
 await expect(page.locator('[data-chapter-link="pattern"]')).toHaveAttribute('aria-current','location');
 await expect(page.locator('#pattern')).toBeInViewport();
 await page.reload();await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});await settle(page);
 await expect(page).toHaveURL(/\/#pattern$/);await expect(page.locator('#pattern')).toBeInViewport();
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
 expect(requests,'Reduced introduction and chapter navigation must not request model/HDR assets').toEqual([]);
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('home stays usable before project readiness and browser Back can leave a pending entry',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));
 let release;const assetGate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/source-layers.glb',async route=>{await assetGate;await route.continue();});
 const scrollHome=async()=>{
  expect(await page.evaluate(()=>[document.documentElement,document.body].map(element=>getComputedStyle(element).overflowY)),'Pending home must not inherit the project entry scroll lock').not.toContain('hidden');
  const before=await page.evaluate(()=>scrollY),viewport=page.viewportSize();
  await page.mouse.move(16,viewport.height/2);await page.mouse.wheel(0,80);
  await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(before);
  await expect(stage(page)).toHaveAttribute('data-presentation-context','home');
  expect(await page.evaluate(()=>window.__story.inspect().entry.phase)).toBe('preparing');
 };
 try{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/',{waitUntil:'domcontentloaded'});
  await introduction(page);
  await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='preparing',null,{timeout:WAIT});
  await expect(stage(page)).toHaveAttribute('data-presentation-context','home');
  await expect(page.locator('[data-entry-loader]')).toBeHidden();
  await scrollHome();await page.mouse.wheel(0,-1000);
  await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBe(0);
  await projectLink(page).focus();await expect(projectLink(page)).toBeFocused();
  await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/#overview$/);
  await expect(stage(page)).toHaveAttribute('data-presentation-context','project');
  await expect(page.locator('[data-entry-loader]')).toBeVisible();
  expect(await page.evaluate(()=>window.__story.inspect().entry.phase)).toBe('preparing');
  await page.goBack();await expect(page).toHaveURL('http://127.0.0.1:4186/');
  await expect(stage(page)).toHaveAttribute('data-presentation-context','home');
  await expect(page.locator('[data-entry-loader]')).toBeHidden();await introduction(page);
  await scrollHome();
  await projectLink(page).focus();await expect(projectLink(page)).toBeFocused();
 }finally{
  release();
  // Finish active continue() calls before disabling interception. The default
  // unroute teardown can otherwise race this deliberately blocked handler.
  await page.unrouteAll({behavior:'wait'});
 }
});
