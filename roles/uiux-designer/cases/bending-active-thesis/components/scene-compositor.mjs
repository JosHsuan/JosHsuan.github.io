import * as T from 'three';

const MAX_RECTS = 16;
const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

/** UV arrays use bottom-left origin. Client rect objects use CSS px, top-left origin. */
export function normalizeProtectedRects(rectangles = [], width, height, paddingPx = 16) {
  const px = paddingPx / width, py = paddingPx / height;
  const normalized = rectangles.map(r => Array.isArray(r) ? r : [r.left / width, 1 - r.bottom / height, r.right / width, 1 - r.top / height])
    .filter(r => r.length === 4 && r.every(Number.isFinite) && r[2] > r[0] && r[3] > r[1] && r[2] >= 0 && r[0] <= 1 && r[3] >= 0 && r[1] <= 1)
    .map(r => [clamp(r[0] - px), clamp(r[1] - py), clamp(r[2] + px), clamp(r[3] + py)]);
  if (normalized.length <= MAX_RECTS) return {rects: normalized, mode: 'individual', inputCount: normalized.length};
  // A conservative reading-region union never silently drops an overflow rectangle.
  const union = [Math.min(...normalized.map(r => r[0])), Math.min(...normalized.map(r => r[1])), Math.max(...normalized.map(r => r[2])), Math.max(...normalized.map(r => r[3]))];
  return {rects: [union], mode: 'reading-union-fallback', inputCount: normalized.length};
}

