import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { profile, projects, capabilities, experience, education, publications, awards } from '../src/data/portfolio.ts'

const output = resolve('dist')
const origin = 'https://JosHsuan.github.io'
const template = await readFile(join(output, 'index.html'), 'utf8')
const pdfCvPath = '/cv/chia-hsuan-chao-cv.pdf'
const hasPdfCv = await access(join(output, pdfCvPath.slice(1))).then(() => true, () => false)
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const list = (items) => `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>`
const projectList = (items) => `<div>${items.map((project) => `<article><p>${escape(project.year)} · ${escape(project.category)}</p><h2><a href="/projects/${escape(project.slug)}/">${escape(project.title)}</a></h2><p>${escape(project.summary)}</p></article>`).join('')}</div>`
const section = (title, body) => `<section><h2>${escape(title)}</h2>${body}</section>`
const nav = `<nav aria-label="Primary">${[['/', 'Home'], ['/about/', 'About'], ['/projects/', 'Projects'], ['/research/', 'Research'], ['/cv/', 'CV'], ['/contact/', 'Contact']].map(([href, text]) => `<a href="${href}">${text}</a>`).join(' · ')}</nav>`
const contacts = `<p><a href="${escape(profile.github)}">GitHub</a>${profile.email ? ` · <a href="mailto:${escape(profile.email)}">Email</a>` : ''}</p>`
const media = (project) => `${project.media.images.map((image) => {
  const dimensions = Number.isInteger(image.width) && image.width > 0 && Number.isInteger(image.height) && image.height > 0 ? ` width="${image.width}" height="${image.height}"` : ''
  return `<figure><img src="${escape(image.src)}" alt="${escape(image.alt)}"${dimensions} loading="lazy"><figcaption>${escape(image.caption)}</figcaption></figure>`
}).join('')}<p>${escape(project.media.label)}</p><p>${escape(project.sceneCaption)}</p>`
const cvBody = `<h1>${escape(profile.name)}</h1><p>${escape(profile.headline)}</p>${contacts}${section('Professional experience', experience.map((entry) => `<article><h3>${escape(entry.role)}</h3><p>${escape(entry.organization)} · ${escape(entry.period)}</p>${list(entry.description)}</article>`).join(''))}${section('Education', education.map((entry) => `<article><h3>${escape(entry.program)}</h3><p>${escape(entry.institution)} · ${escape(entry.period)}</p><p>${escape(entry.focus)}</p></article>`).join(''))}${section('Skills', capabilities.map((entry) => `<h3>${escape(entry.title)}</h3><p>${escape(entry.description)}</p><p>${entry.tools.map(escape).join(', ')}</p>`).join(''))}${section('Publications', publications.map((entry) => `<p><a href="${escape(entry.url)}">${escape(entry.title)}</a><br>${escape(entry.authors.join(', '))} · ${escape(entry.venue)} · ${escape(entry.year)}</p>`).join(''))}${section('Awards', awards.map((entry) => `<p>${escape(entry.title)} · ${escape(entry.distinction)} · ${escape(entry.year)}</p>`).join(''))}`
const routes = [
  { path: '/', title: `${profile.name} — Design & computation`, description: profile.introduction, body: `<h1>${escape(profile.name)}</h1><p>${escape(profile.headline)}</p><p>${escape(profile.introduction)}</p>${section('Selected work', projectList(projects.filter((project) => project.featured)))}` },
  { path: '/about/', title: `About — ${profile.name}`, description: profile.introduction, body: `<h1>About</h1>${profile.about.map((text) => `<p>${escape(text)}</p>`).join('')}${section('Capabilities', capabilities.map((entry) => `<h3>${escape(entry.title)}</h3><p>${escape(entry.description)}</p>`).join(''))}` },
  { path: '/projects/', title: `Projects — ${profile.name}`, description: 'Computational design, architecture, digital fabrication and software projects.', body: `<h1>Projects</h1>${projectList(projects)}` },
  { path: '/research/', title: `Research & development — ${profile.name}`, description: 'Research, computational workflows and digital fabrication development.', body: `<h1>Research & development</h1>${projectList(projects.filter((project) => ['research', 'computational', 'xr'].includes(project.category)))}` },
  { path: '/cv/', title: `CV — ${profile.name}`, description: 'Professional experience, education, skills, publications and awards.', body: `${cvBody}<p><a href="${escape(profile.cvUrl)}">View printable CV</a>${hasPdfCv ? ` · <a href="${pdfCvPath}" download>Download PDF CV</a>` : ''}</p>` },
  { path: '/contact/', title: `Contact — ${profile.name}`, description: 'Contact for computational design, research and design technology collaboration.', body: `<h1>Contact</h1><p>${escape(profile.contactNote)}</p>${contacts}` },
  { path: '/404.html', title: `Page not found — ${profile.name}`, description: 'This page could not be found. Return to the portfolio or browse projects.', body: '<h1>Page not found</h1><p>This address does not match a portfolio page.</p><p><a href="/">Return home</a> · <a href="/projects/">Browse projects</a></p>' },
  ...projects.map((project) => ({ path: `/projects/${project.slug}/`, title: `${project.title} — ${profile.name}`, description: project.summary, body: `<p>${escape(project.year)} · ${escape(project.category)}</p><h1>${escape(project.title)}</h1><p>${escape(project.summary)}</p>${section('Context', `<p>${escape(project.context)}</p>`)}${section('My role', `<p>${escape(project.role.type)}</p>${list(project.role.personal)}<p>${escape(project.role.scope)}</p>`)}${section('Method', list(project.method))}${section('Process', list(project.process))}${section('Result', list(project.result))}${section('Tools & technology', list(project.tools))}${section('Collaboration and credits', `${list(project.role.team)}${list(project.credits.map((credit) => `${credit.name} — ${credit.role}`))}`)}${section('Media', media(project))}${section('Related links', project.links.map((link) => `<p><a href="${escape(link.url)}">${escape(link.label)}</a></p>`).join(''))}` })),
]
const validSlugs = /^[a-z\d]+(?:-[a-z\d]+)*$/
if (new Set(projects.map((project) => project.slug)).size !== projects.length || projects.some((project) => !validSlugs.test(project.slug))) throw new Error('Project slugs must be unique, lowercase route-safe identifiers')
function document(route) {
  const metadata = `<link rel="canonical" href="${origin}${route.path}" /><meta property="og:title" content="${escape(route.title)}" /><meta property="og:description" content="${escape(route.description)}" /><meta property="og:type" content="${route.path.startsWith('/projects/') && route.path !== '/projects/' ? 'article' : 'website'}" /><meta property="og:url" content="${origin}${route.path}" /><meta name="twitter:card" content="summary" />`
  return template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(route.title)}</title>`).replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(route.description)}" />`).replace('</head>', `${metadata}</head>`).replace(/<div id="root"><\/div>/, `<div id="root"><a href="#main-content">Skip to content</a>${nav}<main id="main-content">${route.body}</main></div>`)
}
for (const route of routes) {
  const file = route.path === '/' ? join(output, 'index.html') : route.path.endsWith('.html') ? join(output, route.path.slice(1)) : join(output, route.path.slice(1), 'index.html')
  await mkdir(resolve(file, '..'), { recursive: true })
  await writeFile(file, document(route), 'utf8')
}
// A standalone, print-friendly document. This uses only the curated public data.
const printFile = join(output, profile.cvUrl.replace(/^\//, ''))
if (!profile.cvUrl.startsWith('/cv/') || !profile.cvUrl.endsWith('.html')) throw new Error('Printable CV must be an HTML document under /cv/')
await mkdir(resolve(printFile, '..'), { recursive: true })
await writeFile(printFile, `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(profile.name)} — CV</title><meta name="description" content="${escape(profile.name)}: professional experience, education, skills and research."><link rel="canonical" href="${origin}${escape(profile.cvUrl)}"><style>body{max-width:900px;margin:3rem auto;padding:0 1.5rem;color:#202523;background:#fff;font:16px/1.55 system-ui,sans-serif}h1{font-size:2.3rem;line-height:1.1}h2{border-top:1px solid #bbb;padding-top:1rem;margin-top:2rem}h3{margin-bottom:.2rem}a{color:#174947}li{margin:.35rem 0}.actions{display:flex;gap:1rem;align-items:center}button{font:inherit;padding:.5rem 1rem;cursor:pointer}@media print{body{margin:0;font-size:10pt;max-width:none}.actions{display:none}h2,h3{break-after:avoid}article,li{break-inside:avoid}a{color:inherit;text-decoration:none}@page{margin:16mm}}</style></head><body><div class="actions"><a href="/cv/">Back to portfolio CV</a>${hasPdfCv ? `<a href="${pdfCvPath}" download>Download PDF CV</a>` : ''}<button type="button" onclick="window.print()">Print / save as PDF</button></div><main>${cvBody}</main></body></html>`, 'utf8')
await writeFile(join(output, '.nojekyll'), '', 'utf8')
await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter((route) => route.path !== '/404.html').map((route) => `<url><loc>${origin}${route.path}</loc></url>`).join('')}</urlset>`, 'utf8')
await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, 'utf8')
console.log(`Static route entries generated: ${routes.length} routes, printable CV, sitemap and 404 fallback. Base path: /.`)
