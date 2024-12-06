'use client'

import { useEffect } from 'react'
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function Model({
  position,
  rotation,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  const { scene } = useGLTF("/Kask.glb") as unknown as { scene: THREE.Group }

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.needsUpdate = true
      }
    })
  }, [scene])

  return (
    <primitive
      object={scene}
      scale={2}
      position={position}
      rotation={rotation}
    />
  )
}

useGLTF.preload("/Kask.glb")

