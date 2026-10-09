import * as T from 'three';

const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

const vertex = /* glsl */`varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
// Two small separable gathers. The first extracts real scene radiance; the second
// spreads that extracted light. No CSS filter, full-frame gray lift or time input.
const mistFragment = /* glsl */`
uniform sampler2D sourceColor;
uniform vec2 stepUv;
uniform float threshold;
uniform float prefilter;
varying vec2 vUv;
vec3 extractLight(vec2 uv){
  vec4 sampleColor=texture2D(sourceColor,clamp(uv,vec2(0.0),vec2(1.0)));
  vec3 radiance=sampleColor.rgb;
  if(prefilter>0.5){
    float luminance=max(0.0,dot(radiance,vec3(0.2126,0.7152,0.0722)));
    float soft=smoothstep(threshold*0.55,threshold*1.35,luminance);
    radiance*=sampleColor.a*soft;
  }
  return radiance;
}
void main(){
  vec3 spread=extractLight(vUv)*0.227027027;
  spread+=(extractLight(vUv+stepUv)+extractLight(vUv-stepUv))*0.194594595;
  spread+=(extractLight(vUv+stepUv*2.0)+extractLight(vUv-stepUv*2.0))*0.121621622;
  spread+=(extractLight(vUv+stepUv*3.0)+extractLight(vUv-stepUv*3.0))*0.054054054;
  spread+=(extractLight(vUv+stepUv*4.0)+extractLight(vUv-stepUv*4.0))*0.016216216;
  gl_FragColor=vec4(spread,1.0);
}`;
const fragment = /* glsl */`
uniform sampler2D sceneColor;
uniform sampler2D sceneDepth;
uniform sampler2D mistColor;
uniform float mistStrength;
uniform vec2 resolution;
uniform vec2 cssResolution;
uniform float nearPlane;
uniform float farPlane;
uniform float focusDistance;
uniform float aperture;
uniform float maxBlur;
uniform float asciiWeight;
uniform float cellPx;
uniform vec3 asciiTint;
uniform float blendMode;
uniform float veil;
uniform float fieldTime;
uniform float fieldWeight;
uniform float fieldSceneMix;
uniform float fieldSurfaceGain;
uniform float fieldSourceOnly;
uniform vec2 fieldFlow;
uniform vec4 fieldEnvelope;
uniform vec2 fieldPointer;
uniform float fieldPointerStrength;
uniform vec4 fieldBlendMix;
uniform sampler2D cellData;
uniform vec2 cellResolution;
uniform vec2 fieldDrift;
varying vec2 vUv;

