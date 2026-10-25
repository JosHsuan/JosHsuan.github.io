/** Isolated estimated-depth diagnostic. No application integration or frame clock. */
let activeOwner=null,sequence=0;
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
const vertex=`#version 300 es
in vec2 position;
out vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment=`#version 300 es
precision highp float;
uniform sampler2D photo;
uniform sampler2D depthMap;
uniform vec2 sourceSize;
uniform vec2 pose;
in vec2 uv;
out vec4 color;
void main(){
 vec2 sourceUV=vec2(uv.x,1.-uv.y);
 float d=texture(depthMap,sourceUV).r;
 vec2 border=min(sourceUV,1.-sourceUV)*sourceSize;
 float edge=smoothstep(0.,24.,min(border.x,border.y));
 vec2 offset=pose*vec2(6.,3.)/sourceSize*d*edge;
 color=texture(photo,clamp(sourceUV+offset,vec2(0.),vec2(1.)));
}`;
export async function initPhotoDepthPreview({host,imageUrl='/assets/projects/project-caschlatsch/portfolio-xr-workshop.webp',depthUrl='/photo-depth/depth.bin',provenanceUrl='/photo-depth/provenance.json'}={}){
 if(!host?.isConnected)throw new Error('Connected fixture host required');
 activeOwner?.dispose(); const generation=++sequence;
 const doc=host.ownerDocument,win=doc.defaultView,cleanups=[],resources=[],abort=new AbortController();
 let gl=null,program=null,disposed=false,ready=false,failed=null,draws=0,staticMode=false,lastKey=null,lastEvent='initial',provenance=null,depth=null;
 let pose={x:0,y:0},pointer={x:0,y:0},scrollY=0; const originY=win.scrollY;
 const media=win.matchMedia('(prefers-reduced-motion: reduce)'),forced=win.matchMedia('(forced-colors: active)');
 const root=doc.createElement('section');root.dataset.photoDepthPreview='';root.style.cssText='max-width:662px;margin:0 auto;color:inherit;font:inherit';
 const stage=doc.createElement('div');stage.dataset.depthStage='';stage.style.cssText='position:relative;width:100%;aspect-ratio:662/373;overflow:hidden';
 const img=doc.createElement('img');img.dataset.depthOriginal='';img.alt='Original Caschlatsch workshop photograph showing participants assembling a timber frame.';img.width=662;img.height=373;img.src=imageUrl;img.style.cssText='display:block;width:100%;height:100%;object-fit:contain';
 const canvas=doc.createElement('canvas');canvas.dataset.depthCanvas='';canvas.width=662;canvas.height=373;canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none';
 stage.append(img,canvas);const caption=doc.createElement('p');caption.textContent='Estimated relative-depth preview — illustrative, not measured geometry. Move the pointer or scroll; compare with the unchanged original.';
 const label=doc.createElement('label'),toggle=doc.createElement('input');toggle.type='checkbox';toggle.dataset.depthStatic='';label.append(toggle,doc.createTextNode(' Static original'));
 const resetButton=doc.createElement('button');resetButton.type='button';resetButton.dataset.depthReset='';resetButton.textContent='Reset depth pose';resetButton.style.cssText='margin-left:12px;min-height:44px';
 const status=doc.createElement('p');status.dataset.depthStatus='';status.setAttribute('role','status');status.textContent='Loading diagnostic; original photograph remains available.';
 root.append(stage,caption,label,resetButton,status);host.append(root);
 const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);cleanups.push(()=>target.removeEventListener(type,fn,options));};
 const policy=()=>({hidden:doc.hidden,reduced:media.matches,saveData:win.navigator.connection?.saveData===true,forced:forced.matches,static:staticMode});
 const bounds=node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,right:r.right,bottom:r.bottom,left:r.left};};
 const visible=()=>{const r=stage.getBoundingClientRect();return stage.isConnected&&r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<win.innerHeight&&r.left<win.innerWidth;};
 const blocked=()=>{const p=policy();return p.hidden||p.reduced||p.saveData||p.forced||p.static;};
 const fail=reason=>{if(disposed)return;failed=String(reason).slice(0,240);canvas.style.display='none';status.textContent='Depth preview unavailable; unchanged original shown.';};
 const setPose=value=>{pose={x:clamp(Number.isFinite(value?.x)?value.x:0,-1,1),y:clamp(Number.isFinite(value?.y)?value.y:0,-1,1)};render();};
 function render(){
  if(disposed||failed||!ready)return;
  if(!gl){canvas.style.display='none';status.textContent='Unchanged original shown; this acquisition started with a static policy.';return;}
  if(blocked()){canvas.style.display='none';status.textContent='Unchanged original shown; depth rendering inactive.';return;}
  if(!visible())return;
  const key=`${pose.x}:${pose.y}`;
  if(key!==lastKey){
   try{gl.useProgram(program);gl.uniform2f(gl.getUniformLocation(program,'pose'),pose.x,pose.y);gl.drawArrays(gl.TRIANGLES,0,6);const error=gl.getError();if(error!==gl.NO_ERROR)throw new Error(`WebGL draw error ${error}`);draws++;lastKey=key;}catch(error){fail(error.message);return;}
  }
  canvas.style.display='block';status.textContent='Estimated depth active; original RGB texture unchanged.';
 }
 const sample=(x,y)=>{
  if(!depth)return null; const u=clamp(x,0,1),v=clamp(y,0,1),px=u*662-.5,py=v*373-.5,x0=Math.floor(px),y0=Math.floor(py),fx=px-x0,fy=py-y0;
  const at=(a,b)=>depth[clamp(b,0,372)*662+clamp(a,0,661)]/255;
  const d=(at(x0,y0)*(1-fx)+at(x0+1,y0)*fx)*(1-fy)+(at(x0,y0+1)*(1-fx)+at(x0+1,y0+1)*fx)*fy;
  const t=clamp(Math.min(u*662,(1-u)*662,v*373,(1-v)*373)/24,0,1),edge=t*t*(3-2*t);
  return{uv:{x:u,y:v},depth:d,edge,offsetSourcePixels:{x:pose.x*6*d*edge,y:pose.y*3*d*edge}};
 };
 const handle={setPose,reset(){lastEvent='reset';pointer={x:0,y:0};scrollY=0;setPose({x:0,y:0});},setStatic(value){staticMode=!!value;toggle.checked=staticMode;lastEvent='static-toggle';lastKey=null;render();},inspect(){return{generation,ready,disposed,state:failed?'fallback':blocked()||ready&&!gl?'static':ready?'ready':'loading',failure:failed,pose:{...pose},pointer:{...pointer},scrollContribution:scrollY,originScrollY:originY,currentScrollY:win.scrollY,lastEvent,draws,policy:policy(),visible:visible(),source:provenance?.source??null,depth:provenance?.depth??null,bounds:{stage:bounds(stage),image:bounds(img),canvas:bounds(canvas)},canvasVisible:canvas.style.display!=='none',originalComplete:img.complete&&img.naturalWidth===662&&img.naturalHeight===373,renderer:gl?{context:'webgl2',width:canvas.width,height:canvas.height,version:gl.getParameter(gl.VERSION),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE),contextLost:gl.isContextLost(),toneMapping:false,colorFilter:false}:null,displacement:{maxSourcePixelsX:6,maxSourcePixelsY:3,edgeTaperSourcePixels:24},sampleProbes:{foreground:sample(38/662,205/373),background:sample(370/662,190/373),border:sample(0,0)}};},dispose(){if(disposed)return;disposed=true;abort.abort();for(const clear of cleanups)clear();if(gl){for(const [type,value] of resources){if(type==='shader')gl.deleteShader(value);if(type==='texture')gl.deleteTexture(value);if(type==='buffer')gl.deleteBuffer(value);}if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}root.remove();if(activeOwner===handle)activeOwner=null;}};
 activeOwner=handle;
 const current=()=>!disposed&&generation===sequence;
 listen(win,'pagehide',()=>handle.dispose());
 listen(canvas,'webglcontextlost',event=>{event.preventDefault();fail('context-lost');});
 listen(stage,'pointermove',event=>{if(event.pointerType==='touch'||blocked())return;const r=stage.getBoundingClientRect();pointer={x:clamp((event.clientX-r.left)/r.width*2-1,-1,1),y:clamp((event.clientY-r.top)/r.height*2-1,-1,1)};lastEvent='pointermove';setPose({x:pointer.x,y:clamp(pointer.y+scrollY,-1,1)});});
 listen(stage,'pointerleave',()=>{pointer={x:0,y:0};lastEvent='pointerleave';setPose({x:0,y:scrollY});});
 listen(win,'scroll',()=>{scrollY=clamp((win.scrollY-originY)/Math.max(1,win.innerHeight*.5),-1,1);lastEvent='scroll';setPose({x:pointer.x,y:clamp(pointer.y+scrollY,-1,1)});},{passive:true});
 listen(win,'resize',()=>{lastEvent='resize';lastKey=null;render();});
 const updatePolicy=()=>{lastEvent='policy';lastKey=null;render();};listen(doc,'visibilitychange',updatePolicy);listen(media,'change',updatePolicy);listen(forced,'change',updatePolicy);if(win.navigator.connection)listen(win.navigator.connection,'change',updatePolicy);
 listen(toggle,'change',()=>handle.setStatic(toggle.checked));listen(resetButton,'click',()=>handle.reset());
 try{
  const response=await fetch(provenanceUrl,{signal:abort.signal});if(!current())return handle;if(!response.ok)throw new Error('Provenance unavailable');provenance=await response.json();if(!current())return handle;
  const [photoResponse,depthResponse]=await Promise.all([fetch(imageUrl,{signal:abort.signal}),fetch(depthUrl,{signal:abort.signal})]);if(!current())return handle;if(!photoResponse.ok||!depthResponse.ok)throw new Error('Original/depth unavailable');
  const [photoBytes,depthBytes]=await Promise.all([photoResponse.arrayBuffer(),depthResponse.arrayBuffer()]);if(!current())return handle;
  const photoDigest=await digest(photoBytes);if(!current())return handle;const depthDigest=await digest(depthBytes);if(!current())return handle;
  if(photoDigest!==provenance.source.sha256||depthDigest!==provenance.depth.sha256)throw new Error('Source/depth integrity mismatch');
  if(depthBytes.byteLength!==662*373||provenance.source.width!==662||provenance.source.height!==373||provenance.depth.format!=='uint8-row-major-top-left')throw new Error('Unsupported fixture data');
  await img.decode();if(!current())return handle;if(img.naturalWidth!==662||img.naturalHeight!==373)throw new Error('Original dimensions mismatch');
  if(disposed||generation!==sequence)return handle;
  depth=new Uint8Array(depthBytes);
  if(policy().reduced||policy().saveData||policy().forced){ready=true;render();return handle;}
  gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false});if(!gl)throw new Error('WebGL2 unavailable');
  const compile=(type,source)=>{const shader=gl.createShader(type);resources.push(['shader',shader]);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const buffer=gl.createBuffer();resources.push(['buffer',buffer]);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  for(let unit=0;unit<2;unit++){
   const texture=gl.createTexture();resources.push(['texture',texture]);gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   if(unit===0)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);else gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,662,373,0,gl.RED,gl.UNSIGNED_BYTE,depth);
   gl.uniform1i(gl.getUniformLocation(program,unit===0?'photo':'depthMap'),unit);
  }
  gl.uniform2f(gl.getUniformLocation(program,'sourceSize'),662,373);gl.viewport(0,0,662,373);ready=true;render();
 }catch(error){fail(error.message);}
 return handle;
}
