"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

interface Particle {
  mesh: THREE.Mesh
  position: THREE.Vector3
  velocity: THREE.Vector3
  originalPosition: THREE.Vector3
  ripplePhase: number
  rippleAmplitude: number
}

interface RippleEffect {
  center: THREE.Vector3
  radius: number
  maxRadius: number
  strength: number
  startTime: number
  duration: number
}

export default function RippleSphere() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const particlesRef = useRef<Particle[]>([])
  const animationIdRef = useRef<number>()
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const rippleEffectsRef = useRef<RippleEffect[]>([])
  const lastInteractionRef = useRef<number>(0)

  // AI Assistant breathing effect
  const breathingPhaseRef = useRef<number>(0)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup with transparent background
    const scene = new THREE.Scene()
    scene.background = null
    sceneRef.current = scene

    // Add subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    // Bright lighting to make specs visible - gold for light, white for dark
    const isLightMode = document.documentElement.classList.contains('light') ||
                       !document.documentElement.classList.contains('dark')
    const lightColor = isLightMode ? 0xffd700 : 0xffffff // Bright gold or white
    const pointLight = new THREE.PointLight(lightColor, 1.0, 100) // Brighter intensity
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    // Get container dimensions
    const containerRect = mountRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width || window.innerWidth
    const containerHeight = containerRect.height || window.innerHeight

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, containerWidth / containerHeight, 0.1, 1000)
    camera.position.set(0, 0, 18)
    cameraRef.current = camera

    // Renderer setup with enhanced quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(containerWidth, containerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Add canvas to DOM and log its properties
    const canvas = renderer.domElement

    // Ensure canvas is properly styled for rendering - KEEPING ALL FORCED CANVAS SETUP
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.zIndex = '1'

    mountRef.current.appendChild(canvas)
    rendererRef.current = renderer

    // CHANGED: Now using mathematical pattern for particle placement
    createEnhancedHollowSphere()

    // Event listeners for precise interaction - KEEPING ALL INTERACTION CODE INTACT
    const handleInteraction = (clientX: number, clientY: number) => {
      if (!cameraRef.current || !mountRef.current) return

      // Get container bounds for proper coordinate conversion
      const rect = mountRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top

      // Convert screen coordinates to normalized device coordinates
      mouseRef.current.x = (x / rect.width) * 2 - 1
      mouseRef.current.y = -(y / rect.height) * 2 + 1

      // Use raycasting to find the exact 3D intersection point
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

      // Create an invisible sphere for intersection testing
      const sphereGeometry = new THREE.SphereGeometry(7, 32, 32)
      const sphereMesh = new THREE.Mesh(sphereGeometry)

      const intersects = raycasterRef.current.intersectObject(sphereMesh)

      if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point
        createRippleEffect(intersectionPoint)
      } else {
        // Force create a ripple at sphere surface if no intersection found
        const direction = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5).normalize()
        const spherePoint = direction.multiplyScalar(7) // sphere radius
        createRippleEffect(spherePoint)
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault()
      handleInteraction(event.clientX, event.clientY)
    }

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()
      if (event.touches.length > 0) {
        const touch = event.touches[0]
        handleInteraction(touch.clientX, touch.clientY)
      }
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !mountRef.current) return

      const containerRect = mountRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width || window.innerWidth
      const containerHeight = containerRect.height || window.innerHeight

      cameraRef.current.aspect = containerWidth / containerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(containerWidth, containerHeight)
    }

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    window.addEventListener("resize", handleResize)

    // Function definitions need to be inside useEffect
    function createEnhancedHollowSphere() {
      const particles: Particle[] = []
      
      // CHANGED: Using golden ratio spiral for denser, more aesthetic distribution
      const numParticles = 3500  // Increased for denser coverage
      const sphereRadius = 7
      
      // CHANGED: Even smaller particles for cleaner look with more density
      const geometry = new THREE.SphereGeometry(0.015, 6, 6)

      // Golden ratio for optimal spacing
      const goldenRatio = (1 + Math.sqrt(5)) / 2
      const goldenAngle = 2 * Math.PI / (goldenRatio * goldenRatio)

      // Create particles using Fibonacci sphere distribution
      for (let i = 0; i < numParticles; i++) {
        // CHANGED: Using golden ratio spiral distribution
        const t = i / numParticles
        const inclination = Math.acos(1 - 2 * t)
        const azimuth = i * goldenAngle
        
        // Convert spherical to Cartesian coordinates
        const x = Math.sin(inclination) * Math.cos(azimuth)
        const y = Math.sin(inclination) * Math.sin(azimuth)
        const z = Math.cos(inclination)
        
        const position = new THREE.Vector3(
          x * sphereRadius,
          y * sphereRadius,
          z * sphereRadius
        )

        // Shiny specs - bright golden for light mode, bright white for dark mode
        const baseColor = isLightMode ? 0xffd700 : 0xffffff // Bright gold or white
        const emissiveColor = isLightMode ? 0xffdf00 : 0xffffff // Bright emissive colors

        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(baseColor),
          transparent: true,
          opacity: 1.0, // Full opacity for maximum visibility
          shininess: 300, // Much shinier
          emissive: emissiveColor,
          emissiveIntensity: 0.3, // Much brighter emissive
          specular: 0xffffff, // White specular highlights
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.copy(position)
        mesh.castShadow = true

        const particle: Particle = {
          mesh,
          position: position.clone(),
          velocity: new THREE.Vector3(0, 0, 0),
          originalPosition: position.clone(),
          ripplePhase: 0,
          rippleAmplitude: 0,
        }

        particles.push(particle)

        if (sceneRef.current) {
          sceneRef.current.add(mesh)
        }
      }

      particlesRef.current = particles
    }

    function createRippleEffect(center: THREE.Vector3) {
      const currentTime = Date.now()

      if (currentTime - lastInteractionRef.current < 50) return
      lastInteractionRef.current = currentTime

      const ripple: RippleEffect = {
        center: center.clone(),
        radius: 0,
        maxRadius: 8,
        strength: 2.5,
        startTime: currentTime,
        duration: 3000,
      }

      rippleEffectsRef.current.push(ripple)

      // Clean up old ripples
      rippleEffectsRef.current = rippleEffectsRef.current.filter((r) => currentTime - r.startTime < r.duration)
    }

    function animate() {
      animationIdRef.current = requestAnimationFrame(animate)

      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) {
        return
      }

      // CHANGED: Slower, subtler breathing effect
      breathingPhaseRef.current += 0.01 // Reduced from 0.02
      const breathingScale = 1 + Math.sin(breathingPhaseRef.current) * 0.03 // Reduced from 0.1

      // Update particles with ripple physics
      updateParticlesWithRipples(breathingScale)

      // CHANGED: Rotation around Y-axis (vertical axis) for proper clockwise spin
      const time = Date.now() * 0.00005 // Much slower rotation speed (reduced from 0.0002)
      const radius = 18
      const angle = time
      
      // Rotate camera around Y-axis (vertical) for clockwise rotation when viewed from above
      cameraRef.current.position.x = Math.cos(angle) * radius
      cameraRef.current.position.y = 0  // Keep camera at same height
      cameraRef.current.position.z = Math.sin(angle) * radius
      cameraRef.current.lookAt(0, 0, 0)

      rendererRef.current.render(sceneRef.current, cameraRef.current)

      // KEEPING: Force canvas repaint to ensure visual updates
      rendererRef.current.domElement.style.transform = `translateZ(${Math.sin(Date.now() * 0.001) * 0.01}px)`
    }

    function updateParticlesWithRipples(breathingScale: number) {
      const currentTime = Date.now()

      particlesRef.current.forEach((particle) => {
        particle.rippleAmplitude = 0
        let isAffected = false

        rippleEffectsRef.current.forEach((ripple) => {
          const elapsed = currentTime - ripple.startTime
          const progress = elapsed / ripple.duration

          if (progress <= 1) {
            const distance = particle.originalPosition.distanceTo(ripple.center)
            const waveRadius = ripple.maxRadius * progress
            const waveFront = Math.abs(distance - waveRadius)

            if (waveFront < 1.5) {
              const intensity = (1 - waveFront / 1.5) * (1 - progress) * ripple.strength

              const direction = particle.originalPosition.clone().sub(ripple.center)
              if (direction.length() > 0) {
                direction.normalize()

                const displacement = direction.multiplyScalar(intensity * 0.5)
                particle.velocity.add(displacement)

                particle.rippleAmplitude = Math.max(particle.rippleAmplitude, intensity)
                isAffected = true
              }
            }
          }
        })

        const restoreForce = particle.originalPosition.clone().sub(particle.position)
        restoreForce.multiplyScalar(0.08)
        particle.velocity.add(restoreForce)

        particle.velocity.multiplyScalar(0.85)

        const breathingOffset = particle.originalPosition.clone().multiplyScalar(breathingScale - 1)

        particle.position.copy(particle.originalPosition).add(breathingOffset)
        particle.position.add(particle.velocity)
        particle.mesh.position.copy(particle.position)

        const material = particle.mesh.material as THREE.MeshPhongMaterial
        if (isAffected && particle.rippleAmplitude > 0.1) {
          // Bright ripple effect - even brighter when touched
          const intensity = Math.min(particle.rippleAmplitude, 1)
          const rippleColor = isLightMode ?
            new THREE.Color(0xffff00) : // Bright yellow-gold for light mode ripples
            new THREE.Color(0xffffff)   // Pure white for dark mode ripples

          material.color.lerp(rippleColor, intensity * 0.7)
          material.emissive.lerp(rippleColor, intensity * 0.5)
        } else {
          // Return to bright base colors
          const baseColor = isLightMode ? new THREE.Color(0xffd700) : new THREE.Color(0xffffff)
          const baseEmissive = isLightMode ? new THREE.Color(0xffdf00) : new THREE.Color(0xffffff)
          material.color.lerp(baseColor, 0.05)
          material.emissive.lerp(baseEmissive, 0.05)
        }
      })

      // Clean up finished ripples
      rippleEffectsRef.current = rippleEffectsRef.current.filter(
        (ripple) => currentTime - ripple.startTime < ripple.duration,
      )
    }

    // Start animation loop
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      animate()
    }

    return () => {
      // Cleanup
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("touchstart", handleTouchStart)
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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent select-none">
      <div ref={mountRef} className="w-full h-full relative" />

      {/* Elegant AI Assistant UI */}
      <div className="absolute top-8 left-8 text-white z-10 pointer-events-none">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h1 className="text-3xl font-light mb-2 text-purple-100">AI Assistant</h1>
          <p className="text-sm opacity-80 text-purple-200">Touch to create ripples</p>
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-300">Active</span>
          </div>
        </div>
      </div>

      {/* Subtle interaction hint */}
      <div className="absolute bottom-8 right-8 text-white/60 text-sm z-10 pointer-events-none">
        <div className="text-right">
          <p className="mb-1">Tap anywhere to interact</p>
          <p className="text-xs">Experience the gentle ripple effect</p>
        </div>
      </div>

      {/* Ambient particles overlay for extra magic */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"></div>
        <div
          className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-300/20 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-purple-500/25 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  )
}