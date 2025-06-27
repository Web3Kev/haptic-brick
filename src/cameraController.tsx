import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const DEFAULT_POS = new THREE.Vector3(-3, .5, -3)
const TARGET = new THREE.Vector3(0, -0.2, 0)

export function CameraController({ gameStarted }: { gameStarted: boolean }) {
  const { camera, gl } = useThree()
  const cam = camera as THREE.PerspectiveCamera

  const isDragging = useRef(false)
  const startX = useRef(0)
  const angleY = useRef(Math.atan2(DEFAULT_POS.x, DEFAULT_POS.z))
  const currentAngle = useRef(0)
  const spinning = useRef(false)
  const frame = useRef(0)

  const defaultDistance = useRef(DEFAULT_POS.distanceTo(TARGET))
  const height = useRef(DEFAULT_POS.y)
  const endAngle = useRef(0)

  // FOV update based on orientation
  useEffect(() => {
    const updateFov = () => {
      cam.fov = window.innerHeight > window.innerWidth ? 80 : 50
      cam.updateProjectionMatrix()
    }
    updateFov()
    window.addEventListener('resize', updateFov)
    return () => window.removeEventListener('resize', updateFov)
  }, [cam])

  // Drag to rotate
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      isDragging.current = true
      startX.current = e.clientX
    }

    const onMove = (e: PointerEvent) => {
      if (!isDragging.current || spinning.current) return
      const dx = e.clientX - startX.current
      startX.current = e.clientX
      angleY.current -= dx * 0.005 // horizontal sensitivity
    }

    const onUp = () => {
      isDragging.current = false
    }

    gl.domElement.addEventListener('pointerdown', onDown)
    gl.domElement.addEventListener('pointermove', onMove)
    gl.domElement.addEventListener('pointerup', onUp)

    return () => {
      gl.domElement.removeEventListener('pointerdown', onDown)
      gl.domElement.removeEventListener('pointermove', onMove)
      gl.domElement.removeEventListener('pointerup', onUp)
    }
  }, [gl.domElement])

  // Spin when game starts
 useEffect(() => {
  if (!gameStarted) return
  spinning.current = true
  frame.current = 0
  currentAngle.current = angleY.current

  // Calculate final angle based on DEFAULT_POS
  const dx = DEFAULT_POS.x - TARGET.x
  const dz = DEFAULT_POS.z - TARGET.z
  const baseAngle = Math.atan2(dx, dz)

  //  Add 2π to make a full spin
  endAngle.current = baseAngle + Math.PI * 2
}, [gameStarted])

  useFrame(() => {
  if (spinning.current) {
    const duration = 100
    const t = frame.current / duration

    if (t >= 1) {
      spinning.current = false
      angleY.current = endAngle.current // land on final angle

      const x = Math.sin(angleY.current) * defaultDistance.current
      const z = Math.cos(angleY.current) * defaultDistance.current
      camera.position.set(x, height.current, z)
      camera.lookAt(TARGET)

      return
    }

    const eased = t * t * (3 - 2 * t) // smoothstep easing

    const startAngle = currentAngle.current
    const current = THREE.MathUtils.lerp(startAngle, endAngle.current, eased)

    angleY.current = current
    const x = Math.sin(current) * defaultDistance.current
    const z = Math.cos(current) * defaultDistance.current
    camera.position.set(x, height.current, z)
    camera.lookAt(TARGET)

    frame.current++
  } else {
    // manual drag rotation
    const angle = angleY.current
    const x = Math.sin(angle) * defaultDistance.current
    const z = Math.cos(angle) * defaultDistance.current
    camera.position.set(x, height.current, z)
    camera.lookAt(TARGET)
  }
})

  return null
}