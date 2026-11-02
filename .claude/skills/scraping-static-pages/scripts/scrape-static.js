// Usage: node scrape-static.js <url>
// Fetches a server-rendered page and extracts basic structured data with cheerio.
import * as cheerio from 'cheerio'

const USER_AGENT = 'autoev-scraper/1.0 (+contact: your-email@example.com)'

export async function scrapeStatic(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)

  const $ = cheerio.load(await res.text())
  const clean = (s) => s.replace(/\s+/g, ' ').trim()

  return {
    url,
    title: clean($('title').text()),
    description: $('meta[name="description"]').attr('content') ?? null,
    headings: $('h1, h2')
      .map((_, el) => clean($(el).text()))
      .get()
      .filter(Boolean),
    links: $('a[href]')
      .map((_, el) => {
        const href = $(el).attr('href')
        try {
          // Resolve relative links against the page URL
          return { text: clean($(el).text()), href: new URL(href, url).href }
        } catch {
          return null
        }
      })
      .get()
      .filter((l) => l && l.href.startsWith('http')),
    scrapedAt: new Date().toISOString(),
  }
}

if (process.argv[1]?.endsWith('scrape-static.js')) {
  const url = process.argv[2]
  if (!url) {
    console.error('Usage: node scrape-static.js <url>')
    process.exit(1)
  }
  scrapeStatic(url)
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((err) => {
      console.error(err.message)
      process.exit(1)
    })
}
