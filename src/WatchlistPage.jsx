import { useEffect, useState } from 'react'
import { getProviders, imgUrl, countryName } from './api.js'

function WatchlistRow({ item, region, onToggleWatchlist, onSelect }) {
  const [providers, setProviders] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getProviders(item.mediaType, item.id)
      .then((p) => !cancelled && setProviders(p))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [item])

  const local = providers?.[region]
  const streaming = local?.flatrate || []
  const otherCountries = providers
    ? Object.entries(providers).filter(([code, o]) => code !== region && o.flatrate?.length).length
    : 0

  return (
    <div className="wl-row" onClick={() => onSelect(item)}>
      {item.poster ? (
        <img className="wl-poster" src={imgUrl(item.poster, 'w92')} alt={item.title} />
      ) : (
        <div className="wl-poster placeholder">🎞️</div>
      )}
      <div className="wl-info">
        <div className="wl-title">
          {item.title} <span className="muted">{item.year && `(${item.year})`}</span>
          <span className="type-badge inline">{item.mediaType === 'tv' ? 'TV' : 'Movie'}</span>
        </div>
        <div className="wl-availability">
          {error && <span className="error">Couldn&apos;t load availability</span>}
          {!providers && !error && <span className="muted">Checking availability…</span>}
          {providers && streaming.length > 0 && (
            <span className="provider-logos small">
              {streaming.map((p) => (
                <img key={p.provider_id} src={imgUrl(p.logo_path, 'w92')} alt={p.provider_name} title={p.provider_name} />
              ))}
            </span>
          )}
          {providers && streaming.length === 0 && (
            <span className="muted">
              Not streaming in {countryName(region)}
              {otherCountries > 0 && ` — streaming in ${otherCountries} other ${otherCountries === 1 ? 'country' : 'countries'}`}
            </span>
          )}
        </div>
      </div>
      <button
        className="icon-btn"
        title="Remove from watchlist"
        onClick={(e) => {
          e.stopPropagation()
          onToggleWatchlist(item)
        }}
      >
        🗑️
      </button>
    </div>
  )
}

export default function WatchlistPage({ watchlist, region, onToggleWatchlist, onSelect }) {
  if (watchlist.length === 0) {
    return (
      <p className="hint">
        Your watchlist is empty. Search for a title and click the <strong>+</strong> button to save it here — then
        you&apos;ll always see where it&apos;s streaming.
      </p>
    )
  }
  return (
    <div className="wl-list">
      {watchlist.map((item) => (
        <WatchlistRow
          key={`${item.mediaType}-${item.id}`}
          item={item}
          region={region}
          onToggleWatchlist={onToggleWatchlist}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
