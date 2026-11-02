// Step 3: download every image used on the site plus the WordPress media library,
// at original resolution. Output: output/images/<yyyy>/<mm>/<file> and output/images.json.
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { OUT_DIR, SITE, politeFetch, writeJson, log } from './lib/http.js'

const readJson = async (rel) => JSON.parse(await readFile(join(OUT_DIR, rel), 'utf8'))
const pages = await readJson('pages.json')
const products = await readJson('products.json')
const site = await readJson('site.json')
const media = await readJson('api/wp-media.json')

const images = new Map() // url -> { alt, usedOn:Set, sources:Set }
const add = (url, { alt = null, usedOn = null, source }) => {
  if (!url || !url.startsWith(`${SITE}/wp-content/uploads/`)) return // skip plugin icons, gravatars
  const entry = images.get(url) ?? { alt: null, usedOn: new Set(), sources: new Set() }
  entry.alt ||= alt
  if (usedOn) entry.usedOn.add(usedOn)
  entry.sources.add(source)
  images.set(url, entry)
}

for (const p of pages) {
  p.images.forEach((i) => add(i.src, { alt: i.alt, usedOn: p.url, source: 'page' }))
  p.backgroundImages.forEach((u) => add(u, { usedOn: p.url, source: 'background' }))
  p.sitemapImages.forEach((u) => add(u, { usedOn: p.url, source: 'sitemap' }))
  if (p.meta.ogImage) add(p.meta.ogImage, { usedOn: p.url, source: 'og' })
}
for (const p of products) p.images.forEach((i) => add(i.src, { alt: i.alt, usedOn: p.url, source: 'product' }))
site.logos.forEach((l) => add(l.src, { alt: l.alt, usedOn: 'site', source: 'logo' }))
site.favicon.forEach((f) => add(f.href, { usedOn: 'site', source: 'favicon' }))
const mediaByUrl = new Map(media.map((m) => [m.source_url, m]))
media.forEach((m) => add(m.source_url, { alt: m.alt_text || null, source: 'media-library' }))

log(`${images.size} unique images to download`)

const manifest = []
let done = 0, failed = 0, bytesTotal = 0
for (const [url, entry] of images) {
  const rel = decodeURIComponent(new URL(url).pathname.replace('/wp-content/uploads/', ''))
  const localPath = join(OUT_DIR, 'images', rel)
  const m = mediaByUrl.get(url)
  const record = {
    url,
    localPath: `images/${rel}`,
    alt: entry.alt,
    width: m?.media_details?.width ?? null,
    height: m?.media_details?.height ?? null,
    mediaId: m?.id ?? null,
    title: m?.title?.rendered ?? null,
    sources: [...entry.sources],
    usedOn: [...entry.usedOn],
  }
  try {
    let size
    try {
      size = (await stat(localPath)).size // already downloaded on a previous run
    } catch {
      // Some originals are 20MB+ PNGs, so allow far more than the default 15s
      const res = await politeFetch(url, { timeoutMs: 180_000 })
      const buf = Buffer.from(await res.arrayBuffer())
      await mkdir(dirname(localPath), { recursive: true })
      await writeFile(localPath, buf)
      size = buf.length
    }
    record.bytes = size
    bytesTotal += size
  } catch (err) {
    record.error = err.message
    failed++
    log(`FAIL ${url}: ${err.message}`)
  }
  manifest.push(record)
  if (++done % 25 === 0) log(`${done}/${images.size} (${(bytesTotal / 1e6).toFixed(1)} MB)`)
}

await writeJson('images.json', manifest)
log(`done: ${done - failed} downloaded, ${failed} failed, ${(bytesTotal / 1e6).toFixed(1)} MB`)
