import {readdirSync} from 'node:fs';

export const CASE_ROOT = 'roles/uiux-designer/cases/bending-active-thesis/';
export const ALL_BROWSER_TESTS = readdirSync(new URL('../tests/pages/', import.meta.url))
  .filter(name => name.endsWith('.spec.mjs')).sort().map(name => `tests/pages/${name}`);
const baseline = ['public-release'];
const features = {
  model: ['bending-scroll-camera', 'model-inspection', 'model-drag', 'canvas-motion', 'source-artwork', 'runtime-lifecycle', 'mobile-stability'],
  evidence: ['source-artwork', 'motion-feedback'],
  diagram: ['source-artwork', 'library-reveal', 'model-inspection', 'canvas-motion'],
  reading: ['bending-scroll-camera', 'motion-feedback', 'canvas-motion', 'source-artwork', 'model-inspection'],
};
// Explicit cross-feature coverage includes CSS and delegated event contracts.
// An import-only dependency graph cannot establish those relationships.
const featureFiles = {
  model: ['components/ModelInspector.jsx', 'components/model-inspector.module.css',
    'components/model-information.mjs', 'runtime/features/ModelManager.mjs',
    'tests/model-manager.test.mjs', 'tests/model-information-layout.test.mjs'],
  evidence: ['components/EvidenceInspector.jsx', 'components/evidence-inspector.module.css',
    'runtime/features/EvidenceManager.mjs'],
  diagram: ['components/SourceDiagram.jsx', 'components/source-diagram.module.css',
    'runtime/features/DiagramManager.mjs', 'tests/source-diagram.test.mjs'],
  reading: ['runtime/features/ReadingManager.mjs', 'tests/reading-response.test.mjs'],
};

export function browserMatrix(tests, fullCase) {
  if (!tests.length) return [];
  // Separate runners keep one software-GPU worker per machine. File sharding
  // preserves test-local sequences and does not increase concurrent GL clients.
  return [['chromium','chromium',4],['webkit','webkit',2],['mobile-chromium','chromium',2]]
    .flatMap(([browser,engine,fullShards])=>{
      const shards=fullCase?fullShards:1;
      return Array.from({length:shards},(_,i)=>({browser,engine,shard:`${i+1}/${shards}`}));
    });
}

export function classifyChanges(changedFiles, {forceFull = false} = {}) {
  const files = [...new Set(changedFiles)].sort();
  let framework = forceFull, pages = forceFull, fullCase = forceFull;
  const selected = new Set(), reasons = [];
  for (const file of files) {
    if (!file || file.includes('\\') || file.startsWith('/') || file.split('/').includes('..'))
      throw Error(`Invalid repository path: ${file}`);
    const docs = /^(README|AGENTS)\.md$/.test(file)
      || /^docs\/.*\.md$/.test(file)
      || /^roles\/.*\.md$/.test(file) && !file.includes('/release/public/');
    if (docs) continue;
    if (file.startsWith(CASE_ROOT)) {
      pages = true;
      const local = file.slice(CASE_ROOT.length);
      const feature = Object.keys(featureFiles).find(key => featureFiles[key].includes(local));
      if (feature) {
        features[feature].forEach(name => selected.add(`tests/pages/${name}.spec.mjs`));
        reasons.push(`${file}: ${feature} and its integration tests`);
      } else {
        fullCase = true;
        reasons.push(`${file}: shared or unclassified case input; full case validation`);
      }
    } else if (/^tests\/pages\/[^/]+\.spec\.mjs$/.test(file) && ALL_BROWSER_TESTS.includes(file)) {
      pages = true; selected.add(file);
      reasons.push(`${file}: changed browser test`);
    } else if (file.startsWith('tests/pages/') || file === 'playwright.pages.config.mjs') {
      pages = true; fullCase = true;
      reasons.push(`${file}: shared browser fixture or configuration`);
    } else if (/^(src|content|public|tests\/(unit|integration|e2e))\//.test(file)
      || /^scripts\/(content-source|export-content|validate-content|validate-motion|audit-build|serve-export)\.ts$/.test(file)
      || file === 'playwright.config.ts') {
      framework = true;
      reasons.push(`${file}: framework root and subpath validation`);
    } else {
      framework = true; pages = true; fullCase = true;
      reasons.push(`${file}: shared tooling or unknown input; full validation`);
    }
  }
  if (pages) baseline.forEach(name => {
    const file = `tests/pages/${name}.spec.mjs`;
    if (!ALL_BROWSER_TESTS.includes(file)) throw Error(`Missing required release baseline: ${file}`);
    selected.add(file);
  });
  const browserTests = fullCase ? [...ALL_BROWSER_TESTS] : [...selected].sort();
  for (const file of browserTests) if (!ALL_BROWSER_TESTS.includes(file)) throw Error(`Missing mapped test: ${file}`);
  return {
    version: 1, changedFiles: files, framework, pages, fullCase,
    scope: framework && fullCase ? 'full' : framework && pages ? 'framework-and-case'
      : framework ? 'framework' : fullCase ? 'case-full' : pages ? 'case-scoped' : 'documentation',
    browserTests, browserMatrix: browserMatrix(browserTests, fullCase), reasons,
  };
}

export function assertRequiredJobs(plan, results) {
  const expected = {plan: true, quality: plan.framework || plan.pages,
    framework: plan.framework, 'pages-build': plan.pages, 'pages-browser': plan.pages};
  for (const [job, required] of Object.entries(expected)) {
    const actual = results[job]?.result;
    if (actual !== (required ? 'success' : 'skipped'))
      throw Error(`${job}: expected ${required ? 'success' : 'skipped'}, received ${actual}`);
  }
}
