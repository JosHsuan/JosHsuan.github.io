import assert from 'node:assert/strict';

const ORIGIN='https://joshsuan.github.io';
const decode=value=>value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi,(_,entity)=>{
 if(entity[0]==='#')return String.fromCodePoint(entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):Number(entity.slice(1)));
 return {amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'}[entity.toLowerCase()];
});
function head(html){
 // RSC/script payloads, comments and CSS are not native document metadata.
 const document=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const heads=[...document.matchAll(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/gi)];
 assert.equal(heads.length,1,'One actual exported head');
 const content=heads[0][1],tags=[];
 for(const match of content.matchAll(/<(meta|link)\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi)){
  const attributes={};
  for(const attr of match[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)){
   const name=attr[1].toLowerCase();assert(!(name in attributes),'No duplicate head attribute: '+name);attributes[name]=decode(attr[2]??attr[3]??attr[4]);
  }
  tags.push({tag:match[1].toLowerCase(),...attributes});
 }
 return {content,tags};
}
export function assertShareMetadataHtml(html,expected){
 const {content,tags}=head(html),{route,title,description,image}=expected;
 const one=(items,label)=>{assert.equal(items.length,1,`${route}: exactly one ${label}`);return items[0];};
 const meta=(key,value)=>assert.equal(one(tags.filter(tag=>tag.tag==='meta'&&(tag.name===key||tag.property===key)),key).content,String(value),`${route}: ${key}`);
 const titles=[...content.matchAll(/<title\b[^>]*>([^<]*)<\/title\s*>/gi)];assert.equal(decode(one(titles,'title')[1]),title);
 assert.equal(one(tags.filter(tag=>tag.tag==='link'&&tag.rel==='canonical'),'canonical').href,new URL(route,ORIGIN).href);
 meta('description',description);meta('og:type','website');meta('og:title',title);meta('og:description',description);meta('og:url',new URL(route,ORIGIN).href);
 meta('twitter:card',image?'summary_large_image':'summary');meta('twitter:title',title);meta('twitter:description',description);
 if(image){
  meta('og:image',new URL(image.src,ORIGIN).href);meta('og:image:type','image/webp');meta('og:image:width',image.width);meta('og:image:height',image.height);meta('og:image:alt',image.alt);
  meta('twitter:image',new URL(image.src,ORIGIN).href);meta('twitter:image:alt',image.alt);
 }else assert(!tags.some(tag=>/^(?:og:image|twitter:image)(?::|$)/.test(tag.property??tag.name??'')),`${route}: ordinary page must not inherit project imagery`);
}
export function assertNotFoundMetadataHtml(html){
 const {tags}=head(html),robots=tags.filter(tag=>tag.tag==='meta'&&tag.name==='robots');
 assert(robots.some(tag=>tag.content?.split(/\s*,\s*/).includes('noindex')),'Exported 404 retains native noindex');
 assert(!tags.some(tag=>/^(?:og:image|twitter:image)(?::|$)/.test(tag.property??tag.name??'')),'404 must not inherit project imagery');
}

/** Social previews may reuse a source that is deliberately absent from reading content. */
export function assertNoNativeBodySource(html,source){
 const document=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/gi,'');
 const bodies=[...document.matchAll(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/gi)];
 assert.equal(bodies.length,1,'One actual exported native body');
 assert(!decode(bodies[0][1]).includes(source),'Removed opening photograph must remain absent from native body: '+source);
}
