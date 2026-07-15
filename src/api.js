const BASE = 'https://api.themoviedb.org/3'
export const IMG_BASE = 'https://image.tmdb.org/t/p'

export function getApiKey() {
  return localStorage.getItem('sf_tmdb_key') || ''
}

export function setApiKey(key) {
  localStorage.setItem('sf_tmdb_key', key.trim())
}

async function tmdb(path, params = {}) {
  const key = getApiKey()
  if (!key) throw new Error('NO_KEY')

  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  }

  const headers = { Accept: 'application/json' }
  // Long keys starting with "eyJ" are v4 read access tokens; short hex keys are v3 API keys
  if (key.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${key}`
  } else {
    url.searchParams.set('api_key', key)
  }

  const res = await fetch(url, { headers })
  if (!res.ok) {
    if (res.status === 401) throw new Error('BAD_KEY')
    throw new Error(`TMDB request failed (${res.status})`)
  }
  return res.json()
}

// Saves the key if it works; restores the previous key if it doesn't.
export async function testApiKey(key) {
  const prev = getApiKey()
  setApiKey(key)
  try {
    await tmdb('/configuration')
    return true
  } catch {
    setApiKey(prev)
    return false
  }
}

export async function searchTitles(query) {
  const data = await tmdb('/search/multi', { query, include_adult: 'false' })
  return (data.results || [])
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => ({
      id: r.id,
      mediaType: r.media_type,
      title: r.media_type === 'movie' ? r.title : r.name,
      year: (r.media_type === 'movie' ? r.release_date : r.first_air_date || '').slice(0, 4),
      poster: r.poster_path,
      overview: r.overview,
      rating: r.vote_average,
      popularity: r.popularity,
    }))
    .sort((a, b) => b.popularity - a.popularity)
}

const providerCache = new Map()

// Returns TMDB watch-provider data keyed by country code:
// { US: { link, flatrate: [...], free: [...], ads: [...], rent: [...], buy: [...] }, ... }
export async function getProviders(mediaType, id) {
  const cacheKey = `${mediaType}:${id}`
  if (providerCache.has(cacheKey)) return providerCache.get(cacheKey)
  const data = await tmdb(`/${mediaType}/${id}/watch/providers`)
  providerCache.set(cacheKey, data.results || {})
  return data.results || {}
}

export async function getRegions() {
  const cached = localStorage.getItem('sf_regions')
  if (cached) return JSON.parse(cached)
  const data = await tmdb('/watch/providers/regions')
  const regions = (data.results || [])
    .map((r) => ({ code: r.iso_3166_1, name: r.english_name }))
    .sort((a, b) => a.name.localeCompare(b.name))
  localStorage.setItem('sf_regions', JSON.stringify(regions))
  return regions
}

export function imgUrl(path, size = 'w185') {
  return path ? `${IMG_BASE}/${size}${path}` : null
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
export function countryName(code) {
  try {
    return countryNames.of(code) || code
  } catch {
    return code
  }
}
