/**
 * Scrape YouTube WC2026 highlights → thumbnails → Walrus upload → update moments.
 * 
 * Run: node --env-file=.env.local scripts/fetch-youtube.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const WALRUS_PUBLISHER = process.env.WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space'
const WALRUS_AGGREGATOR = process.env.WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space'
const EPOCHS = 5

// 1. Scrape YouTube search for WC2026 highlights
async function scrapeYouTube() {
  console.log('📡 Scraping YouTube for WC2026 highlights...')
  const queries = [
    'FIFA+World+Cup+2026+highlights+official',
    'FIFA+World+Cup+2026+goals+extended+highlights',
    'World+Cup+2026+match+highlights+full'
  ]
  const allIds = new Set()
  for (const q of queries) {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `https://www.youtube.com/results?search_query=${q}`, formats: ['links'] })
    })
    const d = await res.json()
    const links = d.data?.links ?? []
    for (const l of links) {
      const m = l.match(/watch\?v=([a-zA-Z0-9_-]{11})/)
      if (m) allIds.add(m[1])
    }
    await new Promise(r => setTimeout(r, 2000))
  }
  console.log(`  Found ${allIds.size} unique video IDs`)
  return [...allIds]
}

// 2. Get video titles via oEmbed
async function getVideoInfo(videoIds) {
  console.log('📡 Fetching video titles...')
  const results = []
  for (const id of videoIds) {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
      if (!res.ok) continue
      const data = await res.json()
      const title = data.title || ''
      // Only keep WC2026 related
      if (title.match(/world cup|fifa|2026/i) && title.match(/highlight|goal/i)) {
        results.push({
          id,
          title,
          thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
          embed: `https://www.youtube.com/embed/${id}`,
        })
      }
    } catch {}
    await new Promise(r => setTimeout(r, 300))
  }
  console.log(`  ${results.length} WC2026 highlight videos`)
  return results
}

// 3. Extract team names from video titles
function extractTeams(title) {
  const match = title.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:vs?\.?|–)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i)
  if (match) return [match[1].trim(), match[2].trim()]
  return []
}

// 4. Upload video index to Walrus
async function uploadToWalrus(data) {
  try {
    const res = await fetch(`${WALRUS_PUBLISHER}/v1/blobs?epochs=${EPOCHS}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const r = await res.json()
    return r.newlyCreated?.blobObject?.blobId ?? r.alreadyCertified?.blobId ?? null
  } catch { return null }
}

// Main
async function main() {
  console.log('🎬 YouTube WC2026 Highlights Pipeline\n')

  const videoIds = await scrapeYouTube()
  const videos = await getVideoInfo(videoIds)

  // Save video index
  writeFileSync('public/youtube-highlights.json', JSON.stringify(videos, null, 2))
  console.log(`\n💾 Saved ${videos.length} videos to youtube-highlights.json`)

  // Upload video index to Walrus
  console.log('\n📦 Uploading video index to Walrus...')
  const blobId = await uploadToWalrus(videos)
  if (blobId) {
    console.log(`✓ Blob: ${blobId}`)
    console.log(`  ${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`)
  }

  // Update moments.json with YouTube embeds + thumbnails
  const moments = JSON.parse(readFileSync('public/moments.json', 'utf8'))
  
  // Build team → video lookup
  const teamVideo = {}
  for (const v of videos) {
    const teams = extractTeams(v.title)
    for (const t of teams) {
      if (!teamVideo[t]) teamVideo[t] = v
    }
  }

  let updated = 0
  for (const m of moments) {
    const v = teamVideo[m.team] || teamVideo[m.opponent]
    if (v) {
      m.video = v.embed // embeddable YouTube URL
      if (!m.image || m.image.includes('highlightly')) m.image = v.thumbnail
      updated++
    }
  }

  writeFileSync('public/moments.json', JSON.stringify(moments, null, 2))
  console.log(`\n✨ Updated ${updated}/${moments.length} moments with YouTube embeds`)
  console.log('✅ Done!')
}

main().catch(e => { console.error('💥', e.message); process.exit(1) })
