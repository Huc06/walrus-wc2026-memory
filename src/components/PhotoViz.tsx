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
const CAMERA_DISTANCE = 52
const CAMERA_PAN_X = 26 // shift hero left of the right-side detail panel

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
  // TrackballControls instance (drei) — typed loosely to avoid a hard dep on three-stdlib types.
  const controlsRef = useRef<any>(null)
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rotationVelocityRef = useRef(0)

  // Animation targets, lerped each frame (replaces motion's animate()).
  const flyCamPosRef = useRef<Vector3 | null>(null)
  const flyCtrlTargetRef = useRef<Vector3 | null>(null)
  const groupZRef = useRef(0)

  const targetSpeed = 0.1
  const acceleration = 0.5

  const restartInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    inactivityTimerRef.current = setTimeout(() => {
      setIsAutoRotating(true)
    }, 12000)
  }

  const handleInteractionStart = () => {
    setIsAutoRotating(false)
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    rotationVelocityRef.current = 0
    flyCamPosRef.current = null
    flyCtrlTargetRef.current = null
  }

  const handleInteractionEnd = () => {
    restartInactivityTimer()
  }

  // Fly to a focused node.
  useEffect(() => {
    if (
      targetMoment &&
      nodePositions &&
      camera &&
      controlsRef.current &&
      groupRef.current
    ) {
      setIsAutoRotating(false)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      rotationVelocityRef.current = 0

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

      // Pan the framing left so the enlarged hero sits clear of the right-side
      // detail panel (panel ≈ 380px). Shift both eye + target along camera-right.
      const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(CAMERA_PAN_X)

      flyCtrlTargetRef.current = targetNodeWorldVec.clone().add(right)
      flyCamPosRef.current = targetNodeWorldVec.clone().add(offsetDirection).add(right)
    } else if (!targetMoment) {
      restartInactivityTimer()
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

    if (flyCamPosRef.current && flyCtrlTargetRef.current && controlsRef.current) {
      camera.position.lerp(flyCamPosRef.current, k)
      controlsRef.current.target.lerp(flyCtrlTargetRef.current, k)
      if (camera.position.distanceTo(flyCamPosRef.current) < 0.5) {
        camera.position.copy(flyCamPosRef.current)
        controlsRef.current.target.copy(flyCtrlTargetRef.current)
        flyCamPosRef.current = null
        flyCtrlTargetRef.current = null
      }
    }

    if (groupRef.current) {
      groupRef.current.position.z +=
        (groupZRef.current - groupRef.current.position.z) * k
      if (!isAutoRotating) {
        groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * k
        groupRef.current.rotation.z += (0 - groupRef.current.rotation.z) * k
      }
    }

    let v = rotationVelocityRef.current
    v += ((isAutoRotating ? targetSpeed : 0) - v) * acceleration * delta
    rotationVelocityRef.current = v
    if (groupRef.current && Math.abs(v) > 0.0001 && layout !== 'grid') {
      groupRef.current.rotation.y += v * delta
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
        minDistance={40}
        maxDistance={1000}
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
