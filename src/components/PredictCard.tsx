/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useState, useEffect} from 'react'

interface Match {
  home: string
  away: string
  date: string
}

export default function PredictCard() {
  const [match, setMatch] = useState<Match | null>(null)
  const [pick, setPick] = useState<'home' | 'draw' | 'away' | null>(null)
  const [reason, setReason] = useState('')
  const [saved, setSaved] = useState(false)
  const [predictions, setPredictions] = useState<string[]>([])

  // Fetch next scheduled match
  useEffect(() => {
    fetch('/api/next-match')
      .then(r => r.json())
      .then(d => {
        if (d.home) setMatch({
          home: d.home,
          away: d.away,
          date: new Date(d.date).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})
        })
      })
      .catch(() => {})
  }, [])

  // Recall existing predictions from Walrus Memory
  useEffect(() => {
    if (!match) return
    fetch(`/api/notes?momentId=predict`)
      .then(r => r.json())
      .then(d => {
        const picks = (d.notes ?? []).map((n: any) => n.text)
        setPredictions(picks)
      })
      .catch(() => {})
  }, [match])

  const submit = async () => {
    if (!pick || !match) return
    const winner = pick === 'home' ? match.home : pick === 'away' ? match.away : 'Draw'
    setSaved(true)
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          momentId: 'predict',
          author: 'predictor',
          text: `${match.home} vs ${match.away}: ${winner} wins${reason ? ' — ' + reason : ''}`
        })
      })
      setPredictions(prev => [...prev, `${winner} wins`])
    } catch {}
  }

  if (!match) return null

  const homeCount = predictions.filter(p => p.includes(match.home)).length
  const awayCount = predictions.filter(p => p.includes(match.away)).length
  const drawCount = predictions.filter(p => p.includes('Draw')).length
  const total = homeCount + awayCount + drawCount || 1

  return (
    <div className="predictCard">
      <div className="predictHeader">Next Match · Predict & Remember</div>
      <div className="predictMatchup">
        <div className="predictTeam">
          <span className="predictName">{match.home}</span>
          <span className="predictPct">{Math.round(homeCount / total * 100)}%</span>
        </div>
        <span className="predictVs">VS</span>
        <div className="predictTeam">
          <span className="predictName">{match.away}</span>
          <span className="predictPct">{Math.round(awayCount / total * 100)}%</span>
        </div>
      </div>
      <div className="predictDate">{match.date}</div>
      <div className="predictBar">
        <div className="predictBarHome" style={{width: `${homeCount / total * 100}%`}} />
        <div className="predictBarAway" style={{width: `${awayCount / total * 100}%`}} />
      </div>
      <div className="predictButtons">
        <button className={`predictBtn home ${pick === 'home' ? 'active' : ''}`} onClick={() => setPick('home')}>
          {match.home}
        </button>
        <button className={`predictBtn draw ${pick === 'draw' ? 'active' : ''}`} onClick={() => setPick('draw')}>
          Draw
        </button>
        <button className={`predictBtn away ${pick === 'away' ? 'active' : ''}`} onClick={() => setPick('away')}>
          {match.away}
        </button>
      </div>
      {pick && !saved && (
        <>
          <textarea
            className="predictReason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Why? (optional — your reasoning lives on-chain)"
            rows={2}
          />
          <button className="predictSubmit" onClick={submit}>
            Save to Walrus Memory →
          </button>
        </>
      )}
      {saved && <div className="predictSaved">✓ Prediction stored on-chain</div>}
      {predictions.length > 0 && (
        <div className="predictStats">{predictions.length} prediction(s) recalled from Walrus</div>
      )}
    </div>
  )
}
