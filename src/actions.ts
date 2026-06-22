/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {getState as get, setState as set} from './store'
import {queryLlm} from './lib/llm'
import {queryPrompt} from './lib/prompts'
import {sphereLayout, gridLayout} from './lib/layout'
import type {LayoutName, Moment} from './types'

export const init = async (): Promise<void> => {
  if (get().didInit) {
    return
  }
  set(state => {
    state.didInit = true
  })

  const moments: Moment[] = await fetch('moments.json').then(res => res.json())
  const ids = moments.map(m => m.id)

  set(state => {
    state.moments = moments
    state.layouts = {
      sphere: sphereLayout(ids),
      grid: gridLayout(ids)
    }
    state.nodePositions = Object.fromEntries(ids.map(id => [id, [0.5, 0.5, 0.5]]))
  })

  setLayout('sphere')
}

export const setLayout = (layout: LayoutName): void =>
  set(state => {
    state.layout = layout
    if (state.layouts) {
      state.nodePositions = state.layouts[layout]
    }
  })

/** Build a rich text blob for a moment so the LLM has context to match on. */
const momentText = (m: Moment): string =>
  `${m.title}. ${m.description} (${m.player}, ${m.team}, ${m.match})`

export const sendQuery = async (query: string): Promise<void> => {
  set(state => {
    state.isFetching = true
    state.targetMoment = null
    state.resetCam = true
    state.caption = null
  })
  try {
    const corpus = (get().moments ?? []).map(m => ({...m, description: momentText(m)}))
    const res = await queryLlm({prompt: queryPrompt(corpus, query)})
    try {
      const resJ = JSON.parse(res.replace('```json', '').replace('```', ''))
      set(state => {
        state.highlightNodes = resJ.filenames
        state.caption = resJ.commentary
      })
    } catch (e) {
      console.error('Failed to parse LLM response', e)
    }
  } finally {
    set(state => {
      state.isFetching = false
    })
  }
}

export const clearQuery = (): void =>
  set(state => {
    state.highlightNodes = null
    state.caption = null
    state.targetMoment = null
  })

export const setXRayMode = (xRayMode: boolean): void =>
  set(state => {
    state.xRayMode = xRayMode
  })

export const setTargetMoment = (targetMoment: string | null): void => {
  if (targetMoment === get().targetMoment) {
    targetMoment = null
  }
  set(state => {
    state.targetMoment = targetMoment
    state.highlightNodes = null
  })
}

// --- Community memory (Phase 1: local; Phase 2: Walrus blobs) ---
export const addNote = async ({
  momentId,
  author,
  text
}: {
  momentId: string
  author: string
  text: string
}): Promise<void> => {
  if (!momentId || !text.trim()) {
    return
  }
  set(state => {
    state.isAddingNote = true
  })
  try {
    const note = {
      author: author.trim() || 'anon',
      text: text.trim(),
      ts: Date.now(),
      blobId: null
    }
    set(state => {
      if (!state.notes[momentId]) {
        state.notes[momentId] = []
      }
      state.notes[momentId].push(note)
    })
  } finally {
    set(state => {
      state.isAddingNote = false
    })
  }
}

export const toggleSidebar = (): void =>
  set(state => {
    state.isSidebarOpen = !state.isSidebarOpen
  })

export const setSidebarOpen = (isOpen: boolean): void =>
  set(state => {
    state.isSidebarOpen = isOpen
  })

init()
