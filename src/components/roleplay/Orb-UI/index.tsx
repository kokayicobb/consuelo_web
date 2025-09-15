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
    console.log("[RippleSphere] Component mounted, mountRef:", mountRef.current)
    if (!mountRef.current) return

    // Scene setup with a more sophisticated background
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f0f23)
    sceneRef.current = scene

    // Add subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    // Add a point light for depth
    const pointLight = new THREE.PointLight(0x6366f1, 0.5, 100)
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

    // Ensure canvas is properly styled for rendering
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.zIndex = '1'

    mountRef.current.appendChild(canvas)
    rendererRef.current = renderer

    console.log("[RippleSphere] Canvas added to DOM:", {
      width: canvas.width,
      height: canvas.height,
      style: canvas.style.cssText,
      parent: mountRef.current
    })

    // Create the enhanced hollow sphere
    console.log("[RippleSphere] Creating hollow sphere...")
    createEnhancedHollowSphere()
    console.log("[RippleSphere] Created", particlesRef.current.length, "particles")

    // Event listeners for precise interaction
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

    // Start animation loop
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      console.log("[RippleSphere] Starting animation loop")
      animate()
    } else {
      console.error("[RippleSphere] Cannot start animation - missing refs:", {
        scene: !!sceneRef.current,
        camera: !!cameraRef.current,
        renderer: !!rendererRef.current
      })
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

  const createEnhancedHollowSphere = () => {
    const particles: Particle[] = []
    const numParticles = 3000 // More particles for denser effect
    const sphereRadius = 7
    const innerRadius = 5.5 // Tighter hollow center
    const shellThickness = sphereRadius - innerRadius

    // Enhanced particle geometry with subtle glow
    const geometry = new THREE.SphereGeometry(0.025, 8, 8)

    for (let i = 0; i < numParticles; i++) {
      // Fibonacci sphere distribution for perfect uniformity
      const goldenAngle = Math.PI * (3 - Math.sqrt(5))
      const theta = goldenAngle * i
      const y = 1 - (i / (numParticles - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)

      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY

      const shellPosition = Math.pow(Math.random(), 0.3) // Bias toward outer edge
      const radius = innerRadius + shellPosition * shellThickness

      const position = new THREE.Vector3(x * radius, y * radius, z * radius)

      const material = new THREE.MeshPhongMaterial({
        color: 0xc084fc, // Light purple
        transparent: true,
        opacity: 0.8,
        shininess: 100,
        emissive: 0x8b5cf6, // Purple emissive
        emissiveIntensity: 0.1,
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

  const createRippleEffect = (center: THREE.Vector3) => {
    const currentTime = Date.now()

    if (currentTime - lastInteractionRef.current < 50) return
    lastInteractionRef.current = currentTime

    console.log("[v0] Ripple created at:", center)

    const ripple: RippleEffect = {
      center: center.clone(),
      radius: 0,
      maxRadius: 6, // Increased ripple radius for more visible effect
      strength: 1.5, // Increased strength for more noticeable dispersion
      startTime: currentTime,
      duration: 2000, // Slightly longer duration for better visibility
    }

    rippleEffectsRef.current.push(ripple)

    // Clean up old ripples
    rippleEffectsRef.current = rippleEffectsRef.current.filter((r) => currentTime - r.startTime < r.duration)
  }

  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate)

    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) {
      console.error("[RippleSphere] Animation stopped - missing refs")
      return
    }

    // Update breathing effect for AI assistant feel (make it more noticeable)
    breathingPhaseRef.current += 0.02
    const breathingScale = 1 + Math.sin(breathingPhaseRef.current) * 0.1  // Increased from 0.02 to 0.1

    // Update particles with ripple physics
    updateParticlesWithRipples(breathingScale)

    // More noticeable camera rotation for dynamic feel
    const time = Date.now() * 0.001  // Increased from 0.0003 to 0.001
    cameraRef.current.position.x = Math.cos(time) * 18
    cameraRef.current.position.z = Math.sin(time) * 18
    cameraRef.current.lookAt(0, 0, 0)

    rendererRef.current.render(sceneRef.current, cameraRef.current)

    // Force canvas repaint to ensure visual updates
    rendererRef.current.domElement.style.transform = `translateZ(${Math.sin(Date.now() * 0.001) * 0.01}px)`

    // Log every 60 frames to see if animation is running
    if (animationIdRef.current % 60 === 0) {
      console.log("[RippleSphere] Animation frame:", animationIdRef.current, "breathing:", breathingScale.toFixed(3), "camera pos:", cameraRef.current.position.x.toFixed(2))
    }
  }

  const updateParticlesWithRipples = (breathingScale: number) => {
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

          if (waveFront < 1.2) {
            const intensity = (1 - waveFront / 1.2) * (1 - progress) * ripple.strength

            const direction = particle.originalPosition.clone().sub(ripple.center)
            if (direction.length() > 0) {
              direction.normalize()

              const displacement = direction.multiplyScalar(intensity * 0.3)
              particle.velocity.add(displacement)

              particle.rippleAmplitude = Math.max(particle.rippleAmplitude, intensity)
              isAffected = true
            }
          }
        }
      })

      const restoreForce = particle.originalPosition.clone().sub(particle.position)
      restoreForce.multiplyScalar(0.08) // Gentle spring constant
      particle.velocity.add(restoreForce)

      particle.velocity.multiplyScalar(0.85)

      const breathingOffset = particle.originalPosition.clone().multiplyScalar(breathingScale - 1)

      particle.position.copy(particle.originalPosition).add(breathingOffset)
      particle.position.add(particle.velocity)
      particle.mesh.position.copy(particle.position)

      const material = particle.mesh.material as THREE.MeshPhongMaterial
      if (isAffected && particle.rippleAmplitude > 0.1) {
        const redIntensity = Math.min(particle.rippleAmplitude, 1)
        material.color.setRGB(
          0.75 + redIntensity * 0.25, // Light purple to red transition
          0.52 - redIntensity * 0.52, // Reduce green
          0.99 - redIntensity * 0.99, // Reduce blue
        )
        material.emissive.setRGB(redIntensity * 0.4, 0, (1 - redIntensity) * 0.35)
      } else {
        material.color.lerp(new THREE.Color(0xc084fc), 0.05)
        material.emissive.lerp(new THREE.Color(0x8b5cf6), 0.05)
      }
    })

    // Clean up finished ripples
    rippleEffectsRef.current = rippleEffectsRef.current.filter(
      (ripple) => currentTime - ripple.startTime < ripple.duration,
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 select-none">
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
