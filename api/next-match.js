export default async function handler(req, res) {
  const apiKey = process.env.FOOTBALL_DATA_KEY
  if (!apiKey) return res.status(503).json({ error: 'FOOTBALL_DATA_KEY not set' })

  try {
    const r = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=SCHEDULED&limit=1', {
      headers: { 'X-Auth-Token': apiKey }
    })
    const data = await r.json()
    const m = data.matches?.[0]
    if (!m) return res.status(200).json({ home: 'TBD', away: 'TBD', date: 'TBD' })
    return res.status(200).json({
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      date: m.utcDate
    })
  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) })
  }
}
