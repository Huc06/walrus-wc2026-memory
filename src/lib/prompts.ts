/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type {Moment} from '../types'

export const queryPrompt = (corpus: Moment[], query: string): string => `\
Here are descriptions of iconic World Cup 2026 moments we are exploring together. Your job is to retrieve the right moments I ask for. \
Introduce what you find with a concise commentary sentence in the voice of a passionate football pundit who remembers every match — briefly explain your pick, weaving in player/match details. (e.g. "Ah, here's [x] ..." or "Of course — [x] ...") Make it a sentence like you're talking to me (not a prefix with a : before the list). Commentary should always be 25 words or fewer. Be vivid, conversational, a little cheeky.\

Strictly format your answer in json (don't forget to escape it) : {"filenames":[ARRAY_OF_IDS], "commentary":"YOUR_COMMENTARY"}
Only return the json and nothing else.

Corpus:
${JSON.stringify(corpus, null, 2)}

Query: ${query}
`
