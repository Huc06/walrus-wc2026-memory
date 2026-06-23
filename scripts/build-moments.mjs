/**
 * Build moments from football-data.org scorers + FIFA thumbnails + FIFA video links.
 * Run: node --env-file=.env.local scripts/build-moments.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const API_KEY = process.env.FOOTBALL_DATA_KEY

// --- Load FIFA media ---
const thumbs = JSON.parse(readFileSync('public/fifa-thumbnails.json', 'utf8'))
const videos = JSON.parse(readFileSync('public/fifa-videos.json', 'utf8'))

const CODE_MAP = {ARG:'Argentina',FRA:'France',BRA:'Brazil',GER:'Germany',ESP:'Spain',ENG:'England',NED:'Netherlands',POR:'Portugal',MEX:'Mexico',JPN:'Japan',USA:'United States',NOR:'Norway',CAN:'Canada',MAR:'Morocco',URU:'Uruguay',SWE:'Sweden',SUI:'Switzerland',AUS:'Australia',KOR:'South Korea',KSA:'Saudi Arabia',BEL:'Belgium',SEN:'Senegal',SCO:'Scotland',EGY:'Egypt',QAT:'Qatar',CZE:'Czechia',TUN:'Tunisia',NZL:'New Zealand',CIV:'Ivory Coast',IRQ:'Iraq',RSA:'South Africa',PAR:'Paraguay',TUR:'Turkey',HAI:'Haiti',BIH:'Bosnia',AUT:'Austria',ALG:'Algeria',JOR:'Jordan',IRN:'Iran',ECU:'Ecuador',CUW:'Curacao',CPV:'Cabo Verde',NGA:'Nigeria',CMR:'Cameroon',CRC:'Costa Rica',SRB:'Serbia',COL:'Colombia',CRO:'Croatia',GHA:'Ghana'}
const NAME_MAP = Object.fromEntries(Object.entries(CODE_MAP).map(([k,v])=>[v,k]))

// Team name → FIFA thumbnail
const teamThumb = {}
for (const t of thumbs) {
  const codes = (t.label.match(/[A-Z]{3}/g) || [])
  for (const c of codes) { if (CODE_MAP[c]) teamThumb[CODE_MAP[c]] = t.image }
}

// Team name → FIFA video URL (match highlight)
const teamVideo = {}
for (const v of videos) {
  // title like "Norway v Senegal \\"
  const clean = v.title.replace(/\\/g, '').trim()
  const parts = clean.split(/\s+v\s+/i)
  if (parts.length === 2) {
    const [home, away] = parts.map(p => p.trim())
    // Try to match
    for (const [code, name] of Object.entries(CODE_MAP)) {
      if (home.includes(name) || away.includes(name)) {
        teamVideo[name] = v.url
      }
    }
    // Also try partial matches
    for (const name of Object.values(CODE_MAP)) {
      if (home.toLowerCase().includes(name.toLowerCase().slice(0,4)) || away.toLowerCase().includes(name.toLowerCase().slice(0,4))) {
        if (!teamVideo[name]) teamVideo[name] = v.url
      }
    }
  }
}

console.log(`📸 ${Object.keys(teamThumb).length} teams with thumbnails`)
console.log(`🎬 ${Object.keys(teamVideo).length} teams with video highlights`)

// --- Fetch ALL scorers ---
const res = await fetch(`https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=200`, {
  headers: { 'X-Auth-Token': API_KEY }
})
const data = await res.json()
const scorers = data.scorers ?? []
console.log(`⚽ ${scorers.length} scorers (${scorers.reduce((s,x)=>s+x.goals,0)} total goals)`)

// --- Build moments ---
const live = scorers.map((s, i) => {
  const team = s.team.name
  const image = teamThumb[team] || null
  const video = teamVideo[team] || null
  return {
    id: `wc26_live_${String(i + 1).padStart(3, '0')}`,
    player: s.player.name,
    team,
    teamColor: '#888',
    opponent: '',
    match: 'FIFA World Cup 2026',
    stadium: '',
    minute: `${s.goals} goals`,
    type: 'goal',
    title: s.goals >= 3 ? `${s.player.name} — ${s.goals} goals 🔥` : `${s.player.name} scores for ${team}`,
    description: `${s.player.name} has scored ${s.goals} goal(s) in ${s.playedMatches} match(es). World Cup 2026.`,
    image,
    video,
    blobId: null
  }
})

// --- Merge with curated + apply FIFA media to them too ---
const moments = JSON.parse(readFileSync('public/moments.json', 'utf8'))
const curated = moments.filter(m => !m.id.includes('_live_'))
for (const m of curated) {
  const img = teamThumb[m.team] || teamThumb[m.opponent]
  if (img) m.image = img
  const vid = teamVideo[m.team] || teamVideo[m.opponent]
  if (vid) m.video = vid
}

const merged = [...curated, ...live]
writeFileSync('public/moments.json', JSON.stringify(merged, null, 2))
console.log(`\n💾 ${merged.length} moments (${curated.length} curated + ${live.length} live)`)
console.log(`📸 Images: ${merged.filter(m => m.image).length}/${merged.length}`)
console.log(`🎬 Videos: ${merged.filter(m => m.video).length}/${merged.length}`)
