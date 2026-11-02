// Usage: node scrape-dynamic.js <url> [cssSelector]
// Renders a JavaScript-heavy page in headless Chromium and extracts matching elements.
// One-time setup: npx playwright install chromium
import { chromium } from 'playwright'

export async function scrapeDynamic(url, selector = 'h1, h2, h3') {
  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext({
      userAgent: 'autoev-scraper/1.0 (+contact: your-email@example.com)',
    })
    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })

    // Wait for real content instead of a fixed sleep
    await page.locator(selector).first().waitFor({ timeout: 15_000 })

    const items = await page.locator(selector).evaluateAll((els) =>
      els.map((el) => ({
        text: el.innerText.replace(/\s+/g, ' ').trim(),
        href: el.closest('a')?.href ?? el.querySelector('a')?.href ?? null,
      })),
    )

    return { url, selector, count: items.length, items, scrapedAt: new Date().toISOString() }
  } finally {
    await browser.close()
  }
}

if (process.argv[1]?.endsWith('scrape-dynamic.js')) {
  const [url, selector] = process.argv.slice(2)
  if (!url) {
    console.error('Usage: node scrape-dynamic.js <url> [cssSelector]')
    process.exit(1)
  }
  scrapeDynamic(url, selector)
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((err) => {
      console.error(err.message)
      process.exit(1)
    })
}
