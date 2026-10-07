import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
const {chromium} = createRequire(new URL('../../../../../package.json', import.meta.url))('@playwright/test');
const root = 'D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration';
const executablePath = 'C:/Users/JosHsuan/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
await mkdir(`${root}/verification`, {recursive: true}); await mkdir(`${root}/prepared`, {recursive: true});
const browser = await chromium.launch({headless: true, executablePath});
const page = await browser.newPage({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 1});
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => {if (m.type() === 'error') errors.push(m.text());});
try {
  await page.goto('http://127.0.0.1:4184/'); await page.waitForFunction(() => window.__thesis?.inspect().ready, null, {timeout: 40000});
  await page.waitForTimeout(700);
  // A locator screenshot includes overlapping HTML. Hide every foreground layer
  // before recording the actual model-only poster, then restore it for reviews.
  const posterOnly = await page.addStyleTag({content:'body > :not([data-cinematic-background]){visibility:hidden!important}[data-cinematic-background] > :not(:has(canvas)){display:none!important}'});
  await page.locator('canvas').screenshot({path: `${root}/prepared/model-poster.png`});
  await posterOnly.evaluate(el=>el.remove());
  const results = [];
  for (const viewport of [{width:1440,height:1000},{width:1024,height:900},{width:768,height:1024},{width:390,height:844}]) {
    await page.setViewportSize(viewport);
    for (const id of ['overview','form','system','pattern','make','validation','credits']) {
      await page.evaluate(id => {const el = document.getElementById(id); scrollTo(0, el.offsetTop + (el.offsetHeight - innerHeight) * .45);}, id);
      await page.waitForTimeout(180);
      await page.screenshot({path: `${root}/verification/${viewport.width}-${id}.png`});
      results.push({width:viewport.width, id, state:await page.evaluate(()=>window.__thesis.inspect()), overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
    }
  }
  await writeFile(`${root}/verification/captures.json`, JSON.stringify({errors,results},null,2)); console.log(JSON.stringify({errors, captures:results.length, first:results[0].state}));
} finally {await browser.close();}
