import { expect, test, type Page } from '@playwright/test'
import { projects, filters, profile } from '../src/data/portfolio'

const lead = projects.find((project) => project.id === 't3-mocap-bending-active') || projects[0]
const interactive = projects.find((project) => project.scene === 'subdivision')!
const pathFor = (slug: string) => `/projects/${slug}/`
const coreSections = ['context', 'role', 'method', 'process', 'result', 'credits']

async function navigate(page: Page, label: string) {
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: label, exact: true }).click()
}

async function assertCore(page: Page) {
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
}
async function assertFits(page: Page) {
  const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
  expect(layout.scroll).toBeLessThanOrEqual(layout.width + 1)
}
async function prepareVisual(page: Page) {
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBeTruthy()
    await image.evaluate((element) => (element as HTMLImageElement).decode())
  }
  await page.evaluate(async () => {
    await document.fonts.ready
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    scrollTo({ top: 0, left: 0, behavior: 'instant' })
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  await expect.poll(() => page.getByRole('link', { name: /Skip to content/i }).evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0)
}
async function assertDetail(page: Page, slug: string) {
  const project = projects.find((entry) => entry.slug === slug)!
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title)
  for (const id of coreSections) await expect(page.locator(`#${id}`).getByRole('heading').first()).toBeVisible()
  await expect(page.getByText(project.context, { exact: true })).toBeVisible()
}
function collectRuntime(page: Page) {
  const errors: string[] = []
  const failed: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('response', (response) => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) failed.push(`${response.status()} ${response.url()}`) })
  page.on('requestfailed', (request) => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failed.push(`${request.failure()?.errorText} ${request.url()}`) })
  return { errors, failed }
}

test('primary navigation, history and readable route content', async ({ page }) => {
  await page.goto('/')
  await assertCore(page)
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  if (await menu.isVisible()) {
    await menu.click()
    await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeFocused()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
  }
  for (const [label, route] of [['About', '/about/'], ['Projects', '/projects/'], ['Research', '/research/'], ['CV', '/cv/'], ['Contact', '/contact/']] as const) {
    await navigate(page, label)
    await expect(page).toHaveURL(new RegExp(`${route}$`))
    await assertCore(page)
    await assertFits(page)
  }
  await page.goBack()
  await expect(page).toHaveURL(/\/cv\/$/)
})

test('project filtering changes results and preserves accessible state', async ({ page }) => {
  await page.goto('/projects/')
  const cards = page.getByTestId('project-card')
  await expect(cards).toHaveCount(projects.length)
  for (const filter of filters.filter((entry) => entry.id !== 'all')) {
    const control = page.getByTestId('project-filter').filter({ hasText: filter.label })
    await control.click()
    await expect(control).toHaveAttribute('aria-pressed', 'true')
    await expect(cards).toHaveCount(projects.filter((project) => project.category === filter.id).length)
  }
  await page.getByTestId('project-filter').filter({ hasText: filters.find((entry) => entry.id === 'all')!.label }).click()
  await expect(cards).toHaveCount(projects.length)
})

test('project card, detail, browser refresh and return to index', async ({ page }) => {
  await page.goto('/projects/')
  await page.getByTestId('project-card').getByRole('link', { name: new RegExp(lead.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first().click()
  await expect(page).toHaveURL(new RegExp(`${pathFor(lead.slug)}$`))
  await assertDetail(page, lead.slug)
  await page.reload()
  await assertDetail(page, lead.slug)
  await navigate(page, 'Projects')
  await expect(page.getByTestId('project-card')).toHaveCount(projects.length)
})

test('CV entrance resolves to a printable public document', async ({ page, context }) => {
  await page.goto('/cv/')
  const cv = page.getByTestId('cv-download').first()
  const pdfUrl = '/cv/chia-hsuan-chao-cv.pdf'
  await expect(cv).toHaveAttribute('href', pdfUrl)
  const pdfResponse = await context.request.get(pdfUrl)
  expect(pdfResponse.ok()).toBeTruthy()
  expect((await pdfResponse.body()).subarray(0, 5).toString()).toBe('%PDF-')
  const downloadPromise = page.waitForEvent('download')
  await cv.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  expect(await download.failure()).toBeNull()
  const response = await context.request.get(profile.cvUrl)
  expect(response.ok()).toBeTruthy()
  const body = await response.text()
  expect(body).toContain('Professional experience')
  expect(body).toContain('Education')
  const printed = await context.newPage()
  await printed.goto(profile.cvUrl)
  await expect(printed.getByRole('heading', { level: 1 })).toHaveText(profile.name)
  await expect(printed.getByRole('button', { name: /Print.*save as PDF/i })).toBeVisible()
  await printed.emulateMedia({ media: 'print' })
  await expect(printed.getByRole('button', { name: /Print.*save as PDF/i })).toBeHidden()
  await printed.close()
})

test('contact and external links use actionable safe destinations', async ({ page }) => {
  await page.goto('/contact/')
  await expect(page.getByRole('link', { name: /GitHub/i }).first()).toHaveAttribute('href', profile.github)
  if (profile.email) await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute('href', `mailto:${profile.email}`)
  for (const route of ['/contact/', '/cv/', pathFor(lead.slug)]) {
    await page.goto(route)
    const links = await page.locator('a[href^="http"]').evaluateAll((elements) => elements.map((element) => ({ href: element.getAttribute('href'), target: element.getAttribute('target'), rel: element.getAttribute('rel') })))
    for (const link of links) {
      expect(link.href).toMatch(/^https:\/\//)
      if (link.target === '_blank') expect(link.rel).toMatch(/noopener/)
    }
  }
  await page.goto('/contact/')
  await page.context().route(profile.github, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html lang="en"><title>External destination test</title><body>Link navigation verified.</body></html>' }))
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('link', { name: /GitHub/i }).first().click()
  const popup = await popupPromise
  await popup.waitForLoadState('domcontentloaded')
  await expect(popup).toHaveURL(profile.github)
  await expect(popup.locator('body')).toHaveText('Link navigation verified.')
  await popup.close()
})

test('keyboard focus and skip link work without pointer interaction', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: /Skip to content/i })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await page.goto('/projects/')
  const control = page.getByTestId('project-filter').first()
  await control.focus()
  await expect(control).toBeFocused()
  const ring = await control.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, shadow: getComputedStyle(element).boxShadow }))
  expect(ring.outline !== 'none' || ring.shadow !== 'none').toBeTruthy()
  await page.keyboard.press('Enter')
  await expect(control).toHaveAttribute('aria-pressed', 'true')
})

