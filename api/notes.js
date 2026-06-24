import { MemWal } from '@mysten-incubation/memwal'

const SERVER_URL = 'https://relayer.memory.walrus.xyz'
const nsFor = (momentId) => `wc2026:v2:note:${momentId}`

let client = null
function getClient() {
  if (!client) {
    client = MemWal.create({
      key: process.env.DEFAULT_DELEGATE_KEY,
      accountId: process.env.ACCOUNT_ID,
      serverUrl: process.env.MEMWAL_SERVER_URL || SERVER_URL,
      namespace: 'wc2026'
    })
  }
  return client
}

export default async function handler(req, res) {
  if (!process.env.ACCOUNT_ID || !process.env.DEFAULT_DELEGATE_KEY) {
    return res.status(503).json({ error: 'memwal not configured' })
  }

  try {
    if (req.method === 'GET') {
      const momentId = req.query.momentId
      if (!momentId) return res.status(400).json({ error: 'momentId required' })

      const ns = momentId === 'predict_all' ? 'wc2026:v2:note:predict' : nsFor(momentId)
      const query = momentId === 'predict_all' ? 'prediction wins world cup match' : 'world cup moment fan memory note reaction'

      const rec = await getClient().recall({
        query,
        namespace: ns,
        limit: 100,
        maxDistance: 5
      })
      const notes = rec.results
        .map(r => {
          try {
            const n = JSON.parse(r.text)
            return { author: n.author, text: n.text, ts: n.ts, blobId: r.blob_id }
          } catch {
            return { author: 'anon', text: r.text, ts: 0, blobId: r.blob_id }
          }
        })
        .sort((a, b) => a.ts - b.ts)
      return res.status(200).json({ notes })
    }

    if (req.method === 'POST') {
      const { momentId, author, text } = req.body
      if (!momentId || !text?.trim()) {
        return res.status(400).json({ error: 'momentId and text required' })
      }
      const note = {
        author: (author || 'anon').trim() || 'anon',
        text: text.trim(),
        ts: Date.now()
      }
      const stored = await getClient().rememberAndWait(
        JSON.stringify(note),
        nsFor(momentId),
        { timeoutMs: 40000 }
      )
      return res.status(200).json({ ...note, blobId: stored.blob_id })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) })
  }
}
