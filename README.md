# StreamFinder 🎬

Search any movie or TV show and see where it's streaming — on Netflix, Max, Prime Video, Disney+ and every other major service, in ~100 countries. Save titles to a watchlist that always shows current availability.

**Live app: https://bruintriton-commits.github.io/streamfinder/**

## Deploying updates

After changing the code, publish the new version with:

```
npm run deploy
```

(builds and pushes to the `gh-pages` branch; the live URL updates in a minute or two)

## Running it locally

```
cd C:\Users\lscot\Claude\StreamFinder
npm run dev
```

Then open http://localhost:5173 in your browser.

## First-time setup (one time, ~2 minutes)

The app uses the free TMDB (The Movie Database) API, which includes JustWatch-powered
where-to-watch data.

1. Create a free account at https://www.themoviedb.org/signup
2. Go to https://www.themoviedb.org/settings/api and request a key
   (choose "Developer", fill in the short form — "personal project" is fine)
3. Paste the **API Key** (or the longer "API Read Access Token" — either works)
   into the app's welcome screen and click Save

The key is stored only in your browser's localStorage.

## Features

- **Search** — type a title, get movies and TV shows ranked by popularity
- **Details** — click any result: synopsis, rating, and where to watch
  (stream / free / rent / buy) in your selected country, plus a list of every
  country where it's included with a subscription
- **Country selector** — header dropdown switches which country availability is shown for
- **Watchlist** — click **+** on any title to save it; the Watchlist tab shows
  live streaming availability for each saved title (stored in localStorage)
- **JustWatch link** — each title links to its JustWatch page for deep links into apps

## Tech

Vite + React, no backend — the browser talks directly to the TMDB API.
Data © TMDB / JustWatch.
