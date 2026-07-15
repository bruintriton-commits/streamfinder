import { imgUrl } from './api.js'
import { isInWatchlist } from './storage.js'

export default function TitleCard({ item, watchlist, onToggleWatchlist, onSelect }) {
  const saved = isInWatchlist(watchlist, item)
  const poster = imgUrl(item.poster, 'w342')

  return (
    <div className="card" onClick={() => onSelect(item)}>
      <div className="poster-wrap">
        {poster ? (
          <img className="poster" src={poster} alt={item.title} loading="lazy" />
        ) : (
          <div className="poster placeholder">🎞️</div>
        )}
        <button
          className={saved ? 'save-btn saved' : 'save-btn'}
          title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleWatchlist(item)
          }}
        >
          {saved ? '✓' : '+'}
        </button>
        <span className="type-badge">{item.mediaType === 'tv' ? 'TV' : 'Movie'}</span>
      </div>
      <div className="card-title">{item.title}</div>
      <div className="card-sub">{item.year || '—'}</div>
    </div>
  )
}
