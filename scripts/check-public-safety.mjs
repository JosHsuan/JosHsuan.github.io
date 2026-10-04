import { readdir, readFile, lstat } from 'node:fs/promises'
import { resolve, relative, extname, join } from 'node:path'

const root = resolve(process.argv[2] || 'dist')
const textFormats = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt', '.xml', '.csv', '.webmanifest'])
const sourceFormats = new Set(['.3dm', '.gh', '.ghx', '.blend', '.psd', '.ai', '.indd', '.pptx', '.docx', '.xlsx', '.bak', '.env', '.map'])
const rules = [
  ['local filesystem path', /(?:\b[a-z]:[\\/]|\b[a-z]%3a(?:%5c|%2f)|file:\/\/\/)/i],
  ['private preparation material', /portfolio-preparation|website-development|(?:^|[\\/])_?private(?:[\\/])|\.codex[\\/]|attachments[\\/][a-f\d-]{30,}/i],
  ['private key', /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z\d]{16}\b/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z\d]{30,}|github_pat_[A-Za-z\d_]{40,})\b/],
  ['API credential', /\bsk-(?:proj-)?[A-Za-z\d_-]{24,}\b/],
  ['MCP development bridge', /r3f-mcp|r3f-mcp-server|MCPBridge|mcp\/sse|modelcontextprotocol|localhost:\d+|127\.0\.0\.1:\d+/i],
  ['WebSocket development control', /\b(?:new\s+)?WebSocket\s*\(|wss?:\/\//],
  ['runtime code injection', /\beval\s*\(|\bnew\s+Function\s*\(/],
  ['non-English public copy', /[\u3400-\u9fff]/u],
]
const violations = []
let files = 0
let bytes = 0
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    const label = relative(root, path).replaceAll('\\', '/')
    const stat = await lstat(path)
    if (stat.isSymbolicLink()) { violations.push(`${label}: symbolic link is not a static deployment asset`); continue }
    if (entry.isDirectory()) { await scan(path); continue }
    files += 1
    bytes += stat.size
    if (sourceFormats.has(extname(entry.name).toLowerCase())) violations.push(`${label}: source or debug format is excluded from deployment`)
    if (!textFormats.has(extname(entry.name).toLowerCase())) continue
    const raw = await readFile(path, 'utf8')
    const text = raw.replace(/\\u([a-f\d]{4})/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    for (const [reason, pattern] of rules) if (pattern.test(text)) violations.push(`${label}: ${reason}`)
    if (extname(entry.name) === '.html') {
      if (!/<html\b[^>]*\blang=["']en["']/i.test(raw)) violations.push(`${label}: HTML language must be English`)
      if (!/<title>[^<]+<\/title>/i.test(raw)) violations.push(`${label}: page title is missing`)
      if (!/<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(raw)) violations.push(`${label}: description metadata is missing`)
    }
  }
}
await scan(root)
if (violations.length) {
  console.error(`Public safety check failed (${violations.length} findings):\n${violations.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Public safety check passed: ${files} files, ${bytes.toLocaleString('en-US')} bytes; English metadata, private paths, credentials and development controls checked.`)
}
