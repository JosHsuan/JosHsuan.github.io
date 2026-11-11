import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {ESLint} from 'eslint';
import {auditPagesSources} from '../../scripts/audit-pages-sources.mjs';
import {pagesLintConfig} from '../../scripts/lint-pages.mjs';
import {PAGES_SOURCE_ROOT} from '../../scripts/pages-sources.mjs';

async function fixture(t, files) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-source-boundary-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  for (const [file, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, file)), {recursive: true});
    await writeFile(path.join(root, file), content);
  }
  return root;
}

test('public imports cannot pull an existing unapproved file into the build', async t => {
  const root = await fixture(t, {'app/page.jsx': "import '../private.mjs';", 'private.mjs': 'export const secret = 1;'});
  await assert.rejects(auditPagesSources(root, ['app/page.jsx']), /Import outside public source manifest/);
});

test('source graph resolves explicit and extensionless imports and rejects cycles', async t => {
  const root = await fixture(t, {'a.jsx': "import './b';", 'b.mjs': 'export const value = 1;'});
  assert.deepEqual(await auditPagesSources(root, ['a.jsx', 'b.mjs']), {sources: 2, modules: 2, internalEdges: 1});
  await writeFile(path.join(root, 'b.mjs'), "export * from './a.jsx';");
  await assert.rejects(auditPagesSources(root, ['a.jsx', 'b.mjs']), /Public module cycle/);
});

test('core cannot acquire React or a presentation dependency', async t => {
  const root = await fixture(t, {'runtime/core/owner.mjs': "import '../../components/view.mjs';", 'components/view.mjs': 'export const view = 1;'});
  await assert.rejects(auditPagesSources(root, ['runtime/core/owner.mjs', 'components/view.mjs']), /Core depends on feature or presentation/);
  await writeFile(path.join(root, 'runtime/core/owner.mjs'), "import React from 'react';");
  await assert.rejects(auditPagesSources(root, ['runtime/core/owner.mjs']), /Core depends on external implementation/);
});

test('nonliteral dynamic imports and duplicate/escaping handoff paths fail closed', async t => {
  const root = await fixture(t, {'a.mjs': 'export const load = path => import(path);'});
  await assert.rejects(auditPagesSources(root, ['a.mjs']), /Nonliteral public import/);
  await assert.rejects(auditPagesSources(root, ['a.mjs', 'a.mjs']), /Duplicate public source/);
  await assert.rejects(auditPagesSources(root, ['../private.mjs']), /Invalid public source/);
});

test('public lint catches invalid hooks while preserving scoped native document links', async () => {
  const linter = new ESLint({overrideConfigFile: true, overrideConfig: pagesLintConfig});
  const filePath = path.join(PAGES_SOURCE_ROOT, 'components/PortfolioNavigation.jsx');
  const [bad] = await linter.lintText("import {useState} from 'react'; export default function Navigation({visible}) {if(visible) useState(0); return <a href='/'>Home</a>;}", {filePath});
  assert(bad.messages.some(message => message.ruleId === 'react-hooks/rules-of-hooks'));
  const [good] = await linter.lintText("export default function Navigation() {return <a href='/'>Home</a>;}", {filePath});
  assert.equal(good.errorCount + good.warningCount, 0);
  const config = await linter.calculateConfigForFile(path.join(PAGES_SOURCE_ROOT, 'components/SourceDiagram.jsx'));
  assert.equal(config.rules['@next/next/no-html-link-for-pages'][0], 2, 'native-link exception does not spread to other components');
});
