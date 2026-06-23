/**
 * Connectivity + roundtrip test for Walrus Memory mainnet.
 * Run: node --env-file=.env.local scripts/memwal-test.mjs
 * (Reads ACCOUNT_ID + DEFAULT_DELEGATE_KEY from env — never logs the key.)
 */
import {MemWal} from '@mysten-incubation/memwal'

const memwal = MemWal.create({
  key: process.env.DEFAULT_DELEGATE_KEY,
  accountId: process.env.ACCOUNT_ID,
  serverUrl: 'https://relayer.memory.walrus.xyz',
  namespace: 'wc2026-test'
})

console.log('account:', process.env.ACCOUNT_ID)
console.log('publicKey:', memwal.getPublicKeyHex?.() ?? '(n/a)')

const health = await memwal.health()
console.log('health:', JSON.stringify(health))

console.log('— storing a test memory on mainnet —')
const stored = await memwal.rememberAndWait(
  'WC2026 test: Ronaldo scored a last-minute header vs Morocco.',
  undefined,
  {timeoutMs: 40000}
)
console.log('stored:', JSON.stringify({blob_id: stored.blob_id, namespace: stored.namespace, owner: stored.owner}))

console.log('— recalling —')
const rec = await memwal.recall({query: 'Ronaldo header', namespace: 'wc2026-test', limit: 5})
console.log('recall total:', rec.total)
for (const r of rec.results) {
  console.log('  •', JSON.stringify({text: r.text, blob_id: r.blob_id, distance: r.distance}))
}
console.log('OK')
