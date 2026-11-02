// Drop-in replacement for fetch() in scrapers: robots.txt check, per-host delay,
// identifying User-Agent, timeout, and retry with exponential backoff.
//   import { politeFetch } from './polite-fetch.js'
//   const html = await (await politeFetch(url)).text()

const USER_AGENT = 'autoev-scraper/1.0 (+contact: your-email@example.com)'
const MIN_DELAY_MS = 1000
const MAX_RETRIES = 3

const lastRequestAt = new Map() // host -> timestamp
const robotsCache = new Map() // origin -> { disallow: string[], crawlDelayMs: number }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function loadRobots(origin) {
  if (robotsCache.has(origin)) return robotsCache.get(origin)
  const rules = { disallow: [], crawlDelayMs: 0 }
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(10_000),
    })
    if (res.ok) {
      // Minimal parser: only the "User-agent: *" group is honored
      let applies = false
      for (const raw of (await res.text()).split('\n')) {
        const [key, ...rest] = raw.split('#')[0].split(':')
        const value = rest.join(':').trim()
        const k = key.trim().toLowerCase()
        if (k === 'user-agent') applies = value === '*'
        else if (applies && k === 'disallow' && value) rules.disallow.push(value)
        else if (applies && k === 'crawl-delay') rules.crawlDelayMs = Number(value) * 1000 || 0
      }
    }
  } catch {
    // Unreachable robots.txt: treat as no rules
  }
  robotsCache.set(origin, rules)
  return rules
}

export async function isAllowed(url) {
  const { origin, pathname } = new URL(url)
  const { disallow } = await loadRobots(origin)
  return !disallow.some((prefix) => pathname.startsWith(prefix))
}

export async function politeFetch(url, options = {}) {
  const { host, origin } = new URL(url)
  const robots = await loadRobots(origin)
  if (!(await isAllowed(url))) throw new Error(`Disallowed by robots.txt: ${url}`)

  const delay = Math.max(MIN_DELAY_MS, robots.crawlDelayMs)
  for (let attempt = 0; ; attempt++) {
    const wait = (lastRequestAt.get(host) ?? 0) + delay - Date.now()
    if (wait > 0) await sleep(wait)
    lastRequestAt.set(host, Date.now())

    const { timeoutMs = 15_000, ...fetchOptions } = options
    const res = await fetch(url, {
      ...fetchOptions,
      headers: { 'User-Agent': USER_AGENT, ...options.headers },
      signal: AbortSignal.timeout(timeoutMs),
    })

    const retryable = res.status === 429 || res.status >= 500
    if (!retryable || attempt >= MAX_RETRIES) {
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return res
    }
    const retryAfter = Number(res.headers.get('retry-after'))
    await sleep(retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 2000)
  }
}
