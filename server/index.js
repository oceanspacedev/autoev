// Production server: serves the built site (dist/) and the visit counter API.
//   npm run build && npm start        -> http://localhost:3000
// PORT and VISITS_FILE can be set through environment variables.
import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { visitsHandler } from './visits.js'

const DIST = fileURLToPath(new URL('../dist', import.meta.url))
const PORT = Number(process.env.PORT) || 3000
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain',
}

function sendFile(res, file, cache) {
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': cache })
  createReadStream(file).pipe(res)
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  if (pathname === '/api/visits') return visitsHandler(req, res)

  // Static file inside dist/ (never outside it)
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    res.statusCode = 400
    return res.end()
  }
  const file = normalize(join(DIST, decoded))
  if (file.startsWith(DIST + sep)) {
    try {
      if (statSync(file).isFile()) {
        return sendFile(res, file, pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600')
      }
    } catch {
      // not a file: fall through to the app
    }
  }
  // Client-side routes (/koleksi/uou-us1, …) all load the app
  sendFile(res, join(DIST, 'index.html'), 'no-cache')
}).listen(PORT, () => console.log(`Auto EV running on http://localhost:${PORT}`))
