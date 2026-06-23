/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useState} from 'react'

interface Match {
  home: string
  away: string
  homeFlag: string
  awayFlag: string
  date: string
  homePct: number
  drawPct: number
  awayPct: number
}

const UPCOMING: Match = {
  home: 'Portugal',
  away: 'Uzbekistan',
  homeFlag: '🇵🇹',
  awayFlag: '🇺🇿',
  date: 'Live · Jun 24 at 00:00',
  homePct: 85.5,
  drawPct: 10.5,
  awayPct: 4.5,
}

export default function PredictCard() {
  const [pick, setPick] = useState<'home' | 'draw' | 'away' | null>(null)
  const [saved, setSaved] = useState(false)

  const submit = async () => {
    if (!pick) return
    setSaved(true)
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          momentId: 'predict_next_match',
          author: 'predictor',
          text: `Prediction: ${pick === 'home' ? UPCOMING.home : pick === 'away' ? UPCOMING.away : 'Draw'} wins ${UPCOMING.home} vs ${UPCOMING.away}`
        })
      })
    } catch {}
  }

  return (
    <div className="predictCard">
      <div className="predictHeader">Sports · FIFA</div>
      <div className="predictMatchup">
        <div className="predictTeam">
          <span className="predictFlag">{UPCOMING.homeFlag}</span>
          <span className="predictName">{UPCOMING.home}</span>
          <span className="predictPct">{UPCOMING.homePct}%</span>
        </div>
        <span className="predictVs">VS</span>
        <div className="predictTeam">
          <span className="predictFlag">{UPCOMING.awayFlag}</span>
          <span className="predictName">{UPCOMING.away}</span>
          <span className="predictPct">{UPCOMING.awayPct}%</span>
        </div>
      </div>
      <div className="predictDate">{UPCOMING.date}</div>
      <div className="predictBar">
        <div className="predictBarHome" style={{width: `${UPCOMING.homePct}%`}} />
        <div className="predictBarAway" style={{width: `${UPCOMING.awayPct}%`}} />
      </div>
      <div className="predictButtons">
        <button
          className={`predictBtn home ${pick === 'home' ? 'active' : ''}`}
          onClick={() => setPick('home')}
        >
          {UPCOMING.home.slice(0, 3).toUpperCase()}
          <span>{UPCOMING.homePct}¢</span>
        </button>
        <button
          className={`predictBtn draw ${pick === 'draw' ? 'active' : ''}`}
          onClick={() => setPick('draw')}
        >
          Draw
          <span>{UPCOMING.drawPct}¢</span>
        </button>
        <button
          className={`predictBtn away ${pick === 'away' ? 'active' : ''}`}
          onClick={() => setPick('away')}
        >
          {UPCOMING.away.slice(0, 3).toUpperCase()}
          <span>{UPCOMING.awayPct}¢</span>
        </button>
      </div>
      {pick && !saved && (
        <button className="predictSubmit" onClick={submit}>
          Save prediction to Walrus →
        </button>
      )}
      {saved && <div className="predictSaved">✓ Prediction stored on Walrus Memory</div>}
    </div>
  )
}