float viewDepth(float z){return nearPlane*farPlane/(farPlane-z*(farPlane-nearPlane));}
float stroke(float distance,float thickness){return 1.0-smoothstep(thickness,thickness+0.045,distance);}
float glyph(vec2 p,float level){
  // Original analytic strokes for . : - + * # @, derived from scene luminance.
  if(level<0.5)return stroke(length(p-vec2(0.0,-0.22)),0.075);
  if(level<1.5)return max(stroke(length(p-vec2(0.0,-0.2)),0.075),stroke(length(p-vec2(0.0,0.2)),0.075));
  float h=stroke(abs(p.y),0.045)*step(abs(p.x),0.34);
  float v=stroke(abs(p.x),0.045)*step(abs(p.y),0.36);
  if(level<2.5)return h;
  if(level<3.5)return max(h,v);
  float diagonal=max(stroke(abs(p.x-p.y)*0.707,0.035),stroke(abs(p.x+p.y)*0.707,0.035))*step(length(p),0.42);
  if(level<4.5)return max(max(h,v),diagonal);
  if(level<5.5)return max(stroke(abs(abs(p.x)-0.16),0.04)*step(abs(p.y),0.36),stroke(abs(abs(p.y)-0.15),0.04)*step(abs(p.x),0.34));
  return max(stroke(abs(length(p)-0.29),0.05),max(stroke(length(p),0.12),stroke(abs(p.y+0.14),0.045)*step(0.0,p.x)*step(p.x,0.34)));
}
vec3 softLight(vec3 backdrop,vec3 source){
  vec3 d=mix(((16.0*backdrop-12.0)*backdrop+4.0)*backdrop,sqrt(max(backdrop,vec3(0.0))),step(vec3(0.25),backdrop));
  return mix(backdrop-(1.0-2.0*source)*backdrop*(1.0-backdrop),backdrop+(2.0*source-1.0)*(d-backdrop),step(vec3(0.5),source));
}
float fieldCoverage(vec2 uv){
  vec2 q=(uv-fieldEnvelope.xy)/max(fieldEnvelope.zw,vec2(0.05));
  // Soft overlapping lobes avoid a square video frame or a cutout at mesh depth.
  float a=exp(-dot(q,q)*1.6);
  vec2 second=q-vec2(fieldDrift.y,0.52);
  float b=exp(-dot(second,second)*2.7)*0.6;
  return smoothstep(0.04,0.62,a+b);
}
void main(){
  vec4 base=texture2D(sceneColor,vUv);
  float rawSceneDepth=texture2D(sceneDepth,vUv).r;
  float depth=viewDepth(rawSceneDepth);
  float radius=min(maxBlur,abs(depth-focusDistance)/max(depth,nearPlane)*aperture);
  vec3 color=base.rgb;
  float alpha=base.a;
  // Keep the gather even on a depth-clear background: resolved MSAA fringe
  // texels may share that depth and contribute the authored silhouette diffusion.
  if(radius>0.08 && base.a>0.001){
    vec3 premult=base.rgb*base.a;
    float alphaSum=base.a;
    float weights=1.0;
    for(int i=0;i<16;i++){
      float fi=float(i);
      float angle=fi*2.39996323;
      float ring=sqrt((fi+0.5)/16.0);
      vec2 uv=clamp(vUv+vec2(cos(angle),sin(angle))*ring*radius/resolution,vec2(0.0),vec2(1.0));
      vec4 sampleColor=texture2D(sceneColor,uv);
      float sampleDepth=viewDepth(texture2D(sceneDepth,uv).r);
      // Suppress cross-silhouette color leaking; remains a single-depth approximation.
      float weight=exp(-abs(sampleDepth-depth)/max(depth*0.065,0.015));
      premult+=sampleColor.rgb*sampleColor.a*weight;
      alphaSum+=sampleColor.a*weight;
      weights+=weight;
    }
    color=premult/max(alphaSum,0.00001);
    alpha=alphaSum/weights;
  }
  if(mistStrength>0.0001){
    vec3 spread=texture2D(mistColor,vUv).rgb;
    float strength=mistStrength;
    // Small direct attenuation plus redistributed highlight energy. Clear corners
    // stay transparent; only actual light within the finite kernel grows a halo.
    float haloAlpha=clamp(dot(spread,vec3(0.2126,0.7152,0.0722))*strength*0.35,0.0,0.38);
    float expandedAlpha=alpha+(1.0-alpha)*haloAlpha;
    color=(color*alpha*(1.0-strength*0.055)+spread*strength)/max(expandedAlpha,0.00001);
    alpha=expandedAlpha;
  }
  color*=1.0-veil;
  vec2 cell=floor(vUv*cssResolution/cellPx);
  vec4 cellSample=vec4(0.0);
  if(asciiWeight>0.0001 || fieldWeight>0.0001)cellSample=texture2D(cellData,(cell+0.5)/cellResolution);
  if(asciiWeight>0.0001){
    float glyphMask=glyph(fract(vUv*cssResolution/cellPx)-0.5,cellSample.r);
    float weight=asciiWeight*glyphMask*cellSample.g;
    vec3 mixed=blendMode<0.5?asciiTint:color+(1.0-clamp(color,0.0,1.0))*asciiTint;
    color=mix(color,mixed,weight);
  }
  if(fieldWeight>0.0001){
    vec2 grid=vUv*cssResolution/cellPx;
    float density=cellSample.a;
    float ink=glyph(fract(grid)-0.5,cellSample.b);
    float grainPresence=smoothstep(0.18,0.46,density);
    // Keep the independent field in clear background. Quiet it over actual
    // depth-bearing surfaces so source metal/colours remain the primary signal.
    // This is scene coverage (including the floor), not a fabricated object ID.
    float surfaceLuminance=max(0.0,dot(base.rgb,vec3(0.2126,0.7152,0.0722)));
    float surfaceCoverage=step(rawSceneDepth,0.999999)*base.a*smoothstep(0.015,0.10,surfaceLuminance);
    // A separate page field may own independent contour pixels. In that mode this
    // pass adds only radiance-derived glyphs on actual scene coverage; it never
    // paints an independent contour into the transparent presentation surface.
    float coverageGain=fieldSourceOnly>0.5?surfaceCoverage*fieldSurfaceGain:mix(1.0,fieldSurfaceGain,surfaceCoverage);
    float layerAlpha=fieldWeight*ink*grainPresence*fieldCoverage(vUv)*coverageGain;
    vec3 sourceInk=asciiTint*(0.55+0.45*density);
    vec3 boundedColor=clamp(color,0.0,1.0);
    vec3 screenBlend=boundedColor+(1.0-boundedColor)*sourceInk;
    vec3 blended=sourceInk*fieldBlendMix.x+(boundedColor*sourceInk)*fieldBlendMix.y+screenBlend*fieldBlendMix.z+softLight(boundedColor,sourceInk)*fieldBlendMix.w;
    // W3C source-over alpha with backdrop-aware blending. The field remains
    // visible over transparent scene pixels; straight color is premultiplied once.
    vec3 inkWithBackdrop=mix(sourceInk,blended,alpha);
    float combinedAlpha=layerAlpha+alpha*(1.0-layerAlpha);
    color=(inkWithBackdrop*layerAlpha+color*alpha*(1.0-layerAlpha))/max(combinedAlpha,0.00001);
    alpha=combinedAlpha;
  }
  gl_FragColor=vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <premultiplied_alpha_fragment>
}`;

// One radiance/depth/contour sample per CSS glyph cell. Integer glyph levels
// survive the half-float target exactly; only smooth density is quantized.
const cellFragment = /* glsl */`
uniform sampler2D sceneColor;
uniform sampler2D sceneDepth;
uniform vec2 cssResolution;
uniform float cellPx;
uniform float fieldTime;
uniform float fieldSceneMix;
uniform float fieldSourceOnly;
uniform vec2 fieldFlow;
uniform vec4 fieldEnvelope;
uniform vec2 fieldPointer;
uniform float fieldPointerStrength;
uniform vec2 fieldDrift;
float evolvingField(vec2 uv){
  // Two coherent moving contour families; no per-frame random seed or noise.
  vec2 q=(uv-fieldEnvelope.xy)/max(fieldEnvelope.zw,vec2(0.05));
  vec2 pointerDelta=(uv-fieldPointer)*vec2(cssResolution.x/cssResolution.y,1.0);
  float influence=exp(-dot(pointerDelta,pointerDelta)*38.0)*fieldPointerStrength;
  q+=vec2(-pointerDelta.y,pointerDelta.x)*influence*2.8;
  q+=fieldFlow*fieldTime;
  float ribbon=sin(q.x*5.1+sin(q.y*2.2-fieldTime*0.28)*1.3+fieldTime*0.43);
  float contour=cos(length(q+vec2(fieldDrift.x,0.0))*7.8-fieldTime*0.55);
  return clamp(0.5+0.29*ribbon+0.21*contour,0.0,1.0);
}

