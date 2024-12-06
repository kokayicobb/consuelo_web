"use client"
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Model({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const { scene } = useGLTF("/kask.glb") as unknown as { scene: THREE.Group };

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.needsUpdate = true;
    }
  });

  return (
    <primitive
      object={scene}
      scale={2}
      position={position}
      rotation={rotation}
    />
  );
}

useGLTF.preload("/kask.glb");