/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import useStore from '../store'

const time = (ts: number) => new Date(ts).toLocaleTimeString('en-GB', {hour12: false})

export default function WalrusLog() {
  const log = useStore.use.walrusLog()
  const recent = log.slice(-7)

  return (
    <div className="walrusLog" aria-hidden>
      <div className="walrusLogHead">
        <span className="walrusDot" /> walrus memory · live
      </div>
      {recent.length === 0 && (
        <div className="logLine idle">awaiting recall… open a moment or search</div>
      )}
      {recent.map((l, i) => (
        <div key={`${l.ts}-${i}`} className={`logLine ${l.kind}`}>
          <span className="logTime">{time(l.ts)}</span> {l.msg}
        </div>
      ))}
    </div>
  )
}
