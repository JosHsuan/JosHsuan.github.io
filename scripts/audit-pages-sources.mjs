import assert from 'node:assert/strict';
import {readFile, realpath} from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

export const isPagesCode = file => /\.(?:[cm]?js|jsx|tsx?)$/.test(file);

/** Check the reviewed copy boundary, including imports the bundler would follow. */
export async function auditPagesSources(sourceRoot, sources) {
  const root = await realpath(sourceRoot), approved = new Set(sources), graph = new Map();
  assert.equal(approved.size, sources.length, 'Duplicate public source');
  for (const file of sources) {
    assert(/^[a-zA-Z0-9/._-]+$/.test(file) && !file.startsWith('/') && !file.split('/').includes('..'), `Invalid public source: ${file}`);
    const resolved = await realpath(path.join(root, file));
    assert(resolved.startsWith(root + path.sep), `Public source escapes handoff: ${file}`);
    if (!isPagesCode(file)) continue;
    const syntax = ts.createSourceFile(file, await readFile(resolved, 'utf8'), ts.ScriptTarget.Latest, true);
    const imports = [];
    const visit = node => {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier) imports.push(node.moduleSpecifier.text);
      } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(syntax) === 'require')) {
        assert(node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0]), `Nonliteral public import: ${file}`);
        imports.push(node.arguments[0].text);
      }
      ts.forEachChild(node, visit);
    };
    visit(syntax);
    const dependencies = [];
    for (const specifier of imports) {
      if (!specifier.startsWith('.')) {
        assert(!specifier.startsWith('node:') && !specifier.startsWith('/') && !specifier.includes(':'), `Non-browser import in ${file}: ${specifier}`);
        if (file.startsWith('runtime/core/')) throw Error(`Core depends on external implementation: ${file} -> ${specifier}`);
        continue;
      }
      const stem = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
      const candidates = [stem, ...['.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx', '/index.js', '/index.jsx', '/index.mjs'].map(extension => stem + extension)];
      const dependency = candidates.find(candidate => approved.has(candidate));
      assert(dependency, `Import outside public source manifest: ${file} -> ${specifier}`);
      if (file.startsWith('runtime/core/')) assert(/^runtime\/(core|contracts)\//.test(dependency), `Core depends on feature or presentation: ${file} -> ${dependency}`);
      if (isPagesCode(dependency)) dependencies.push(dependency);
    }
    graph.set(file, dependencies);
  }
  const visited = new Set(), active = [];
  const visit = file => {
    assert(!active.includes(file), `Public module cycle: ${[...active, file].join(' -> ')}`);
    if (visited.has(file)) return;
    active.push(file);
    for (const dependency of graph.get(file) ?? []) visit(dependency);
    active.pop(); visited.add(file);
  };
  for (const file of graph.keys()) visit(file);
  return {sources: sources.length, modules: graph.size, internalEdges: [...graph.values()].reduce((count, edges) => count + edges.length, 0)};
}
