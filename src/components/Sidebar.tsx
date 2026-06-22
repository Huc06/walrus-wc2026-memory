/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import c from 'clsx'
import useStore from '../store'
import {setSidebarOpen, setTargetMoment} from '../actions'

export default function Sidebar() {
  const moments = useStore.use.moments()
  const isSidebarOpen = useStore.use.isSidebarOpen()

  return (
    <aside className={c('sidebar', {open: isSidebarOpen})}>
      <button className="closeButton" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
        <span className="icon">close</span>
      </button>

      <ul>
        {moments?.map(moment => (
          <li
            key={moment.id}
            onClick={() => {
              setTargetMoment(moment.id)
              setSidebarOpen(false)
            }}
          >
            <span className="thumbnail" style={{background: moment.teamColor}} aria-hidden />
            <p>
              <strong>{moment.title}</strong>
              <br />
              {moment.player} · {moment.team}
            </p>
          </li>
        ))}
        {(!moments || moments.length === 0) && <li>No moments available.</li>}
      </ul>
    </aside>
  )
}
