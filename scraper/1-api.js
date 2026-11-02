// Step 1: dump the public WordPress + WooCommerce Store APIs to output/api/*.json.
// These give clean structured data (product prices, images, categories, page content).
import { SITE, cachedJson, writeJson, log } from './lib/http.js'

const ENDPOINTS = {
  'wp-pages': '/wp-json/wp/v2/pages',
  'wp-posts': '/wp-json/wp/v2/posts',
  'wp-media': '/wp-json/wp/v2/media',
  'wp-categories': '/wp-json/wp/v2/categories',
  'wp-tags': '/wp-json/wp/v2/tags',
  'wc-products': '/wp-json/wc/store/v1/products',
  'wc-categories': '/wp-json/wc/store/v1/products/categories',
  'wc-tags': '/wp-json/wc/store/v1/products/tags',
  'wc-attributes': '/wp-json/wc/store/v1/products/attributes',
}

async function fetchAllPages(path) {
  const all = []
  for (let page = 1; page <= 50; page++) {
    const sep = path.includes('?') ? '&' : '?'
    let batch
    try {
      batch = await cachedJson(`${SITE}${path}${sep}per_page=100&page=${page}`)
    } catch (err) {
      // WP returns 400 when page is past the last one
      if (page > 1 && /HTTP 400/.test(err.message)) break
      throw err
    }
    if (!Array.isArray(batch)) return batch
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
}

for (const [name, path] of Object.entries(ENDPOINTS)) {
  try {
    const data = await fetchAllPages(path)
    await writeJson(`api/${name}.json`, data)
    log(`${name}: ${Array.isArray(data) ? data.length : 1} items`)
  } catch (err) {
    log(`${name}: FAILED ${err.message}`)
  }
}
