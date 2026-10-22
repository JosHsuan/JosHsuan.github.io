import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL(`../../${name}`,import.meta.url),'utf8');
test('security patch pins Next family consistently without changing runtime/browser policy',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.dependencies.next,'16.4.2');assert.equal(pkg.devDependencies['eslint-config-next'],'16.4.2');
 assert.equal(pkg.engines.node,'24.x');assert.equal(read('.node-version').trim(),'24.19.0');assert.equal(pkg.engines.pnpm,'11.19.0');assert.equal(pkg.packageManager,'pnpm@11.19.0');
 assert.equal(pkg.devDependencies['@playwright/test'],'1.63.0');
 const lock=read('pnpm-lock.yaml'),policy=read('pnpm-workspace.yaml');
 assert.doesNotMatch(lock,/(?:@next\/[a-z0-9-]+|eslint-config-next|next)@16\.4\.0/);assert.doesNotMatch(policy,/16\.4\.0/);
 for(const name of ['next','eslint-config-next','@next/env','@next/eslint-plugin-next','@next/swc-darwin-arm64','@next/swc-darwin-x64','@next/swc-linux-arm64-gnu','@next/swc-linux-arm64-musl','@next/swc-linux-x64-gnu','@next/swc-linux-x64-musl','@next/swc-win32-arm64-msvc','@next/swc-win32-x64-msvc']) {
  assert.ok(lock.includes(`${name}@16.4.2`),name);assert.ok(policy.includes(`${name}@16.4.2`),name);
 }
 assert.ok(lock.includes('sha512-r+oBJojfefUjOiWkBhXgLS+igxX/7BWyK59uHnyOyplMSLtBZ+QLP3okrdYTbrfrbrmNTVWLBPaHDX9KRaIt3w=='));
 assert.ok(lock.includes('sha512-P33vjcETMXc+qBjpF77TeJHZLzk6cPcTy8KjpxLucYB3mCIFIORMcZ+cBXcAiIYjE5RM7jyknEEOwMNdnx/ADQ=='));
 assert.match(lock,/sharp@0\.35\.5/);
});
