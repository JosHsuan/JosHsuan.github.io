import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { projects, lab, categories, filterProjects } from '../src/content/portfolio.ts'
import { parseRoute, routeFromLocation } from '../src/navigation/routes.ts'

test('the expanded inventory has 15 cases and four distinct Lab studies', () => {
  assert.equal(projects.length, 15)
  assert.equal(lab.length, 4)
  assert.equal(new Set([...projects, ...lab].map(p => p.slug)).size, 19)
  assert.equal(projects.filter(p => p.featured).length, 6)
  for (const p of [...projects, ...lab]) {
    assert.ok(categories.includes(p.category))
    assert.ok(p.role && p.premise && p.sections.length && p.credits.length)
  }
})
test('all published images have local exports, text alternatives, captions and source credits', () => {
  for (const p of [...projects, ...lab]) for (const media of [p.cover, ...p.gallery]) {
    assert.ok(media.alt.length > 20 && media.caption && media.credit)
    assert.ok(existsSync(`public/media/${media.id}.webp`), media.id)
    assert.ok(existsSync(`public/media/${media.id}-thumb.webp`), media.id)
  }
})
test('category and multi-word search operate on the same project records', () => {
  assert.equal(filterProjects(projects, 'All', 'unity tracking').length, 1)
  assert.equal(filterProjects(projects, 'Architecture & Facades', '').length, 3)
  assert.equal(filterProjects(projects, 'All', 'NON-PLANAR').length, 1)
  assert.equal(filterProjects(projects, 'All', 'unavailable-search-term').length, 0)
})
test('removed projects have no active records or dedicated public media', () => {
  assert.equal(projects.some(p => ['woodflow', 'dome-tessellation'].includes(p.slug)), false)
  assert.equal(existsSync('public/media/woodflow-workflow.svg'), false)
  assert.equal(existsSync('public/media/dome-tessellation.webp'), false)
  assert.equal(existsSync('public/media/dome-panels.webp'), false)
})
test('section figures refer to existing attributed media without duplicates', () => {
  for (const project of [...projects, ...lab]) {
    const ids = project.sections.flatMap(section => section.media ?? [])
    assert.equal(new Set(ids).size, ids.length, project.slug)
    for (const id of ids) assert.ok(project.gallery.some(media => media.id === id), `${project.slug}: ${id}`)
  }
})
test('shared project paths, static deep links and invalid routes are handled', () => {
  assert.deepEqual(parseRoute('#/work/echoxr'), { section: 'work', slug: 'echoxr' })
  assert.deepEqual(routeFromLocation('', '/work/echoxr/'), { section: 'work', slug: 'echoxr' })
  assert.deepEqual(routeFromLocation('', '/lab/eggshell/index.html'), { section: 'lab', slug: 'eggshell' })
  assert.deepEqual(routeFromLocation('#/contact', '/work/echoxr/'), { section: 'contact' })
  assert.ok(parseRoute('#/about/invalid').missing)
  assert.ok(parseRoute('#/unknown').missing)
})
test('the active app uses the static background boundary and does not import a 3D renderer', () => {
  const app = readFileSync('src/App.tsx', 'utf8')
  assert.match(app, /WorkspaceBackdrop/)
  assert.doesNotMatch(app, /NeutralScene|Canvas|Suspense|scene\//)
})
