'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import { Color } from 'three'

export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
    </mesh>
  )
}

const vertexShader = `uniform float u_time;

varying vec2 vUv;
varying float vZ;
varying float vX;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(modelPosition.x * 10.0 + u_time * 12.0) * 0.2;
  
  // Uncomment the code and hit the refresh button below for a more complex effect 🪄
  modelPosition.y += sin(modelPosition.z * 6.0 + u_time * 2.0) * 0.1;
  modelPosition.y += sin(modelPosition.z * 2.0 + u_time * -2.4) * 0.3;
  modelPosition.x += sin(modelPosition.z * 2.0 + u_time * 1.4) * 0.2;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  vZ = modelPosition.y;
  vX = modelPosition.x;

  gl_Position = projectedPosition;
}`

const fragmentShader = `uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
varying float vZ;
varying float vX;


void main() {
  vec3 color = mix(u_colorA, u_colorB, vZ * 2.0 + 0.5); 
  vec3 color2 = mix(color, u_colorC, vX * .3 );
  gl_FragColor = vec4(color2, 1.0);
  
}`

export const MovingPlane = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  const mesh = useRef()
  const resolution = useMemo(() => new THREE.Vector2(), [])
  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_colorA: { value: new Color('#FFE486') },
      u_colorB: { value: new Color('#FEB3D9') },
      u_colorC: { value: new Color('#000000') },
    }),
    [],
  )
  useFrame((state) => {
    const { clock } = state
    mesh.current.material.uniforms.u_time.value = clock.getElapsedTime()
  })
  useCursor(hovered)
  return (
    <mesh ref={mesh} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.5}>
      <planeGeometry args={[7, 7, 64, 64]} />
      <shaderMaterial fragmentShader={fragmentShader} vertexShader={vertexShader} uniforms={uniforms} />
    </mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, hover] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  return (
    <group ref={mesh} {...props}>
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, 1]} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, -1]} />
      <mesh onClick={() => router.push(route)} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
      </mesh>
    </group>
  )
}

export function Duck(props) {
  const { scene } = useGLTF('/duck.glb')

  useFrame((state, delta) => (scene.rotation.y += delta))

  return <primitive object={scene} {...props} />
}
export function Dog(props) {
  const { scene } = useGLTF('/dog.glb')

  return <primitive object={scene} {...props} />
}
