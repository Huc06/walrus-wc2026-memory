/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useState, useEffect} from 'react'
import c from 'clsx'
import useStore from '../store'
import {setSidebarOpen, setTargetMoment} from '../actions'

interface Prediction {
  text: string
  ts: number
  blobId: string | null
}

export default function Sidebar() {
  const moments = useStore.use.moments()
  const isSidebarOpen = useStore.use.isSidebarOpen()
  const [tab, setTab] = useState<'moments' | 'memory'>('moments')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [roast, setRoast] = useState('')
  const [loadingRoast, setLoadingRoast] = useState(false)

  // Load prediction history from Walrus when Memory tab opens
  useEffect(() => {
    if (tab !== 'memory' || !isSidebarOpen) return
    fetch('/api/notes?momentId=predict_history')
      .then(r => r.json())
      .then(d => setPredictions(d.notes ?? []))
      .catch(() => {})
  }, [tab, isSidebarOpen])

  const getAgentRoast = async () => {
    if (predictions.length === 0) { setRoast('No predictions yet. Make some calls first!'); return }
    setLoadingRoast(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          query: `Roast this user's prediction record in 2 sentences. Be cheeky like a football pundit. Their predictions: ${predictions.map(p => p.text).join('; ')}`,
          moments: []
        })
      })
      const data = await res.json()
      setRoast(data.commentary || "Can't roast what I can't recall. Keep predicting!")
    } catch { setRoast("The pundit is speechless.") }
    setLoadingRoast(false)
  }

  return (
    <aside className={c('sidebar', {open: isSidebarOpen})}>
      <button className="closeButton" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
        <span className="icon">close</span>
      </button>

      <div className="sidebarTabs">
        <button className={c({active: tab === 'moments'})} onClick={() => setTab('moments')}>
          Moments
        </button>
        <button className={c({active: tab === 'memory'})} onClick={() => setTab('memory')}>
          My Memory
        </button>
      </div>

      {tab === 'moments' && (
        <ul>
          {moments?.map(moment => (
            <li key={moment.id} onClick={() => { setTargetMoment(moment.id); setSidebarOpen(false) }}>
              <span className="thumbnail" style={{background: moment.teamColor}} aria-hidden />
              <p><strong>{moment.title}</strong><br />{moment.player} · {moment.team}</p>
            </li>
          ))}
        </ul>
      )}

      {tab === 'memory' && (
        <div className="memoryTab">
          <h3>Prediction History</h3>
          {predictions.length === 0 && <p className="emptyMemory">No predictions yet. Use the Predict card to make your first call.</p>}
          <ul className="predictionList">
            {predictions.map((p, i) => (
              <li key={i}>
                <span className="predText">{p.text}</span>
                {p.blobId && <span className="predBlob">🐋 {p.blobId.slice(0, 8)}</span>}
              </li>
            ))}
          </ul>

          <div className="roastSection">
            <button className="roastBtn" onClick={getAgentRoast} disabled={loadingRoast}>
              {loadingRoast ? 'thinking…' : 'Get pundit roast of my record'}
            </button>
            {roast && <p className="roastText">"{roast}"</p>}
          </div>

          <div className="memoryFooter">
            <span className="walrusDot" />
            {predictions.length} prediction(s) on Walrus · permanent record
          </div>
        </div>
      )}
    </aside>
  )
}
