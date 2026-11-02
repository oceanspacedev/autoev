---
name: scraping-static-pages
description: Use when scraping a website whose content is already present in the raw HTML response (server-rendered pages, blogs, listings, product pages) and no JavaScript execution is needed to see the data
---

# Scraping Static Pages

## Overview
Fetch the HTML with Node's built-in `fetch`, parse it with **cheerio** (jQuery-like selectors), return plain JSON. Fastest and cheapest approach — try it before reaching for a browser.

**Check first:** `curl -s <url> | grep "<text you want>"`. If the text is in the output, the page is static. If not, use **scraping-dynamic-pages**.

**REQUIRED:** Follow **scraping-responsibly** (robots.txt, delays, User-Agent) for every scraper.

## Quick Reference
| Task | cheerio |
|------|---------|
| Load HTML | `const $ = cheerio.load(html)` |
| Text | `$('h1').text().trim()` |
| Attribute | `$('a').attr('href')` |
| Loop | `$('.item').map((_, el) => ...).get()` |
| Scope inside element | `$(el).find('.price')` |
| Absolute URL | `new URL(href, pageUrl).href` |

## Implementation
Runnable example: `node .claude/skills/scraping-static-pages/scripts/scrape-static.js <url>`
It prints title, meta description, headings, and absolute links as JSON. Copy it into `scraper/` and change the selectors.

Where scraper code lives in this project: `scraper/` (Node, server-side). **Never** scrape from React components — browsers block cross-origin requests (CORS). See **serving-scraped-data-to-react**.

## Common Mistakes
- **Selectors from DevTools don't match** — DevTools shows the DOM *after* JS ran. Inspect `view-source:` or the fetched HTML instead.
- **Relative links** — always resolve with `new URL(href, baseUrl)`.
- **Mojibake / wrong encoding** — check `content-type` charset; use `TextDecoder` for non-UTF-8 pages.
- **No error handling** — check `res.ok` and throw with the status code.
- **Whitespace junk** — `.text().replace(/\s+/g, ' ').trim()`.
