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
  const [saved, setSaved] = useState(false)
  const [predictions, setPredictions] = useState<string[]>([])

  // Fetch next scheduled match
  useEffect(() => {
    fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=SCHEDULED&limit=1', {
      headers: {'X-Auth-Token': '47dc9248efe245f9afe113623d74e27c'}
    })
      .then(r => r.json())
      .then(d => {
        const m = d.matches?.[0]
        if (m) setMatch({
          home: m.homeTeam.name,
          away: m.awayTeam.name,
          date: new Date(m.utcDate).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})
        })
      })
      .catch(() => setMatch({home: 'Portugal', away: 'Uzbekistan', date: 'Next match'}))
  }, [])

  // Recall existing predictions from Walrus Memory
  useEffect(() => {
    if (!match) return
    fetch(`/api/notes?momentId=predict_${match.home}_${match.away}`)
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
          momentId: `predict_${match.home}_${match.away}`,
          author: 'predictor',
          text: `${winner} wins`
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
          {match.home.slice(0, 3).toUpperCase()}
        </button>
        <button className={`predictBtn draw ${pick === 'draw' ? 'active' : ''}`} onClick={() => setPick('draw')}>
          Draw
        </button>
        <button className={`predictBtn away ${pick === 'away' ? 'active' : ''}`} onClick={() => setPick('away')}>
          {match.away.slice(0, 3).toUpperCase()}
        </button>
      </div>
      {pick && !saved && (
        <button className="predictSubmit" onClick={submit}>
          Save to Walrus Memory →
        </button>
      )}
      {saved && <div className="predictSaved">✓ Prediction stored on-chain</div>}
      {predictions.length > 0 && (
        <div className="predictStats">{predictions.length} prediction(s) recalled from Walrus</div>
      )}
    </div>
  )
}
