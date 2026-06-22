/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generates node positions for any number of moments, so the
 * visualization no longer depends on precomputed position files.
 * Positions are normalized into the 0..1 cube the renderer expects
 * (PhotoNode multiplies (pos - 0.5) by ~600).
 */
import type {Vec2, Vec3} from '../types'

/**
 * Even points on a sphere via the Fibonacci lattice.
 * `spread` is the normalized half-extent around 0.5 — smaller values
 * pack the nodes into a tighter, denser ball (matching the demo look).
 */
export const sphereLayout = (
  ids: string[],
  spread = 0.13
): Record<string, Vec3> => {
  const n = ids.length
  const positions: Record<string, Vec3> = {}
  const golden = Math.PI * (3 - Math.sqrt(5))

  ids.forEach((id, i) => {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2 // 1 .. -1
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const x = Math.cos(theta) * radius
    const z = Math.sin(theta) * radius
    positions[id] = [0.5 + x * spread, 0.5 + y * spread, 0.5 + z * spread]
  })

  return positions
}

/** Aspect-aware grid (matches the look of the original umap-grid layout). */
export const gridLayout = (ids: string[]): Record<string, Vec2> => {
  const n = ids.length
  const positions: Record<string, Vec2> = {}
  const cols = Math.ceil(Math.sqrt(n * (16 / 9)))
  const rows = Math.ceil(n / cols)

  ids.forEach((id, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = cols === 1 ? 0.5 : col / (cols - 1)
    const y = rows === 1 ? 0.5 : row / (rows - 1)
    positions[id] = [x, y / (16 / 9) + 0.25]
  })

  return positions
}
