import { useEffect, useRef, useState } from 'react'
import { searchTitles } from './api.js'
import TitleCard from './TitleCard.jsx'

export default function SearchPage({ watchlist, onToggleWatchlist, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const timer = useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    const q = query.trim()
    if (!q) {
      setResults([])
      setStatus('idle')
      return
    }
    setStatus('loading')
    timer.current = setTimeout(async () => {
      try {
        const r = await searchTitles(q)
        setResults(r)
        setStatus('done')
      } catch {
        setStatus('error')
      }
    }, 400)
    return () => clearTimeout(timer.current)
  }, [query])

  return (
    <div>
      <div className="search-box">
        <input
          className="search-input"
          type="text"
          placeholder="Search for a movie or TV show…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {status === 'idle' && (
        <p className="hint">
          Type a title above — you&apos;ll see where it&apos;s streaming on Netflix, Max, Prime Video, Disney+ and
          more, in any country.
        </p>
      )}
      {status === 'loading' && <p className="hint">Searching…</p>}
      {status === 'error' && <p className="hint error">Search failed — check your API key in Settings.</p>}
      {status === 'done' && results.length === 0 && <p className="hint">No results for “{query.trim()}”.</p>}

      <div className="grid">
        {results.map((item) => (
          <TitleCard
            key={`${item.mediaType}-${item.id}`}
            item={item}
            watchlist={watchlist}
            onToggleWatchlist={onToggleWatchlist}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
