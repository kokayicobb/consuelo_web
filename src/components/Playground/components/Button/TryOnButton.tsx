"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls, useProgress, Html } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Camera, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import * as THREE from 'three'

interface HeadPosition {
  x: number
  y: number
  z: number
  rotation: [number, number, number]
  scale: number
}

interface HelmetProps {
  headPosition: HeadPosition
}

const calculateHeadPosition = (landmarks: any): HeadPosition => {
  const topHead = landmarks[10]    // Top of forehead
  const nose = landmarks[1]        // Nose tip
  const leftTemple = landmarks[162]
  const rightTemple = landmarks[389]
  
  const headWidth = Math.sqrt(
    Math.pow(rightTemple.x - leftTemple.x, 2) +
    Math.pow(rightTemple.y - leftTemple.y, 2)
  )

  // Calculate position relative to top of head instead of nose
	const x = (topHead.x - 0.5) * 2.5;  // Reduced multiplier for less extreme movement
  const y = -(topHead.y - 0.5) * 2.5 + 1.2;  // Adjusted height
  const z = -topHead.z * 100;  // Reduced z-depth to sit closer to h

  const rotation: [number, number, number] = [
    Math.atan2(nose.y - topHead.y, nose.z - topHead.z),     // Pitch
    Math.atan2(nose.x - topHead.x, nose.z - topHead.z),     // Yaw
    Math.atan2(rightTemple.y - leftTemple.y, rightTemple.x - leftTemple.x)  // Roll
  ]

  return {
    x,
    y,
    z,
    rotation,
    scale: headWidth * 7  // Increased scale to better fit head
  }
}

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(0)} % loaded</Html>
}

const Helmet: React.FC<HelmetProps> = ({ headPosition }) => {
  const { scene } = useGLTF("/Kask.glb")
  const helmetRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    // Initial setup of the helmet model
    scene.scale.set(0.11, 1.01, 0.01)
    // Move the helmet's base position up and forward slightly
    scene.position.set(0, 0.5, -0.2)
    // Rotate to face forward and correct the lid orientation
    scene.rotation.set(
      Math.PI / 2,  // 90 degrees forward on X-axis
      Math.PI / 2,  // 90 degrees on Y-axis
      0             // No rotation on Z-axis
    )
    
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.roughness = 0.7
          child.material.metalness = 0.3
        }
      }
    })
  }, [scene])

  useFrame(() => {
    if (helmetRef.current) {
      // Position the helmet above the head
      helmetRef.current.position.set(
        headPosition.x,
        headPosition.y - 0.7, // Move it up relative to head position
        headPosition.z + 0.3  // Move it forward slightly
      )
      
      // Set rotation to follow head movement
      helmetRef.current.rotation.set(
        headPosition.rotation[0] + 400, // Tilt back
        headPosition.rotation[1] -300,               // Follow head turning
        headPosition.rotation[2]  +100              // Follow head tilting
      )
      
      // Adjust scale to fit head
      helmetRef.current.scale.setScalar(headPosition.scale * 1.5)
    }
  })

  return <primitive ref={helmetRef} object={scene} />
}

const VirtualTryOnButton = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [faceLandmarker, setFaceLandmarker] = useState<any>(null)
  const [webcamRunning, setWebcamRunning] = useState(false)
  const [headPosition, setHeadPosition] = useState<HeadPosition>({
    x: 0,
    y: 0,
    z: -2,
    rotation: [0, 0, 10],
    scale: 1
  })
  const streamRef = useRef<MediaStream | null>(null)
  const lastVideoTimeRef = useRef<number>(-1)

  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !faceLandmarker) return

    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime
      const predictions = await faceLandmarker.detectForVideo(videoRef.current, performance.now())

      if (predictions.faceLandmarks?.length > 0) {
        const landmarks = predictions.faceLandmarks[0]
        const newPosition = calculateHeadPosition(landmarks)
        setHeadPosition(newPosition)
      }
    }

    if (webcamRunning) {
      requestAnimationFrame(predictWebcam)
    }
  }

  useEffect(() => {
    const setupFaceLandmarker = async () => {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      )
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1
      })
      setFaceLandmarker(landmarker)
    }

    setupFaceLandmarker()
  }, [])

  useEffect(() => {
    if (webcamRunning) {
      if (videoRef.current && faceLandmarker) {
        if (streamRef.current) {
          videoRef.current.srcObject = streamRef.current
          videoRef.current.addEventListener('loadeddata', predictWebcam)
        } else {
          navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            streamRef.current = stream
            if (videoRef.current) {
              videoRef.current.srcObject = stream
              videoRef.current.addEventListener('loadeddata', predictWebcam)
            }
          })
        }
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', predictWebcam)
      }
    }
  }, [webcamRunning, faceLandmarker])

  const adjustPosition = (axis: 'x' | 'y' | 'z', delta: number) => {
    setHeadPosition(prev => ({ ...prev, [axis]: prev[axis] + delta }))
  }

  const adjustScale = (delta: number) => {
    setHeadPosition(prev => ({ ...prev, scale: Math.max(0.1, prev.scale + delta) }))
  }

  return (
    <div className="relative h-[60vh] w-full overflow-hidden rounded-3xl bg-white">
      {!webcamRunning ? (
        <div className="flex h-full flex-col items-center justify-center space-y-4 p-4">
          <Button onClick={() => setWebcamRunning(true)} className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Try On Helmet
          </Button>
        </div>
      ) : (
        <div className="relative h-full">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute left-0 top-0 h-full w-full"
          />
          <div className="absolute inset-0">
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 60 }}>
              <ambientLight intensity={0.7} />
              <spotLight 
                position={[10, 10, 10]} 
                angle={0.3} 
                penumbra={1} 
                intensity={1}
                castShadow
              />
              <Suspense fallback={<Loader />}>
                <Helmet headPosition={headPosition} />
                <Environment preset="studio" />
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <Button onClick={() => adjustPosition('y', 0.1)}><ArrowUp className="h-4 w-4" /></Button>
            <Button onClick={() => adjustPosition('y', -0.1)}><ArrowDown className="h-4 w-4" /></Button>
            <Button onClick={() => adjustPosition('x', -0.1)}><ArrowLeft className="h-4 w-4" /></Button>
            <Button onClick={() => adjustPosition('x', 0.1)}><ArrowRight className="h-4 w-4" /></Button>
            <Button onClick={() => adjustScale(10)}><ZoomIn className="h-4 w-4" /></Button>
            <Button onClick={() => adjustScale(-10)}><ZoomOut className="h-4 w-4" /></Button>
          </div>
          <Button
            onClick={() => setWebcamRunning(false)}
            className="absolute right-4 top-4"
            variant="outline"
          >
            Exit Try On
          </Button>
        </div>
      )}
    </div>
  )
}

export default VirtualTryOnButton

