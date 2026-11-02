import { site } from './data.js'

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export const formatPrice = (n) => (n ? rupiah.format(n).replace(/\s/g, ' ') : 'Tanya harga')

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export function whatsappUrl(productName) {
  const text = productName
    ? `Hai kak, saya tertarik dengan sepeda listrik ${productName}. Bisa dibantu info harga & ketersediaannya?`
    : 'Hai kak, saya mau tanya-tanya soal sepeda listrik di Auto EV. Bisa dibantu?'
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`
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
