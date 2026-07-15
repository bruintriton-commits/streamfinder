import { useState } from 'react'
import { getApiKey, testApiKey } from './api.js'

export default function SettingsPage({ hasKey, onKeySaved }) {
  const [key, setKey] = useState(getApiKey)
  const [status, setStatus] = useState('idle') // idle | testing | ok | bad

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
    </div>
  )
}
