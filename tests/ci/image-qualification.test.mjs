import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertImageRuntime,QUALIFICATION_IMAGE,collectFingerprintCommand} from '../../scripts/ci-image-fingerprint.mjs';
const valid={image:QUALIFICATION_IMAGE,node:'v24.19.0',pnpm:'11.19.0',playwright:'1.63.0',platform:'linux',arch:'x64',uid:1001,username:'pwuser',osId:'ubuntu',osVersion:'24.04',browsersPath:'/ms-playwright'};
test('qualification requires the exact image, toolchain, OS, browser package and nonroot user',()=>{
 assert.doesNotThrow(()=>assertImageRuntime(valid));
 for(const [key,value] of Object.entries({image:'mcr.microsoft.com/playwright:latest',node:'v24.20.0',pnpm:'11.20.0',playwright:'1.64.0',platform:'darwin',arch:'arm64',uid:0,username:'root',osId:'debian',osVersion:'22.04',browsersPath:'/tmp/browser'}))
  assert.throws(()=>assertImageRuntime({...valid,[key]:value}),key);
 assert.throws(()=>assertImageRuntime({...valid,uid:undefined}));
});
test('image qualification is opt-in, nonpublishing, nonprivileged and preserves the VM default',()=>{
 const source=readFileSync(new URL('../../.github/workflows/preflight.yml',import.meta.url),'utf8');
 assert.match(source,/qualify_image:\n        description:.*\n        type: boolean\n        default: false/);
 assert.match(source,/targeted-feedback:\n    if: \$\{\{ !inputs.qualify_image \}\}/);
 assert.match(source,/image-qualification:\n    if: \$\{\{ inputs.qualify_image \}\}/);
 assert.match(source,/permissions:\n  contents: read\n/);
 const job=source.split('  image-qualification:')[1];
 assert.ok(job.includes(`image: ${QUALIFICATION_IMAGE}`));
 assert.match(job,/options: --user pwuser --shm-size=1g\n/);
 assert.match(job,/test "\$\(id -u\)" -ne 0/);
 for(const variable of ['GITHUB_WORKSPACE','HOME','RUNNER_TEMP','RUNNER_TOOL_CACHE']) assert.ok(job.includes(`"$${variable}"`));
 assert.match(job,/test -w "\$GITHUB_ENV"/);assert.match(job,/test -w "\$GITHUB_PATH"/);
 assert.match(job,/ref: \$\{\{ github.sha \}\}/);assert.match(job,/persist-credentials: false/);
 assert.match(job,/node-version-file: .node-version/);assert.match(job,/pnpm install --frozen-lockfile/);
 assert.match(job,/node scripts\/ci-preflight.mjs plan/);assert.match(job,/node scripts\/ci-image-fingerprint.mjs/);
 assert.match(job,/node scripts\/ci-preflight.mjs run/);assert.match(job,/name: preflight-image-/);
 assert.doesNotMatch(job,/install-deps|playwright install|sudo|chmod|chown|privileged|SYS_ADMIN|seccomp|ipc=host|continue-on-error|validated-release|static-export-pages|id-token:|pages: write|secrets\./);
});

test('required command failure retains earlier and failing diagnostic records',()=>{
 const report={};
 collectFingerprintCommand(report,'earlier',process.execPath,['-e','console.log("evidence")']);
 assert.throws(()=>collectFingerprintCommand(report,'failed',process.execPath,['-e','console.error("failure evidence");process.exit(3)']));
 assert.equal(report.earlier.status,0);
 assert.match(report.earlier.stdout,/evidence/);
 assert.equal(report.failed.status,3);
 assert.match(report.failed.stderr,/failure evidence/);
});
