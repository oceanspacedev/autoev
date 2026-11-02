// Step 2: crawl every URL in the Yoast sitemaps and extract text, images, links,
// navigation and JSON-LD from the rendered HTML. Output: output/pages.json, output/site.json.
import * as cheerio from 'cheerio'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SITE, OUT_DIR, cachedText, writeJson, log } from './lib/http.js'
import { cleanText } from '../.claude/skills/extracting-structured-data/scripts/normalize.js'

const SITEMAPS = ['page', 'product', 'post', 'product_cat', 'product_tag', 'category', 'post_tag']

async function sitemapUrls() {
  const urls = []
  for (const type of SITEMAPS) {
    const xml = await cachedText(`${SITE}/${type}-sitemap.xml`, '.xml')
    const $ = cheerio.load(xml, { xmlMode: true })
    $('url').each((_, el) => {
      urls.push({
        url: $(el).find('loc').first().text().trim(),
        type,
        lastmod: $(el).find('lastmod').text() || null,
        // Yoast lists each page's images in <image:image>
        sitemapImages: $(el).find('image\\:loc').map((_, i) => $(i).text().trim()).get(),
      })
    })
  }
  // Same URL can appear in two sitemaps (e.g. /product/ as page and product archive)
  return [...new Map(urls.map((u) => [u.url, u])).values()]
}

// Pick the real image URL: lazy-load attributes first, then the largest srcset candidate
function imageSource($img, base) {
  const srcset = $img.attr('data-srcset') || $img.attr('srcset')
  let best = null
  if (srcset) {
    best = srcset
      .split(',')
      .map((s) => s.trim().split(/\s+/))
      .map(([u, w]) => ({ u, w: parseInt(w) || 0 }))
      .sort((a, b) => b.w - a.w)[0]?.u
  }
  const src = best || $img.attr('data-src') || $img.attr('data-lazy-src') || $img.attr('src')
  if (!src || src.startsWith('data:')) return null
  try {
    return new URL(src, base).href
  } catch {
    return null
  }
}

function backgroundImages($, base) {
  const urls = new Set()
  const add = (css) => {
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      if (/\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(m[1])) {
        try { urls.add(new URL(m[1], base).href) } catch { /* ignore bad url */ }
      }
    }
  }
  $('[style*="url("]').each((_, el) => add($(el).attr('style')))
  $('style').each((_, el) => add($(el).html() || ''))
  return [...urls]
}

function parseMenu($, $root) {
  const walk = ($ul) =>
    $ul.children('li').map((_, li) => {
      const $a = $(li).children('a').first()
      const sub = $(li).children('ul')
      return {
        label: cleanText($a.text()),
        href: $a.attr('href') || null,
        ...(sub.length ? { children: walk(sub.first()) } : {}),
      }
    }).get()
  return walk($root)
}

// Rows of a 2-column table -> { label: value }
function parseSpecTable($, $table) {
  const specs = {}
  $table.find('tr').each((_, tr) => {
    const cells = $(tr).find('td, th')
    if (cells.length >= 2) {
      const k = cleanText($(cells[0]).text())
      const v = cleanText($(cells[1]).text())
      if (k && v) specs[k] = v
    }
  })
  return specs
}

