import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { executablePath } from './browser-path.mjs';
const role = fileURLToPath(new URL('../', import.meta.url));
function client(args) {
  const processHandle = spawn(process.execPath, args, { cwd: role, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  const pending = new Map(); let sequence = 0; let stderr = '';
  processHandle.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-5000); });
  createInterface({ input: processHandle.stdout }).on('line', line => { try { const message = JSON.parse(line); const handler = pending.get(message.id); if (handler) { pending.delete(message.id); if (message.error) handler.reject(new Error(message.error.message)); else handler.resolve(message.result); } } catch { /* Non-protocol diagnostics are ignored; no secrets are printed. */ } });
  const request = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out: ${stderr}`)); }, 30000); pending.set(id, { resolve: result => { clearTimeout(timer); resolve(result); }, reject: error => { clearTimeout(timer); reject(error); } }); processHandle.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); });
  return { request, notify(method) { processHandle.stdin.write(JSON.stringify({ jsonrpc: '2.0', method }) + '\n'); }, close() { processHandle.stdin.end(); processHandle.kill(); } };
}
const results = [];
const local = client([path.join(role, 'mcp/catalog-server.mjs')]);
try {
  const initialized = await local.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'uiux-verifier', version: '1.0.0' } }); local.notify('notifications/initialized');
  const tools = await local.request('tools/list');
  if (tools.tools.length !== 3 || tools.tools.some(tool => !tool.annotations.readOnlyHint)) throw new Error('Catalog tool boundary mismatch');
  const fonts = await local.request('tools/call', { name: 'uiux_list_materials', arguments: { category: 'Typography' } });
  if (JSON.parse(fonts.content[0].text).length !== 5) throw new Error('Catalog font query mismatch');
  const material = await local.request('tools/call', { name: 'uiux_get_material', arguments: { id: 'motion-theatre' } });
  if (!JSON.parse(material.content[0].text).preview.includes('motion-theatre')) throw new Error('Deep link mismatch');
  let rejected = false; try { await local.request('tools/call', { name: 'uiux_get_material', arguments: { id: '../private' } }); } catch { rejected = true; }
  if (!rejected) throw new Error('Unknown material did not fail closed');
  results.push({ server: initialized.serverInfo.name, result: 'PASS', tools: tools.tools.map(tool => tool.name), checks: ['initialize', 'read-only tools', 'font query', 'material detail/deep link', 'unknown ID rejected'] });
} finally { local.close(); }
const browser = client([path.join(role, 'node_modules/@playwright/mcp/cli.js'), '--browser', 'chromium', '--executable-path', executablePath, '--headless', '--isolated', '--allowed-origins', 'http://127.0.0.1:4175', '--output-dir', path.join(role, '.runtime/browser-output')]);
try {
  const initialized = await browser.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'uiux-verifier', version: '1.0.0' } }); browser.notify('notifications/initialized');
  const listed = await browser.request('tools/list');
  const names = new Set(listed.tools.map(tool => tool.name));
  for (const required of ['browser_navigate', 'browser_snapshot', 'browser_click', 'browser_take_screenshot']) if (!names.has(required)) throw new Error(`Missing browser tool: ${required}`);
  const navigation = await browser.request('tools/call', { name: 'browser_navigate', arguments: { url: 'http://127.0.0.1:4175/' } });
  if (navigation.isError) throw new Error(JSON.stringify(navigation.content));
  const snapshot = await browser.request('tools/call', { name: 'browser_snapshot', arguments: {} });
  if (!snapshot.content.some(item => item.type === 'text' && item.text.includes('Material studies'))) throw new Error('MCP browser did not read the actual gallery');
  const screenshot = await browser.request('tools/call', { name: 'browser_take_screenshot', arguments: { filename: path.join(role, '.runtime/browser-output/mcp-gallery.png'), type: 'png' } });
  if (screenshot.isError) throw new Error('MCP screenshot failed');
  await browser.request('tools/call', { name: 'browser_close', arguments: {} });
  results.push({ server: initialized.serverInfo.name, result: 'PASS', checks: ['initialize', 'configured tool availability', 'actual loopback navigation', 'accessible snapshot', 'actual screenshot', 'browser close'], registeredVersion: '0.0.83' });
} finally { browser.close(); }
await mkdir(path.join(role, 'verification'), { recursive: true });
await writeFile(path.join(role, 'verification/mcp-results.json'), JSON.stringify({ date: '2026-10-07', role: 'uiux-designer', results }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