const vertex = /* glsl */`varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
const fragment = /* glsl */`
uniform sampler2D sceneColor;
uniform sampler2D sceneDepth;
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
uniform int rectCount;
uniform vec4 protectedRects[16];
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
float exclusion(vec2 uv){
  float allow=1.0;
  vec2 feather=vec2(8.0)/cssResolution;
  for(int i=0;i<16;i++){
    if(i>=rectCount)break;
    vec4 r=protectedRects[i];
    vec2 outside=max(max(r.xy-uv,uv-r.zw),vec2(0.0));
    allow*=smoothstep(0.0,1.0,length(outside/feather));
  }
  return allow;
}
void main(){
  vec4 base=texture2D(sceneColor,vUv);
  float depth=viewDepth(texture2D(sceneDepth,vUv).r);
  float radius=min(maxBlur,abs(depth-focusDistance)/max(depth,nearPlane)*aperture);
  vec3 color=base.rgb;
  float alpha=base.a;
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
  color*=1.0-veil;
  if(asciiWeight>0.0001){
    vec2 cell=floor(vUv*cssResolution/cellPx);
    vec2 sampleUv=clamp((cell+0.5)*cellPx/cssResolution,vec2(0.0),vec2(1.0));
    vec4 source=texture2D(sceneColor,sampleUv);
    float rawDepth=texture2D(sceneDepth,sampleUv).r;
    float luminance=max(0.0,dot(source.rgb,vec3(0.2126,0.7152,0.0722)));
    float density=pow(luminance/(1.0+luminance),0.45);
    float level=min(6.0,floor(density*7.0));
    vec2 cellUv=fract(vUv*cssResolution/cellPx)-0.5;
    float glyphMask=glyph(cellUv,level);
    float coverage=step(rawDepth,0.999999)*source.a*step(0.01,luminance);
    float weight=asciiWeight*glyphMask*coverage*exclusion(vUv);
    vec3 mixed=blendMode<0.5?asciiTint:color+(1.0-clamp(color,0.0,1.0))*asciiTint;
    color=mix(color,mixed,weight);
  }
  gl_FragColor=vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <premultiplied_alpha_fragment>
}`;

export function createSceneCompositor(gl) {
  const target = new T.WebGLRenderTarget(1, 1, {type: T.HalfFloatType, depthTexture: new T.DepthTexture(1, 1, T.UnsignedIntType), samples: 0});
  target.texture.name = 'thesis-linear-color'; target.depthTexture.name = 'thesis-scene-depth';
  const uniforms = {
    sceneColor: {value: target.texture}, sceneDepth: {value: target.depthTexture}, resolution: {value: new T.Vector2(1, 1)}, cssResolution: {value: new T.Vector2(1, 1)},
    nearPlane: {value: .01}, farPlane: {value: 100}, focusDistance: {value: 4}, aperture: {value: 0}, maxBlur: {value: 0},
    asciiWeight: {value: 0}, cellPx: {value: 11}, asciiTint: {value: new T.Vector3(.38, .75, .69)}, blendMode: {value: 1}, veil: {value: 0},
    rectCount: {value: 0}, protectedRects: {value: Array.from({length: MAX_RECTS}, () => new T.Vector4())},
  };
  const material = new T.ShaderMaterial({uniforms, vertexShader: vertex, fragmentShader: fragment, depthWrite: false, depthTest: false, blending: T.NoBlending, premultipliedAlpha: true, toneMapped: true});
  const geometry = new T.PlaneGeometry(2, 2), quad = new T.Mesh(geometry, material), outputScene = new T.Scene(), outputCamera = new T.Camera();
  quad.frustumCulled = false; outputScene.add(quad);
  const viewport = new T.Vector4(), scissor = new T.Vector4(), clear = new T.Color();
  let frames = 0, disposed = false, report = null, checked = false;

  return {
    render(scene, camera, score, {width, height, dpr = 1, samples = 2, protectedRects = []}) {
      if (disposed) throw new Error('Compositor already disposed.');
      if (!(width > 0 && height > 0)) return;
      if (gl.capabilities.reversedDepthBuffer || gl.capabilities.logarithmicDepthBuffer || camera.isOrthographicCamera) throw new Error('This optical pass requires ordinary perspective depth.');
      const actualDpr = clamp(dpr, .5, 1.25), w = Math.max(1, Math.round(width * actualDpr)), h = Math.max(1, Math.round(height * actualDpr));
      const sampleCount = Math.min(gl.capabilities.maxSamples, samples > 0 ? 2 : 0);
      if (target.samples !== sampleCount) {target.dispose(); target.samples = sampleCount; target.resolveDepthBuffer = true; checked = false;}
      if (target.width !== w || target.height !== h) {target.setSize(w, h); checked = false;}
      const controls = {...score, ...(score.overrides ?? {})};
      const masks = normalizeProtectedRects(protectedRects, width, height);
      uniforms.resolution.value.set(w, h); uniforms.cssResolution.value.set(width, height);
      uniforms.nearPlane.value = camera.near; uniforms.farPlane.value = camera.far;
      uniforms.focusDistance.value = clamp(controls.focusDistanceM, camera.near, camera.far);
      uniforms.aperture.value = clamp(controls.apertureScale, 0, 120);
      uniforms.maxBlur.value = clamp(controls.maxBlurPx, 0, 12);
      uniforms.asciiWeight.value = clamp(controls.asciiWeight, 0, 1);
      uniforms.cellPx.value = clamp(controls.asciiCellPx, 6, 28);
      uniforms.asciiTint.value.fromArray(controls.asciiTint ?? [.38, .75, .69]);
      uniforms.blendMode.value = controls.asciiBlend === 'normal' ? 0 : 1;
      uniforms.veil.value = clamp(controls.veil, 0, .65);
      uniforms.rectCount.value = masks.rects.length;
      masks.rects.forEach((r, i) => uniforms.protectedRects.value[i].fromArray(r));
      const oldTarget = gl.getRenderTarget(), oldAutoClear = gl.autoClear, oldScissor = gl.getScissorTest(), oldClearAlpha = gl.getClearAlpha();
      gl.getViewport(viewport); gl.getScissor(scissor); gl.getClearColor(clear);
      try {
        gl.autoClear = false; gl.setScissorTest(false); gl.setRenderTarget(target);
        if (!checked) {const context = gl.getContext(); if (context.checkFramebufferStatus(context.FRAMEBUFFER) !== context.FRAMEBUFFER_COMPLETE) throw new Error('HDR depth target unavailable.'); checked = true;}
        gl.setClearColor(0x000000, 0); gl.clear();
        // Three omits tone mapping/output encoding for ordinary offscreen targets.
        gl.render(scene, camera);
        gl.setRenderTarget(null); gl.setViewport(0, 0, width, height); gl.clear(); gl.render(outputScene, outputCamera);
      } finally {
        gl.setClearColor(clear, oldClearAlpha); gl.setRenderTarget(oldTarget); gl.setViewport(viewport); gl.setScissor(scissor); gl.setScissorTest(oldScissor); gl.autoClear = oldAutoClear;
      }
      frames++;
      report = {frames, width: w, height: h, dpr: actualDpr, color: 'RGBA16F linear', depth: 'unsigned-int perspective', requestedSamples: sampleCount, depthResolve: true, approximateTargetBytes: w * h * 12 * (sampleCount + 1),
        passes: 2, maximumColorTaps: 17, outputTransformCount: 1, alpha: 'premultiplied display output; source alpha preserved',
        focusDistanceM: uniforms.focusDistance.value, apertureScale: uniforms.aperture.value, maxBlurPx: uniforms.maxBlur.value,
        asciiWeight: uniforms.asciiWeight.value, asciiCellPx: uniforms.cellPx.value, asciiBlend: uniforms.blendMode.value ? 'screen-limited' : 'normal',
        asciiSource: 'pre-DOF rendered scene luminance and depth; includes source base and scene ground', veil: uniforms.veil.value,
        maskMode: masks.mode, protectedRectCount: masks.rects.length, protectedInputCount: masks.inputCount};
    },
    inspect() {return report ? {...report, disposed} : {frames, disposed};},
    dispose() {if (disposed) return; disposed = true; target.dispose(); material.dispose(); geometry.dispose(); outputScene.remove(quad);},
  };
}
