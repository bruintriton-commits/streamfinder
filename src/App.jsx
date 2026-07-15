import { useEffect, useState } from 'react'
import { getApiKey, getRegions } from './api.js'
import { getRegion, setRegion, getWatchlist, saveWatchlist, toggleWatchlist } from './storage.js'
import SearchPage from './SearchPage.jsx'
import WatchlistPage from './WatchlistPage.jsx'
import SettingsPage from './SettingsPage.jsx'
import DetailsModal from './DetailsModal.jsx'

const FALLBACK_REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
]

export default function App() {
  const [hasKey, setHasKey] = useState(() => Boolean(getApiKey()))
  const [page, setPage] = useState(() => (getApiKey() ? 'search' : 'settings'))
  const [region, setRegionState] = useState(getRegion)
  const [regions, setRegions] = useState(FALLBACK_REGIONS)
  const [watchlist, setWatchlist] = useState(getWatchlist)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!hasKey) return
    getRegions().then(setRegions).catch(() => {})
  }, [hasKey])

  function changeRegion(code) {
    setRegion(code)
    setRegionState(code)
  }

  function handleToggleWatchlist(item) {
    const next = toggleWatchlist(watchlist, item)
    setWatchlist(next)
    saveWatchlist(next)
  }

  function handleKeySaved() {
    setHasKey(true)
    setPage('search')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand" onClick={() => hasKey && setPage('search')}>
          <span className="brand-icon">🎬</span> StreamFinder
        </div>
        {hasKey && (
          <nav className="tabs">
            <button className={page === 'search' ? 'tab active' : 'tab'} onClick={() => setPage('search')}>
              Search
            </button>
            <button className={page === 'watchlist' ? 'tab active' : 'tab'} onClick={() => setPage('watchlist')}>
              Watchlist{watchlist.length > 0 && <span className="badge">{watchlist.length}</span>}
            </button>
          </nav>
        )}
        <div className="header-right">
          {hasKey && (
            <select
              className="region-select"
              value={region}
              onChange={(e) => changeRegion(e.target.value)}
              title="Country for availability"
            >
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
          <button className="icon-btn" title="Settings" onClick={() => setPage('settings')}>
            ⚙️
          </button>
        </div>
      </header>

      <main className="main">
        {page === 'search' && (
          <SearchPage watchlist={watchlist} onToggleWatchlist={handleToggleWatchlist} onSelect={setSelected} />
        )}
        {page === 'watchlist' && (
          <WatchlistPage
            watchlist={watchlist}
            region={region}
            onToggleWatchlist={handleToggleWatchlist}
            onSelect={setSelected}
          />
        )}
        {page === 'settings' && <SettingsPage hasKey={hasKey} onKeySaved={handleKeySaved} />}
      </main>

      {selected && (
        <DetailsModal
          item={selected}
          region={region}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
