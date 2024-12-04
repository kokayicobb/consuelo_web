import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

function Model() {
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
      position={[0, -1, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function ThreeScene() {
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
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <Model />
      <Environment preset="warehouse" />
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.6}
        scale={10}
        blur={2.5}
        far={4}
      />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.8}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 0.5}
        enableZoom={true}
        zoomSpeed={0.5}
      />
    </Canvas>
  );
}

useGLTF.preload("/kask.glb");