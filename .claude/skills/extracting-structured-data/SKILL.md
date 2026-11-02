---
name: extracting-structured-data
description: Use when turning scraped HTML into clean records (prices, specs, names, dates, ratings), when selectors break after a site redesign, when values come out as messy strings like "Rp 1.250.000" or "12 Jan 2026", or when results must be saved as JSON or CSV
---

# Extracting Structured Data

## Overview
Pull from the most stable source first, normalize every field into a typed value, validate, then save. The output is an array of flat records with consistent keys.

## Source priority (most to least stable)
1. **JSON-LD:** `<script type="application/ld+json">` (Product, Offer, Article, Vehicle, etc.)
2. **Embedded app state:** `<script id="__NEXT_DATA__">`, `window.__NUXT__`, `window.__INITIAL_STATE__`
3. **Meta tags:** `og:title`, `og:price:amount`, `product:price`
4. **Semantic attributes:** `itemprop`, `data-*`, `aria-label`
5. **CSS classes:** last resort. Avoid hashed classes such as `.css-1x2y3z` or `.sc-abc123`.

```js
// JSON-LD with cheerio
const ld = $('script[type="application/ld+json"]')
  .map((_, el) => { try { return JSON.parse($(el).text()) } catch { return null } })
  .get().flat().filter(Boolean)
const product = ld.find((d) => d['@type'] === 'Product')
```

## Normalizing values
| Raw | Normalize to | How |
|-----|--------------|-----|
| `Rp 1.250.000` / `$1,250.00` | `1250000` / `1250` (number) + `currency` | Use `parsePrice()` in `scripts/normalize.js` |
| `12 Jan 2026`, `2026-01-12T..` | ISO `2026-01-12` | Use `toIsoDate()`. Return `null` if ambiguous. |
| `  Tesla\n Model 3 ` | `Tesla Model 3` | `.replace(/\s+/g, ' ').trim()` |
| `/cars/123` | absolute URL | `new URL(href, pageUrl).href` |
| `4.5 out of 5` | `4.5` | `parseFloat` |
| missing element | `null` | Never use `''` or `undefined` |

## Output
- One record per item, with the same keys in every record. Include `sourceUrl` and `scrapedAt`.
- Save to `scraper/output/<name>.json` (and CSV if asked; `toCsv()` in `scripts/normalize.js`).
- Dedupe by a stable key (product ID, URL).
- Log and count records with missing required fields. Don't silently drop them.

## Common Mistakes
- **Parsing `1.250.000` with `parseFloat`** gives `1.25`. Indonesian and European formats use `.` as the thousands separator, so use `parsePrice()`.
- **Selector found nothing, so the value is `''`.** Return `null` so gaps are visible.
- **Brittle nth-child chains** (`div > div:nth-child(3) > span`) break on any redesign. Anchor to text labels or attributes instead.
