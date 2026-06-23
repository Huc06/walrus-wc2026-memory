/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MomentType = 'goal' | 'save' | 'skill'

/** A curated iconic World Cup 2026 moment (admin layer). */
export interface Moment {
  id: string
  player: string
  team: string
  teamColor: string
  opponent?: string
  match: string
  stadium?: string
  minute?: string
  type: MomentType
  title: string
  description: string
  /** Real photo URL (CC-licensed, hotlinked for now; Walrus blob later). */
  image?: string
}

/** A community memory attached to a moment (public layer). */
export interface Note {
  author: string
  text: string
  ts: number
  /** Walrus blob id once published (Phase 2). */
  blobId: string | null
}

export type LayoutName = 'sphere' | 'grid'

export type Vec3 = [number, number, number]
export type Vec2 = [number, number]

export interface Layouts {
  sphere: Record<string, Vec3>
  grid: Record<string, Vec2>
}
