import { Vector2, Vector4 } from 'three'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

// A web interpretation of Apple's lensing, optical separation and thicker
// reading surfaces. This samples only the scene; HTML text is never refracted.
export class GlassPass extends ShaderPass {
  constructor() {
    super({
      uniforms: { tDiffuse: { value: null }, resolution: { value: new Vector2(1,1) }, panel: { value: new Vector4() }, enabledGlass: { value: 1 }, depth: { value: 0 } },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform vec4 panel;
        uniform float enabledGlass,depth;
        float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.0)+length(max(q,0.0))-r;}
        vec4 sampleScene(vec2 uv){return textureLod(tDiffuse,uv,0.0);}
        void main(){
          vec4 original=sampleScene(vUv);
          vec2 pixel=vUv*resolution;
          vec2 center=panel.xy+panel.zw*0.5;
          vec2 local=pixel-center,halfSize=panel.zw*0.5;
          float d=box(local,halfSize,17.0);
          if(d>1.0 || enabledGlass<0.5){gl_FragColor=original;return;}
          vec2 n=normalize(vec2(box(local+vec2(0.5,0),halfSize,17.0)-box(local-vec2(0.5,0),halfSize,17.0),box(local+vec2(0,0.5),halfSize,17.0)-box(local-vec2(0,0.5),halfSize,17.0))+0.00001);
          float edge=exp(-abs(d)/9.0);
          vec2 refracted=clamp(vUv+n*(5.5+depth*3.0)*edge/resolution,vec2(0.001),vec2(0.999));
          vec3 scattered=sampleScene(refracted).rgb*0.2;
          for(int i=0;i<8;i++){
            float angle=float(i)*0.785398;
            scattered+=sampleScene(refracted+vec2(cos(angle),sin(angle))*(6.0+depth*6.0)/resolution).rgb*0.1;
          }
          vec3 body=mix(scattered,vec3(0.014,0.020,0.025),0.86+depth*0.04);
          body+=vec3(0.06,0.071,0.078)*pow(edge,2.0)*max(0.0,dot(n,normalize(vec2(-0.5,1.0))));
          gl_FragColor=vec4(mix(body,original.rgb,smoothstep(-0.8,0.6,d)),1.0);
        }
      `,
    })
  }
}
