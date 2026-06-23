/**
 * Scrape FIFA.com WC2026 highlights using Firecrawl (free, no key needed).
 * Gets video thumbnails + clip URLs for each match.
 *
 * Run: node scripts/scrape-fifa.mjs
 *
 * Output: public/highlights.json
 */

const FIRECRAWL_URL = 'https://api.firecrawl.dev/v1/scrape'
const FIFA_HIGHLIGHTS = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/highlights'

async function scrape(url, options = {}) {
  const res = await fetch(FIRECRAWL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, ...options })
  })
  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${await res.text()}`)
  return res.json()
}

async function main() {
  console.log('🔥 Scraping FIFA.com WC2026 highlights via Firecrawl...\n')

  const result = await scrape(FIFA_HIGHLIGHTS, {
    formats: ['markdown', 'links'],
    onlyMainContent: true
  })

  console.log('Status:', result.success ? '✓' : '✗')

  const markdown = result.data?.markdown ?? ''
  const links = result.data?.links ?? []

  // Extract highlight entries from markdown
  // FIFA page format: "Team A v Team B | Group X | FIFA World Cup 2026™ | Highlights"
  const highlightPattern = /([A-Za-z\s]+)\s+v\s+([A-Za-z\s]+)\|([^|]+)\|[^|]+\|\s*Highlights/g
  const matches = []
  let match
  while ((match = highlightPattern.exec(markdown)) !== null) {
    matches.push({
      home: match[1].trim(),
      away: match[2].trim(),
      stage: match[3].trim()
    })
  }

  // Extract video/image URLs from links
  const videoLinks = links.filter(l =>
    l.includes('fifa.com/en/watch') || l.includes('youtube.com') || l.includes('youtu.be')
  )
  const imageLinks = links.filter(l =>
    l.includes('.jpg') || l.includes('.png') || l.includes('digitalhub')
  )

  console.log(`\n📊 Found:`)
  console.log(`  ${matches.length} highlight entries`)
  console.log(`  ${videoLinks.length} video links`)
  console.log(`  ${imageLinks.length} image links`)

  // Also dump raw markdown for inspection
  const { writeFileSync } = await import('node:fs')
  writeFileSync('public/fifa-highlights-raw.md', markdown)
  writeFileSync('public/highlights.json', JSON.stringify({
    matches, videoLinks, imageLinks,
    scrapedAt: new Date().toISOString()
  }, null, 2))

  console.log('\n💾 Saved: public/highlights.json + public/fifa-highlights-raw.md')
  console.log('✅ Done!')
}

main().catch(e => { console.error('💥', e.message); process.exit(1) })
