/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useMemo, useRef, useEffect, useState} from 'react'
import {useLoader, useFrame} from '@react-three/fiber'
import {Billboard, Text} from '@react-three/drei'
import {TextureLoader, VideoTexture, type Group, type MeshStandardMaterial} from 'three'
import {setTargetMoment} from '../actions'
import type {Moment} from '../types'

// Landscape 16:9 — sized to hold a real moment photo later (placeholder for now).
const aspectRatio = 16 / 9
const thumbHeight = 21
const thumbWidth = thumbHeight * aspectRatio

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
  // 16:9 placeholder: team-colour "photo" with a big emoji, plus a bottom
  // caption bar (player / team / minute) — mimics a real image card.
  const W = 384
  const H = 216
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${color}" stop-opacity="0.9"/>
        <stop offset="1" stop-color="#0a0a0a"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" rx="18" fill="#0a0a0a"/>
    <rect width="${W}" height="${H}" rx="18" fill="url(#g)"/>
    <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="15" fill="none" stroke="${color}" stroke-width="2" opacity="0.55"/>
    <text x="${W / 2}" y="108" font-size="96" text-anchor="middle">${emoji}</text>
    <rect x="0" y="146" width="${W}" height="70" fill="#000000" opacity="0.42"/>
    <text x="20" y="180" font-size="22" font-family="sans-serif" font-weight="700"
      fill="#fff" text-anchor="start">${escapeXml(m.player)}</text>
    <text x="20" y="202" font-size="14" font-family="sans-serif"
      fill="#ffffffcc" text-anchor="start">${escapeXml(m.team)}</text>
    <text x="${W - 20}" y="202" font-size="14" font-family="sans-serif" font-weight="600"
      fill="${color}" text-anchor="end">${escapeXml(m.minute ?? '')} · ${escapeXml(m.type)}</text>
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
  const hasImage = !!moment.image
  const uri = useMemo(
    () => moment.image ?? buildPlaceholder(moment),
    [moment]
  )
  const texture = useLoader(TextureLoader, uri)
  const groupRef = useRef<Group>(null)
  const matRef = useRef<MeshStandardMaterial>(null)
  const targetOpacity = highlight ? 1 : dim ? 0.1 : 1

  // Video texture: plays on the 3D card when node is highlighted
  const [videoTex, setVideoTex] = useState<VideoTexture | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (highlight && moment.video?.includes('walrus')) {
      const vid = document.createElement('video')
      vid.src = moment.video
      vid.crossOrigin = 'anonymous'
      vid.loop = true
      vid.muted = true
      vid.playsInline = true
      vid.play().catch(() => {})
      videoRef.current = vid
      const tex = new VideoTexture(vid)
      setVideoTex(tex)
      return () => { vid.pause(); vid.src = ''; setVideoTex(null) }
    } else {
      if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = '' }
      setVideoTex(null)
    }
  }, [highlight, moment.video])

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
      const targetScale = highlight ? 1.9 : 1
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
            map={videoTex ?? texture}
            transparent
            opacity={0}
            depthWrite={!dim}
            color={xRayMode ? '#999' : '#fff'}
          />
        </mesh>

        {/* Caption overlay for real photos (can't bake text into a remote image). */}
        {hasImage && (
          <group position={[0, 0, 0.2]} renderOrder={highlight ? 11 : 1}>
            <mesh position={[0, -thumbHeight / 2 + 3, 0]}>
              <planeGeometry args={[thumbWidth, 6.2]} />
              <meshBasicMaterial color="#000" transparent opacity={dim ? 0.15 : 0.55} />
            </mesh>
            <Text
              fontSize={1.9}
              color="#fff"
              anchorX="left"
              anchorY="middle"
              position={[-thumbWidth / 2 + 1.6, -thumbHeight / 2 + 3.7, 0.1]}
              maxWidth={thumbWidth - 9}
              fillOpacity={dim ? 0.15 : 1}
            >
              {moment.player}
            </Text>
            <Text
              fontSize={1.3}
              color={moment.teamColor}
              anchorX="right"
              anchorY="middle"
              position={[thumbWidth / 2 - 1.6, -thumbHeight / 2 + 2.1, 0.1]}
              fillOpacity={dim ? 0.15 : 1}
            >
              {`${moment.minute ?? ''} · ${moment.type}`}
            </Text>
          </group>
        )}
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
