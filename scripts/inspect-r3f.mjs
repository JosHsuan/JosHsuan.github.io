import { mkdir, writeFile, readFile, realpath } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'
import { chromium, expect } from '@playwright/test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport, getDefaultEnvironment } from '@modelcontextprotocol/sdk/client/stdio.js'

// Local inspection only. Supply a private output directory; never write evidence
// into the public repository. No injection or mutation MCP tools are used.
const args = process.argv.slice(2)
const option = (name, fallback) => {
  const at = args.indexOf(name)
  return at < 0 ? fallback : args[at + 1]
}
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const target = new URL(option('--url', 'http://127.0.0.1:5173/projects/mesh-subdivision-stare-at-the-silence/'))
if (!['http:', 'https:'].includes(target.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)) {
  throw new Error('Inspection is restricted to a local development URL.')
}
const requestedOutput = option('--out', process.env.INSPECTION_OUTPUT_DIR)
if (!requestedOutput || !path.isAbsolute(requestedOutput)) {
  throw new Error('Pass --out with an absolute private website-development directory outside the repository.')
}
const outputRoot = await realpath(requestedOutput)
const relativeOutput = path.relative(root, outputRoot)
if (!relativeOutput.startsWith('..') && !path.isAbsolute(relativeOutput)) {
  throw new Error('Inspection evidence must remain outside the public repository.')
}
if (path.basename(outputRoot) !== 'website-development' || path.basename(path.dirname(outputRoot)) !== '_private') {
  throw new Error('The output directory must be a private website-development directory inside _private.')
}
const run = path.join(outputRoot, `r3f-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`)
const temp = path.join(run, 'server-temp')
await mkdir(temp, { recursive: true })

const require = createRequire(import.meta.url)
const entry = require.resolve('r3f-mcp-server')
const clientPackage = JSON.parse(await readFile(path.join(path.dirname(require.resolve('r3f-mcp')), '..', 'package.json'), 'utf8'))
const serverPackage = JSON.parse(await readFile(path.join(path.dirname(entry), '..', 'package.json'), 'utf8'))
// Upstream 0.5.2 has no --host option and otherwise binds all interfaces. Wrap
// its actual WebSocketServer constructor to constrain this run to loopback.
// The MCP stdio implementation, tools and browser protocol remain upstream.
const bootstrap = `
  import { createRequire } from 'node:module';
  const require = createRequire(${JSON.stringify(pathToFileURL(entry).href)});
  const ws = require('ws');
  const OriginalServer = ws.WebSocketServer;
  ws.WebSocketServer = class extends OriginalServer {
    constructor(options, callback) { super({ ...options, host: '127.0.0.1' }, callback); }
  };
  await import(${JSON.stringify(pathToFileURL(entry).href)});
`
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['--input-type=module', '-e', bootstrap],
  env: { ...getDefaultEnvironment(), TMP: temp, TEMP: temp, TMPDIR: temp },
  stderr: 'pipe', cwd: root,
})
let stderr = ''
transport.stderr?.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-1000000) })
const client = new Client({ name: 'portfolio-scene-inspection', version: '1.0.0' })
let browser
const record = {
  startedAt: new Date().toISOString(), status: 'running', url: target.href,
  versions: { client: clientPackage.version, server: serverPackage.version },
  bridge: { transport: 'MCP stdio', websocket: 'loopback:3333', readOnly: true },
  illustration: 'New synthetic subdivision geometry; no original project model or Mola implementation copied.',
  performanceInterpretation: 'Demand frameloop. MCP FPS includes idle intervals between requested frames and is not a continuous-render benchmark. Upstream 0.5.2 captures render counters in useFrame before rendering, so a snapshot may lag the latest control change by one frame. Raw snapshots and a second sample after real view controls are preserved. Playwright counts actual WebGL draw calls without driving extra idle frames.',
  calls: [], checks: [], consoleErrors: [], consoleWarnings: [], pageErrors: [], failedRequests: [],
}
async function save(name, value) {
  await writeFile(path.join(run, name), typeof value === 'string' ? value : JSON.stringify(value, null, 2))
}
async function tool(name, parameters = {}, label = name) {
  const response = await client.callTool({ name, arguments: parameters }, undefined, { timeout: 15000 })
  const images = []
  const content = []
  for (const [index, item] of (response.content ?? []).entries()) {
    if (item.type === 'image') {
      const filename = `${label}-${index}.png`
      await writeFile(path.join(run, filename), Buffer.from(item.data, 'base64'))
      images.push(filename)
      content.push({ type: 'image', mimeType: item.mimeType, savedAs: filename })
    } else content.push(item)
  }
  const archived = { ...response, content }
  await save(`${label}.json`, archived)
  record.calls.push({ name, arguments: parameters, response: `${label}.json`, images, isError: response.isError ?? false })
  if (response.isError) throw new Error(`${name}: ${content.filter(i => i.type === 'text').map(i => i.text).join(' ')}`)
  const text = content.find(item => item.type === 'text')?.text
  try { return JSON.parse(text) } catch { return archived }
}
async function check(name, fn) {
  await fn()
  record.checks.push({ name, status: 'passed' })
}
async function connectedScene(page, label) {
  for (let attempt = 1; ; attempt++) {
    try { return await tool('scene_graph', {}, `${label}-${attempt}`) }
    catch (error) { if (attempt >= 4) throw error; await page.waitForTimeout(500) }
  }
}

