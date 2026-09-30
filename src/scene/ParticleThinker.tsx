import { useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Mesh, Vector3, ShaderMaterial } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { randomSequence } from '../opening/arrival'

export function ParticleThinker() {
  const { size, gl } = useThree()
  const model = useLoader(GLTFLoader, '/models/thinker-smoothed.glb')
  const narrow=size.width<720
  const data=useMemo(()=>{
    let source:Mesh|undefined
    model.scene.traverse(object=>{if(object instanceof Mesh)source=object})
    if(!source)throw Error('Missing Thinker geometry')
    const random=randomSequence(172),sampler=new MeshSurfaceSampler(source)
    // Three r186 exposes this method; the r185 declaration has not caught up.
    ;(sampler as MeshSurfaceSampler & { setRandomGenerator: (random: () => number) => MeshSurfaceSampler }).setRandomGenerator(random)
    sampler.build()
    const count=narrow?40000:100000,positions=new Float32Array(count*3),normals=new Float32Array(count*3),seeds=new Float32Array(count)
    const p=new Vector3(),n=new Vector3()
    for(let i=0;i<count;i++){sampler.sample(p,n);p.toArray(positions,i*3);n.toArray(normals,i*3);seeds[i]=random()}
    return{positions,normals,seeds}
  },[model,narrow])
  const material=useRef<ShaderMaterial>(null)
  const uniforms=useMemo(()=>({pixels:{value:900},minimumSize:{value:1}}),[])
  useFrame(()=>{
    if(!material.current)return
    material.current.uniforms.pixels.value=size.height*Math.min(gl.getPixelRatio(),narrow?1:1.5)
    // Keep the low-density silhouette continuous on a one-pixel mobile grid.
    material.current.uniforms.minimumSize.value=narrow?1.8:1
  })
  return <points name="Back-facing particle Thinker" frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions,3]}/><bufferAttribute attach="attributes-normal" args={[data.normals,3]}/><bufferAttribute attach="attributes-seed" args={[data.seeds,1]}/></bufferGeometry>
    <shaderMaterial ref={material} uniforms={uniforms} depthWrite vertexShader={`
      attribute float seed;
      uniform float pixels,minimumSize;
      varying float rim,grain;
      void main(){
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        vec3 n=normalize(normalMatrix*normal),view=normalize(-mv.xyz);
        rim=pow(1.0-abs(dot(n,view)),4.0)*smoothstep(-0.2,0.7,n.y);
        grain=seed;
        gl_PointSize=clamp(pixels*(0.034+seed*0.016)*length(modelMatrix[0].xyz)/max(1.0,-mv.z),minimumSize,8.0);
        gl_Position=projectionMatrix*mv;
      }
    `} fragmentShader={`
      varying float rim,grain;
      void main(){
        float r=length(gl_PointCoord-0.5)*2.0;
        if(r>1.0 || (grain>0.995 && r>0.35))discard;
        vec3 black=vec3(0.003,0.006,0.008)*(0.85+grain*0.3);
        gl_FragColor=vec4(black+vec3(0.021,0.029,0.033)*rim,1.0);
      }
    `}/>
  </points>
}
