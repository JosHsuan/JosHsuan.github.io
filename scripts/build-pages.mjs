import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { projects, lab, PROFILE } from '../src/content/portfolio.ts'

const origin = 'https://joshsuan.github.io'
const template = await readFile('dist/index.html', 'utf8')
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const imagePath = media => `/media/${media.id}.webp`
const figure = media => `<figure><img src="${imagePath(media)}" alt="${escape(media.alt)}" loading="lazy"><figcaption>${escape(media.caption)}<br><small>${escape(media.credit)}</small></figcaption></figure>`
const paragraphs = text => text.split('\n\n').map(value => `<p>${escape(value)}</p>`).join('')
const sectionMedia = (project, index) => project.sections[index].media === undefined ? project.gallery.slice(index, index + 1) : project.gallery.filter(media => project.sections[index].media.includes(media.id))
const navigation = '<nav><a href="/">Home</a> · <a href="/work/">Work</a> · <a href="/lab/">Lab</a> · <a href="/about/">About</a> · <a href="/contact/">Contact</a></nav>'
const styles = `<style>.static-reading{font:16px/1.8 system-ui,sans-serif;max-width:1000px;padding:40px 24px;margin:auto;color:#e5e9df}.static-reading h1{font-size:42px}.static-reading h2{margin-top:36px}.static-reading img{max-width:100%;max-height:600px;object-fit:contain}.static-reading a{text-decoration:underline;text-underline-offset:4px;color:#dbceb1}.static-reading figure{margin:24px 0}.static-reading figcaption{font-size:13px}.static-reading small{font-size:11px}.static-reading dl{display:grid;grid-template-columns:120px 1fr;gap:10px}.static-reading dd{margin:0}.static-reading .reading-card{padding:28px 0;border-bottom:1px solid #cbd5c133}.static-reading .reading-card img{width:100%;max-height:320px;object-fit:cover}.static-reading .reading-card h2{margin-top:16px}@media print{.static-reading{color:#111}.static-reading a{color:#111}}</style>`

