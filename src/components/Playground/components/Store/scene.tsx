'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import dynamic from 'next/dynamic'

const Model = dynamic(() => import('./Model3D'), { ssr: false });

export default function Scene({ modelPosition, modelRotation }) {
  return (
    <Canvas camera={{ position: [0, 1, 8], fov: 45 }}>
      <color attach="background" args={["#f0f0f0"]} />
      <ambientLight intensity={0.3} />
      <spotLight
        position={[10, 15, 10]}
        angle={0.25}
        penumbra={1}
        intensity={0.8}
        shadow-mapSize={2048}
        castShadow
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
      />
      <Suspense fallback={null}>
        <Model position={modelPosition} rotation={modelRotation} />
        <Environment preset="warehouse" />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.6}
          scale={10}
          blur={2.5}
          far={4}
        />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.8}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 2}
        enableZoom={true}
        zoomSpeed={0.5}
      />
    </Canvas>
  )
}

