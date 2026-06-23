/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai'

// Lazy singleton — constructing GoogleGenAI at module load throws in the
// browser when the key is missing, which would crash the whole app. Defer it
// until a search actually runs.
let ai: GoogleGenAI | null = null
const getAi = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY as string | undefined
  if (!apiKey) return null
  if (!ai) ai = new GoogleGenAI({apiKey})
  return ai
}

export const queryLlm = async ({prompt}: {prompt: string}): Promise<string> => {
  const client = getAi()
  if (!client) {
    console.warn('GEMINI_API_KEY not set — search disabled.')
    return ''
  }
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{text: prompt}],
    config: {
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  })
  return response.text ?? ''
}
