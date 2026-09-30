import { readFile, access, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { projects, lab } from '../src/content/portfolio.ts'

const all = [...projects, ...lab]
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char])
let checked = 0
for (const [section, items] of [['work', projects], ['lab', lab]]) for (const project of items) {
  const path = `dist/${section}/${project.slug}/index.html`
  const html = await readFile(path, 'utf8')
  const main = html.match(/<main class="static-reading">([\s\S]*?)<\/main>/)?.[1]
  if (!main) throw new Error(`Missing static reading body: ${path}`)
  const requireContent = (source, content, label) => {
    if (!source.includes(content)) throw new Error(`Missing ${label} in ${path}: ${content.slice(0,90)}`)
  }
  requireContent(main, `<h1>${escape(project.title)}</h1>`, 'case heading')
  requireContent(html, `<meta name="description" content="${escape(project.summary)}"`, 'case summary metadata')
  for (const paragraph of [project.subtitle, project.premise, ...project.credits]) requireContent(main, `<p>${escape(paragraph)}</p>`, 'case paragraph')
  for (const fact of [project.context, project.location, project.role, project.tags.join(' / ')]) requireContent(main, `<dd>${escape(fact)}</dd>`, 'case fact')
  const sections = [...main.matchAll(/<section>([\s\S]*?)<\/section>/g)].map(match => match[1])
  if (sections.length !== project.sections.length) throw new Error(`Incorrect static section count: ${path}`)
  for (const [index, item] of project.sections.entries()) {
    requireContent(sections[index], `<h2>${escape(item.title)}</h2>`, 'section heading')
    for (const paragraph of item.text.split('\n\n')) requireContent(sections[index], `<p>${escape(paragraph)}</p>`, 'section paragraph')
    const media = item.media === undefined ? project.gallery.slice(index, index + 1) : project.gallery.filter(image => item.media.includes(image.id))
    for (const image of media) requireContent(sections[index], `src="/media/${image.id}.webp"`, 'assigned section image')
  }
  const figures = [...main.matchAll(/<figure>([\s\S]*?)<\/figure>/g)].map(match => match[1])
  for (const media of [project.cover, ...project.gallery]) {
    const matches = figures.filter(figure => figure.includes(`src="/media/${media.id}.webp"`))
    if (matches.length !== 1) throw new Error(`Expected one static figure for ${media.id} in ${path}; found ${matches.length}`)
    requireContent(matches[0], `alt="${escape(media.alt)}"`, 'image text alternative')
    requireContent(matches[0], `<figcaption>${escape(media.caption)}<br><small>${escape(media.credit)}</small></figcaption>`, 'image caption and credit')
  }
  for (const link of project.links ?? []) requireContent(main, `href="${escape(link.url)}"`, 'project source link')
  requireContent(html, `<link rel="canonical" href="https://joshsuan.github.io/${section}/${project.slug}/"`, 'case canonical link')
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
  if (/woodflow|ChinPaoSan|dome-tessellation/i.test(source)) throw new Error(`Removed project in active bundle ${file}`)
}
for (const path of ['work/woodflow', 'work/dome-tessellation', 'media/woodflow-workflow.svg', 'media/dome-tessellation.webp', 'media/dome-panels.webp']) if (existsSync(`dist/${path}`)) throw new Error(`Removed publication path: ${path}`)
if (/woodflow|dome-tessellation/i.test(await readFile('dist/sitemap.xml','utf8'))) throw new Error('Removed project in sitemap.')
const site = (await readFile('dist/index.html', 'utf8')) + (await readFile('dist/resume.html', 'utf8'))
if (/Born in|1994\.07|apiKey|databaseURL|firebaseConfig|Study controls|Full case studies will follow/.test(site)) throw new Error('Unexpected private or provisional content in release.')
console.log(`Verified ${all.length} complete static cases, ${checked} local references and the renderer-free active bundle.`)
