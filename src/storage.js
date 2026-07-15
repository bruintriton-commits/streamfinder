const WATCHLIST_KEY = 'sf_watchlist'
const REGION_KEY = 'sf_region'

export function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || []
  } catch {
    return []
  }
}

export function saveWatchlist(list) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list))
}

export function isInWatchlist(list, item) {
  return list.some((w) => w.id === item.id && w.mediaType === item.mediaType)
}

export function toggleWatchlist(list, item) {
  if (isInWatchlist(list, item)) {
    return list.filter((w) => !(w.id === item.id && w.mediaType === item.mediaType))
  }
  const { id, mediaType, title, year, poster } = item
  return [...list, { id, mediaType, title, year, poster }]
}

const HIDE_ACCOUNT_TIED_KEY = 'sf_hide_account_tied'
const INCLUDE_FREE_KEY = 'sf_include_free'

export function getIncludeFree() {
  return localStorage.getItem(INCLUDE_FREE_KEY) === '1'
}

export function setIncludeFree(on) {
  localStorage.setItem(INCLUDE_FREE_KEY, on ? '1' : '0')
}

export function getHideAccountTied() {
  return localStorage.getItem(HIDE_ACCOUNT_TIED_KEY) === '1'
}

export function setHideAccountTied(on) {
  localStorage.setItem(HIDE_ACCOUNT_TIED_KEY, on ? '1' : '0')
}

export function getRegion() {
  return localStorage.getItem(REGION_KEY) || 'US'
}

export function setRegion(code) {
  localStorage.setItem(REGION_KEY, code)
}