void main(){
  vec2 uv=clamp(gl_FragCoord.xy*cellPx/cssResolution,vec2(0.0),vec2(1.0));
  vec4 source=texture2D(sceneColor,uv);
  float rawDepth=texture2D(sceneDepth,uv).r;
  float luminance=max(0.0,dot(source.rgb,vec3(0.2126,0.7152,0.0722)));
  float sourceDensity=pow(luminance/(1.0+luminance),0.45);
  float subject=step(rawDepth,0.999999)*source.a;
  float density=fieldSourceOnly>0.5?sourceDensity:mix(evolvingField(uv),sourceDensity,fieldSceneMix*subject);
  gl_FragColor=vec4(min(6.0,floor(sourceDensity*7.0)),subject*step(0.01,luminance),min(6.0,floor(density*7.0)),density);
}`;

export function createSceneCompositor(gl) {
  const target = new T.WebGLRenderTarget(1, 1, {type: T.HalfFloatType, depthTexture: new T.DepthTexture(1, 1, T.UnsignedIntType), samples: 0});
  target.texture.name = 'thesis-linear-color'; target.depthTexture.name = 'thesis-scene-depth';
  const mistA = new T.WebGLRenderTarget(1, 1, {type: T.HalfFloatType, depthBuffer: false});
  const mistB = new T.WebGLRenderTarget(1, 1, {type: T.HalfFloatType, depthBuffer: false});
  const cellTarget = new T.WebGLRenderTarget(1, 1, {type:T.HalfFloatType,depthBuffer:false,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
  cellTarget.texture.name='thesis-cell-radiance-contours';
  mistA.texture.name = 'thesis-mist-horizontal'; mistB.texture.name = 'thesis-mist-vertical';
  const mistUniforms = {sourceColor: {value: target.texture}, stepUv: {value: new T.Vector2()}, threshold: {value: .65}, prefilter: {value: 1}};
  const mistMaterial = new T.ShaderMaterial({uniforms: mistUniforms, vertexShader: vertex, fragmentShader: mistFragment, depthWrite: false, depthTest: false, blending: T.NoBlending, toneMapped: false});
  const uniforms = {
    sceneColor: {value: target.texture}, sceneDepth: {value: target.depthTexture}, resolution: {value: new T.Vector2(1, 1)}, cssResolution: {value: new T.Vector2(1, 1)},
    mistColor: {value: mistB.texture}, mistStrength: {value: 0},
    nearPlane: {value: .01}, farPlane: {value: 100}, focusDistance: {value: 4}, aperture: {value: 0}, maxBlur: {value: 0},
    asciiWeight: {value: 0}, cellPx: {value: 11}, asciiTint: {value: new T.Vector3(.38, .75, .69)}, blendMode: {value: 1}, veil: {value: 0},
    fieldTime: {value: 0}, fieldWeight: {value: 0}, fieldSceneMix: {value: .4}, fieldSurfaceGain: {value: .24}, fieldSourceOnly:{value:0}, fieldFlow: {value: new T.Vector2(.035, -.018)},
    fieldEnvelope: {value: new T.Vector4(.65, .5, .5, .6)}, fieldPointer: {value: new T.Vector2(.5, .5)}, fieldPointerStrength: {value: 0},
    fieldBlendMix: {value: new T.Vector4(0, 0, 1, 0)},
    cellData:{value:cellTarget.texture},cellResolution:{value:new T.Vector2(1,1)},fieldDrift:{value:new T.Vector2()},
  };
  const cellMaterial = new T.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:cellFragment,depthWrite:false,depthTest:false,blending:T.NoBlending,toneMapped:false});
  const material = new T.ShaderMaterial({uniforms, vertexShader: vertex, fragmentShader: fragment, depthWrite: false, depthTest: false, blending: T.NoBlending, premultipliedAlpha: true, toneMapped: true});
  const geometry = new T.PlaneGeometry(2, 2), quad = new T.Mesh(geometry, material), outputScene = new T.Scene(), outputCamera = new T.Camera();
  quad.frustumCulled = false; outputScene.add(quad);
  const viewport = new T.Vector4(), scissor = new T.Vector4(), clear = new T.Color();
  let frames = 0, disposed = false, report = null, checked = false, mistAllocated = false, cellAllocated = false, frameControls = {};

  return {
    // Optional caller-owned per-frame values; render score/overrides take priority.
    // No timer, frame scheduling or shader recompilation is owned here.
    setFrame(controls = {}) {if (disposed) throw new Error('Compositor already disposed.'); frameControls = {...controls};},
    render(scene, camera, score, {width, height, dpr = 1, requestedDpr = dpr, samples = 2, independentField = false}) {
      if (disposed) throw new Error('Compositor already disposed.');
      if (!(width > 0 && height > 0)) return;
      if (gl.capabilities.reversedDepthBuffer || gl.capabilities.logarithmicDepthBuffer || camera.isOrthographicCamera) throw new Error('This optical pass requires ordinary perspective depth.');
      const actualDpr = Number.isFinite(dpr) && dpr > 0 ? Math.min(dpr, 1.25) : 1, w = Math.max(1, Math.floor(width * actualDpr)), h = Math.max(1, Math.floor(height * actualDpr));
      const opticalDensityScale = actualDpr / clamp(requestedDpr, actualDpr, 1.25);
      const sampleCount = Math.min(gl.capabilities.maxSamples, samples > 0 ? 2 : 0);
      if (target.samples !== sampleCount) {target.dispose(); target.samples = sampleCount; target.resolveDepthBuffer = true; checked = false;}
      if (target.width !== w || target.height !== h) {target.setSize(w, h); checked = false;}
      const controls = {...frameControls, ...score, ...(score.overrides ?? {})};
      const mistStrength = clamp(controls.mistStrength, 0, .8), mistRadiusPx = clamp(controls.mistRadiusPx ?? 24, 4, 56);
      const mistEnabled = mistStrength > .0001;
      const mistWidth = Math.max(1, Math.ceil(w / 4)), mistHeight = Math.max(1, Math.ceil(h / 4));
      if (mistEnabled && (mistA.width !== mistWidth || mistA.height !== mistHeight)) {mistA.setSize(mistWidth, mistHeight); mistB.setSize(mistWidth, mistHeight);}
      if (!mistEnabled && mistAllocated) {mistA.setSize(1,1);mistB.setSize(1,1);mistAllocated=false;}
      uniforms.mistStrength.value = mistStrength; mistUniforms.threshold.value = clamp(controls.mistThreshold ?? .65, .05, 4);
      uniforms.resolution.value.set(w, h); uniforms.cssResolution.value.set(width, height);
      uniforms.nearPlane.value = camera.near; uniforms.farPlane.value = camera.far;
      uniforms.focusDistance.value = clamp(controls.focusDistanceM, camera.near, camera.far);
      uniforms.aperture.value = clamp(controls.apertureScale, 0, 120) * opticalDensityScale;
      uniforms.maxBlur.value = clamp(controls.maxBlurPx, 0, 12) * opticalDensityScale;
      uniforms.asciiWeight.value = clamp(controls.asciiWeight, 0, 1);
      uniforms.cellPx.value = clamp(controls.asciiCellPx, 6, 28);
      uniforms.asciiTint.value.fromArray(controls.asciiTint ?? [.38, .75, .69]);
      uniforms.blendMode.value = controls.asciiBlend === 'normal' ? 0 : 1;
      uniforms.veil.value = clamp(controls.veil, 0, .65);
      const vector = (value, fallback, count) => Array.isArray(value) && value.length === count && value.every(Number.isFinite) ? value : fallback;
      uniforms.fieldTime.value = clamp(controls.fieldTime, 0, 1000000);
      uniforms.fieldSourceOnly.value = Number(independentField);
      // The independent layer owns decorative field time and pointer flow.
      // Source response evolves through real source/camera/light changes only.
      uniforms.fieldDrift.value.set(independentField?0:.28*Math.sin(uniforms.fieldTime.value*.19),independentField?0:.65*Math.sin(uniforms.fieldTime.value*.13));
      uniforms.fieldWeight.value = clamp(controls.fieldWeight, 0, .65);
      uniforms.fieldSceneMix.value = clamp(controls.fieldSceneMix ?? .4);
      uniforms.fieldSurfaceGain.value = clamp(controls.fieldSurfaceGain ?? .24);
      uniforms.fieldFlow.value.fromArray(vector(controls.fieldFlow, [.035, -.018], 2));
      uniforms.fieldEnvelope.value.fromArray(vector(controls.fieldEnvelope, [.65, .5, .5, .6], 4));
      uniforms.fieldPointer.value.fromArray(vector(controls.fieldPointerUv, [.5, .5], 2));
      uniforms.fieldPointerStrength.value = clamp(controls.fieldPointerStrength, 0, 1);
      const blend = vector(controls.fieldBlendMix, [0, 0, 1, 0], 4).map(v => clamp(v));
      const blendTotal = blend.reduce((sum, v) => sum + v, 0);
      uniforms.fieldBlendMix.value.fromArray(blendTotal > 0 ? blend.map(v => v / blendTotal) : [0, 0, 1, 0]);
      const cellsEnabled=uniforms.asciiWeight.value>.0001 || uniforms.fieldWeight.value>.0001;
      // Allocate for the smallest supported CSS cell once per viewport size;
      // continuously changing authored cell size must not reallocate targets.
      const cellWidth=Math.max(1,Math.ceil(width/6)),cellHeight=Math.max(1,Math.ceil(height/6));
      if(cellsEnabled&&(cellTarget.width!==cellWidth||cellTarget.height!==cellHeight))cellTarget.setSize(cellWidth,cellHeight);
      if(!cellsEnabled&&cellAllocated){cellTarget.setSize(1,1);cellAllocated=false;}
      uniforms.cellResolution.value.set(cellTarget.width,cellTarget.height);
      const oldTarget = gl.getRenderTarget(), oldAutoClear = gl.autoClear, oldScissor = gl.getScissorTest(), oldClearAlpha = gl.getClearAlpha();
      gl.getViewport(viewport); gl.getScissor(scissor); gl.getClearColor(clear);
      try {
        gl.autoClear = false; gl.setScissorTest(false); gl.setRenderTarget(target);
        if (!checked) {const context = gl.getContext(); if (context.checkFramebufferStatus(context.FRAMEBUFFER) !== context.FRAMEBUFFER_COMPLETE) throw new Error('HDR depth target unavailable.'); checked = true;}
        gl.setClearColor(0x000000, 0); gl.clear();
        // Three omits tone mapping/output encoding for ordinary offscreen targets.
        gl.render(scene, camera);
        if(cellsEnabled){quad.material=cellMaterial;gl.setRenderTarget(cellTarget);gl.clear();gl.render(outputScene,outputCamera);cellAllocated=true;}
        if (mistEnabled) {
          quad.material = mistMaterial;
          mistUniforms.sourceColor.value = target.texture; mistUniforms.prefilter.value = 1; mistUniforms.stepUv.value.set(mistRadiusPx / width / 4, 0);
          gl.setRenderTarget(mistA); gl.clear(); gl.render(outputScene, outputCamera);
          mistUniforms.sourceColor.value = mistA.texture; mistUniforms.prefilter.value = 0; mistUniforms.stepUv.value.set(0, mistRadiusPx / height / 4);
          gl.setRenderTarget(mistB); gl.clear(); gl.render(outputScene, outputCamera);
          mistAllocated = true;
        }
        quad.material = material;
        gl.setRenderTarget(null); gl.setViewport(0, 0, width, height); gl.clear(); gl.render(outputScene, outputCamera);
      } finally {
        quad.material = material;
        gl.setClearColor(clear, oldClearAlpha); gl.setRenderTarget(oldTarget); gl.setViewport(viewport); gl.setScissor(scissor); gl.setScissorTest(oldScissor); gl.autoClear = oldAutoClear;
      }
      frames++;
      report = {frames, width: w, height: h, dpr: actualDpr, color: 'RGBA16F linear', depth: 'unsigned-int perspective', requestedSamples: sampleCount, depthResolve: true, approximateTargetBytes: w * h * 12 * (sampleCount + 1) + (mistAllocated ? mistA.width * mistA.height * 16 : 0) + (cellAllocated ? cellTarget.width * cellTarget.height * 8 : 0),
        passes: 2 + (mistEnabled ? 2 : 0) + Number(cellsEnabled), maximumColorTaps: 17, outputTransformCount: 1, alpha: 'premultiplied display output; bounded highlight halo may expand source coverage',
        mist: {enabled: mistEnabled, strength: mistStrength, radiusCssPx: mistRadiusPx, threshold: mistUniforms.threshold.value, resolution: mistEnabled ? [mistWidth, mistHeight] : null, gatherTapsPerAxis: 9, source: 'pre-DOF linear scene highlight radiance', operator: 'direct attenuation plus additive radiance spread'},
        requestedDpr, opticalDensityScale, backgroundDefocus:'preserve full gather, including opaque-background MSAA fringe diffusion', focusDistanceM: uniforms.focusDistance.value, apertureScale: uniforms.aperture.value, maxBlurPx: uniforms.maxBlur.value,
        asciiWeight: uniforms.asciiWeight.value, asciiCellPx: uniforms.cellPx.value, asciiBlend: uniforms.blendMode.value ? 'screen-limited' : 'normal',
        asciiSource: 'pre-DOF rendered scene luminance and depth; includes source base and scene ground', veil: uniforms.veil.value,
        field: {weight: uniforms.fieldWeight.value, time: uniforms.fieldTime.value, sceneMix: independentField?1:uniforms.fieldSceneMix.value, surfaceGain: uniforms.fieldSurfaceGain.value, pointerStrength: independentField?0:uniforms.fieldPointerStrength.value, blendMix: uniforms.fieldBlendMix.value.toArray(), mode:independentField?'source-only':'combined', source: independentField?'rendered scene luminance/depth on actual scene coverage; independent decorative page field composed separately':'authored evolving contours/ribbons plus scene luminance/depth; not analysis data', extraPasses: Number(cellsEnabled), cellResolution:cellsEnabled?[cellTarget.width,cellTarget.height]:null, sampling:independentField?'one radiance/depth calculation per CSS glyph cell; no independent contour':'one radiance/depth/contour calculation per CSS glyph cell; integer glyph levels in RGBA16F'},
        layering: {position:'rear', semanticMask:false, readingOwner:'DOM reading planes', independentField}, retainedMistBytes:mistAllocated?mistA.width*mistA.height*16:0};
    },
    inspect() {return report ? {...report, disposed} : {frames, disposed};},
    dispose() {if (disposed) return; disposed = true; target.dispose(); mistA.dispose(); mistB.dispose(); mistMaterial.dispose(); cellTarget.dispose(); cellMaterial.dispose(); material.dispose(); geometry.dispose(); outputScene.remove(quad);},
  };
}
