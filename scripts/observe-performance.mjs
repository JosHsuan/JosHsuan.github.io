import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const base = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:4173'
const output = resolve(process.env.PORTFOLIO_QA_DIR || join(tmpdir(), 'portfolio-performance'))
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'chrome' : undefined) })
const results = []
try {
  for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, isMobile: device === 'mobile', hasTouch: device === 'mobile', deviceScaleFactor: 1 })
    for (const route of ['/', '/about/', '/projects/', '/research/', '/cv/', '/contact/', '/projects/inside-out-idf2019/', '/projects/computational-art/', '/projects/mesh-subdivision-stare-at-the-silence/']) {
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.addInitScript(() => {
        window.__layoutShifts = []
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__layoutShifts.push({ value: entry.value, at: entry.startTime })
        }).observe({ type: 'layout-shift', buffered: true })
      })
      const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' })
      await page.locator('main h1').waitFor()
      await page.waitForTimeout(400)
      const initial = await page.evaluate(() => ({
        layoutShiftSum: window.__layoutShifts.reduce((sum, entry) => sum + entry.value, 0),
        navigation: performance.getEntriesByType('navigation').map(entry => ({ responseEnd: entry.responseEnd, domContentLoaded: entry.domContentLoadedEventEnd, load: entry.loadEventEnd })),
        requestedAssets: performance.getEntriesByType('resource').map(entry => new URL(entry.name).pathname),
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      }))
      await page.screenshot({ path: join(output, `${device}-${route === '/' ? 'home' : route.split('/').filter(Boolean).join('-')}-viewport.png`) })
      for (const img of await page.locator('main img').all()) {
        await img.scrollIntoViewIfNeeded()
        await img.evaluate(image => image.decode())
      }
      await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); scrollTo({ top: 0, behavior: 'instant' }) })
      await page.screenshot({ path: join(output, `${device}-${route === '/' ? 'home' : route.split('/').filter(Boolean).join('-')}-full.png`), fullPage: true })
      results.push({ device, route, http: response.status(), ...initial, errors })
      await page.close()
    }
    await context.close()
  }
} finally { await browser.close() }
await writeFile(join(output, 'performance-observation.json'), JSON.stringify({ at: new Date().toISOString(), base, note: 'Local browser observations, without network throttling; navigation timings are not production speed guarantees. Layout shift sum excludes recent input and covers initial loading only.', results }, null, 2))
console.log(JSON.stringify(results.map(({ requestedAssets, navigation, ...result }) => ({ ...result, threeRequestedInitially: requestedAssets.some(path => /react-three-fiber/.test(path)) })), null, 2))
