/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string
})

export const queryLlm = async ({prompt}: {prompt: string}): Promise<string> => {
  const response = await ai.models.generateContent({
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
