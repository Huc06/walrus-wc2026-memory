/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {getState as get, setState as set} from './store'
import {sphereLayout, gridLayout} from './lib/layout'
import type {LayoutName, Moment, Note} from './types'

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

export const sendQuery = async (query: string): Promise<void> => {
  set(state => {
    state.isFetching = true
    state.targetMoment = null
    state.resetCam = true
    state.caption = null
  })
  try {
    const moments = (get().moments ?? []).map(m => ({
      id: m.id,
      player: m.player,
      team: m.team,
      type: m.type,
      title: m.title,
      description: m.description
    }))
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query, moments})
    })
    const data = await res.json()
    set(state => {
      state.highlightNodes = Array.isArray(data.filenames) ? data.filenames : []
      state.caption = data.commentary ?? (res.ok ? '' : `(${data.error ?? 'search error'})`)
    })
  } catch (e) {
    console.error('search failed', e)
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
  if (targetMoment) {
    loadNotes(targetMoment)
  }
}

/** Ask the agent (OpenRouter + Walrus Memory) to react to a moment + its notes. */
export const askAgent = async (moment: Moment): Promise<string> => {
  try {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        momentId: moment.id,
        title: moment.title,
        player: moment.player,
        description: moment.description
      })
    })
    const data = await res.json()
    return res.ok ? (data.text ?? '') : `(${data.error ?? 'agent error'})`
  } catch (e) {
    console.warn('askAgent failed', e)
    return ''
  }
}

/** Fetch a moment's community notes from Walrus (via the memwal API). */
export const loadNotes = async (momentId: string): Promise<void> => {
  try {
    const res = await fetch(`/api/notes?momentId=${encodeURIComponent(momentId)}`)
    if (!res.ok) return
    const {notes} = (await res.json()) as {notes: Note[]}
    set(state => {
      state.notes[momentId] = notes
    })
  } catch (e) {
    console.warn('loadNotes failed', e)
  }
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
    // Publish to Walrus Memory (mainnet) via the server API, which holds the
    // delegate key. Falls back to a local-only note if the API is unavailable.
    let note: Note
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({momentId, author, text})
      })
      if (!res.ok) throw new Error(await res.text())
      note = (await res.json()) as Note
    } catch (e) {
      console.warn('addNote: falling back to local note', e)
      note = {author: author.trim() || 'anon', text: text.trim(), ts: Date.now(), blobId: null}
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
