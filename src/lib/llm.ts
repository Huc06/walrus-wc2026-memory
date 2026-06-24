/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY as string | undefined

export const queryLlm = async ({prompt}: {prompt: string}): Promise<string> => {
  if (!OPENROUTER_KEY) {
    console.warn('OPENROUTER_API_KEY not set — search disabled.')
    return ''
  }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{role: 'user', content: prompt}],
      })
    })
    if (!res.ok) return ''
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  } catch (e) {
    console.warn('queryLlm failed', e)
    return ''
  }
}
