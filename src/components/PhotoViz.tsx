/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {TrackballControls} from '@react-three/drei'
import {useRef, useState, useEffect, Suspense} from 'react'
import {Vector3, type Group} from 'three'
import useStore, {setState} from '../store'
import PhotoNode from './PhotoNode'
import {setTargetMoment} from '../actions'

const CAMERA_HOME = new Vector3(0, 0, 185)
const CAMERA_DISTANCE = 66
const CAMERA_PAN_X = 26 // shift hero left of the right-side detail panel
const IDLE_MS = 9000
const AUTO_SPEED = 0.045

function SceneContent() {
  const moments = useStore.use.moments()
  const nodePositions = useStore.use.nodePositions()
  const layout = useStore.use.layout()
  const highlightNodes = useStore.use.highlightNodes()
  const targetMoment = useStore.use.targetMoment()
  const xRayMode = useStore.use.xRayMode()
  const resetCam = useStore.use.resetCam()
  const {camera} = useThree()
  const groupRef = useRef<Group>(null)
  const controlsRef = useRef<any>(null)
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoVelRef = useRef(0)

  // Programmatic camera move targets, lerped each frame.
  const flyCamPosRef = useRef<Vector3 | null>(null)
  const flyCtrlTargetRef = useRef<Vector3 | null>(null)
  const groupZRef = useRef(0)

  const armIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setIsAutoRotating(true), IDLE_MS)
  }

  const handleInteractionStart = () => {
    setIsAutoRotating(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    flyCamPosRef.current = null
    flyCtrlTargetRef.current = null
  }

  const handleInteractionEnd = () => armIdleTimer()

  // Fly to a focused node.
  useEffect(() => {
    if (targetMoment && nodePositions && camera && controlsRef.current && groupRef.current) {
      setIsAutoRotating(false)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

      const nodePos = nodePositions[targetMoment]
      if (!nodePos) return

      const nodeLocalX = (nodePos[0] - 0.5) * 600
      const nodeLocalY = (nodePos[1] - 0.5) * 600
      const nodeLocalZ = ((nodePos[2] ?? 0.5) - 0.5) * 600

      const groupRotationY = groupRef.current.rotation.y
      const groupPositionZ = groupRef.current.position.z

      const targetNodeWorldVec = new Vector3(
        nodeLocalX * Math.cos(groupRotationY) - nodeLocalZ * Math.sin(groupRotationY),
        nodeLocalY,
        nodeLocalX * Math.sin(groupRotationY) +
          nodeLocalZ * Math.cos(groupRotationY) +
          groupPositionZ
      )

      const offsetDirection = camera.position.clone().sub(controlsRef.current.target)
      if (offsetDirection.lengthSq() === 0) offsetDirection.set(0, 0, 1)
      offsetDirection.normalize().multiplyScalar(CAMERA_DISTANCE)

      // Pan left so the enlarged hero clears the right-side detail panel.
      const right = new Vector3(1, 0, 0)
        .applyQuaternion(camera.quaternion)
        .multiplyScalar(CAMERA_PAN_X)

      flyCtrlTargetRef.current = targetNodeWorldVec.clone().add(right)
      flyCamPosRef.current = targetNodeWorldVec.clone().add(offsetDirection).add(right)
    } else if (!targetMoment) {
      armIdleTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMoment, nodePositions, camera])

  // Reset camera + reposition group on layout / reset changes.
  useEffect(() => {
    flyCtrlTargetRef.current = new Vector3(0, 0, 0)
    flyCamPosRef.current = CAMERA_HOME.clone()
    groupZRef.current = layout === 'grid' ? 150 : 0
    setState(state => {
      state.resetCam = false
    })
  }, [layout, resetCam])

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 4)

    // Programmatic camera move (fly-to node / reset).
    if (flyCamPosRef.current && flyCtrlTargetRef.current && controlsRef.current) {
      camera.position.lerp(flyCamPosRef.current, k)
      controlsRef.current.target.lerp(flyCtrlTargetRef.current, k)
      if (camera.position.distanceTo(flyCamPosRef.current) < 0.4) {
        camera.position.copy(flyCamPosRef.current)
        controlsRef.current.target.copy(flyCtrlTargetRef.current)
        flyCamPosRef.current = null
        flyCtrlTargetRef.current = null
      }
    }

    if (groupRef.current) {
      // Sphere / grid depth transition.
      groupRef.current.position.z +=
        (groupZRef.current - groupRef.current.position.z) * 0.08

      // Gentle idle auto-rotation of the cluster (eased in/out).
      const target = isAutoRotating && layout !== 'grid' ? AUTO_SPEED : 0
      autoVelRef.current += (target - autoVelRef.current) * Math.min(1, delta * 1.5)
      if (Math.abs(autoVelRef.current) > 0.0001) {
        groupRef.current.rotation.y += autoVelRef.current * delta
      }
      // Settle any tilt back to level.
      groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * k
      groupRef.current.rotation.z += (0 - groupRef.current.rotation.z) * k
    }

    controlsRef.current?.update()
  })

  return (
    <>
      <ambientLight intensity={2.3} />
      <TrackballControls
        ref={controlsRef}
        onStart={handleInteractionStart}
        onEnd={handleInteractionEnd}
        rotateSpeed={3.2}
        zoomSpeed={1.3}
        dynamicDampingFactor={0.12}
        staticMoving={false}
        minDistance={55}
        maxDistance={900}
        noPan
      />
      <group ref={groupRef}>
        {moments?.map(moment => {
          const pos = nodePositions?.[moment.id]
          const isHighlighted = highlightNodes?.includes(moment.id)
          return (
            <PhotoNode
              key={moment.id}
              id={moment.id}
              moment={moment}
              x={(pos?.[0] ?? 0.5) - 0.5}
              y={(pos?.[1] ?? 0.5) - 0.5}
              z={(pos?.[2] ?? 0.5) - 0.5}
              highlight={
                !!((highlightNodes && isHighlighted) ||
                  (targetMoment && targetMoment === moment.id))
              }
              dim={
                !!((highlightNodes && !isHighlighted) ||
                  (targetMoment && targetMoment !== moment.id))
              }
              xRayMode={xRayMode}
            />
          )
        })}
      </group>
    </>
  )
}

export default function PhotoViz() {
  return (
    <Canvas
      camera={{position: [0, 0, 185], near: 0.1, far: 10000}}
      onPointerMissed={() => setTargetMoment(null)}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  )
}
