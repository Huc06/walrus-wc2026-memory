/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import 'immer'
import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import {createSelectorFunctions} from 'auto-zustand-selectors-hook'
import type {LayoutName, Layouts, Moment, Note, Vec3} from './types'

export interface AppState {
  didInit: boolean
  moments: Moment[] | null
  layout: LayoutName
  layouts: Layouts | null
  nodePositions: Record<string, Vec3 | [number, number]> | null
  highlightNodes: string[] | null
  isFetching: boolean
  isSidebarOpen: boolean
  xRayMode: boolean
  targetMoment: string | null
  caption: string | null
  resetCam: boolean
  /** Community memory keyed by moment id. */
  notes: Record<string, Note[]>
  isAddingNote: boolean
}

const initialState: AppState = {
  didInit: false,
  moments: null,
  layout: 'sphere',
  layouts: null,
  nodePositions: null,
  highlightNodes: null,
  isFetching: false,
  isSidebarOpen: false,
  xRayMode: false,
  targetMoment: null,
  caption: null,
  resetCam: false,
  notes: {},
  isAddingNote: false
}

const useStore = createSelectorFunctions(create(immer<AppState>(() => initialState)))

export default useStore

/** Immer-style mutate (recipe returns void). The selector wrapper erases the
 *  immer setState signature, so we re-expose typed helpers here. */
export const setState = useStore.setState as unknown as (
  recipe: (state: AppState) => void
) => void
export const getState = useStore.getState
