"use client"

import React, { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls, useProgress, Html } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Camera, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import * as THREE from 'three'

interface HeadPosition {
  x: number
  y: number
  z: number
  rotation: [number, number, number] // Explicitly typed as tuple
  scale: number
}

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(0)} % loaded</Html>
}

const HelmetVirtualTryOn = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [faceLandmarker, setFaceLandmarker] = useState<any>(null)
  const [webcamRunning, setWebcamRunning] = useState(false)
  const [headPosition, setHeadPosition] = useState<HeadPosition>({
    x: 0,
    y: 0,
    z: -2,
    rotation: [0, 0, 0],
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
        
        const nose = landmarks[1]
        const leftTemple = landmarks[162]
        const rightTemple = landmarks[389]
        const topHead = landmarks[10]
        
        const headWidth = Math.sqrt(
          Math.pow(rightTemple.x - leftTemple.x, 2) +
          Math.pow(rightTemple.y - leftTemple.y, 2)
        )

        const x = (nose.x - 0.5) * 3
        const y = -(nose.y - 0.5) * 3 + 0.5
        const z = -nose.z * 3 - 2
        
        const forwardVector = {
          x: nose.x - topHead.x,
          y: nose.y - topHead.y,
          z: nose.z - topHead.z
        }
        
        const rotation = [
          Math.atan2(forwardVector.y, forwardVector.z),
          Math.atan2(forwardVector.x, forwardVector.z),
          Math.atan2(rightTemple.y - leftTemple.y, rightTemple.x - leftTemple.x)
        ]

        setHeadPosition({ 
          x, 
          y, 
          z, 
					rotation: [0, 0, 0], // Initialize as tuple
          scale: headWidth * 4
        })
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

  const Helmet = () => {
    const { scene } = useGLTF("/Kask.glb")
    const helmetRef = useRef<THREE.Group>(null)
    
    useEffect(() => {
      scene.scale.set(0.01, 0.01, 0.01)
      scene.position.set(0, -0.1, 0)
      
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
        helmetRef.current.position.set(
          headPosition.x,
          headPosition.y + 0.1,
          headPosition.z
        )
        helmetRef.current.rotation.set(...headPosition.rotation)
        helmetRef.current.scale.setScalar(headPosition.scale)
      }
    })

    return <primitive ref={helmetRef} object={scene} />
  }

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
                <Helmet />
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
            <Button onClick={() => adjustScale(0.1)}><ZoomIn className="h-4 w-4" /></Button>
            <Button onClick={() => adjustScale(-0.1)}><ZoomOut className="h-4 w-4" /></Button>
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

export default HelmetVirtualTryOn

