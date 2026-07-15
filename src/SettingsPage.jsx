import { useState } from 'react'
import { getApiKey, testApiKey, getOmdbKey, setOmdbKey, testOmdbKey } from './api.js'

export default function SettingsPage({ hasKey, onKeySaved }) {
  const [key, setKey] = useState(getApiKey)
  const [status, setStatus] = useState('idle') // idle | testing | ok | bad
  const [omdb, setOmdb] = useState(getOmdbKey)
  const [omdbStatus, setOmdbStatus] = useState('idle') // idle | testing | ok | bad | cleared

  async function saveOmdb() {
    if (!omdb.trim()) {
      setOmdbKey('')
      setOmdbStatus('cleared')
      return
    }
    setOmdbStatus('testing')
    const ok = await testOmdbKey(omdb)
    if (ok) setOmdbKey(omdb)
    setOmdbStatus(ok ? 'ok' : 'bad')
  }

  async function save() {
    if (!key.trim()) return
    setStatus('testing')
    const ok = await testApiKey(key.trim())
    setStatus(ok ? 'ok' : 'bad')
    if (ok) onKeySaved()
  }

  return (
    <div className="settings">
      {!hasKey && <h2>Welcome to StreamFinder 👋</h2>}
      <p>
        StreamFinder uses the free <strong>TMDB</strong> (The Movie Database) API for search results and
        where-to-watch data. You need a free API key — it takes about two minutes:
      </p>
      <ol className="steps">
        <li>
          Create a free account at{' '}
          <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer">
            themoviedb.org/signup
          </a>
        </li>
        <li>
          Go to{' '}
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            Settings → API
          </a>{' '}
          and request a key (choose “Developer”, fill in the short form — “personal project” is fine)
        </li>
        <li>
          Copy the <strong>API Key</strong> (or the longer “API Read Access Token” — either works) and paste it below
        </li>
      </ol>
      <div className="key-row">
        <input
          className="search-input"
          type="text"
          placeholder="Paste your TMDB API key here"
          value={key}
          onChange={(e) => {
            setKey(e.target.value)
            setStatus('idle')
          }}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <button className="btn" onClick={save} disabled={status === 'testing' || !key.trim()}>
          {status === 'testing' ? 'Testing…' : 'Save'}
        </button>
      </div>
      {status === 'ok' && <p className="hint success">✓ Key works! You&apos;re all set.</p>}
      {status === 'bad' && <p className="hint error">That key didn&apos;t work — double-check you copied the whole thing.</p>}
      <p className="muted small">
        Your key is stored only in this browser (localStorage) and is sent only to TMDB. Availability data is provided
        by JustWatch via TMDB.
      </p>

      <h3 className="settings-divider">Optional: Rotten Tomatoes &amp; IMDb scores</h3>
      <p>
        To show 🍅 Rotten Tomatoes and IMDb ratings in title details, add a free <strong>OMDb</strong> key: request it
        at{' '}
        <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noreferrer">
          omdbapi.com/apikey.aspx
        </a>{' '}
        (choose the FREE tier — the key arrives by email, click the activation link in that email first).
      </p>
      <div className="key-row">
        <input
          className="search-input"
          type="text"
          placeholder="Paste your OMDb API key here (optional)"
          value={omdb}
          onChange={(e) => {
            setOmdb(e.target.value)
            setOmdbStatus('idle')
          }}
          onKeyDown={(e) => e.key === 'Enter' && saveOmdb()}
        />
        <button className="btn" onClick={saveOmdb} disabled={omdbStatus === 'testing'}>
          {omdbStatus === 'testing' ? 'Testing…' : 'Save'}
        </button>
      </div>
      {omdbStatus === 'ok' && <p className="hint success">✓ Key works! Ratings will show in title details.</p>}
      {omdbStatus === 'cleared' && <p className="hint">OMDb key removed — ratings hidden.</p>}
      {omdbStatus === 'bad' && (
        <p className="hint error">
          That key didn&apos;t work — make sure you clicked the activation link in OMDb&apos;s email.
        </p>
      )}
    </div>
  )
}