try {
  await client.connect(transport)
  await save('tools.json', await client.listTools())
  browser = await chromium.launch({ channel: option('--channel', 'chrome'), headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' })
  // Read-only test instrumentation, installed before WebGL initialization.
  await context.addInitScript(() => {
    window.__r3fInspectionDraws = 0
    for (const Constructor of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!Constructor) continue
      for (const method of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
        const original = Constructor.prototype[method]
        if (!original) continue
        Constructor.prototype[method] = function (...values) {
          window.__r3fInspectionDraws++
          return original.apply(this, values)
        }
      }
    }
  })
  const page = await context.newPage()
  page.on('console', message => {
    if (message.type() === 'error') record.consoleErrors.push(message.text())
    if (message.type() === 'warning') record.consoleWarnings.push(message.text())
  })
  page.on('pageerror', error => record.pageErrors.push(error.message))
  page.on('requestfailed', request => record.failedRequests.push({ url: request.url(), failure: request.failure()?.errorText }))
  await page.goto(target.href, { waitUntil: 'networkidle' })
  const section = page.getByTestId('project-interactive')
  await section.scrollIntoViewIfNeeded()
  const enable = page.getByTestId('enable-3d')
  if (await enable.isVisible()) await enable.click()
  await expect(section.locator('canvas')).toBeVisible({ timeout: 20000 })
  await expect(section.locator('.method-state')).toContainText('3D view active')
  // Allow bounded bridge initialization/reconnection; archive actual failures.
  await connectedScene(page, 'scene-graph')
  for (const name of ['MethodSurface', 'MethodEdges', 'MethodCamera', 'KeyLight', 'FillLight']) {
    const object = await tool('get_object', { identifier: name }, `object-${name}`)
    if (object.name !== name) throw new Error(`Missing named runtime object ${name}`)
  }
  await tool('query_bounds', { identifier: 'SubdivisionMethod' }, 'bounds-overview')
  await tool('get_performance', {}, 'performance-level1')
  await tool('screenshot', {}, 'canvas-level1')
  await page.screenshot({ path: path.join(run, 'page-desktop.png'), fullPage: true })
  const range = section.getByRole('slider', { name: 'Refinement level' })
  await check('Keyboard refinement changes real mesh state', async () => {
    await range.focus()
    await range.press('Home')
    await expect(section.locator('.method-state')).toContainText('20 triangles')
    await range.press('ArrowRight')
    await expect(section.locator('.method-state')).toContainText('80 triangles')
    await range.press('End')
    await expect(section.locator('.method-state')).toContainText('1,280 triangles')
    await page.waitForTimeout(200)
  })
  const refined = await tool('get_object', { identifier: 'MethodSurface' }, 'object-level3')
  if (refined.userData.triangles !== 1280 || refined.userData.vertices !== 642) {
    throw new Error('Named runtime mesh did not receive the refined geometry state')
  }
  await tool('get_performance', {}, 'performance-level3')
  await tool('screenshot', {}, 'canvas-level3')
  await section.getByLabel('View', { exact: true }).selectOption('side')
  await page.waitForTimeout(100)
  await section.getByLabel('View', { exact: true }).selectOption('overview')
  await page.waitForTimeout(100)
  await tool('get_performance', {}, 'performance-level3-after-view-controls')
  await check('DOM display and camera-view controls update runtime', async () => {
    await section.getByRole('button', { name: 'Edges', exact: true }).click()
    await expect(section.getByRole('button', { name: 'Edges', exact: true })).toHaveAttribute('aria-pressed', 'true')
    const mesh = await tool('get_object', { identifier: 'MethodSurface' }, 'object-edges-mode')
    if (mesh.visible !== false) throw new Error('Surface remains visible in edges mode')
    await section.getByLabel('View', { exact: true }).selectOption('detail')
    const group = await tool('get_object', { identifier: 'SubdivisionMethod' }, 'object-detail-view')
    if (group.scale[0] !== 1.24) throw new Error('Detail scale did not update')
    await tool('query_bounds', { identifier: 'SubdivisionMethod' }, 'bounds-detail')
    await tool('screenshot', {}, 'canvas-edges-detail')
  })
  await page.waitForTimeout(350)
  const before = await page.evaluate(() => window.__r3fInspectionDraws)
  await page.waitForTimeout(1000)
  const after = await page.evaluate(() => window.__r3fInspectionDraws)
  record.idleObservation = { intervalMs: 1000, before, after, additionalWebGLDrawCalls: after - before }
  if (after !== before) throw new Error('Idle demand scene continued drawing')
  record.checks.push({ name: 'Idle demand scene makes zero additional WebGL draw calls', status: 'passed' })
  await check('Out-of-view Canvas unmounts and returns when visible', async () => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect(section.locator('canvas')).toHaveCount(0)
    await section.scrollIntoViewIfNeeded()
    await expect(section.locator('canvas')).toBeVisible()
  })
  await check('Diagram controls work without Canvas', async () => {
    await page.getByTestId('disable-3d').click()
    await expect(section.locator('canvas')).toHaveCount(0)
    await expect(page.getByTestId('scene-fallback')).toBeVisible()
    await range.focus(); await range.press('Home')
    await expect(section.locator('.method-state')).toContainText('20 triangles')
  })
  await check('Reduced motion defaults to an accessible diagram', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload({ waitUntil: 'networkidle' })
    await section.scrollIntoViewIfNeeded()
    await expect(section.locator('canvas')).toHaveCount(0)
    await expect(page.getByTestId('scene-fallback')).toBeVisible()
    await expect(page.getByTestId('enable-3d')).toBeVisible()
    await page.screenshot({ path: path.join(run, 'page-reduced-motion.png'), fullPage: true })
  })
  await check('WebGL context loss switches to working diagram controls', async () => {
    await page.getByTestId('enable-3d').click()
    await expect(section.locator('canvas')).toBeVisible()
    // A Canvas DOM node can exist before asynchronous renderer initialization.
    // Confirm the real bridge/scene is ready before inducing a live context loss.
    await connectedScene(page, 'scene-graph-before-context-loss')
    await tool('get_object', { identifier: 'MethodSurface' }, 'object-before-context-loss')
    await section.locator('canvas').evaluate(canvas => {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      const extension = gl?.getExtension('WEBGL_lose_context')
      if (!extension) throw new Error('Context-loss extension unavailable on this browser')
      extension.loseContext()
    })
    await expect(section.locator('canvas')).toHaveCount(0)
    await expect(section.locator('.method-state')).toContainText('3D is unavailable')
    await expect(page.getByTestId('scene-fallback')).toBeVisible()
    await section.getByRole('slider', { name: 'Refinement level' }).press('End')
    await expect(section.locator('.method-state')).toContainText('1,280 triangles')
  })
  if (record.pageErrors.length || record.consoleErrors.length || record.failedRequests.length) {
    throw new Error('Browser errors or failed requests were captured; inspect the private record.')
  }
  record.status = 'passed'
} catch (error) {
  record.status = 'failed'
  record.error = error instanceof Error ? error.stack : String(error)
  process.exitCode = 1
} finally {
  await browser?.close().catch(() => {})
  await client.close().catch(() => {})
  await transport.close().catch(() => {})
  record.finishedAt = new Date().toISOString()
  await save('server-stderr.txt', stderr)
  await save('inspection.json', record)
  console.log(JSON.stringify({ status: record.status, output: run, error: record.error }))
}