function extractPage(html, { url, type, lastmod, sitemapImages }) {
  const $ = cheerio.load(html)
  const jsonLd = $('script[type="application/ld+json"]')
    .map((_, el) => { try { return JSON.parse($(el).text()) } catch { return null } })
    .get()
    .filter(Boolean)

  const meta = {
    title: cleanText($('title').text()),
    description: $('meta[name="description"]').attr('content') ?? null,
    ogTitle: $('meta[property="og:title"]').attr('content') ?? null,
    ogDescription: $('meta[property="og:description"]').attr('content') ?? null,
    ogImage: $('meta[property="og:image"]').attr('content') ?? null,
    canonical: $('link[rel="canonical"]').attr('href') ?? null,
  }

  // Main content only: drop site chrome so text isn't repeated on every page
  const $main = $('#content, main, .site-content').first().length ? $('#content, main, .site-content').first() : $('body')
  $main.find('script, style, noscript, header.site-header, footer.site-footer, .elementor-location-header, .elementor-location-footer').remove()

  const blocks = []
  $main.find('h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, .elementor-heading-title, .elementor-button-text').each((_, el) => {
    const $el = $(el)
    // Skip containers whose text is already captured by a nested block
    if ($el.find('h1, h2, h3, h4, h5, h6, p, li').length) return
    const text = cleanText($el.text())
    if (!text) return
    const tag = el.tagName.toLowerCase()
    const kind = $el.hasClass('elementor-button-text') ? 'button' : tag
    if (blocks.at(-1)?.text !== text) blocks.push({ tag: kind, text })
  })

  const images = $main.find('img').map((_, img) => {
    const $img = $(img)
    const src = imageSource($img, url)
    return src && { src, alt: cleanText($img.attr('alt')), width: Number($img.attr('width')) || null, height: Number($img.attr('height')) || null }
  }).get().filter(Boolean)

  const links = $main.find('a[href]').map((_, a) => {
    const href = $(a).attr('href')
    try {
      return { text: cleanText($(a).text()) || cleanText($(a).attr('aria-label')), href: new URL(href, url).href }
    } catch { return null }
  }).get().filter(Boolean)

  const page = {
    url,
    type,
    lastmod,
    meta,
    headings: blocks.filter((b) => /^h[1-6]$/.test(b.tag)),
    blocks,
    images: [...new Map(images.map((i) => [i.src, i])).values()],
    backgroundImages: backgroundImages($, url),
    sitemapImages,
    internalLinks: [...new Set(links.filter((l) => l.href.startsWith(SITE)).map((l) => l.href))],
    externalLinks: [...new Map(links.filter((l) => !l.href.startsWith(SITE)).map((l) => [l.href, l])).values()],
    iframes: $main.find('iframe').map((_, f) => $(f).attr('src') || $(f).attr('data-src')).get().filter(Boolean),
    jsonLd,
  }

  if (type === 'product') {
    const $summary = $('.summary, .product').first()
    const $specTable = $summary.find('.woocommerce-product-details__short-description table').first()
    page.product = {
      name: cleanText($('h1.product_title').text()),
      priceText: cleanText($summary.find('.price').first().text()),
      specs: $specTable.length ? parseSpecTable($, $specTable) : {},
      categories: $('.posted_in a').map((_, a) => cleanText($(a).text())).get(),
      tags: $('.tagged_as a').map((_, a) => cleanText($(a).text())).get(),
      gallery: $('.woocommerce-product-gallery__image').map((_, el) => {
        const $el = $(el)
        return $el.attr('data-thumb') ? new URL($el.find('a').attr('href') || $el.attr('data-thumb'), url).href : null
      }).get().filter(Boolean),
      whatsappLinks: [...new Set($('a[href*="whatsapp.com"], a[href*="wa.me"]').map((_, a) => $(a).attr('href')).get())],
      descriptionText: cleanText($('#tab-description').text()),
    }
  }
  return page
}

