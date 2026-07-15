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

function mapTitles(results) {
  return (results || [])
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => ({
      id: r.id,
      mediaType: r.media_type,
      title: r.media_type === 'movie' ? r.title : r.name,
      year: ((r.media_type === 'movie' ? r.release_date : r.first_air_date) || '').slice(0, 4),
      poster: r.poster_path,
      overview: r.overview,
      rating: r.vote_average,
      popularity: r.popularity,
    }))
}

export async function searchTitles(query) {
  const data = await tmdb('/search/multi', { query, include_adult: 'false' })
  return mapTitles(data.results).sort((a, b) => b.popularity - a.popularity)
}

export async function getTrending() {
  const data = await tmdb('/trending/all/week')
  return mapTitles(data.results)
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

export function getOmdbKey() {
  return localStorage.getItem('sf_omdb_key') || ''
}

export function setOmdbKey(key) {
  localStorage.setItem('sf_omdb_key', key.trim())
}

const ratingsCache = new Map()

// Rotten Tomatoes + IMDb scores via OMDb (optional — needs its own free key).
// Returns { rt, imdb } or null when no key, no IMDb id, or no data.
export async function getRatings(mediaType, id) {
  const omdbKey = getOmdbKey()
  if (!omdbKey) return null
  const cacheKey = `${mediaType}:${id}`
  if (ratingsCache.has(cacheKey)) return ratingsCache.get(cacheKey)

  let result = null
  try {
    const ext = await tmdb(`/${mediaType}/${id}/external_ids`)
    if (ext.imdb_id) {
      const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${ext.imdb_id}`)
      const data = await res.json()
      const rt = data.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value || null
      const imdb = data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null
      if (rt || imdb) result = { rt, imdb }
    }
  } catch {
    return null
  }
  ratingsCache.set(cacheKey, result)
  return result
}

export async function testOmdbKey(key) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${key.trim()}&i=tt0111161`)
    const data = await res.json()
    return data.Response === 'True'
  } catch {
    return false
  }
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
