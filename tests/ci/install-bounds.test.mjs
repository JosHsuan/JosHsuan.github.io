import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [file,engine] of [['ci.yml','matrix.engine'],['preflight.yml','steps.plan.outputs.engine']]) {
 test(`${file}: browser setup is bounded, unchanged, and fail-closed without interrupted apt retry`,()=>{
  const source=readFileSync(new URL(`../../.github/workflows/${file}`,import.meta.url),'utf8');
  const scope=file==='ci.yml'?source.split('  pages-browser:')[1].split('\n  gate:')[0]:source;
  assert.match(scope,/timeout-minutes: 45/);
  const expected=`      - name: Install OS browser dependencies (bounded)\n        timeout-minutes: 8\n        run: pnpm exec playwright install-deps \${{ ${engine} }}\n      - name: Install pinned browser binary (bounded)\n        timeout-minutes: 3\n        run: pnpm exec playwright install \${{ ${engine} }}`;
  assert.ok(scope.includes(expected));
  assert.doesNotMatch(scope,/--with-deps|continue-on-error|apt-get|apt-config|sources\.list|\bretry\b|\bcontainer:/);
  if(file==='ci.yml') assert.match(source,/pnpm exec playwright install --with-deps chromium firefox webkit/);
 });
}
