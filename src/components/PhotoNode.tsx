/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useMemo, useRef} from 'react'
import {useLoader, useFrame} from '@react-three/fiber'
import {Billboard, Text} from '@react-three/drei'
import {TextureLoader, type Group, type MeshStandardMaterial} from 'three'
import {setTargetMoment} from '../actions'
import type {Moment} from '../types'

const thumbHeight = 16
const thumbWidth = 16

const typeEmoji: Record<string, string> = {goal: '⚽', save: '🧤', skill: '✨'}

const escapeXml = (s: string): string =>
  String(s ?? '').replace(
    /[&<>"']/g,
    c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c] as string)
  )

// Build a placeholder "moment card" as an SVG data URI (Phase 1).
// Phase 2 swaps this for a real image blob served from Walrus.
const buildPlaceholder = (m: Moment): string => {
  const color = m.teamColor || '#444'
  const emoji = typeEmoji[m.type] || '⚽'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${color}" stop-opacity="0.85"/>
        <stop offset="1" stop-color="#0a0a0a"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" rx="20" fill="#0a0a0a"/>
    <rect width="256" height="256" rx="20" fill="url(#g)"/>
    <rect x="4" y="4" width="248" height="248" rx="17" fill="none" stroke="${color}" stroke-width="2" opacity="0.6"/>
    <text x="128" y="92" font-size="56" text-anchor="middle">${emoji}</text>
    <text x="128" y="150" font-size="20" font-family="sans-serif" font-weight="700"
      fill="#fff" text-anchor="middle">${escapeXml(m.player)}</text>
    <text x="128" y="178" font-size="13" font-family="sans-serif"
      fill="#ffffffcc" text-anchor="middle">${escapeXml(m.team)}</text>
    <text x="128" y="222" font-size="12" font-family="sans-serif"
      fill="${color}" text-anchor="middle">${escapeXml(m.minute ?? '')} · ${escapeXml(m.type)}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

interface PhotoNodeProps {
  id: string
  moment: Moment
  x?: number
  y?: number
  z?: number
  highlight?: boolean
  dim?: boolean
  xRayMode?: boolean
}

export default function PhotoNode({
  id,
  moment,
  x = 0,
  y = 0,
  z = 0,
  highlight,
  dim,
  xRayMode
}: PhotoNodeProps) {
  const uri = useMemo(() => buildPlaceholder(moment), [moment])
  const texture = useLoader(TextureLoader, uri)
  const groupRef = useRef<Group>(null)
  const matRef = useRef<MeshStandardMaterial>(null)
  const targetOpacity = highlight ? 1 : dim ? 0.1 : 1

  // Animate position (layout morph) + opacity (highlight/dim) by lerping
  // each frame — replaces framer-motion-3d (incompatible here).
  useFrame((_, delta) => {
    // Position eases slower (the dramatic "bloom"); opacity fades a touch faster.
    const kp = Math.min(1, delta * 3)
    const ko = Math.min(1, delta * 5)
    if (groupRef.current) {
      groupRef.current.position.x += (x * 600 - groupRef.current.position.x) * kp
      groupRef.current.position.y += (y * 600 - groupRef.current.position.y) * kp
      groupRef.current.position.z += (z * 600 - groupRef.current.position.z) * kp
      // The focused node grows into the hero/highlight; others stay at 1.
      const targetScale = highlight ? 2.4 : 1
      const s = groupRef.current.scale.x + (targetScale - groupRef.current.scale.x) * ko
      groupRef.current.scale.setScalar(s)
    }
    if (matRef.current) {
      matRef.current.opacity += (targetOpacity - matRef.current.opacity) * ko
    }
  })

  if (!texture) return null

  return (
    <group
      ref={groupRef}
      onClick={e => {
        e.stopPropagation()
        setTargetMoment(id)
      }}
      // Start nearer the centre and let useFrame lerp out to *600 — the
      // "bloom" entrance from the original (which animated *500 → *600).
      position={[x * 500, y * 500, z * 500]}
    >
      <Billboard>
        <mesh scale={[thumbWidth, thumbHeight, 1]} renderOrder={highlight ? 10 : 0}>
          <planeGeometry />
          <meshStandardMaterial
            ref={matRef}
            map={texture}
            transparent
            opacity={0}
            depthWrite={!dim}
            color={xRayMode ? '#999' : '#fff'}
          />
        </mesh>
      </Billboard>

      <Billboard>
        <Text
          fontSize={1}
          color="white"
          anchorX="center"
          anchorY="middle"
          position={[0, -thumbHeight / 2 - 1.5, 0]}
          maxWidth={thumbWidth + 6}
          textAlign="center"
          fillOpacity={xRayMode ? 1 : 0}
        >
          {moment.title}
        </Text>
      </Billboard>
    </group>
  )
}
