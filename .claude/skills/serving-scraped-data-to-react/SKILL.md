---
name: serving-scraped-data-to-react
description: Use when showing scraped data in the autoev React app, when a fetch to another website from React fails with a CORS error ("blocked by CORS policy", "No 'Access-Control-Allow-Origin' header"), or when deciding where scraper code should run
---

# Serving Scraped Data to React

## Overview
Browsers block React code from reading other sites (CORS), and scraping libraries like cheerio and Playwright run only in Node. So **scraping always runs server-side**. React reads the results from our own endpoint or a JSON file.

```
scraper/ (Node: cheerio / Playwright)  ->  scraper/output/*.json  or  /api/*  ->  React (src/)
```

## Option A: Static JSON (simplest, for data refreshed occasionally)
1. The scraper writes to `public/data/<name>.json`.
2. React reads it with `fetch('/data/<name>.json')`.
3. Re-run the scraper to refresh (manually or via cron).

## Option B: Vite dev middleware (live scrape during development)
Add a plugin in `vite.config.js` that runs the scraper on `/api/scrape?url=...`:
```js
const scrapeApi = () => ({
  name: 'scrape-api',
  configureServer(server) {
    server.middlewares.use('/api/scrape', async (req, res) => {
      const url = new URL(req.url, 'http://x').searchParams.get('url')
      const { scrapeStatic } = await server.ssrLoadModule('/scraper/scrape.js')
      try {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(await scrapeStatic(url)))
      } catch (e) {
        res.statusCode = 502
        res.end(JSON.stringify({ error: e.message }))
      }
    })
  },
})
// plugins: [react(), tailwindcss(), scrapeApi()]
```
This works with `npm run dev` only. For production, move the handler to a real server (Express, Hono) or a serverless function.

**Security:** an endpoint that fetches arbitrary URLs is an SSRF hole. In production, allowlist target hosts and reject `localhost`, private IP ranges, and `file:`.

## React side
```jsx
const [data, setData] = useState(null)
const [error, setError] = useState(null)
useEffect(() => {
  fetch('/data/cars.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then(setData)
    .catch((e) => setError(e.message))
}, [])
```
Always render loading, error, and empty states. Style them with Tailwind classes.

## Common Mistakes
- **Importing cheerio or Playwright in `src/`**: this breaks the browser bundle. Keep them in `scraper/`.
- **Using a public CORS proxy** to scrape from the browser: unreliable and leaks traffic to a third party. Use Option A or B.
- **Scraping on every page view**: cache the results. One scrape can serve many views.
