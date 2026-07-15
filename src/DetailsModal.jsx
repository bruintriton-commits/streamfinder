import { useEffect, useState } from 'react'
import { getProviders, getRatings, imgUrl, countryName } from './api.js'
import {
  isInWatchlist,
  getHideAccountTied,
  setHideAccountTied,
  getIncludeFree,
  setIncludeFree,
} from './storage.js'

// Services whose catalog follows the account's registered country rather than
// your physical/IP location — being (or VPNing) in a country doesn't unlock them.
const ACCOUNT_TIED = /amazon|prime video|apple tv/i

function isAccountTied(providerName) {
  return ACCOUNT_TIED.test(providerName)
}

const SECTION_LABELS = [
  ['flatrate', 'Stream'],
  ['free', 'Free'],
  ['ads', 'Free with ads'],
  ['rent', 'Rent'],
  ['buy', 'Buy'],
]

function ProviderLogos({ providers }) {
  return (
    <div className="provider-logos">
      {providers.map((p) => (
        <span key={p.provider_id} className="provider" title={p.provider_name}>
          {p.logo_path ? (
            <img src={imgUrl(p.logo_path, 'w92')} alt={p.provider_name} />
          ) : (
            <span className="provider-name-only">{p.provider_name}</span>
          )}
          <span className="provider-label">{p.provider_name}</span>
        </span>
      ))}
    </div>
  )
}

export default function DetailsModal({ item, region, watchlist, onToggleWatchlist, onClose }) {
  const [providers, setProviders] = useState(null)
  const [error, setError] = useState(false)
  const [showWorldwide, setShowWorldwide] = useState(false)
  const [hideAccountTied, setHideAccountTiedState] = useState(getHideAccountTied)
  const [includeFree, setIncludeFreeState] = useState(getIncludeFree)

  function toggleHideAccountTied(on) {
    setHideAccountTied(on)
    setHideAccountTiedState(on)
  }

  function toggleIncludeFree(on) {
    setIncludeFree(on)
    setIncludeFreeState(on)
  }

  const [ratings, setRatings] = useState(null)

  useEffect(() => {
    let cancelled = false
    getProviders(item.mediaType, item.id)
      .then((p) => !cancelled && setProviders(p))
      .catch(() => !cancelled && setError(true))
    getRatings(item.mediaType, item.id)
      .then((r) => !cancelled && setRatings(r))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [item])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const saved = isInWatchlist(watchlist, item)
  const local = providers?.[region]
  const hasLocal = local && SECTION_LABELS.some(([key]) => local[key]?.length)

  // Every country where the title is included with a subscription (flatrate),
  // plus free / ad-supported offers when that toggle is on
  const worldwideAll = providers
    ? Object.entries(providers)
        .map(([code, offers]) => {
          const services = (offers.flatrate || []).map((p) => ({ name: p.provider_name, free: false }))
          if (includeFree) {
            for (const p of [...(offers.free || []), ...(offers.ads || [])]) {
              if (!services.some((s) => s.name === p.provider_name)) {
                services.push({ name: p.provider_name, free: true })
              }
            }
          }
          return { code, name: countryName(code), services }
        })
        .filter((c) => c.services.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name))
    : []

  const worldwide = hideAccountTied
    ? worldwideAll
        .map((c) => ({ ...c, services: c.services.filter((s) => !isAccountTied(s.name)) }))
        .filter((c) => c.services.length > 0)
    : worldwideAll

  const hiddenCountries = worldwideAll.length - worldwide.length

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-head">
          {item.poster && <img className="modal-poster" src={imgUrl(item.poster, 'w185')} alt={item.title} />}
          <div>
            <h2>
              {item.title} {item.year && <span className="muted">({item.year})</span>}
            </h2>
            <div className="modal-meta">
              <span className="type-badge inline">{item.mediaType === 'tv' ? 'TV show' : 'Movie'}</span>
              {ratings?.rt && <span title="Rotten Tomatoes">🍅 {ratings.rt}</span>}
              {ratings?.imdb && <span title="IMDb rating">IMDb {ratings.imdb}</span>}
              {item.rating > 0 && <span title="TMDB user score">⭐ {item.rating.toFixed(1)}</span>}
            </div>
            {item.overview && <p className="overview">{item.overview}</p>}
            <button className={saved ? 'btn saved' : 'btn'} onClick={() => onToggleWatchlist(item)}>
              {saved ? '✓ On your watchlist' : '+ Add to watchlist'}
            </button>
          </div>
        </div>

        <h3>Where to watch in {countryName(region)}</h3>
        {error && <p className="hint error">Couldn&apos;t load availability.</p>}
        {!providers && !error && <p className="hint">Loading availability…</p>}
        {providers && !hasLocal && (
          <p className="hint">
            Not available on any tracked service in {countryName(region)}.
            {worldwide.length > 0 && ' Try another country below.'}
          </p>
        )}
        {hasLocal &&
          SECTION_LABELS.map(
            ([key, label]) =>
              local[key]?.length > 0 && (
                <div key={key} className="offer-row">
                  <span className="offer-label">{label}</span>
                  <ProviderLogos providers={local[key]} />
                </div>
              ),
          )}
        {local?.link && (
          <a className="jw-link" href={local.link} target="_blank" rel="noreferrer">
            View on JustWatch ↗
          </a>
        )}

        {providers && (
          <>
            <h3>
              Streaming worldwide{' '}
              <span className="muted small">
                ({includeFree ? 'free or included with subscription' : 'included with subscription'} in{' '}
                {worldwide.length} {worldwide.length === 1 ? 'country' : 'countries'})
              </span>
            </h3>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={hideAccountTied}
                onChange={(e) => toggleHideAccountTied(e.target.checked)}
              />
              <span>
                Hide account-tied services{' '}
                <span className="muted small">
                  (Prime Video, Apple TV &amp; their channels follow your account&apos;s country — traveling or a VPN
                  won&apos;t unlock them)
                </span>
              </span>
            </label>
            <label className="toggle-row">
              <input type="checkbox" checked={includeFree} onChange={(e) => toggleIncludeFree(e.target.checked)} />
              <span>
                Include free services{' '}
                <span className="muted small">(Tubi, Pluto TV and other free or ad-supported services)</span>
              </span>
            </label>
            {hideAccountTied && hiddenCountries > 0 && (
              <p className="hint small">
                {hiddenCountries} {hiddenCountries === 1 ? 'country' : 'countries'} hidden where it&apos;s only on
                account-tied services.
              </p>
            )}
            {worldwide.length === 0 && (
              <p className="hint">
                {hideAccountTied && worldwideAll.length > 0
                  ? 'Only available on account-tied services — untick the box above to see them.'
                  : `Not ${includeFree ? 'streamable free or with a subscription' : 'included with any subscription service'} anywhere.`}
              </p>
            )}
            {worldwide.length > 0 && (
              <>
                <div className="country-list">
                  {(showWorldwide ? worldwide : worldwide.slice(0, 12)).map((c) => (
                    <div key={c.code} className="country-row">
                      <span className="country-name">{c.name}</span>
                      <span className="country-services">
                        {c.services.map((s, i) => (
                          <span key={s.name}>
                            {i > 0 && ', '}
                            {s.name}
                            {s.free && <span className="free-tag">FREE</span>}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
                {worldwide.length > 12 && (
                  <button className="btn subtle" onClick={() => setShowWorldwide(!showWorldwide)}>
                    {showWorldwide ? 'Show fewer' : `Show all ${worldwide.length} countries`}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
