import {readFileSync} from 'node:fs';
const weights = JSON.parse(readFileSync(new URL('./ci-test-weights.json', import.meta.url)));
export function partitionFiles(files, browser, count, profileWeights = weights.profiles[browser]) {
  if (!profileWeights || !Number.isInteger(count) || count < 1 || !files.length || new Set(files).size !== files.length) throw Error('Invalid partition input');
  const fallback = Math.max(60, ...Object.values(profileWeights));
  const weight = file => profileWeights[file] ?? fallback;
  const bins = Array.from({length: count}, (_, index) => ({index, seconds: 0, files: []}));
  for (const file of [...files].sort((a,b) => weight(b)-weight(a) || a.localeCompare(b, 'en'))) {
    const target = [...bins].sort((a,b) => a.seconds-b.seconds || a.index-b.index)[0];
    target.files.push(file); target.seconds += weight(file);
  }
  return bins.map(bin => bin.files.sort());
}
export function shardFiles(plan, browser, shard) {
  const job = plan.browserMatrix.find(job => job.browser === browser && job.shard === shard);
  if (!job) throw Error('Unexpected browser/shard');
  const [index,count] = shard.split('/').map(Number);
  return partitionFiles(plan.browserTests,browser,count)[index-1];
}
