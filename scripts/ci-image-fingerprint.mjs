import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {constants,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
export const QUALIFICATION_IMAGE='mcr.microsoft.com/playwright@sha256:bc6ab0d6d44ff4826e4cb8c1e6d801e185bfc42bb0753f8e2a30efc70db054c7';
export function assertImageRuntime(runtime) {
  if(runtime.image!==QUALIFICATION_IMAGE || runtime.node!=='v24.19.0' || runtime.pnpm!=='11.19.0' || runtime.playwright!=='1.63.0'
    || runtime.platform!=='linux' || runtime.arch!=='x64' || (!Number.isInteger(runtime.uid) || runtime.uid<=0) || runtime.username!=='pwuser'
    || runtime.osId!=='ubuntu' || runtime.osVersion!=='24.04' || runtime.browsersPath!=='/ms-playwright') throw Error('Image qualification runtime mismatch');
}
function command(file,args,required=true) {
  const result=spawnSync(file,args,{encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});
  const record={command:[file,...args],status:result.status,stdout:result.stdout??'',stderr:result.stderr??'',error:result.error?.message};
  if(required && (result.error || result.status!==0)) throw new Error(`Required fingerprint command failed: ${file}`,{cause:record});
  return record;
}
export function collectFingerprintCommand(report,name,file,args,required=true) {
  try { report[name]=command(file,args,required); }
  catch(error) { report[name]=error.cause; throw error; }
  return report[name];
}
async function sha256(file) {
  const hash=createHash('sha256');
  for await(const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
async function main() {
  await mkdir('preflight-results',{recursive:true});
  const report={version:1,publishable:false,purpose:'environment-qualification-only',commit:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT};
  try {
  const require=createRequire(import.meta.url);
  const testPackage=require('@playwright/test/package.json');
  const playwrightPackage=require.resolve('playwright/package.json',{paths:[require.resolve('@playwright/test/package.json')]});
  const corePackage=createRequire(playwrightPackage).resolve('playwright-core/package.json');
  const registry=JSON.parse(await readFile(path.join(path.dirname(corePackage),'browsers.json'),'utf8'));
  const osRelease=await readFile('/etc/os-release','utf8');
  const fields=Object.fromEntries(osRelease.trim().split('\n').filter(line=>line.includes('=')).map(line=>{const i=line.indexOf('=');return[line.slice(0,i),line.slice(i+1).replace(/^"|"$/g,'')];}));
  const runtime={image:process.env.CI_QUALIFICATION_IMAGE,node:process.version,
    playwright:testPackage.version,platform:process.platform,arch:process.arch,uid:process.getuid(),
    osId:fields.ID,osVersion:fields.VERSION_ID,browsersPath:process.env.PLAYWRIGHT_BROWSERS_PATH};
  report.runtime=runtime;
  report.imageIdentitySource='Digest pinned by workflow container declaration; not an independent in-container image attestation';
  report.osRelease=osRelease;
  report.registry=registry;
  const collect=(name,...args)=>collectFingerprintCommand(report,name,...args);
  runtime.pnpm=collect('pnpm','pnpm',['--version']).stdout.trim();
  runtime.username=collect('identityName','id',['-un']).stdout.trim();
  collect('identity','id',[]);
  collect('packages','dpkg-query',['-W','-f=${Package}\t${Version}\t${Architecture}\n']);
  collect('fonts','fc-list',['--format','%{file}\t%{family}\t%{style}\n']);
  collect('sharedMemory','df',['-k','/dev/shm']);
  collect('media','gst-inspect-1.0',['playbin3'],false);
  collect('libraries','/sbin/ldconfig',['-p'],false);
  report.browsers=[];
  report.configSha256=await sha256('playwright.pages.config.mjs');
  report.lockSha256=await sha256('pnpm-lock.yaml');
    assertImageRuntime(runtime);
    report.fontFiles = await Promise.all([...new Set(report.fonts.stdout.trim().split('\n').filter(Boolean).map(line=>line.split('\t')[0]))].sort().map(async file=>({file,sha256:await sha256(file)})));
    if(!report.fontFiles.length) throw Error('No installed fonts recorded');
    const {chromium,webkit}=await import('@playwright/test');
    for(const [name,browser] of [['chromium',chromium],['webkit',webkit]]) {
      const executable=browser.executablePath();
      if(!executable.startsWith('/ms-playwright/')) throw Error('Unexpected browser executable source');
      await access(executable,constants.R_OK|constants.X_OK);
      report.browsers.push({name,executable,sha256:await sha256(executable)});
    }
    // Chromium headless is a distinct executable; it must already exist too.
    const shell=registry.browsers.find(browser=>browser.name==='chromium-headless-shell');
    if(!shell) throw Error('Missing pinned headless-shell registry');
    const executable=`/ms-playwright/chromium_headless_shell-${shell.revision}/chrome-headless-shell-linux64/chrome-headless-shell`;
    await access(executable,constants.R_OK|constants.X_OK);
    report.browsers.push({name:'chromium-headless-shell',executable,sha256:await sha256(executable)});
    report.status='fingerprint-verified-not-yet-behavior-qualified';
  } catch(error) {
    report.status='failed'; report.error=error.message; report.commandFailure=error.cause; throw error;
  } finally {
    await writeFile('preflight-results/image-fingerprint.json',JSON.stringify(report,null,2)+'\n');
  }
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) await main();
