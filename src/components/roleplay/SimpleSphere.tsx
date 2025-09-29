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

interface SimpleSphereProps {
  onMouseDown?: () => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: () => void
  onTouchEnd?: () => void
  onClick?: () => void
  disabled?: boolean
  isPressed?: boolean
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export default function SimpleSphere({
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onClick,
  disabled = false,
  isPressed = false,
  className = "",
  size = "lg",
}: SimpleSphereProps) {
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

  // Breathing effect
  const breathingPhaseRef = useRef<number>(0)

  const sizeMap = {
    sm: { width: 96, height: 96 },    // w-24 h-24
    md: { width: 128, height: 128 },  // w-32 h-32
    lg: { width: 160, height: 160 },  // w-40 h-40
    xl: { width: 192, height: 192 },  // w-48 h-48
  }

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup with transparent background
    const scene = new THREE.Scene()
    scene.background = null
    sceneRef.current = scene

    // Add subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    // Bright lighting to make specs visible - bright light purple for both modes
    const lightColor = 0xda70d6 // Bright light purple (orchid)
    const pointLight = new THREE.PointLight(lightColor, 1.0, 100)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    // Get container dimensions - use actual element size if available, fallback to size map
    const rect = mountRef.current.getBoundingClientRect()
    const containerSize = sizeMap[size]
    const containerWidth = rect.width || containerSize.width
    const containerHeight = rect.height || containerSize.height

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

    // Add canvas to DOM
    const canvas = renderer.domElement
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.zIndex = '1'

    if (mountRef.current) {
      mountRef.current.appendChild(canvas)
    }
    rendererRef.current = renderer

    // Create the enhanced hollow sphere
    createEnhancedHollowSphere()

    // Event listeners for interaction
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
      if (disabled) return
      event.preventDefault()
      handleInteraction(event.clientX, event.clientY)
      onMouseDown?.()
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (disabled) return
      onMouseUp?.()
    }

    const handleMouseLeave = (event: MouseEvent) => {
      if (disabled) return
      onMouseLeave?.()
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (disabled) return
      event.preventDefault()
      if (event.touches.length > 0) {
        const touch = event.touches[0]
        handleInteraction(touch.clientX, touch.clientY)
      }
      onTouchStart?.()
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (disabled) return
      onTouchEnd?.()
    }

    const handleClick = (event: MouseEvent) => {
      if (disabled) return
      onClick?.()
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !mountRef.current) return

      const rect = mountRef.current.getBoundingClientRect()
      const containerSize = sizeMap[size]
      const containerWidth = rect.width || containerSize.width
      const containerHeight = rect.height || containerSize.height

      cameraRef.current.aspect = containerWidth / containerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(containerWidth, containerHeight)
    }

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)
    canvas.addEventListener("click", handleClick)
    window.addEventListener("resize", handleResize)

    function createEnhancedHollowSphere() {
      const particles: Particle[] = []

      // Using golden ratio spiral for denser, more aesthetic distribution
      const numParticles = 3500  // Increased for denser coverage
      const sphereRadius = 7

      // Even smaller particles for cleaner look with more density
      const geometry = new THREE.SphereGeometry(0.015, 6, 6)

      // Golden ratio for optimal spacing
      const goldenRatio = (1 + Math.sqrt(5)) / 2
      const goldenAngle = 2 * Math.PI / (goldenRatio * goldenRatio)

      // Create particles using Fibonacci sphere distribution
      for (let i = 0; i < numParticles; i++) {
        // Using golden ratio spiral distribution
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

        // Shiny bright light purple specs
        const baseColor = 0xda70d6 // Bright light purple (orchid)
        const emissiveColor = 0xe6a8e6 // Even brighter light purple

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

      // Slower, subtler breathing effect
      breathingPhaseRef.current += 0.01
      const breathingScale = 1 + Math.sin(breathingPhaseRef.current) * 0.03

      // Update particles with ripple physics
      updateParticlesWithRipples(breathingScale)

      // Rotation around Y-axis (vertical axis) for proper clockwise spin
      const time = Date.now() * 0.00005 // Much slower rotation speed
      const radius = 18
      const angle = time

      // Rotate camera around Y-axis (vertical) for clockwise rotation when viewed from above
      cameraRef.current.position.x = Math.cos(angle) * radius
      cameraRef.current.position.y = 0  // Keep camera at same height
      cameraRef.current.position.z = Math.sin(angle) * radius
      cameraRef.current.lookAt(0, 0, 0)

      rendererRef.current.render(sceneRef.current, cameraRef.current)

      // Force canvas repaint to ensure visual updates
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
          // Bright purple ripple effect - even brighter when touched
          const intensity = Math.min(particle.rippleAmplitude, 1)
          const rippleColor = new THREE.Color(0xf0a0f0) // Bright pink-purple for ripples

          material.color.lerp(rippleColor, intensity * 0.7)
          material.emissive.lerp(rippleColor, intensity * 0.5)
        } else {
          // Return to bright light purple base colors
          const baseColor = new THREE.Color(0xda70d6) // Bright light purple
          const baseEmissive = new THREE.Color(0xe6a8e6) // Even brighter light purple
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
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("click", handleClick)
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
  }, [size, onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, onClick, disabled])

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
    xl: "w-48 h-48",
  }

  return (
    <div
      className={`
        relative
        ${sizeClasses[size]}
        rounded-full
        transition-transform
        duration-300
        ease-out
        ${isPressed ? "scale-95" : "hover:scale-105"}
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${className}
      `}
    >
      <div ref={mountRef} className="w-full h-full relative" />
    </div>
  )
}