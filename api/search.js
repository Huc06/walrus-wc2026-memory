export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { query, moments } = req.body
  if (!query || !moments) return res.status(400).json({ error: 'query and moments required' })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'OPENROUTER_API_KEY not set' })

  const prompt = `You have a list of World Cup 2026 moments. Find ALL that match the user's query. Return their IDs.
Add a brief pundit commentary (max 25 words, vivid, cheeky).

Format: {"filenames":["id1","id2",...], "commentary":"YOUR_COMMENTARY"}
Only return json, no markdown.

Moments:
${JSON.stringify(moments)}

Query: ${query}`

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      })
    })
    if (!r.ok) return res.status(502).json({ error: 'LLM request failed' })
    const data = await r.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    const parsed = JSON.parse(text.replace('```json', '').replace('```', ''))
    return res.status(200).json(parsed)
  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) })
  }
}
