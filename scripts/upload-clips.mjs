/**
 * Download WC2026 highlight clips → upload to Walrus → update moments.json
 * 
 * Run: node --env-file=.env.local scripts/upload-clips.mjs
 * 
 * Requires: yt-dlp, ffmpeg
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'

const WALRUS_PUBLISHER = process.env.WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space'
const WALRUS_AGGREGATOR = process.env.WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space'
const EPOCHS = 5
const CLIP_DIR = 'clips'
const CLIP_DURATION = '0:00-0:30' // first 30 seconds

if (!existsSync(CLIP_DIR)) mkdirSync(CLIP_DIR)

// Videos to download (globally available FIFA highlights)
const VIDEOS = [
  { id: 'JH_WRKTCPK4', match: 'Argentina vs Algeria' },
  { id: '0PVo3bk-TMk', match: 'USA vs Paraguay' },
  { id: 'atWtyemTWQ0', match: 'Turkey vs Paraguay' },
  { id: 'cjsFUxVHAX0', match: 'Uzbekistan vs Colombia' },
  { id: 'j0BQN0nJ7mM', match: 'Spain vs Saudi Arabia' },
]

async function uploadToWalrus(filePath) {
  const data = readFileSync(filePath)
  const res = await fetch(`${WALRUS_PUBLISHER}/v1/blobs?epochs=${EPOCHS}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4' },
    body: data,
  })
  if (!res.ok) return null
  const r = await res.json()
  return r.newlyCreated?.blobObject?.blobId ?? r.alreadyCertified?.blobId ?? null
}

async function main() {
  console.log('🎬 WC2026 Video → Walrus Pipeline\n')
  
  const results = []

  for (const v of VIDEOS) {
    const outFile = `${CLIP_DIR}/${v.id}.mp4`
    
    // Download clip
    if (!existsSync(outFile)) {
      console.log(`📥 Downloading: ${v.match}...`)
      try {
        execSync(`yt-dlp -f "worst[ext=mp4]" --download-sections "*${CLIP_DURATION}" -o "${outFile}" "https://www.youtube.com/watch?v=${v.id}" --quiet`, { stdio: 'pipe' })
      } catch (e) {
        console.log(`  ⚠ Skipped (geo-blocked or unavailable)`)
        continue
      }
    }
    
    // Upload to Walrus
    console.log(`📦 Uploading: ${v.match}...`)
    const blobId = await uploadToWalrus(outFile)
    if (blobId) {
      const url = `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`
      console.log(`  ✓ ${blobId}`)
      results.push({ ...v, blobId, url })
    }
  }

  console.log(`\n✨ ${results.length} clips uploaded to Walrus`)

  // Update moments.json - map by team name
  const moments = JSON.parse(readFileSync('public/moments.json', 'utf8'))
  for (const r of results) {
    const teams = r.match.split(' vs ')
    for (const m of moments) {
      if (teams.some(t => m.team?.includes(t) || m.opponent?.includes(t))) {
        m.video = r.url // Walrus video URL (plays directly in <video> tag)
      }
    }
  }
  writeFileSync('public/moments.json', JSON.stringify(moments, null, 2))
  
  // Save clip index
  writeFileSync('public/walrus-clips.json', JSON.stringify(results, null, 2))
  console.log('💾 Updated moments.json + walrus-clips.json')
  console.log('✅ Done!')
}

main().catch(e => { console.error('💥', e.message); process.exit(1) })
