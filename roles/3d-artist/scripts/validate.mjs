import {readFile,readdir,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const role=fileURLToPath(new URL('../',import.meta.url)),project=path.resolve(role,'../..');
const json=async file=>JSON.parse(await readFile(path.join(role,file),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const check=(condition,message)=>{if(!condition)throw new Error(message);};
const catalog=await json('catalog/studies.json'),sources=await json('catalog/sources.json');check(catalog.studies.length===7,'Study coverage');
for(const study of catalog.studies){for(const id of study.sources)check(sources.sources.some(s=>s.id===id),'Unknown source '+id);check(study.preview.endsWith('study='+study.id),'Invalid direct URL');}
const assetManifest=await json('catalog/assets.manifest.json');for(const asset of assetManifest.assets){const bytes=await readFile(path.join(role,asset.path));check(hash(bytes)===asset.sha256,'Asset hash mismatch '+asset.path);await stat(path.join(role,asset.notice));}
const previews=await json('catalog/previews.manifest.json');check(previews.captures.length===14,'Missing A/B previews');for(const preview of previews.captures)check(hash(await readFile(path.join(role,preview.path)))===preview.sha256,'Preview hash mismatch');
const motion=await json('src/motion/theatre/motion.manifest.json'),stateBytes=await readFile(path.join(role,'src/motion/theatre/motion.state.json'));check(hash(stateBytes)===motion.stateRevision,'Score hash mismatch');const tracks=JSON.parse(stateBytes).sheetsById.Main.sequence.tracksByObject.Pose;check(Object.keys(tracks.trackData).length===4,'Score must retain four authored tracks');check(Object.values(tracks.trackData).every(track=>track.keyframes.length===6),'Expected genuine six-keyframe tracks');
async function files(folder){const all=[];for(const entry of await readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())all.push(...await files(file));else all.push(file);}return all;}
for(const file of await files(path.join(role,'src'))){if(/\.[jt]sx?$/.test(file)){const code=await readFile(file,'utf8');if(/from\s+['"]@theatre\//.test(code))check(file.includes(path.join('src','motion','theatre')),'Direct Theatre import outside boundary');check(!code.includes('@theatre/studio'),'Studio in runtime source');}}
const untouched=[];for(const line of (await readFile(path.join(role,'verification/boundary-before.sha256'),'utf8')).split(/\r?\n/).filter(Boolean)){const match=line.match(/^([A-F0-9]+)  (.+)$/i);if(!match)continue;check(hash(await readFile(path.join(project,match[2]))).toLowerCase()===match[1].toLowerCase(),'Unrelated file changed: '+match[2]);untouched.push(match[2]);}
const build=await json('verification/build.json');check(build.studioExcluded && build.theatreModules.length>0 && build.theatreModules.every(id=>!/@theatre[+/]studio/.test(id)),'Compiled Studio module boundary');const bundles=[];for(const file of await files(path.join(role,'dist'))){if(file.endsWith('.js')&&!file.includes(path.sep+'samples'+path.sep)){const bytes=await readFile(file);bundles.push({file:path.relative(path.join(role,'dist'),file),bytes:bytes.length,gzipBytes:gzipSync(bytes).length});}}
const report={verifiedAt:new Date().toISOString(),studies:7,previews:14,licensedAssetHashes:assetManifest.assets.length,score:{tracks:4,keyframes:24,hash:motion.stateRevision,provenance:motion.provenance},untouchedExistingFiles:untouched.length,rootLockfileUnchanged:true,studioExcluded:build.studioExcluded,bundles,note:'Gzip sizes are offline measurements. The loopback server serves raw bytes; these are not transfer timing, GPU memory or field performance measurements.'};
await writeFile(path.join(role,'verification/validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
