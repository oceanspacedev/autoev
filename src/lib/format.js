import { site } from './data.js'

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export const formatPrice = (n) => (n ? rupiah.format(n).replace(/\s/g, ' ') : 'Tanya harga')

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

// The scraped product blurb is one run-on string ("…kelasnya.. Diskon 10% … Ketentuan : * … * …"),
// sometimes with a stray model name or clipped word in front. Split it into readable parts.
export function parseDescription(text = '') {
  const [body, terms = ''] = text.split(/Ketentuan\s*:/i)
  let intro = body.replace(/\.{2,}/g, '.').trim()
  const start = intro.search(/(se)?peda listrik/i)
  if (start > 0) intro = intro.slice(start)
  intro = intro.replace(/^peda/i, 'Sepeda').replace(/^Sepeda listrik [A-Z0-9][A-Z0-9 .-]*? dengan/, 'Sepeda listrik dengan')
  const sentences = intro.split(/(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean)
  return {
    lines: sentences.map((s) => (/[.!?]$/.test(s) ? s : `${s}.`)),
    terms: terms.split('*').map((t) => t.trim()).filter(Boolean),
  }
}

// Rough reading time of an article body at ~200 words per minute
export const readMinutes = (html = '') =>
  Math.max(1, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200))

export const whatsappMessage = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`

export function whatsappUrl(productName) {
  return whatsappMessage(
    productName
      ? `Hai kak, saya tertarik dengan sepeda listrik ${productName}. Bisa dibantu info harga & ketersediaannya?`
      : 'Hai kak, saya mau tanya-tanya soal sepeda listrik di Auto EV. Bisa dibantu?',
  )
}

export const mapsUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

export const brandSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// "UOU US1" -> "US1" when the brand is shown separately; falls back to the full name
export function modelName(product) {
  const prefix = `${product.brand} `
  const rest = product.name.toUpperCase().startsWith(prefix.toUpperCase()) ? product.name.slice(prefix.length).trim() : ''
  return rest || product.name
}

// "4-5 Jam" -> 4, "48V 500W" -> 48 (first number); used to rank specs in the compare table
export const firstNumber = (s) => {
  const m = String(s ?? '').replace(',', '.').match(/\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}
