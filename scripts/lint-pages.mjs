import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {ESLint} from 'eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import {PAGES_SOURCES, PAGES_SOURCE_ROOT} from './pages-sources.mjs';
import {auditPagesSources, isPagesCode} from './audit-pages-sources.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export const pagesLintConfig = [
  ...nextVitals, ...nextTypescript,
  {
    // These anchors deliberately cross native document lifetimes. SiteNavigation
    // prepares the destination; Next client routing would bypass that contract.
    files: ['**/app/not-found.jsx', '**/components/PortfolioNavigation.jsx', '**/components/SiteExperience.jsx'],
    rules: {'@next/next/no-html-link-for-pages': 'off'},
  },
];

export async function lintPages() {
  const source = path.join(root, PAGES_SOURCE_ROOT);
  const boundary = await auditPagesSources(source, PAGES_SOURCES);
  const linter = new ESLint({cwd: root, overrideConfigFile: true, overrideConfig: pagesLintConfig});
  const files = PAGES_SOURCES.filter(isPagesCode);
  const results = await linter.lintFiles(files.map(file => path.join(source, file)));
  const formatter = await linter.loadFormatter('stylish');
  const output = formatter.format(results);
  if (output) process.stdout.write(output);
  const errors = results.reduce((count, row) => count + row.errorCount + row.warningCount, 0);
  console.log(`Public source audit: ${boundary.sources} approved files, ${boundary.modules} modules, ${boundary.internalEdges} internal edges; lint: ${files.length} files, ${errors} errors/warnings.`);
  return errors === 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!await lintPages()) process.exitCode = 1;
}
