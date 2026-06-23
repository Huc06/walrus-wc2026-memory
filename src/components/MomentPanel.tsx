/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {useState} from 'react'
import useStore from '../store'
import {setTargetMoment, addNote} from '../actions'

const timeAgo = (ts: number): string => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

export default function MomentPanel() {
  const moments = useStore.use.moments()
  const targetMoment = useStore.use.targetMoment()
  const notes = useStore.use.notes()
  const isAddingNote = useStore.use.isAddingNote()
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')

  const moment = moments?.find(m => m.id === targetMoment)
  if (!moment) return null

  const momentNotes = notes[moment.id] || []

  const submit = async () => {
    if (!text.trim()) return
    await addNote({momentId: moment.id, author, text})
    setText('')
  }

  const typeEmoji: Record<string, string> = {goal: '⚽', save: '🧤', skill: '✨'}

  return (
    <aside className="momentPanel" style={{['--team' as string]: moment.teamColor}}>
      <button className="closeButton" onClick={() => setTargetMoment(null)} aria-label="Close">
        <span className="icon">close</span>
      </button>

      {moment.image && (
        <div
          className="momentImage"
          style={{backgroundImage: `url("${moment.image}")`}}
        >
          <div className="momentImageFade" />
        </div>
      )}

      <div className="momentHero">
        <span className="momentType">{typeEmoji[moment.type] ?? '⚽'} {moment.type}</span>
        <h2>{moment.title}</h2>
        <p className="momentPlayer">{moment.player}</p>
        <p className="momentMeta">
          {moment.team}
          {moment.minute && <span className="dot">·</span>}
          {moment.minute}
        </p>
        <p className="momentMatch">{moment.match}</p>
        {moment.stadium && <p className="momentStadium">📍 {moment.stadium}</p>}
      </div>

      <p className="momentDesc">{moment.description}</p>

      <div className="notesSection">
        <h3>
          Community memory <span className="noteCount">{momentNotes.length}</span>
        </h3>

        <div className="addNote">
          <input
            className="authorInput"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="your name (optional)"
          />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="I remember this moment… add your note"
            rows={2}
          />
          <button
            className="postNote"
            onClick={submit}
            disabled={isAddingNote || !text.trim()}
            style={{background: moment.teamColor}}
          >
            {isAddingNote ? 'saving to Walrus…' : 'remember this →'}
          </button>
        </div>

        <ul className="notesList">
          {momentNotes.length === 0 && (
            <li className="emptyNote">No memories yet. Be the first to remember this moment.</li>
          )}
          {momentNotes
            .slice()
            .reverse()
            .map((n, i) => (
              <li key={i} className="note">
                <div className="noteHead">
                  <strong>{n.author}</strong>
                  <span className="noteTime">{timeAgo(n.ts)}</span>
                </div>
                <p>{n.text}</p>
                {n.blobId && (
                  <a
                    className="blobLink"
                    href={`https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${n.blobId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ⛓ on Walrus
                  </a>
                )}
              </li>
            ))}
        </ul>
      </div>

      <div className="walrusFooter">
        <span className="walrusDot" />
        Stored on Walrus Mainnet · public &amp; permanent
      </div>
    </aside>
  )
}
