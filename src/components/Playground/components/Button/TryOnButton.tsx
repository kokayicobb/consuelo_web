"use client"

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls, useProgress, Html } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Camera, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import * as THREE from 'three'
import { ErrorBoundary } from 'react-error-boundary';

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
  // Key landmark points for better head mapping
  const topHead = landmarks[10]      // Top of forehead
  const nose = landmarks[1]          // Nose tip
  const leftTemple = landmarks[162]  // Left temple
  const rightTemple = landmarks[389] // Right temple
  const leftEar = landmarks[234]     // Left ear
  const rightEar = landmarks[454]    // Right ear
  const chin = landmarks[152]        // Chin point
  
  // Calculate head dimensions
  const headWidth = Math.sqrt(
    Math.pow(rightEar.x - leftEar.x, 2) +
    Math.pow(rightEar.y - leftEar.y, 2)
  )

  const headHeight = Math.sqrt(
    Math.pow(topHead.y - chin.y, 2) +
    Math.pow(topHead.z - chin.z, 2)
  )

  // Estimate true top of head (about 1/3 more above highest visible point)
  const estimatedTopOfHead = {
    x: topHead.x,
    y: topHead.y - (headHeight * 0.3), // Adjust Y upward
    z: topHead.z 
  }

  // Calculate central head position
  const x = (estimatedTopOfHead.x - 0.5) * 1.75
  const y = -(estimatedTopOfHead.y - 0.5) * 2 + 0.8 // Adjusted for true head top
  const z = -estimatedTopOfHead.z * 80

  // Enhanced rotation calculations using multiple reference points
  const rotation: [number, number, number] = [
    // Pitch (up/down) - using forehead to chin angle
    Math.atan2(chin.y - topHead.y, chin.z - topHead.z),
    // Yaw (left/right) - using ear to ear angle
    Math.atan2(rightEar.x - leftEar.x, rightEar.z - leftEar.z),
    // Roll (tilt) - using temple to temple angle
    Math.atan2(rightTemple.y - leftTemple.y, rightTemple.x - leftTemple.x)
  ]

  // Calculate scale based on head width and height
  const scale = (headWidth + headHeight) * 4
  const zDepth = -nose.z / 1000  // Adjust multiplier as needed
  return {
    x,
    y,
    z: zDepth,
    rotation,
    scale
  }
}