test('touch navigation and normal scroll remain usable', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Touch input is covered by the mobile project')
  await page.goto('/projects/')
  const firstLink = page.getByTestId('project-card').first().getByRole('link').first()
  await firstLink.tap()
  await assertCore(page)
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100)
  await assertFits(page)
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  if (await menu.isVisible()) await menu.tap()
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'CV', exact: true }).tap()
  await expect(page).toHaveURL(/\/cv\/$/)
})

test('reduced motion leaves all content and controls readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(pathFor(interactive.slug))
  await assertDetail(page, interactive.slug)
  await expect(page.getByTestId('project-interactive')).toBeVisible()
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBeTruthy()
  await assertFits(page)
  const animations = await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running' && animation.effect instanceof KeyframeEffect && getComputedStyle(animation.effect.target as Element).animationIterationCount === 'infinite').length)
  expect(animations).toBe(0)
})

test('disabled 3D preserves fallback and the complete project story', async ({ page }) => {
  await page.goto(pathFor(interactive.slug))
  await page.getByTestId('project-interactive').scrollIntoViewIfNeeded()
  await page.getByTestId('disable-3d').click()
  await expect(page.getByTestId('scene-fallback')).toBeVisible()
  await expect(page.getByTestId('project-interactive').locator('canvas')).toHaveCount(0)
  await assertDetail(page, interactive.slug)
  await page.getByTestId('enable-3d').click()
  await expect(page.getByTestId('disable-3d')).toBeVisible()
})

test('mesh illustration controls update geometry and preserve explanatory scope', async ({ page }) => {
  await page.goto(pathFor(interactive.slug))
  const study = page.getByTestId('project-interactive')
  await study.scrollIntoViewIfNeeded()
  await page.getByTestId('disable-3d').click()
  const refine = study.getByRole('slider', { name: 'Refinement level' })
  await refine.focus()
  await page.keyboard.press('Home')
  await expect(refine).toHaveValue('0')
  await expect(study.locator('.method-state')).toContainText('20 triangles')
  await page.keyboard.press('ArrowRight')
  await expect(refine).toHaveValue('1')
  await expect(study.locator('.method-state')).toContainText('80 triangles')
  await study.getByRole('button', { name: 'Edges', exact: true }).click()
  await expect(study.getByRole('button', { name: 'Edges', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await study.getByLabel('View', { exact: true }).selectOption('side')
  await expect(study.getByLabel('View', { exact: true })).toHaveValue('side')
  await expect(study.locator('.method-caption')).toContainText('separate from the coursework geometry')
  await expect(study.locator('.method-caption')).toContainText('Mola')
  await expect(study.locator('.method-caption')).toContainText('fabrication is not simulated')
  await assertDetail(page, interactive.slug)
})

test('WebGL initialization failure preserves DOM content and a fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (/^webgl|experimental-webgl$/.test(type)) return null
      return original.apply(this, [type, ...args] as never)
    } as typeof original
  })
  await page.goto(pathFor(interactive.slug))
  await page.getByTestId('project-interactive').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('scene-fallback')).toBeVisible()
  await assertDetail(page, interactive.slug)
  await navigate(page, 'Contact')
  await expect(page.getByRole('link', { name: /GitHub/i }).first()).toHaveAttribute('href', profile.github)
})

