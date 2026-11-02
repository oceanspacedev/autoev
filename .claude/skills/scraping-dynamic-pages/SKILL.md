---
name: scraping-dynamic-pages
description: Use when target data is missing from the raw HTML because it is rendered by JavaScript (React/Vue/Angular SPAs, infinite scroll, "Load more" buttons, lazy-loaded content, pages that need clicks or form input before data appears)
---

# Scraping Dynamic Pages

## Overview
Drive a real headless browser with **Playwright**, wait for the data to render, then extract it. Slower and heavier than **scraping-static-pages**, so use it only when the static check fails.

**First, look for the hidden API:** open DevTools → Network → Fetch/XHR, reload, and find the JSON request that carries the data. Calling that JSON endpoint directly with `fetch` beats rendering the page. Use Playwright only if no usable endpoint exists.

**REQUIRED:** Follow **scraping-responsibly**.

## Setup (one-time)
```bash
npx playwright install chromium
```

## Quick Reference
| Task | Playwright |
|------|-----------|
| Open page | `await page.goto(url, { waitUntil: 'domcontentloaded' })` |
| Wait for data | `await page.locator('.card').first().waitFor()` |
| Extract many | `await page.locator('.card').evaluateAll(els => els.map(e => ...))` |
| Click | `await page.getByRole('button', { name: 'Load more' }).click()` |
| Scroll to bottom | `await page.mouse.wheel(0, 10000)` |
| Capture JSON responses | `page.on('response', r => r.url().includes('/api/') && r.json())` |
| Screenshot for debugging | `await page.screenshot({ path: 'debug.png', fullPage: true })` |

## Implementation
Runnable example: `node .claude/skills/scraping-dynamic-pages/scripts/scrape-dynamic.js <url> [cssSelector]`
It renders the page, waits for the selector, and returns each matching element's text and link as JSON.

## Common Mistakes
- **`waitForTimeout(5000)` as a wait strategy** — flaky and slow. Wait for a locator or a network response.
- **`waitUntil: 'networkidle'`** — never settles on sites with analytics/websockets. Prefer `domcontentloaded` plus a locator wait.
- **Browser not closed** — always `browser.close()` in `finally`, or processes leak.
- **One browser per URL** — reuse one browser, open a new `page` (or `context`) per URL.
- **Infinite scroll loop without a stop condition** — stop when item count stops growing or a max is reached.