const Helmet: React.FC<HelmetProps> = ({ headPosition }) => {
  const { scene } = useGLTF("/Kask2.glb")
  const helmetRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const smoothedPosition = useRef({...headPosition})
  const smoothingFactor = 0.1
  
  // Store vertical offset separately from head position
  const [verticalOffset, setVerticalOffset] = useState(0)

  useEffect(() => {
    if (!scene) return
    // Initial model setup
    scene.scale.set(1, 1, 1)
    scene.position.set(0, 0.5, -110.2)
    scene.rotation.set(
      Math.PI / 2,
      Math.PI / 2 - Math.PI/2,
      0
    )
    
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.roughness = 0.7
          child.material.metalness = 0.3
          child.castShadow = true
          child.receiveShadow = true
        }
      }
    })

    // Add event listeners for dragging
    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault()
      setIsDragging(true)
      const y = event.clientY
      setDragOffset(y - (verticalOffset * 100)) // Scale the offset for better control
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (isDragging) {
        const y = event.clientY
        const newOffset = (y - dragOffset) / 100 // Scale down the movement
        setVerticalOffset(newOffset)
      }
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    const domElement = gl.domElement
    domElement.addEventListener('pointerdown', handlePointerDown)
    domElement.addEventListener('pointermove', handlePointerMove)
    domElement.addEventListener('pointerup', handlePointerUp)
    domElement.addEventListener('pointerleave', handlePointerUp)

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown)
      domElement.removeEventListener('pointermove', handlePointerMove)
      domElement.removeEventListener('pointerup', handlePointerUp)
      domElement.removeEventListener('pointerleave', handlePointerUp)
    }
  }, [scene, gl.domElement, isDragging, dragOffset])

  useFrame(() => {
    if (helmetRef.current) {
      // Smooth position updates
      smoothedPosition.current = {
        x: smoothedPosition.current.x + (headPosition.x - smoothedPosition.current.x) * smoothingFactor,
        y: smoothedPosition.current.y + (headPosition.y - smoothedPosition.current.y) * smoothingFactor,
        z: smoothedPosition.current.z + (headPosition.z - smoothedPosition.current.z) * smoothingFactor,
        rotation: [
          smoothedPosition.current.rotation[0] + (headPosition.rotation[0] - smoothedPosition.current.rotation[0]) * smoothingFactor,
          smoothedPosition.current.rotation[1] + (headPosition.rotation[1] - smoothedPosition.current.rotation[1]) * smoothingFactor,
          smoothedPosition.current.rotation[2] + (headPosition.rotation[2] - smoothedPosition.current.rotation[2]) * smoothingFactor
        ],
        scale: smoothedPosition.current.scale + (headPosition.scale - smoothedPosition.current.scale) * smoothingFactor
      }

      // Apply smoothed position with vertical offset
      helmetRef.current.position.set(
        smoothedPosition.current.x,
        smoothedPosition.current.y - 2 + verticalOffset, // Add vertical offset here
        smoothedPosition.current.z - 2
      )
      
      helmetRef.current.rotation.set(
        smoothedPosition.current.rotation[0] + Math.PI * 2,
        smoothedPosition.current.rotation[1] - Math.PI,
        smoothedPosition.current.rotation[2] + Math.PI / 2
      )
      
      helmetRef.current.scale.setScalar(smoothedPosition.current.scale)
    }
  })

  return <primitive ref={helmetRef} object={scene} />
}
function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(0)} % loaded</Html>
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
  const [isLoading, setIsLoading] = useState(true);

  const predictWebcam = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !faceLandmarker) return;

    const detectAndUpdate = async () => {
      if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        try {
          const predictions = await faceLandmarker.detectForVideo(videoRef.current, performance.now());
          if (predictions.faceLandmarks?.length > 0) {
            const landmarks = predictions.faceLandmarks[0];
            const newPosition = calculateHeadPosition(landmarks);
            setHeadPosition(newPosition);
          }
        } catch (error) {
          console.error('Error in face detection:', error);
        }
      }

      if (webcamRunning) {
        requestAnimationFrame(detectAndUpdate);
      }
    };

    detectAndUpdate();
  }, [faceLandmarker, webcamRunning]);

  useEffect(() => {
    const setupFaceLandmarker = async () => {
      setIsLoading(true);
      try {
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });
        setFaceLandmarker(landmarker);
        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up FaceLandmarker:', error);
        setIsLoading(false);
        // Handle the error appropriately, e.g., show an error message to the user
      }
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
          navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
              streamRef.current = stream;
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.addEventListener('loadeddata', predictWebcam);
              }
            })
            .catch((error) => {
              console.error('Error accessing webcam:', error);
              setWebcamRunning(false);
              // Show an error message to the user
            });
        }
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', predictWebcam);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamRunning, faceLandmarker, predictWebcam])

  const adjustPosition = (axis: 'x' | 'y' | 'z', delta: number) => {
    setHeadPosition(prev => ({ ...prev, [axis]: prev[axis] + delta }))
  }

  const adjustScale = (delta: number) => {
    setHeadPosition(prev => ({ ...prev, scale: Math.max(0.1, prev.scale + delta) }))
  }

  return (
    <div className="relative h-[60vh] w-full overflow-hidden rounded-3xl bg-white">
      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">Loading...</div>}
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
            <ErrorBoundary fallback={<div>Error loading 3D content</div>}>
              <Canvas shadows camera={{ position: [0, 0, 5], fov: 60 }}>
                <ambientLight intensity={0.7} />
                <spotLight
                position={[10, 15, 10]}
                angle={0.25}
                penumbra={1}
                intensity={0.8}
                shadow-mapSize={2048}
                castShadow
              />
                <Suspense fallback={<Loader />}>
                  <Helmet headPosition={headPosition} />
                  <Environment preset="studio" />
                </Suspense>
                <OrbitControls enableZoom={true}  zoomSpeed={0.5} enablePan={false} />
              </Canvas>
            </ErrorBoundary>
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