test('lazy 3D asset failure preserves fallback and navigation', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/assets/*', async (route) => {
    if (/fiber|three|r3f/i.test(route.request().url())) { blocked.push(route.request().url()); await route.abort('failed') }
    else await route.continue()
  })
  await page.goto(pathFor(interactive.slug))
  await page.getByTestId('project-interactive').scrollIntoViewIfNeeded()
  await assertDetail(page, interactive.slug)
  await expect(page.getByTestId('scene-fallback')).toBeVisible()
  await expect.poll(() => blocked.length).toBeGreaterThan(0)
  await navigate(page, 'Projects')
  await expect(page.getByTestId('project-card')).toHaveCount(projects.length)
})

test('unknown deep route shows useful 404 content', async ({ page }) => {
  await page.goto('/projects/not-a-real-project/')
  await expect(page.getByText('404 / Page not found', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /Return to projects/i })).toBeVisible()
  await page.reload()
  await expect(page.getByText('404 / Page not found', { exact: true })).toBeVisible()
})

test('production browser has no console errors, failed assets or MCP dependency', async ({ page }) => {
  const runtime = collectRuntime(page)
  const sockets: string[] = []
  page.on('websocket', (socket) => sockets.push(socket.url()))
  for (const route of ['/', '/about/', '/projects/', pathFor(lead.slug), pathFor(interactive.slug), '/research/', '/cv/', '/contact/']) {
    await page.goto(route)
    await assertCore(page)
    await page.waitForLoadState('networkidle')
    await assertFits(page)
    await prepareVisual(page)
  }
  expect(runtime.errors).toEqual([])
  expect(runtime.failed).toEqual([])
  expect(sockets).toEqual([])
  await page.screenshot({ path: test.info().outputPath('portfolio-contact.png'), fullPage: true, animations: 'disabled' })
  await page.goto('/')
  await prepareVisual(page)
  await page.screenshot({ path: test.info().outputPath('portfolio-home.png'), fullPage: true, animations: 'disabled' })
  await page.goto(pathFor(lead.slug))
  await prepareVisual(page)
  await page.screenshot({ path: test.info().outputPath('portfolio-project.png'), fullPage: true, animations: 'disabled' })
  for (const slug of [interactive.slug, 'inside-out-idf2019', 'computational-art']) {
    await page.goto(pathFor(slug))
    await prepareVisual(page)
    if (slug === interactive.slug) {
      await page.getByTestId('project-interactive').scrollIntoViewIfNeeded()
      await expect(page.getByTestId('project-interactive').locator('canvas')).toHaveCount(1)
      await page.screenshot({ path: test.info().outputPath('portfolio-mesh-3d-viewport.png'), animations: 'disabled' })
      await prepareVisual(page)
    }
    await page.screenshot({ path: test.info().outputPath(`portfolio-${slug}.png`), fullPage: true, animations: 'disabled' })
  }
})

test('English public UI has complete image alternative text', async ({ page }) => {
  for (const route of ['/', '/about/', '/projects/', pathFor(lead.slug), '/cv/', '/contact/', '/404.html']) {
    await page.goto(route)
    expect(await page.locator('body').innerText()).not.toMatch(/[\u3400-\u9fff]/u)
    const imagesWithoutAlt = await page.locator('img').evaluateAll((images) => images.filter((image) => !image.hasAttribute('alt')).length)
    expect(imagesWithoutAlt).toBe(0)
  }
})

test('core text and approved media are readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  const base = test.info().project.use.baseURL || 'http://127.0.0.1:4173'
  for (const route of ['/', '/about/', '/projects/', pathFor(lead.slug), '/cv/', '/contact/']) {
    await page.goto(new URL(route, base).href)
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.locator('body').innerText()).not.toMatch(/[\u3400-\u9fff]/u)
  }
  const pictured = projects.find((project) => project.media.images.length)
  if (pictured) {
    await page.goto(new URL(pathFor(pictured.slug), base).href)
    await expect(page.getByRole('img').first()).toBeVisible()
    await expect(page.getByText(pictured.media.images[0].caption, { exact: true })).toBeVisible()
    await expect(page.getByRole('img').first()).toHaveAttribute('width', String(pictured.media.images[0].width))
    await expect(page.getByRole('img').first()).toHaveAttribute('height', String(pictured.media.images[0].height))
  }
  const research = projects.filter((project) => ['research', 'computational', 'xr'].includes(project.category))
  await page.goto(new URL('/research/', base).href)
  await expect(page.getByRole('main').locator('article')).toHaveCount(research.length)
  for (const project of research) await expect(page.getByRole('heading', { name: project.title, exact: true })).toBeVisible()
  await context.close()
})

for (const project of projects) {
  test(`direct URL and refresh: ${project.slug}`, async ({ page, request }) => {
    const route = pathFor(project.slug)
    const response = await request.get(route)
    expect(response.ok()).toBeTruthy()
    const html = await response.text()
    expect(html).toContain('property="og:title"')
    expect(html).toContain(project.title.replaceAll('&', '&amp;'))
    await page.goto(route)
    await assertDetail(page, project.slug)
    await page.reload()
    await assertDetail(page, project.slug)
    await assertFits(page)
  })
}
