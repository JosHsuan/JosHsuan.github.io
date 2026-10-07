import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
export default {
 output:'export', trailingSlash:true, poweredByHeader:false,
 images:{unoptimized:true}, productionBrowserSourceMaps:false,
 experimental:{externalDir:true},
 outputFileTracingRoot:path.resolve(here,'../../../..'),
 webpack(config){
  config.plugins.push({apply(compiler){compiler.hooks.compilation.tap('LocalReviewBoundary',compilation=>{
   compilation.hooks.finishModules.tap('LocalReviewBoundary',modules=>{for(const m of modules){const id=m.identifier().replaceAll('\\','/');if(/@theatre[+/]studio|\/src\/dev\//.test(id))throw Error('Authoring module in review build');}});
  });}});
  return config;
 }
};
