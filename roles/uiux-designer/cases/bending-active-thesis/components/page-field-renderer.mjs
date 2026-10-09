// Independent decorative page plane. The caller supplies the existing chapter
// clock; this module owns no RAF, timer, React state, WebGL context or scene data.
// Source-radiance/depth glyphs remain in scene-compositor.mjs.
export const PAGE_FIELD_LIMITS=Object.freeze({pixels:900_000,maxDimension:4096,cells:12_000,fps:30,atlasCell:24,densityBins:16});
const clamp=(n,lo=0,hi=1)=>Math.max(lo,Math.min(hi,Number.isFinite(n)?n:lo));
const smooth=(lo,hi,n)=>{const t=clamp((n-lo)/(hi-lo));return t*t*(3-2*t);};
const stroke=(distance,thickness)=>1-smooth(thickness,thickness+.045,distance);

// The original shader's analytic . : - + * # @; no font substitution or asset.
export function pageFieldGlyph(x,y,level) {
  if(level===0)return stroke(Math.hypot(x,y+.22),.075);
  if(level===1)return Math.max(stroke(Math.hypot(x,y+.2),.075),stroke(Math.hypot(x,y-.2),.075));
  const h=stroke(Math.abs(y),.045)*(Math.abs(x)<=.34),v=stroke(Math.abs(x),.045)*(Math.abs(y)<=.36);
  if(level===2)return h;
  if(level===3)return Math.max(h,v);
  if(level===4)return Math.max(h,v,Math.max(stroke(Math.abs(x-y)*.707,.035),stroke(Math.abs(x+y)*.707,.035))*(Math.hypot(x,y)<=.42));
  if(level===5)return Math.max(stroke(Math.abs(Math.abs(x)-.16),.04)*(Math.abs(y)<=.36),stroke(Math.abs(Math.abs(y)-.15),.04)*(Math.abs(x)<=.34));
  return Math.max(stroke(Math.abs(Math.hypot(x,y)-.29),.05),stroke(Math.hypot(x,y),.12),stroke(Math.abs(y+.14),.045)*(x>=0&&x<=.34));
}

export function resolvePageFieldBudget(width,height,cellPx=11,{pixels=PAGE_FIELD_LIMITS.pixels,cells=PAGE_FIELD_LIMITS.cells}={}) {
  if(![width,height].every(n=>Number.isFinite(n)&&n>0)||![pixels,cells].every(n=>Number.isFinite(n)&&n>=1))throw new RangeError('Positive page field dimensions and budgets required');
  const dpr=Math.min(1,Math.sqrt(pixels/(width*height)),PAGE_FIELD_LIMITS.maxDimension/Math.max(width,height));
  let cell=Math.max(6,Number.isFinite(cellPx)?cellPx:11,Math.sqrt(width*height/cells));
  let columns=Math.ceil(width/cell),rows=Math.ceil(height/cell);
  // Ceil at the viewport edges counts real work, including partial cells.
  while(columns*rows>cells){cell*=1.01;columns=Math.ceil(width/cell);rows=Math.ceil(height/cell);}
  return {width:Math.max(1,Math.floor(width*dpr)),height:Math.max(1,Math.floor(height*dpr)),dpr,cellPx:cell,columns,rows,cells:columns*rows};
}

// Display-ready copper approved against the Round08 rendered field. This
// independent overlay has no scene-depth attenuation; restrained gain keeps
// metal folds and original vertex colours readable under it.
export const PAGE_FIELD_INK=Object.freeze([224,123,59]);
export const PAGE_FIELD_GAIN=.65;

