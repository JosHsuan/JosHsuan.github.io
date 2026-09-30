import { readFile, access, readdir } from 'node:fs/promises'
import { projects, lab } from '../src/content/portfolio.ts'

const all = [...projects, ...lab]
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char])
let checked = 0
for (const [section, items] of [['work', projects], ['lab', lab]]) for (const project of items) {
  const path = `dist/${section}/${project.slug}/index.html`
  const html = await readFile(path, 'utf8')
  for (const content of [project.title, project.summary, project.role, ...project.sections.map(s => s.text), ...project.credits]) if (!html.includes(escape(content))) throw new Error(`Missing static content in ${path}: ${content.slice(0,70)}`)
  if (!html.includes(`https://joshsuan.github.io/${section}/${project.slug}/`)) throw new Error(`Missing canonical: ${path}`)
  for (const match of html.matchAll(/(?:src|href)="(\/(?!\/)[^"#]*)"/g)) {
    const target = match[1].endsWith('/') ? `${match[1]}index.html` : match[1]
    await access(`dist${target}`)
    checked++
  }
}
const files = await readdir('dist/assets')
for (const file of files.filter(f => f.endsWith('.js'))) {
  const source = await readFile(`dist/assets/${file}`, 'utf8')
  if (/WebGLRenderer|ParticleThinker|NeutralScene|UnrealBloomPass/.test(source)) throw new Error(`Unexpected 3D code in active bundle ${file}`)
}
const site = (await readFile('dist/index.html', 'utf8')) + (await readFile('dist/resume.html', 'utf8'))
if (/Born in|1994\.07|apiKey|databaseURL|firebaseConfig|Study controls|Full case studies will follow/.test(site)) throw new Error('Unexpected private or provisional content in release.')
console.log(`Verified ${all.length} complete static cases, ${checked} local references and the renderer-free active bundle.`)
