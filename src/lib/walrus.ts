/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Walrus mainnet storage layer.
 *
 * Reads go through the public mainnet aggregator (free, no auth). Writes go
 * through a publisher — Walrus has NO public mainnet publisher, so you must
 * point VITE_WALRUS_PUBLISHER at your own (e.g. a Railway "Walrus
 * Publisher/Aggregator" deploy) or an authenticated relay. When no publisher
 * is configured, `publishJson`/`publishBytes` return null and callers fall
 * back to local-only storage.
 */

const AGGREGATOR =
  (import.meta.env.VITE_WALRUS_AGGREGATOR as string | undefined) ??
  'https://aggregator.walrus-mainnet.walrus.space'

const PUBLISHER = import.meta.env.VITE_WALRUS_PUBLISHER as string | undefined

/** Default storage duration (Walrus epochs ≈ 2 weeks each on mainnet). */
const DEFAULT_EPOCHS = 53 // ~2 years

export const walrusEnabled = (): boolean => !!PUBLISHER

/** Public URL anyone can use to read a blob. */
export const aggregatorUrl = (blobId: string): string =>
  `${AGGREGATOR}/v1/blobs/${blobId}`

/** Read a blob and parse it as JSON. Returns null on any failure. */
export const readJson = async <T = unknown>(blobId: string): Promise<T | null> => {
  try {
    const res = await fetch(aggregatorUrl(blobId))
    if (!res.ok) return null
    return (await res.json()) as T
  } catch (e) {
    console.warn('walrus readJson failed', blobId, e)
    return null
  }
}

interface StoreResponse {
  newlyCreated?: {blobObject?: {blobId?: string}}
  alreadyCertified?: {blobId?: string}
}

const extractBlobId = (r: StoreResponse): string | null =>
  r.newlyCreated?.blobObject?.blobId ?? r.alreadyCertified?.blobId ?? null

/** Store raw bytes on Walrus. Returns the blobId, or null if not configured / failed. */
export const publishBytes = async (
  body: BodyInit,
  contentType: string,
  epochs = DEFAULT_EPOCHS
): Promise<string | null> => {
  if (!PUBLISHER) return null
  try {
    const res = await fetch(`${PUBLISHER}/v1/blobs?epochs=${epochs}`, {
      method: 'PUT',
      headers: {'Content-Type': contentType},
      body
    })
    if (!res.ok) {
      console.warn('walrus publish failed', res.status, await res.text())
      return null
    }
    return extractBlobId((await res.json()) as StoreResponse)
  } catch (e) {
    console.warn('walrus publish error', e)
    return null
  }
}

/** Store a JSON object on Walrus. Returns the blobId or null. */
export const publishJson = (obj: unknown, epochs?: number): Promise<string | null> =>
  publishBytes(JSON.stringify(obj), 'application/json', epochs)

/** Store an image/file on Walrus. Returns the blobId or null. */
export const publishFile = (file: Blob, epochs?: number): Promise<string | null> =>
  publishBytes(file, file.type || 'application/octet-stream', epochs)