export function createPageFieldRenderer(canvas,{createCanvas=()=>document.createElement('canvas'),pixelBudget=PAGE_FIELD_LIMITS.pixels,maxCells=PAGE_FIELD_LIMITS.cells,maxFps=PAGE_FIELD_LIMITS.fps}={}) {
  if(![pixelBudget,maxCells].every(n=>Number.isFinite(n)&&n>=1)||!Number.isFinite(maxFps)||maxFps<=0)throw new RangeError('Positive page field limits required');
  if(!canvas||typeof canvas.getContext!=='function')throw new TypeError('Page field canvas required');
  let context=null,initialError=null;
  try{context=canvas.getContext('2d',{alpha:true});}catch(error){initialError=error;}
  let atlas=null,atlasContext=null,atlasTint='',lastFrameTimeMs=null,lastSignature='',empty=true,disposed=false,lost=false;
  const report={ready:!!context,draws:0,allocations:0,atlasBuilds:0,pixels:0,pixelBudget,maxCells,maxFps,cells:0,drawnGlyphs:0,fieldTime:0,width:0,height:0,cssWidth:0,cssHeight:0,skipReason:initialError?'failed':'initial',contextLost:false,failed:!!initialError,failureReason:initialError?.message??null};
  const onLost=event=>{event.preventDefault?.();lost=true;report.contextLost=true;report.ready=false;};
  const onRestored=()=>{if(report.failed)return;lost=false;report.contextLost=false;report.ready=!!context;lastSignature='';lastFrameTimeMs=null;atlasTint='';};
  canvas.addEventListener?.('contextlost',onLost);canvas.addEventListener?.('contextrestored',onRestored);
  function buildAtlas(tint) {
    const key=tint.join(',');if(atlas && key===atlasTint)return;
    if(!atlas){atlas=createCanvas();atlas.width=PAGE_FIELD_LIMITS.atlasCell*7;atlas.height=PAGE_FIELD_LIMITS.atlasCell*PAGE_FIELD_LIMITS.densityBins;atlasContext=atlas.getContext('2d',{alpha:true});}
    if(!atlasContext)throw new Error('Page field atlas unavailable');
    const size=PAGE_FIELD_LIMITS.atlasCell,bins=PAGE_FIELD_LIMITS.densityBins,pixels=atlasContext.createImageData(atlas.width,atlas.height);
    for(let bin=0;bin<bins;bin++){
      const gain=.55+.45*bin/(bins-1),rgb=PAGE_FIELD_INK.map(c=>Math.round(c*gain));
      for(let level=0;level<7;level++)for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const offset=((bin*size+y)*atlas.width+level*size+x)*4;
        pixels.data[offset]=rgb[0];pixels.data[offset+1]=rgb[1];pixels.data[offset+2]=rgb[2];
        pixels.data[offset+3]=Math.round(255*pageFieldGlyph((x+.5)/size-.5,.5-(y+.5)/size,level));
      }
    }
    atlasContext.putImageData(pixels,0,0);atlasTint=key;report.atlasBuilds++;
  }
  function clear(reason) {
    if(context&&!empty&&!lost){context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,canvas.width,canvas.height);empty=true;}
    report.skipReason=reason;report.drawnGlyphs=0;
  }
  const inspect=()=>({...report,disposed,atlasPixels:atlas?atlas.width*atlas.height:0});
  const releaseStorage=()=>{
    // Even cleanup must not throw back into the only reading controller when
    // the optional layer has exhausted or lost its backing storage.
    try{canvas.width=1;canvas.height=1;}catch{/* Browser owns a failed backing. */}
    try{if(atlas){atlas.width=1;atlas.height=1;}}catch{/* Best-effort disposal. */}
    atlas=null;atlasContext=null;
  };
  const disable=error=>{
    report.failed=true;report.ready=false;report.failureReason=String(error?.message??error);report.skipReason='failed';report.drawnGlyphs=0;
    releaseStorage();empty=true;
  };
  return {
    render(state,width,height) {
      if(disposed||report.failed||!context||lost){report.skipReason=disposed?'disposed':report.failed?'failed':lost?'context-lost':'unavailable';return inspect();}
      // The existing RAF owner supplies its monotonic timestamp. Story time can
      // be boosted by wheel/touch input, so it cannot enforce a real work limit.
      // Keep invalid caller input distinct from an optional Canvas failure.
      const frameTimeMs=state?.frameTimeMs;
      if(!Number.isFinite(frameTimeMs)||frameTimeMs<0)throw new RangeError('Existing controller frameTimeMs required');
      try{
      const field=state?.field??state?.chapterScene?.field;
      if(state?.systemReduced||state?.reducedMotion||!field||!(field.fieldWeight>0)){clear('disabled');lastFrameTimeMs=null;lastSignature='';return inspect();}
      if(state.hidden||state.paused){report.skipReason=state.hidden?'hidden':'paused';return inspect();}
      if(![width,height].every(n=>Number.isFinite(n)&&n>0)){clear('invalid-size');return inspect();}
      const time=Math.max(0,Number.isFinite(field.fieldTime)?field.fieldTime:0);
      const tint=Array.isArray(field.asciiTint)&&field.asciiTint.length===3?field.asciiTint:[.64,.29,.105];
      const envelope=field.fieldEnvelope??[.65,.5,.5,.62],flow=field.fieldFlow??[.035,-.018],pointer=field.fieldPointerUv??[.5,.5];
      const weight=clamp(field.fieldWeight)*PAGE_FIELD_GAIN,strength=clamp(field.fieldPointerStrength);
      // Animation samples fieldTime; delivery uses the caller's existing frame
      // timestamp. A genuine viewport resize can refresh a stationary frame.
      const signature=[width,height,field.asciiCellPx,weight,...tint,...envelope,...flow,...pointer,strength].join(',');
      if(lastSignature && report.cssWidth===width && report.cssHeight===height && lastFrameTimeMs!==null && frameTimeMs>=lastFrameTimeMs && frameTimeMs-lastFrameTimeMs+1e-5<1000/maxFps){report.skipReason='controller-frame-cadence';return inspect();}
      const budget=resolvePageFieldBudget(width,height,field.asciiCellPx,{pixels:pixelBudget,cells:maxCells});
      if(canvas.width!==budget.width||canvas.height!==budget.height){
        // Native setters allocate sequentially; never pair a new wide width with
        // a stale tall height above the policy during orientation changes.
        if(budget.width*canvas.height>pixelBudget)canvas.height=Math.max(1,Math.floor(pixelBudget/Math.max(canvas.width,budget.width)));
        if(canvas.width!==budget.width)canvas.width=budget.width;
        if(canvas.height!==budget.height)canvas.height=budget.height;
        report.allocations++;
      }
      buildAtlas(tint);
      context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,canvas.width,canvas.height);
      context.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
      context.globalCompositeOperation='source-over';context.imageSmoothingEnabled=true;
      const cell=budget.cellPx,ex=Math.max(.05,envelope[2]),ey=Math.max(.05,envelope[3]);
      const driftX=.28*Math.sin(time*.19),driftY=.65*Math.sin(time*.13),aspect=width/height;
      const size=PAGE_FIELD_LIMITS.atlasCell,bins=PAGE_FIELD_LIMITS.densityBins;
      let drawn=0;
      for(let row=0;row<budget.rows;row++)for(let column=0;column<budget.columns;column++){
        // Shader UVs are bottom-up; page CSS coordinates are top-down.
        const u=clamp((column+.5)*cell/width),v=clamp(1-(row+.5)*cell/height);
        const baseX=(u-envelope[0])/ex,baseY=(v-envelope[1])/ey;
        const coverage=smooth(.04,.62,Math.exp(-(baseX*baseX+baseY*baseY)*1.6)+.6*Math.exp(-((baseX-driftY)**2+(baseY-.52)**2)*2.7));
        if(coverage*weight<.004)continue;
        const px=(u-pointer[0])*aspect,py=v-pointer[1],influence=Math.exp(-(px*px+py*py)*38)*strength*2.8;
        const qx=baseX-py*influence+flow[0]*time,qy=baseY+px*influence+flow[1]*time;
        const ribbon=Math.sin(qx*5.1+Math.sin(qy*2.2-time*.28)*1.3+time*.43),contour=Math.cos(Math.hypot(qx+driftX,qy)*7.8-time*.55);
        const density=clamp(.5+.29*ribbon+.21*contour),alpha=weight*coverage*smooth(.18,.46,density);
        if(alpha<.004)continue;
        const level=Math.min(6,Math.floor(density*7)),bin=Math.round(density*(bins-1));
        context.globalAlpha=alpha;
        context.drawImage(atlas,level*size,bin*size,size,size,column*cell,row*cell,cell,cell);drawn++;
      }
      context.globalAlpha=1;empty=drawn===0;lastFrameTimeMs=frameTimeMs;lastSignature=signature;
      Object.assign(report,{draws:report.draws+1,pixels:canvas.width*canvas.height,cells:budget.cells,drawnGlyphs:drawn,fieldTime:time,frameTimeMs,width:canvas.width,height:canvas.height,cssWidth:width,cssHeight:height,skipReason:null});
      return inspect();
      }catch(error){disable(error);return inspect();}
    },
    inspect,
    dispose() {
      if(disposed)return;try{clear('disposed');}catch{/* Optional canvas cleanup cannot strand the page. */}disposed=true;report.ready=false;
      canvas.removeEventListener?.('contextlost',onLost);canvas.removeEventListener?.('contextrestored',onRestored);
      // Release both 2D backing stores; the caller owns detaching the page node.
      releaseStorage();
    },
  };
}
