import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=process.cwd(), artist=path.join(root,'roles/3d-artist'), cinema=path.join(root,'roles/animation-cinematographer');
for(const folder of ['scripts','src/review','src/motion/theatre','preview','catalog','assets','licenses','research','mcp','tests','verification','skills/cinema-shot-design','skills/cinema-interaction-review','skills/vendor'])await mkdir(path.join(cinema,folder),{recursive:true});
await mkdir(path.join(artist,'src/review'),{recursive:true});
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const {readdir}=await import('node:fs/promises');
async function walk(dir){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){if(['node_modules','dist','.runtime','verification'].includes(e.name))continue;const f=path.join(dir,e.name);out.push(...e.isDirectory()?await walk(f):[path.relative(root,f).replaceAll('\\','/')]);}return out;}
const files=[...new Set([...tracked,...await walk(path.join(root,'roles/uiux-designer'))])].filter(f=>!f.startsWith('roles/3d-artist/')&&!f.startsWith('roles/animation-cinematographer/'));
await writeFile(path.join(artist,'verification/interaction-boundary-before.json'),JSON.stringify(await Promise.all(files.map(async file=>({file,sha256:createHash('sha256').update(await readFile(path.join(root,file))).digest('hex')}))),null,2));
for(const name of ['ts-loader.cjs','browser-path.mjs'])await copyFile(path.join(artist,'scripts',name),path.join(cinema,'scripts',name));
for(const name of ['open-desk.ps1','codex-role.ps1','config.template.toml','scripts/serve.mjs','mcp/catalog-server.mjs','scripts/verify-mcp.mjs']){
 let s=await readFile(path.join(artist,name),'utf8');s=s.replaceAll('3D Artist','Animation Cinematographer').replaceAll('3d-artist','animation-cinematographer').replaceAll('artist3d','cinema').replaceAll('4180','4182');
 await writeFile(path.join(cinema,name),s);
}
await cp(path.join(artist,'licenses'),path.join(cinema,'licenses'),{recursive:true});
await cp(path.join(artist,'skills/vendor/playwright'),path.join(cinema,'skills/vendor/playwright'),{recursive:true});
const skillFile=path.join(cinema,'skills/vendor/playwright/agents/openai.yaml');
await writeFile(skillFile,(await readFile(skillFile,'utf8')).replaceAll('3D Artist','Animation Cinematographer').replaceAll('3d-artist','animation-cinematographer'));
await copyFile(path.join(artist,'assets/studio_small_09_1k.hdr'),path.join(cinema,'assets/studio_small_09_1k.hdr'));
await copyFile(path.join(artist,'src/uiux-reference.js'),path.join(cinema,'src/uiux-reference.js'));
for(const name of ['runtime.js','motion.state.json','motion.manifest.json']){
 let s=await readFile(path.join(artist,'src/motion/theatre',name),'utf8');if(name!=='motion.state.json')s=s.replaceAll('artist3d.inspection.v1','cinema.inspection.v1').replaceAll('3d-artist','animation-cinematographer');
 await writeFile(path.join(cinema,'src/motion/theatre',name),s);
}
await writeFile(path.join(cinema,'.gitignore'),'node_modules/\n.runtime/\ndist/\nverification/screenshots/\n*.log\n');
await writeFile(path.join(cinema,'package.json'),JSON.stringify({name:'portfolio-animation-cinematographer-desk',version:'0.1.0',private:true,type:'module',packageManager:'pnpm@11.19.0',engines:{node:'24.19.0',pnpm:'11.19.0'},scripts:{build:'node scripts/build.mjs',preview:'node scripts/serve.mjs',test:'node --test tests/*.test.mjs','verify:mcp':'node scripts/verify-mcp.mjs'},devDependencies:{'@playwright/mcp':'0.0.83'}},null,2)+'\n');
console.log('Prepared isolated cinema role and protected-file baseline.');
