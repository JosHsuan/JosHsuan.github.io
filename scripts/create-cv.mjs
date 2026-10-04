import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { profile, experience, education, capabilities, publications, awards } from '../src/data/portfolio.ts'

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const output = resolve('public/cv/chia-hsuan-chao-cv.pdf')
await mkdir(dirname(output), { recursive: true })
const browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) })
try {
  const page = await browser.newPage()
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Chia-Hsuan Chao — CV</title><style>
  @page{size:A4;margin:15mm 16mm}*{box-sizing:border-box}body{font:9.4pt/1.45 Arial,sans-serif;color:#242d26;margin:0}h1{font:30pt/1.05 Georgia,serif;margin:0 0 5mm}h2{font:16pt Georgia,serif;border-top:1px solid #b9c1b5;padding-top:4mm;margin:7mm 0 4mm;break-after:avoid}h3{font-size:10pt;margin:0 0 1mm}p{margin:1mm 0 2mm}a{color:inherit;text-decoration:none}.intro{font-size:11pt;max-width:165mm}.contact{font-size:9pt;margin:3mm 0 6mm}.entry{break-inside:avoid;margin:0 0 4mm}.date{color:#596258;font-size:8pt;letter-spacing:.04em}.role{font-size:9pt;color:#596258}ul{padding-left:4mm;margin:2mm 0}li{margin:1mm 0}.skills{display:grid;grid-template-columns:1fr 1fr;gap:4mm 7mm}.skills>div{break-inside:avoid}footer{margin-top:7mm;color:#596258;font-size:7.5pt}
  </style></head><body><header><h1>${escape(profile.name)}</h1><p class="intro">${escape(profile.headline)}</p><p class="contact">${profile.email ? `<a href="mailto:${escape(profile.email)}">${escape(profile.email)}</a> · ` : ''}<a href="${escape(profile.github)}">github.com/JosHsuan</a> · <a href="https://JosHsuan.github.io">JosHsuan.github.io</a></p></header>
  <h2>Professional experience</h2>${experience.map(e => `<section class="entry"><p class="date">${escape(e.period)}</p><h3>${escape(e.organization)}</h3><p class="role">${escape(e.role)}</p><ul>${e.description.map(s => `<li>${escape(s)}</li>`).join('')}</ul></section>`).join('')}
  <h2>Education</h2>${education.map(e => `<section class="entry"><p class="date">${escape(e.period)}</p><h3>${escape(e.institution)}</h3><p>${escape(e.program)}</p><p class="role">${escape(e.focus)}</p></section>`).join('')}
  <h2>Skills and practice</h2><div class="skills">${capabilities.map(c => `<div><h3>${escape(c.title)}</h3><p>${escape(c.tools.join(' / '))}</p></div>`).join('')}</div>
  <h2>Research and publications</h2>${publications.map(p => `<section class="entry"><p class="date">${escape(p.year)} · ${escape(p.venue)}</p><h3>${escape(p.title)}</h3><p>${escape(p.authors.join(', '))}</p></section>`).join('')}
  ${awards.length ? `<h2>Awards</h2>${awards.map(a => `<section class="entry"><p class="date">${escape(a.year)}</p><h3>${escape(a.title)}</h3><p>${escape(a.distinction)}</p></section>`).join('')}` : ''}
  <footer>Project contributions, collaborators and methods are documented at JosHsuan.github.io.</footer></body></html>`, { waitUntil: 'load' })
  await page.emulateMedia({ media: 'print' })
  await page.pdf({ path: output, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true })
  console.log('Public CV PDF generated from the curated portfolio data.')
} finally { await browser.close() }
