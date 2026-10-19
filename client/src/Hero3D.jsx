import {useEffect,useRef} from 'react'
import * as THREE from 'three'
// Sculptural looped ribbon + orange routing nodes. Scroll + pointer drive the scene.
export default function Hero3D({onFail}){
  const ref=useRef(null)
  useEffect(()=>{
    const el=ref.current; let renderer
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){onFail?.();return}
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile=innerWidth<800
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2)); el.appendChild(renderer.domElement)
    const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(38,1,.1,50); cam.position.set(0,0,7)
    scene.add(new THREE.HemisphereLight(0xf5f3ed,0x171a19,.6))
    const key=new THREE.DirectionalLight(0xfff1e0,2.2); key.position.set(4,5,5); scene.add(key)
    const rim=new THREE.PointLight(0x79a99b,40,20); rim.position.set(-5,-1,2); scene.add(rim)
    const group=new THREE.Group(); scene.add(group)
    const geo=new THREE.TorusKnotGeometry(1.5,.34,mobile?120:220,mobile?16:28,2,3)
    const mat=new THREE.MeshStandardMaterial({color:0x79a99b,metalness:.85,roughness:.32})
    group.add(new THREE.Mesh(geo,mat))
    const nodeGeo=new THREE.SphereGeometry(.12,20,20), nodeMat=new THREE.MeshStandardMaterial({color:0xd98252,emissive:0xd98252,emissiveIntensity:.5,roughness:.4})
    const curve=new THREE.CatmullRomCurve3(Array.from({length:120},(_,i)=>{const t=i/120*Math.PI*2,p=2,q=3,r=Math.cos(q*t)+2
      return new THREE.Vector3(r*Math.cos(p*t)*.75,r*Math.sin(p*t)*.75,-Math.sin(q*t)*.75)}),true)
    // Torus-knot param approximation: nodes sit on the loop
    ;[0,.33,.66].forEach(u=>{const n=new THREE.Mesh(nodeGeo,nodeMat);n.position.copy(curve.getPoint(u)).multiplyScalar(1.18);group.add(n)})
    const floor=new THREE.Mesh(new THREE.CircleGeometry(3,48),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.25}))
    floor.rotation.x=-Math.PI/2; floor.position.y=-2.4; scene.add(floor)
    const m={x:0,y:0}; let sp=0,visible=true,raf,t0=performance.now()
    const size=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);cam.aspect=w/h;cam.position.z=w/h<.9?9.5:7;cam.updateProjectionMatrix()}
    size(); addEventListener('resize',size)
    const pm=e=>{m.x=e.clientX/innerWidth-.5;m.y=e.clientY/innerHeight-.5}
    if(!mobile)addEventListener('pointermove',pm)
    const draw=()=>{
      const t=(performance.now()-t0)/1000, intro=Math.min(1,t/2.2), e=1-Math.pow(1-intro,3)
      sp=Math.min(1,scrollY/innerHeight)
      group.rotation.y=reduce?.6:(.4+t*.08+sp*Math.PI*.9+m.x*.5)
      group.rotation.x=.25+sp*.6+m.y*.3
      group.scale.setScalar((.7+.3*e)*(1-sp*.25)); cam.position.y=-sp*1.2
      renderer.render(scene,cam)
    }
    const loop=()=>{if(visible&&!document.hidden)draw();raf=requestAnimationFrame(loop)}
    const io=new IntersectionObserver(([en])=>{visible=en.isIntersecting},{rootMargin:'200px'}); io.observe(el)
    if(reduce){draw();addEventListener('scroll',draw,{passive:true})}else loop()
    return()=>{cancelAnimationFrame(raf);io.disconnect();removeEventListener('resize',size);removeEventListener('pointermove',pm);removeEventListener('scroll',draw)
      geo.dispose();mat.dispose();nodeGeo.dispose();nodeMat.dispose();renderer.dispose();renderer.domElement.remove()}
  },[])
  return <div className="scene3d" ref={ref} aria-hidden="true"/>
}
