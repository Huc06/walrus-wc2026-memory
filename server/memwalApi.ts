/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dev-server API for Walrus Memory (memwal). Runs inside Vite's Node process
 * so the delegate key never reaches the browser. Exposes:
 *   POST /api/notes        { momentId, author, text }  -> { blobId }
 *   GET  /api/notes?momentId=...                        -> { notes: [...] }
 *
 * Notes are stored as one memwal memory per note, in a namespace scoped to the
 * moment. All notes live under a single shared "admin" account, which is what
 * makes them publicly visible to every visitor of the app.
 */
import type {Connect, Plugin} from 'vite'
import {MemWal} from '@mysten-incubation/memwal'
import {withMemWal} from '@mysten-incubation/memwal/ai'
import {createOpenAI} from '@ai-sdk/openai'
import {generateText} from 'ai'

const SERVER_URL = 'https://relayer.memory.walrus.xyz'
// Namespace is versioned: bumping it orphans old test data (memwal has no
// delete) so the visible note set can be reset cleanly.
const nsFor = (momentId: string) => `wc2026:v2:note:${momentId}`

interface StoredNote {
  author: string
  text: string
  ts: number
}

const readBody = async (req: Connect.IncomingMessage): Promise<any> => {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

const json = (res: any, status: number, body: unknown) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export function memwalApi(env: Record<string, string>): Plugin {
  let client: ReturnType<typeof MemWal.create> | null = null
  const enabled = !!(env.ACCOUNT_ID && env.DEFAULT_DELEGATE_KEY)

  const getClient = () => {
    if (!client) {
      client = MemWal.create({
        key: env.DEFAULT_DELEGATE_KEY,
        accountId: env.ACCOUNT_ID,
        serverUrl: env.MEMWAL_SERVER_URL || SERVER_URL,
        namespace: 'wc2026'
      })
    }
    return client
  }

  return {
    name: 'memwal-api',
    configureServer(server) {
      server.middlewares.use('/api/notes', async (req, res) => {
        if (!enabled) return json(res, 503, {error: 'memwal not configured'})
        try {
          const url = new URL(req.url || '', 'http://localhost')

          if (req.method === 'GET') {
            const momentId = url.searchParams.get('momentId')
            if (!momentId) return json(res, 400, {error: 'momentId required'})
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
                  const n = JSON.parse(r.text) as StoredNote
                  return {author: n.author, text: n.text, ts: n.ts, blobId: r.blob_id}
                } catch {
                  return {author: 'anon', text: r.text, ts: 0, blobId: r.blob_id}
                }
              })
              .sort((a, b) => a.ts - b.ts)
            return json(res, 200, {notes})
          }

          if (req.method === 'POST') {
            const {momentId, author, text} = await readBody(req)
            if (!momentId || !text?.trim()) {
              return json(res, 400, {error: 'momentId and text required'})
            }
            const note: StoredNote = {
              author: (author || 'anon').trim() || 'anon',
              text: text.trim(),
              ts: Date.now()
            }
            const stored = await getClient().rememberAndWait(
              JSON.stringify(note),
              nsFor(momentId),
              {timeoutMs: 40000}
            )
            return json(res, 200, {...note, blobId: stored.blob_id})
          }

          return json(res, 405, {error: 'method not allowed'})
        } catch (e) {
          console.error('[memwal-api]', e)
          return json(res, 500, {error: String((e as Error)?.message ?? e)})
        }
      })

      // The "agent" — a cheeky pundit that reacts to a moment's community
      // memories. withMemWal auto-recalls the moment's notes from Walrus and
      // injects them as context (autoSave off so it never pollutes memory).
      server.middlewares.use('/api/agent', async (req, res) => {
        if (!enabled) return json(res, 503, {error: 'memwal not configured'})
        if (!env.OPENROUTER_API_KEY) return json(res, 503, {error: 'OPENROUTER_API_KEY missing'})
        if (req.method !== 'POST') return json(res, 405, {error: 'method not allowed'})
        try {
          const {momentId, title, player, description} = await readBody(req)
          if (!momentId) return json(res, 400, {error: 'momentId required'})

          const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: env.OPENROUTER_API_KEY
          })
          const model = withMemWal(openrouter.chat('openai/gpt-4o-mini'), {
            key: env.DEFAULT_DELEGATE_KEY,
            accountId: env.ACCOUNT_ID,
            serverUrl: env.MEMWAL_SERVER_URL || SERVER_URL,
            namespace: nsFor(momentId),
            autoSave: false,
            maxMemories: 30,
            minRelevance: 0
          })

          const {text} = await generateText({
            model,
            system:
              'You are a witty, slightly cheeky football pundit with a long memory. ' +
              "You react to fans' community notes about iconic World Cup 2026 moments. " +
              'Be playful, vivid and concise — 2 to 3 sentences max. If fans made bold ' +
              'predictions or hot takes, hype or gently roast them. Never invent fake facts; ' +
              "if there are no fan notes yet, riff on the moment itself and invite people to add memories.",
            prompt:
              `React to what the community remembers about this moment: "${title}" — ` +
              `${player}. Context: ${description}`
          })

          return json(res, 200, {text})
        } catch (e) {
          console.error('[agent]', e)
          return json(res, 500, {error: String((e as Error)?.message ?? e)})
        }
      })

      // Natural-language search over the moments, powered by OpenRouter (so it
      // works with the same key as the agent — no separate Gemini key needed).
      server.middlewares.use('/api/search', async (req, res) => {
        if (!env.OPENROUTER_API_KEY) return json(res, 503, {error: 'OPENROUTER_API_KEY missing'})
        if (req.method !== 'POST') return json(res, 405, {error: 'method not allowed'})
        try {
          const {query, moments} = await readBody(req)
          if (!query || !Array.isArray(moments)) {
            return json(res, 400, {error: 'query and moments required'})
          }
          const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: env.OPENROUTER_API_KEY
          })
          const {text} = await generateText({
            model: openrouter.chat('openai/gpt-4o-mini'),
            system:
              'You match a search query to World Cup 2026 football moments and reply with STRICT JSON only — no prose, no code fences.',
            prompt:
              'Return ONLY JSON: {"filenames":[matching moment ids],"commentary":"one short cheeky football-pundit sentence (<=20 words) about the picks"}. ' +
              'Match by player, team, title, type or description (case-insensitive, partial names ok). If nothing matches, use filenames: [].\n\n' +
              `Moments:\n${JSON.stringify(moments)}\n\nQuery: ${query}`
          })
          let parsed: {filenames: string[]; commentary: string} = {filenames: [], commentary: ''}
          try {
            parsed = JSON.parse(text.replace(/```json/gi, '').replace(/```/g, '').trim())
          } catch {
            /* leave empty result */
          }
          return json(res, 200, parsed)
        } catch (e) {
          console.error('[search]', e)
          return json(res, 500, {error: String((e as Error)?.message ?? e)})
        }
      })
    }
  }
}
