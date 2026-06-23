/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useRef, useState, useEffect} from 'react'
import c from 'clsx'
import PhotoViz from './components/PhotoViz'
import Sidebar from './components/Sidebar'
import MomentPanel from './components/MomentPanel'
import WalrusLog from './components/WalrusLog'
import PredictCard from './components/PredictCard'
import useStore from './store'
import {setLayout, sendQuery, clearQuery, setXRayMode, toggleSidebar} from './actions'

const searchPresets = [
  'Messi free-kicks',
  'last-minute winners',
  'solo goals',
  'penalty shootout saves'
]

// The marketing landing page — links the app back to it (set VITE_LANDING_URL for deploy).
const LANDING_URL = import.meta.env.VITE_LANDING_URL ?? 'http://localhost:3001'

export default function App() {
  const layout = useStore.use.layout()
  const isFetching = useStore.use.isFetching()
  const xRayMode = useStore.use.xRayMode()
  const caption = useStore.use.caption()
  const isSidebarOpen = useStore.use.isSidebarOpen()
  const highlightNodes = useStore.use.highlightNodes()
  const moments = useStore.use.moments()
  const [value, setValue] = useState('')
  const [searchPresetIdx, setSearchPresetIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(
      () => setSearchPresetIdx(n => (n === searchPresets.length - 1 ? 0 : n + 1)),
      5000
    )
    return () => clearInterval(interval)
  }, [])

  // The R3F canvas can mount at 0 size if the layout is still settling
  // (e.g. a browser banner shifting the page), leaving it stuck at 300×150.
  // Nudge its ResizeObserver a few times right after mount.
  useEffect(() => {
    const fire = () => window.dispatchEvent(new Event('resize'))
    const raf = requestAnimationFrame(fire)
    const timers = [120, 500, 1200].map(ms => setTimeout(fire, ms))
    window.addEventListener('load', fire)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      window.removeEventListener('load', fire)
    }
  }, [])

  return (
    <main>
      <header className="appHeader">
        <a className="appHomeLink" href={LANDING_URL}>
          <h1>Walrus Memory · World Cup 2026</h1>
        </a>
        <p>
          {moments ? `${moments.length} moments` : 'Loading…'}
          {moments && ` · ${moments.filter(m => m.video).length} videos on-chain`}
          {' · remembered on Walrus, forever.'}
        </p>
      </header>
      <PhotoViz />
      <Sidebar />
      <MomentPanel />
      <WalrusLog />
      <PredictCard />
      <footer>
        <div className="caption">{caption && <>{caption}</>}</div>
        <div className="input">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && value) {
                sendQuery(value)
                inputRef.current?.blur()
              }
            }}
            ref={inputRef}
            placeholder={`Search moments… “${searchPresets[searchPresetIdx]}”`}
          />
          <img
            src="https://storage.googleapis.com/experiments-uploads/g2demos/photo-applet/spinner.svg"
            className={c('spinner', {active: isFetching})}
          />
          <button
            onClick={() => {
              clearQuery()
              setValue('')
            }}
            className={c('clearButton', {active: highlightNodes})}
          >
            ×
          </button>
        </div>

        <div className="controls">
          <div></div>
          <div>
            <button onClick={() => setLayout('sphere')} className={c({active: layout === 'sphere'})}>
              sphere
            </button>
            <button onClick={() => setLayout('grid')} className={c({active: layout === 'grid'})}>
              grid
            </button>
          </div>
          <div>
            <label>
              <input type="checkbox" checked={xRayMode} onChange={() => setXRayMode(!xRayMode)} />
              x-ray
            </label>
          </div>
        </div>
      </footer>
      <button
        onClick={toggleSidebar}
        className={c('sidebarButton iconButton', {active: isSidebarOpen})}
        aria-label="Toggle moment list"
        title="Toggle moment list"
      >
        <span className="icon">list</span>
      </button>
    </main>
  )
}
