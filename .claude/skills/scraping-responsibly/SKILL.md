---
name: scraping-responsibly
description: Use when writing or running any web scraper or crawler, especially one that requests many pages, runs on a schedule, hits HTTP 429/403 errors, gets blocked, or targets a site whose terms or robots.txt are unknown
---

# Scraping Responsibly

## Overview
A scraper is a guest on someone else's server. Respect the site's rules, keep load low, and identify yourself. This keeps the scraper legal, polite, and unblocked.

## Rules for every scraper
1. **Check `robots.txt`** (`<origin>/robots.txt`) before crawling. Skip disallowed paths. Helper: `isAllowed(url)` in `scripts/polite-fetch.js`.
2. **Check the site's Terms of Service.** If scraping is forbidden or the data sits behind a login or paywall, stop and ask the user. Do not work around it.
3. **Prefer an official API or RSS feed** when one exists.
4. **Rate limit:** at most 1 request per second per domain (or the robots.txt `Crawl-delay`). Run requests to the same host one at a time.
5. **Identify yourself:** send a descriptive `User-Agent` with contact info. Do not fake a browser to slip past blocks.
6. **Back off on errors:** on 429/503, honor `Retry-After` or use exponential backoff. Stop after 3 retries.
7. **Cache:** save raw HTML/JSON to `scraper/cache/` while developing so you don't re-fetch the same page.
8. **Personal data:** do not collect names, emails, phone numbers, or profiles of private individuals unless the user has a lawful basis. Collect only the fields you need.

## Never
- Solve or bypass CAPTCHAs, rotate proxies, or spoof fingerprints to evade blocking. A block means the site said no, so report it to the user.
- Hammer a site with parallel requests.

## Implementation
`scripts/polite-fetch.js` exports `politeFetch(url)`. It applies the robots.txt check, a per-host delay, a User-Agent, timeouts, and retry with backoff. Use it in place of raw `fetch` in scrapers.

## Quick Reference
| Status | Meaning | Action |
|--------|---------|--------|
| 200 | OK | Parse |
| 301/302 | Redirect | `fetch` follows it automatically |
| 403 | Forbidden / blocked | Stop and tell the user. Don't evade. |
| 404 | Missing | Log it and skip |
| 429 | Too many requests | Wait for `Retry-After`, then slow down |
| 5xx | Server error | Back off and retry (max 3) |
