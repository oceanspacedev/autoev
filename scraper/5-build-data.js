// Step 5: turn the scrape into the website's static data (src/data/*.json) and
// web-sized WebP images (public/img/). Safe to re-run: existing images are skipped.
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { OUT_DIR, ROOT, log } from './lib/http.js'
import { cleanText } from '../.claude/skills/extracting-structured-data/scripts/normalize.js'

const APP = join(ROOT, '..')
const PUBLIC = join(APP, 'public')
const DATA = join(APP, 'src', 'data')
const readJson = async (rel) => JSON.parse(await readFile(join(OUT_DIR, rel), 'utf8'))

const products = await readJson('products.json')
const posts = await readJson('api/wp-posts.json')
const media = await readJson('api/wp-media.json')
const site = await readJson('site.json')
const pages = await readJson('pages.json')
const showrooms = await readJson('showrooms.json')
const manifest = await readJson('images.json')

const localByUrl = new Map(manifest.filter((m) => m.bytes).map((m) => [m.url, join(OUT_DIR, m.localPath)]))
const mediaById = new Map(media.map((m) => [m.id, m]))
const pageBySlug = (slug) => pages.find((p) => p.url === `https://autoev.co.id/${slug}`)

// WordPress resized variants (foo-300x200.jpg) -> original upload (foo.jpg) when we have it
const original = (url) => {
  const full = url.replace(/-\d+x\d+(\.\w+)$/, '$1')
  return localByUrl.has(full) ? full : url
}

let made = 0
async function webp(url, outRel, width) {
  if (!url) return null
  const src = localByUrl.get(original(url)) ?? localByUrl.get(url)
  if (!src) {
    log(`missing local file for ${url}`)
    return null
  }
  const out = join(PUBLIC, 'img', outRel + '.webp')
  try {
    await stat(out)
  } catch {
    await mkdir(dirname(out), { recursive: true })
    // libvips can't open Windows paths over 260 chars, so Node does the file I/O
    const buf = await sharp(await readFile(src), { limitInputPixels: false })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
    await writeFile(out, buf)
    made++
  }
  return `/img/${outRel}.webp`
}

// Product photo has a see-through background (looks good on any color)?
async function isTransparent(url) {
  const src = localByUrl.get(url)
  if (!src) return false
  const img = sharp(await readFile(src), { limitInputPixels: false })
  const { hasAlpha } = await img.metadata()
  if (!hasAlpha) return false
  const { data } = await img.extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true })
  return data[3] === 0
}

const COLORS = {
  HITAM: ['Hitam', '#1f1f1f'], BLACK: ['Hitam', '#1f1f1f'], PUTIH: ['Putih', '#f4f4f4'], WHITE: ['Putih', '#f4f4f4'],
  MERAH: ['Merah', '#d6282b'], RED: ['Merah', '#d6282b'], BIRU: ['Biru', '#2b5fd9'], BLUE: ['Biru', '#2b5fd9'],
  NAVY: ['Navy', '#1d2c55'], HIJAU: ['Hijau', '#3aa35b'], IJO: ['Hijau', '#3aa35b'], GREEN: ['Hijau', '#3aa35b'],
  TOSCA: ['Tosca', '#2bb5a8'], KUNING: ['Kuning', '#f2c230'], YELLOW: ['Kuning', '#f2c230'], PINK: ['Pink', '#f08bb4'],
  ORANGE: ['Oranye', '#f28a30'], ABU: ['Abu-abu', '#8a8f98'], GREY: ['Abu-abu', '#8a8f98'], GRAY: ['Abu-abu', '#8a8f98'],
  SILVER: ['Silver', '#c4c8cc'], UNGU: ['Ungu', '#7a4fc9'], PURPLE: ['Ungu', '#7a4fc9'], CREAM: ['Krem', '#efe3c8'],
  COKLAT: ['Coklat', '#7b5236'], BROWN: ['Coklat', '#7b5236'], GOLD: ['Emas', '#c9a23f'], MINT: ['Mint', '#9fe0c6'],
}
const colorOf = (name = '') => {
  const words = name.toUpperCase().replace(/[^A-Z]+/g, ' ')
  const key = Object.keys(COLORS).find((k) => new RegExp(`(^|\\s|[A-Z0-9])${k}(\\s|$)`).test(words))
  return key ? { label: COLORS[key][0], hex: COLORS[key][1] } : null
}

