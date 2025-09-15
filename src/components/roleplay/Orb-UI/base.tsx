"use client"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

interface Particle {
  mesh: THREE.Mesh
  position: THREE.Vector3
  velocity: THREE.Vector3
  originalPosition: THREE.Vector3
}

export default function ThreeDSphere() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const particlesRef = useRef<Particle[]>([])
  const animationIdRef = useRef<number>()
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const isMouseDownRef = useRef<boolean>(false)

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    mouseX: 0,
    mouseY: 0,
    isPressed: false,
    particleCount: 0,
    affectedParticles: 0,
  })

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 15)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create particles for hollow sphere
    createHollowSphere()

    // Event listeners
    const updateMousePosition = (clientX: number, clientY: number) => {
      mouseRef.current.x = (clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(clientY / window.innerHeight) * 2 + 1

      // Update debug info
      setDebugInfo((prev) => ({
        ...prev,
        mouseX: mouseRef.current.x,
        mouseY: mouseRef.current.y,
      }))
    }

    const handleMouseMove = (event: MouseEvent) => {
      updateMousePosition(event.clientX, event.clientY)
    }

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault()
      isMouseDownRef.current = true
      updateMousePosition(event.clientX, event.clientY)
      setDebugInfo((prev) => ({ ...prev, isPressed: true }))
    }

    const handleMouseUp = () => {
      isMouseDownRef.current = false
      setDebugInfo((prev) => ({ ...prev, isPressed: false }))
    }

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      if (event.touches.length > 0) {
        const touch = event.touches[0]
        updateMousePosition(touch.clientX, touch.clientY)
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()
      isMouseDownRef.current = true
      setDebugInfo((prev) => ({ ...prev, isPressed: true }))
      if (event.touches.length > 0) {
        const touch = event.touches[0]
        updateMousePosition(touch.clientX, touch.clientY)
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault()
      isMouseDownRef.current = false
      setDebugInfo((prev) => ({ ...prev, isPressed: false }))
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return

      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }

    // Add event listeners after a brief delay to ensure canvas is ready
    setTimeout(() => {
      const canvas = renderer.domElement
      console.log("Adding event listeners to canvas:", canvas)

      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mousedown", handleMouseDown)
      canvas.addEventListener("mouseup", handleMouseUp)
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
      canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

      // Also add to window as fallback
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mousedown", handleMouseDown)
      window.addEventListener("mouseup", handleMouseUp)

      console.log("Event listeners added")
    }, 100)

    window.addEventListener("resize", handleResize)

    // Start animation loop
    animate()

    return () => {
      // Cleanup
      const canvas = rendererRef.current?.domElement
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mouseup", handleMouseUp)
        canvas.removeEventListener("touchmove", handleTouchMove)
        canvas.removeEventListener("touchstart", handleTouchStart)
        canvas.removeEventListener("touchend", handleTouchEnd)
      }

      // Remove window listeners
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("resize", handleResize)

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }

      particlesRef.current.forEach((particle) => {
        if (sceneRef.current) {
          sceneRef.current.remove(particle.mesh)
        }
      })
    }
  }, [])

  const createHollowSphere = () => {
    const particles: Particle[] = []
    const numParticles = 2000
    const sphereRadius = 6 // Tighter sphere
    const innerRadius = 4.5 // Smaller hollow center
    const shellThickness = sphereRadius - innerRadius

    // Create particle geometry and material
    const geometry = new THREE.SphereGeometry(0.04, 8, 8) // Slightly smaller particles
    const material = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.9,
    })

    for (let i = 0; i < numParticles; i++) {
      // More uniform distribution using Fibonacci sphere
      const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle
      const theta = goldenAngle * i // Golden angle increment
      const y = 1 - (i / (numParticles - 1)) * 2 // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y)

      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY

      // Create tighter shell by using less random variation
      const shellPosition = 0.7 + Math.random() * 0.3 // Concentrate more particles toward outer edge
      const radius = innerRadius + shellPosition * shellThickness

      const position = new THREE.Vector3(x * radius, y * radius, z * radius)

      const mesh = new THREE.Mesh(geometry, material.clone())
      mesh.position.copy(position)

      const particle: Particle = {
        mesh,
        position: position.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        originalPosition: position.clone(),
      }

      particles.push(particle)

      if (sceneRef.current) {
        sceneRef.current.add(mesh)
      }
    }

    particlesRef.current = particles
    setDebugInfo((prev) => ({ ...prev, particleCount: particles.length }))
  }

  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate)

    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return

    // Update particles with physics
    updateParticles()

    // Rotate camera around the sphere
    const time = Date.now() * 0.0005
    cameraRef.current.position.x = Math.cos(time) * 15
    cameraRef.current.position.z = Math.sin(time) * 15
    cameraRef.current.lookAt(0, 0, 0)

    rendererRef.current.render(sceneRef.current, cameraRef.current)
  }

  const updateParticles = () => {
    if (!cameraRef.current) return

    let affectedCount = 0

    particlesRef.current.forEach((particle, index) => {
      // Mouse interaction with very subtle movements
      if (isMouseDownRef.current) {
        // Create a 3D mouse position in world space
        const mouseWorld3D = new THREE.Vector3(mouseRef.current.x * 6, mouseRef.current.y * 6, 0)

        // Calculate distance from particle to mouse position
        const distance = particle.position.distanceTo(mouseWorld3D)

        // Smaller influence radius for more localized effect
        if (distance < 8) {
          // Force direction: away from mouse
          const forceDirection = particle.position.clone().sub(mouseWorld3D)

          if (forceDirection.length() > 0) {
            forceDirection.normalize()

            // Much smaller, very subtle repulsion force
            const forceStrength = 0.05 * (1 - distance / 8)
            forceDirection.multiplyScalar(forceStrength)

            particle.velocity.add(forceDirection)
            affectedCount++

            // Change color when affected - keep red
            const material = particle.mesh.material as THREE.MeshBasicMaterial
            material.color.setRGB(1, 0, 0) // Red when affected
          }
        }
      }

      // Very strong damping for smooth, non-bouncy movement
      particle.velocity.multiplyScalar(0.85)

      // Gentle but consistent spring force back to original position
      const restoreForce = particle.originalPosition.clone().sub(particle.position)
      restoreForce.multiplyScalar(0.12)
      particle.velocity.add(restoreForce)

      // Update position
      particle.position.add(particle.velocity)
      particle.mesh.position.copy(particle.position)

      // Gradually restore to original blue color
      if (!isMouseDownRef.current) {
        const material = particle.mesh.material as THREE.MeshBasicMaterial
        material.color.lerp(new THREE.Color(0x4f46e5), 0.1)
      }
    })

    // Update debug info
    setDebugInfo((prev) => ({ ...prev, affectedParticles: affectedCount }))
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black touch-none select-none"
      onMouseMove={(e) => {
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
        setDebugInfo((prev) => ({
          ...prev,
          mouseX: mouseRef.current.x,
          mouseY: mouseRef.current.y,
        }))
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        isMouseDownRef.current = true
        setDebugInfo((prev) => ({ ...prev, isPressed: true }))
      }}
      onMouseUp={(e) => {
        e.preventDefault()
        isMouseDownRef.current = false
        setDebugInfo((prev) => ({ ...prev, isPressed: false }))
      }}
      onTouchMove={(e) => {
        e.preventDefault()
        if (e.touches.length > 0) {
          const touch = e.touches[0]
          mouseRef.current.x = (touch.clientX / window.innerWidth) * 2 - 1
          mouseRef.current.y = -(touch.clientY / window.innerHeight) * 2 + 1
          setDebugInfo((prev) => ({
            ...prev,
            mouseX: mouseRef.current.x,
            mouseY: mouseRef.current.y,
          }))
        }
      }}
      onTouchStart={(e) => {
        e.preventDefault()
        isMouseDownRef.current = true
        setDebugInfo((prev) => ({ ...prev, isPressed: true }))
        if (e.touches.length > 0) {
          const touch = e.touches[0]
          mouseRef.current.x = (touch.clientX / window.innerWidth) * 2 - 1
          mouseRef.current.y = -(touch.clientY / window.innerHeight) * 2 + 1
          setDebugInfo((prev) => ({
            ...prev,
            mouseX: mouseRef.current.x,
            mouseY: mouseRef.current.y,
          }))
        }
      }}
      onTouchEnd={(e) => {
        e.preventDefault()
        isMouseDownRef.current = false
        setDebugInfo((prev) => ({ ...prev, isPressed: false }))
      }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Instructions overlay */}
      <div className="absolute top-6 left-6 text-white z-10 pointer-events-none">
        <h1 className="text-2xl font-bold mb-2">3D Hollow Sphere</h1>
        <p className="text-sm opacity-80">Click and drag to apply gravity forces</p>
        <p className="text-xs opacity-60 mt-1">Touch and move on mobile devices</p>
      </div>

      {/* Debug panel */}
      <div className="absolute bottom-6 left-6 text-white text-xs z-10 pointer-events-none bg-black/50 p-3 rounded">
        <p>
          Mouse: {debugInfo.mouseX.toFixed(2)}, {debugInfo.mouseY.toFixed(2)}
        </p>
        <p>Pressed: {debugInfo.isPressed ? "YES" : "NO"}</p>
        <p>Particles: {debugInfo.particleCount}</p>
        <p>Affected: {debugInfo.affectedParticles}</p>
      </div>

      {/* Info panel */}
      <div className="absolute bottom-6 right-6 text-white text-xs opacity-60 z-10 pointer-events-none">
        <p>Hollow center with gravity physics</p>
        <p>Debug info in bottom left</p>
      </div>
    </div>
  )
}
