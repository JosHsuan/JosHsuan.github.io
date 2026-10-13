import {readFile, readdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertRequiredJobs} from './ci-impact.mjs';

export async function artifactDigest(folder) {
  const records = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      if (entry.isSymbolicLink()) throw Error('Symlink in static artifact');
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else if (entry.isFile()) records.push([path.relative(folder, filename).replaceAll('\\', '/'),
        createHash('sha256').update(await readFile(filename)).digest('hex')]);
      else throw Error('Non-file entry in static artifact');
    }
  }
  await walk(folder);
  if (!records.length) throw Error('Empty static artifact');
  records.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  return createHash('sha256').update(JSON.stringify(records)).digest('hex');
}
export async function verifyValidation(validation, folder, {sha, runId, branch}) {
  if (validation.version !== 1 || !validation.publishable || validation.event !== 'push'
    || validation.commit !== sha || validation.plan?.head !== sha || validation.runId !== runId
    || validation.branch !== branch || !validation.plan.pages) throw Error('Validation provenance mismatch');
  assertRequiredJobs(validation.plan, validation.jobs);
  if (validation.build?.commit !== sha || validation.build.digest !== await artifactDigest(folder)) throw Error('Tested artifact digest mismatch');
  const release = JSON.parse(await readFile(path.join(folder, 'release.json'), 'utf8'));
  if (release.commit !== sha) throw Error('Release commit mismatch');
}
async function main() {
  const [command, folder = '.pages-workspace/out'] = process.argv.slice(2);
  if (command === 'record') {
    const release = JSON.parse(await readFile(path.join(folder, 'release.json'), 'utf8'));
    const commit = process.env.GITHUB_SHA || release.commit;
    if (release.commit !== commit) throw Error('Build release commit mismatch');
    await writeFile('ci-build.json', JSON.stringify({commit, digest: await artifactDigest(folder)}) + '\n');
  } else if (command === 'check-build') {
    const build = JSON.parse(await readFile('ci-build.json', 'utf8'));
    if (build.commit !== process.env.GITHUB_SHA || build.digest !== await artifactDigest(folder)) throw Error('Browser artifact differs from built artifact');
  } else if (command === 'verify') {
    await verifyValidation(JSON.parse(await readFile('ci-validation.json', 'utf8')), folder,
      {sha: process.env.EXPECTED_SHA, runId: process.env.RUN_ID, branch: process.env.EXPECTED_BRANCH});
  } else throw Error('Expected record, check-build or verify');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