// Header, footer and global elements come from the homepage
function extractSiteChrome(html) {
  const $ = cheerio.load(html)
  // Header/footer are Elementor Pro theme-builder templates, not <header>/<footer> tags
  const $header = $('.elementor-location-header').first()
  const $footer = $('.elementor-location-footer').first()
  const navs = $('nav ul, .main-header-menu, .elementor-nav-menu').filter((_, ul) => $(ul).parents('ul').length === 0)
  const menus = [...new Map(navs.map((_, ul) => {
    const items = parseMenu($, $(ul))
    return [[JSON.stringify(items), items]]
  }).get()).values()].filter((m) => m.length)

  const logos = $('.elementor-widget-theme-site-logo img, .custom-logo').map((_, img) => ({
    src: imageSource($(img), SITE),
    alt: cleanText($(img).attr('alt')),
    location: $(img).closest('.elementor-location-footer').length ? 'footer' : 'header',
  })).get()
  return {
    siteName: $('meta[property="og:site_name"]').attr('content') ?? null,
    logos: [...new Map(logos.map((l) => [l.src + l.location, l])).values()],
    favicon: $('link[rel="icon"]').map((_, l) => ({ href: $(l).attr('href'), sizes: $(l).attr('sizes') || null })).get(),
    menus,
    header: {
      text: cleanText($header.find('script, style').remove().end().text()),
      links: $header.find('a[href]').map((_, a) => ({ text: cleanText($(a).text()) || cleanText($(a).attr('aria-label')), href: $(a).attr('href') })).get(),
    },
    footer: {
      text: cleanText($footer.find('script, style').remove().end().text()),
      blocks: $footer.find('h1, h2, h3, h4, h5, h6, p, li, .elementor-icon-list-text').map((_, el) => cleanText($(el).text())).get().filter(Boolean),
      links: $footer.find('a[href]').map((_, a) => ({ text: cleanText($(a).text()) || cleanText($(a).attr('aria-label')), href: $(a).attr('href') })).get(),
      images: $footer.find('img').map((_, img) => imageSource($(img), SITE)).get().filter(Boolean),
    },
    heroSlides: $('.swiper-slide-image').map((_, img) => ({ src: imageSource($(img), SITE), alt: cleanText($(img).attr('alt')) })).get(),
    // Google reviews rendered by the Trustindex widget (profile photos intentionally not kept)
    testimonials: $('.ti-review-item').map((_, el) => ({
      source: ($(el).attr('class').match(/source-(\w+)/) || [])[1] ?? null,
      name: cleanText($(el).find('.ti-name').text()),
      date: cleanText($(el).find('.ti-date').text()),
      rating: $(el).find('.ti-star').filter((_, s) => /\/f\.svg/.test($(s).attr('data-imgurl') || '')).length,
      text: cleanText($(el).find('.ti-review-text-container, .ti-review-content').first().clone().find('.ti-stars').remove().end().text()),
    })).get(),
    socialLinks: [...new Set($('a[href*="instagram.com"], a[href*="facebook.com"], a[href*="tiktok.com"], a[href*="youtube.com"], a[href*="twitter.com"], a[href*="x.com/"], a[href*="shopee"], a[href*="tokopedia"]').map((_, a) => $(a).attr('href')).get())],
    whatsapp: [...new Set($('a[href*="whatsapp.com"], a[href*="wa.me"]').map((_, a) => $(a).attr('href')).get())],
    phones: [...new Set($('a[href^="tel:"]').map((_, a) => $(a).attr('href').slice(4)).get())],
    emails: [...new Set($('a[href^="mailto:"]').map((_, a) => $(a).attr('href').slice(7)).get())],
  }
}

const targets = await sitemapUrls()
log(`${targets.length} URLs from sitemaps`)

const pages = []
const failed = []
for (const [i, t] of targets.entries()) {
  try {
    const html = await cachedText(t.url)
    pages.push(extractPage(html, t))
    if (t.url === `${SITE}/`) await writeJson('site.json', extractSiteChrome(html))
  } catch (err) {
    failed.push({ url: t.url, error: err.message })
    log(`FAIL ${t.url}: ${err.message}`)
  }
  if ((i + 1) % 20 === 0) log(`${i + 1}/${targets.length}`)
}

await writeJson('pages.json', pages)
await writeJson('crawl-errors.json', failed)
log(`done: ${pages.length} pages, ${failed.length} failed`)

// Clean product catalog: HTML page data merged with the Store API (which has prices and full images)
const apiProducts = JSON.parse(await readFile(join(OUT_DIR, 'api/wc-products.json'), 'utf8'))
const htmlByUrl = new Map(pages.filter((p) => p.product).map((p) => [p.url, p]))
const products = apiProducts.map((p) => {
  const html = htmlByUrl.get(p.permalink)
  const $ = cheerio.load(p.short_description || '')
  const specs = html?.product.specs && Object.keys(html.product.specs).length
    ? html.product.specs
    : parseSpecTable($, $('table').first())
  const price = Number(p.prices.price) || null
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    url: p.permalink,
    brand: p.categories[0]?.name ?? null,
    categories: p.categories.map((c) => c.name),
    tags: p.tags.map((t) => t.name),
    price, // null = no price published (sold via WhatsApp inquiry)
    regularPrice: Number(p.prices.regular_price) || null,
    onSale: p.on_sale,
    currency: p.prices.currency_code,
    specs,
    description: cleanText(cheerio.load(p.description || '').text()),
    images: p.images.map((i) => ({ src: i.src, alt: i.alt || null, name: i.name })),
    whatsappLink: html?.product.whatsappLinks[0] ?? null,
  }
})
await writeJson('products.json', products)
log(`products.json: ${products.length} products, ${products.filter((p) => p.price).length} with price`)
