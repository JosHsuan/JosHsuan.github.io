import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
export const directory=path.resolve(fileURLToPath(new URL('.',import.meta.url)));
export const repository=path.resolve(directory,'../../../../..');
export const source=path.join(directory,'..');
export const dist=path.join(directory,'dist');
export async function build(){
 assert.equal(process.version,'v24.19.0','Use the exact committed Node 24.19.0');
 const require=createRequire(import.meta.url),fromTsx=createRequire(require.resolve('tsx/package.json')),esbuild=fromTsx('esbuild');
 await mkdir(dist,{recursive:true});
 // Native directory scanning crosses denied Windows ancestors. Node resolves
 // this fixed local dependency graph; esbuild parses supplied file contents.
 const loaded=new Set(),files={name:'review-files',setup(api){
  api.onResolve({filter:/.*/},args=>{
   let filename;
   if(args.path.startsWith('.')||path.isAbsolute(args.path))filename=path.resolve(args.resolveDir||directory,args.path);
   else{const at=createRequire(path.join(args.resolveDir||directory,'review-entry.cjs'));filename=at.resolve(args.path);if(args.path==='three')filename=filename.replace(/three\.cjs$/,'three.module.js');}
   return {path:filename,namespace:'review-files'};
  });
  api.onLoad({filter:/.*/,namespace:'review-files'},async args=>{loaded.add(args.path);return {contents:await readFile(args.path,'utf8'),loader:path.extname(args.path)==='.ts'?'ts':path.extname(args.path)==='.jsx'?'jsx':'js',resolveDir:path.dirname(args.path)};});
 }};
 await esbuild.build({absWorkingDir:repository,tsconfigRaw:{compilerOptions:{}},stdin:{contents:await readFile(path.join(directory,'app.mjs'),'utf8'),resolveDir:directory,sourcefile:'review-app.mjs',loader:'js'},plugins:[files],bundle:true,platform:'browser',format:'esm',target:['chrome120','safari17'],outfile:path.join(dist,'app.js'),legalComments:'linked'});
 await copyFile(path.join(directory,'index.html'),path.join(dist,'index.html'));
 let css=await readFile(path.join(directory,'style.css'),'utf8');
 for(const file of ['effects-2d.css','effects-3d.css','window-specimen.css'])try{css+='\n'+await readFile(path.join(directory,file),'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
 await writeFile(path.join(dist,'style.css'),css);
 const hashes={};for(const absolute of loaded){if(absolute.startsWith(source+path.sep)&&!absolute.startsWith(directory+path.sep)){hashes[path.relative(repository,absolute).replaceAll('\\','/')]=createHash('sha256').update(await readFile(absolute)).digest('hex');}}
 await writeFile(path.join(dist,'source-manifest.json'),JSON.stringify({generatedAt:new Date().toISOString(),scope:['3d','2d'],hashes},null,2));
 console.log(`Animation artifact built; ${Object.keys(hashes).length} original source modules referenced.`);
 return hashes;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
