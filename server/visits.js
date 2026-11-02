// Visit counter stored in a local JSON file (server/data/visits.json).
// Shared by the production server (server/index.js) and the Vite dev server (vite.config.js).
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_FILE = process.env.VISITS_FILE || join(dirname(fileURLToPath(import.meta.url)), 'data', 'visits.json')
// Last "Total kunjungan" shown on the old WordPress site, so the count carries on
const START_TOTAL = 24805
const KEEP_DAYS = 70 // enough for "this month" and "yesterday"

// Day keys in Indonesian Western time (WIB), e.g. "2026-11-02"
const dayKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(date)

let store = null
function load() {
  if (store) return store
  try {
    store = JSON.parse(readFileSync(DATA_FILE, 'utf8'))
  } catch {
    store = { total: START_TOTAL, days: {} }
  }
  return store
}

function save() {
  mkdirSync(dirname(DATA_FILE), { recursive: true })
  const tmp = `${DATA_FILE}.tmp`
  writeFileSync(tmp, JSON.stringify(store, null, 1)) // write-then-rename so a crash never leaves half a file
  renameSync(tmp, DATA_FILE)
}

export function stats(now = new Date()) {
  const s = load()
  const today = dayKey(now)
  const month = today.slice(0, 7)
  return {
    total: s.total,
    today: s.days[today] || 0,
    yesterday: s.days[dayKey(new Date(now.getTime() - 864e5))] || 0,
    month: Object.entries(s.days).filter(([d]) => d.startsWith(month)).reduce((sum, [, n]) => sum + n, 0),
  }
}

// One count per visitor per day. Visitor keys live only in memory and are never written to disk.
const seen = { day: '', keys: new Set() }
export function hit(visitorKey, now = new Date()) {
  const s = load()
  const today = dayKey(now)
  if (seen.day !== today) {
    seen.day = today
    seen.keys.clear()
  }
  if (!seen.keys.has(visitorKey)) {
    seen.keys.add(visitorKey)
    s.total += 1
    s.days[today] = (s.days[today] || 0) + 1
    for (const d of Object.keys(s.days).sort().slice(0, -KEEP_DAYS)) delete s.days[d]
    save()
  }
  return stats(now)
}

// Node/connect-style handler for GET (read) and POST (count) on /api/visits
export function visitsHandler(req, res) {
  let body
  if (req.method === 'POST') {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
    body = hit(`${ip}|${req.headers['user-agent'] || ''}`)
  } else if (req.method === 'GET') {
    body = stats()
  } else {
    res.statusCode = 405
    return res.end()
  }
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}