async function page(path, title, description, body, image = '/media/xr-structure.webp', schema) {
  const canonical = `${origin}${path}`
  let html = template.replace(/<title>.*?<\/title>/s, `<title>${escape(title)} — JosHsuan</title>`)
  for (const [attribute, key, value] of [['name', 'description', description], ['property', 'og:title', `${title} — JosHsuan`], ['property', 'og:description', description], ['property', 'og:url', canonical], ['property', 'og:image', `${origin}${image}`]]) {
    html = html.replace(new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*/>`), `<meta ${attribute}="${key}" content="${escape(value)}" />`)
  }
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
  html = html.replace('<div id="root"></div>', `<div id="root"><main class="static-reading">${navigation}${body}<footer><p>Chia-Hsuan Chao / JosHsuan · <a href="/credits.html">Credits</a></p></footer></main></div>`)
  html = html.replace('</head>', `${styles}<noscript><style>html,body,#root{height:auto;min-height:100%;overflow:visible}</style></noscript>${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : ''}</head>`)
  const directory = `dist${path}`
  await mkdir(directory, { recursive: true })
  await writeFile(`${directory}/index.html`, html)
}

function indexBody(items, section) {
  return `<h1>${section === 'work' ? 'Work' : 'Lab'}</h1><p>${escape(PROFILE.statement)}</p>${items.map(p => `<article class="reading-card"><a href="/${section}/${p.slug}/"><img src="${imagePath(p.cover)}" alt="${escape(p.cover.alt)}"><h2>${escape(p.title)}</h2></a><p>${escape(p.summary)}</p><p><small>${escape(p.year)} / ${escape(p.category)}<br>My role: ${escape(p.role)}</small></p></article>`).join('')}`
}

await page('/', 'Computational design, XR & fabrication', 'Chia-Hsuan Chao (JosHsuan) — computational designer and XR developer.', `<h1>JosHsuan.</h1><p>Chia-Hsuan Chao / Computational designer and XR developer</p>${indexBody(projects.filter(p => p.featured), 'work')}`, undefined, { '@context': 'https://schema.org', '@type': 'Person', name: PROFILE.fullName, alternateName: PROFILE.name, url: origin, jobTitle: 'Computational designer and XR developer', sameAs: [PROFILE.github, 'https://gramaziokohler.arch.ethz.ch/web/e/team/370.html'] })
for (const [section, items] of [['work', projects], ['lab', lab]]) {
  await page(`/${section}/`, section === 'work' ? 'Work' : 'Lab', PROFILE.statement, indexBody(items, section))
  for (const p of items) {
    const assigned = new Set(p.sections.flatMap((_, index) => sectionMedia(p, index).map(media => media.id)))
    const body = `<a href="/${section}/">← Back to ${section}</a><p>${escape(p.category)} / ${escape(p.year)}</p><h1>${escape(p.title)}</h1><p>${escape(p.subtitle)}</p>${figure(p.cover)}<p>${escape(p.premise)}</p><dl><dt>Context</dt><dd>${escape(p.context)}</dd><dt>Location</dt><dd>${escape(p.location)}</dd><dt>My role</dt><dd>${escape(p.role)}</dd><dt>Tools & themes</dt><dd>${escape(p.tags.join(' / '))}</dd></dl>${p.sections.map((s, i) => `<section><h2>${escape(s.title)}</h2>${paragraphs(s.text)}${sectionMedia(p, i).map(figure).join('')}</section>`).join('')}${p.gallery.filter(media => !assigned.has(media.id)).map(figure).join('')}<h2>Credits & context</h2>${p.credits.map(c => `<p>${escape(c)}</p>`).join('')}${(p.links || []).map(l => `<p><a href="${escape(l.url)}">${escape(l.label)} ↗</a></p>`).join('')}`
    await page(`/${section}/${p.slug}/`, p.title, p.summary, body, imagePath(p.cover), { '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.title, description: p.summary, url: `${origin}/${section}/${p.slug}/`, image: `${origin}${imagePath(p.cover)}`, creditText: p.credits.join(' ') })
  }
}
await page('/about/', 'About', PROFILE.statement, `<h1>Chia-Hsuan Chao</h1><p>JosHsuan / Computational designer and XR developer</p><p>My research and professional work concern computational geometry, material behavior and design-to-fabrication workflows. Projects include bending-active metal panels, robotic timber assembly, custom fabrication machines and extended-reality interfaces.</p><p>After studying landscape architecture at Fu Jen Catholic University, I completed a master’s degree at National Cheng Kung University with a thesis on computational simulation and pattern development for bending-active metal panels. At PKD Engineering Consultants, I worked on facade rationalization, coordination with structural and detail specialists, and the conversion of three-dimensional models into fabrication drawings.</p><p>The MAS in Architecture and Digital Fabrication at ETH Zürich extended this work to collaborative timber construction and motion-capture-based assembly guidance. As a research assistant on EchoXR at Gramazio Kohler Research, I developed VR interactions, tracking, multiplayer networking and material rendering for collaborative spatial-acoustics exploration.</p><p><a href="/resume.html">Read the résumé</a></p><p><a href="/contact/">Contact</a></p>`)
await page('/contact/', 'Contact', 'Contact Chia-Hsuan Chao for research and design collaborations.', `<h1>Contact</h1><p>Research enquiries and design collaborations.</p><p><a href="mailto:${PROFILE.email}">${PROFILE.email}</a></p><p><a href="${PROFILE.github}">GitHub</a></p>`)
const paths = ['/', '/work/', '/lab/', '/about/', '/contact/', '/resume.html', ...projects.map(p => `/work/${p.slug}/`), ...lab.map(p => `/lab/${p.slug}/`)]
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p => `<url><loc>${origin}${p}</loc></url>`).join('')}</urlset>\n`)
await writeFile('dist/.nojekyll', '')
await writeFile('dist/404.html', `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — JosHsuan</title><style>body{background:#182321;color:#e5e9df;font:18px/1.8 system-ui;max-width:700px;margin:12vh auto;padding:25px}a{color:#dbceb1}</style><h1>Page not found.</h1><p>This path is not part of the portfolio.</p><a href="/">Open the portfolio ↗</a></html>`)
console.log(`Generated ${projects.length + lab.length} case pages, indexes, metadata and sitemap.`)
