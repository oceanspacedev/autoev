// Normalization helpers for scraped values.

const CURRENCY_SYMBOLS = { Rp: 'IDR', IDR: 'IDR', $: 'USD', USD: 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY' }
const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, mei: 5, jun: 6, jul: 7,
  aug: 8, agu: 8, agt: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, des: 12,
}

export const cleanText = (s) => (s == null ? null : String(s).replace(/\s+/g, ' ').trim() || null)

// "Rp 1.250.000" -> { amount: 1250000, currency: 'IDR' }
// "$1,250.50"    -> { amount: 1250.5,  currency: 'USD' }
export function parsePrice(raw) {
  if (raw == null) return { amount: null, currency: null }
  const text = String(raw)
  const symbol = Object.keys(CURRENCY_SYMBOLS).find((s) => text.includes(s))
  let num = text.replace(/[^\d.,-]/g, '')
  if (!num) return { amount: null, currency: CURRENCY_SYMBOLS[symbol] ?? null }

  const lastDot = num.lastIndexOf('.')
  const lastComma = num.lastIndexOf(',')
  if (lastDot > -1 && lastComma > -1) {
    // Whichever separator comes last is the decimal separator
    num = lastComma > lastDot ? num.replace(/\./g, '').replace(',', '.') : num.replace(/,/g, '')
  } else {
    const sep = lastDot > -1 ? '.' : lastComma > -1 ? ',' : null
    // A separator followed by exactly 3 digits (or repeated) is a thousands separator
    if (sep && (num.split(sep).length > 2 || /^\d{3}$/.test(num.split(sep).pop()))) {
      num = num.split(sep).join('')
    } else if (sep === ',') {
      num = num.replace(',', '.')
    }
  }
  const amount = Number(num)
  return { amount: Number.isFinite(amount) ? amount : null, currency: CURRENCY_SYMBOLS[symbol] ?? null }
}

// "12 Jan 2026" / "12 Januari 2026" / "2026-01-12T10:00Z" -> "2026-01-12"; ambiguous -> null
export function toIsoDate(raw) {
  if (!raw) return null
  const text = String(raw).trim()
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const dmy = text.match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})/)
  if (dmy) {
    const month = MONTHS[dmy[2].slice(0, 3).toLowerCase()]
    if (month) return `${dmy[3]}-${String(month).padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }
  return null
}

// Array of flat objects -> CSV string (RFC 4180 quoting)
export function toCsv(records) {
  if (!records.length) return ''
  const keys = [...new Set(records.flatMap(Object.keys))]
  const esc = (v) => {
    if (v == null) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [keys.join(','), ...records.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
}

export function dedupeBy(records, key) {
  const seen = new Set()
  return records.filter((r) => (seen.has(r[key]) ? false : seen.add(r[key])))
}