// ---- products ----
const outProducts = []
for (const p of products) {
  const images = []
  for (const [i, img] of p.images.entries()) {
    const src = await webp(img.src, `produk/${p.slug}-${i + 1}`, 900)
    if (src) images.push({ src, alt: img.alt || p.name, color: colorOf(img.name) })
  }
  const description = (p.description || '')
    .split(/Jam Operasional/i)[0]
    .replace(new RegExp(`^${p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '')
    .trim()
  outProducts.push({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    regularPrice: p.regularPrice !== p.price ? p.regularPrice : null,
    onSale: p.onSale,
    specs: p.specs,
    description: description || null,
    images,
    transparent: p.images[0] ? await isTransparent(p.images[0].src) : false,
  })
}
log(`products: ${outProducts.length}`)

// ---- articles ----
const decode = (html) => cheerio.load(`<p>${html}</p>`)('p').text()
const outPosts = []
for (const post of posts) {
  const $ = cheerio.load(post.content.rendered, null, false)
  $('script, style, noscript').remove()
  let n = 0
  for (const el of $('img').toArray()) {
    const $img = $(el)
    const srcset = $img.attr('srcset')
    const best = srcset
      ? srcset.split(',').map((s) => s.trim().split(/\s+/)).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0][0]
      : $img.attr('src')
    const local = await webp(best, `artikel/${post.id}-${++n}`, 1200)
    if (local) $img.attr('src', local)
    $img.removeAttr('srcset').removeAttr('sizes').removeAttr('width').removeAttr('height').removeAttr('class').attr('loading', 'lazy')
  }
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href')
    const product = href.match(/^https?:\/\/autoev\.co\.id\/product\/([^/]+)/)
    const article = posts.find((x) => href.replace(/\/$/, '').endsWith(`/${x.slug}`))
    if (product) $(a).attr('href', `/koleksi/${product[1]}`)
    else if (article) $(a).attr('href', `/artikel/${article.slug}`)
    else if (/^https?:\/\/autoev\.co\.id\/?$/.test(href)) $(a).attr('href', '/')
  })
  const featured = mediaById.get(post.featured_media)
  outPosts.push({
    slug: post.slug,
    title: decode(post.title.rendered),
    date: post.date.slice(0, 10),
    excerpt: cleanText(cheerio.load(post.excerpt.rendered).text()).replace(/\s*\[…\]|\s*\[&hellip;\]/, '…'),
    cover: featured ? await webp(featured.source_url, `artikel/${post.id}-cover`, 1200) : null,
    html: $.html().trim(),
  })
}
log(`articles: ${outPosts.length}`)

// ---- site-wide content ----
const pairs = (blocks, from, to) => {
  const start = blocks.findIndex((b) => b.text.toLowerCase().startsWith(from))
  const end = to ? blocks.findIndex((b, i) => i > start && b.text.toLowerCase().startsWith(to)) : blocks.length
  const out = []
  for (let i = start + 1; i < end; i++) {
    if (/^h[1-6]$/.test(blocks[i].tag) && blocks[i + 1]?.tag === 'p') out.push({ title: blocks[i].text, text: blocks[i + 1].text })
  }
  return out
}
const home = pageBySlug('')
const about = pageBySlug('tentang-kami/')
const community = pageBySlug('auto-evers/')

const customerGallery = []
for (const [i, img] of about.images.entries()) {
  // The page links WordPress thumbnails (Page-1-200x300.jpg); drop the size suffix to get the original
  const src = await webp(img.src.replace(/-\d+x\d+(\.\w+)$/, '$1'), `tentang/pelanggan-${i + 1}`, 800)
  if (src) customerGallery.push({ src, alt: `Pelanggan Auto EV ${i + 1}` })
}
const communityPhotos = []
for (const [i, img] of community.images.slice(0, 3).entries()) {
  const src = await webp(img.src, `komunitas/foto-${i + 1}`, 1400)
  if (src) communityPhotos.push({ src, caption: img.alt === 'Auto Evers' ? 'Komunitas Auto EVers' : img.alt })
}

const logo = await webp(site.logos[0].src, 'brand/logo-putih', 600)
const icon = await webp('https://autoev.co.id/wp-content/uploads/2023/08/Tumbnail-Auto-EV.png', 'brand/icon', 256)
const evIllustration = await webp('https://autoev.co.id/wp-content/uploads/2024/08/3D-ICON-2048x2048.webp', 'beranda/ilustrasi-ev', 1000)

const brandCounts = {}
outProducts.forEach((p) => (brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1))

const outSite = {
  name: 'Auto EV',
  tagline: 'Autohemat Autogaya',
  logo,
  icon,
  evIllustration,
  whatsapp: '6287738417771',
  phone: '+62 877-3841-7771',
  emails: site.emails,
  headOffice: {
    address: 'Rukan Golf Island Blok I No 27-28, Jl Pantai Indah Kapuk – 14460',
    hours: 'Senin–Sabtu 08.00–17.00 · Minggu tutup',
    mapEmbed: pages.find((p) => p.url.endsWith('/kontak-kami/')).iframes[0],
  },
  socials: [
    { name: 'Instagram', handle: '@autoev.indonesia', url: 'https://instagram.com/autoev.indonesia/' },
    { name: 'TikTok', handle: '@auto_ev', url: 'https://www.tiktok.com/@auto_ev' },
  ],
  // Wording from the old site's promo banners
  perks: [
    { title: 'DP 0%', text: 'Cicilan mudah' },
    { title: 'Garansi 1 tahun', text: 'Aki, dinamo & service' },
    { title: 'Gratis kirim', text: 'Tanpa biaya pengiriman' },
  ],
  about: about.blocks.find((b) => b.text.startsWith('Pertama di Indonesia')).text,
  evBenefits: pairs(home.blocks, 'apa kelebihan kendaraan', 'apa kelebihan auto ev'),
  services: pairs(home.blocks, 'apa kelebihan auto ev', 'testimoni'),
  testimonials: site.testimonials,
  brands: Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
  customerGallery,
  communityPhotos,
}

await mkdir(DATA, { recursive: true })
await writeFile(join(DATA, 'products.json'), JSON.stringify(outProducts, null, 1))
await writeFile(join(DATA, 'articles.json'), JSON.stringify(outPosts, null, 1))
await writeFile(join(DATA, 'site.json'), JSON.stringify(outSite, null, 1))
await writeFile(join(DATA, 'showrooms.json'), JSON.stringify(showrooms, null, 1))
log(`done, ${made} new images`)
