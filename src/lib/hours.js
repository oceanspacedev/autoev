// Opening-hours helpers for strings like "09.00–20.00" or "Senin–Sabtu 08.00–17.00 · Minggu tutup".
// Times are WIB (UTC+7), where every Auto EV location is.

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const toMinutes = (h, m) => Number(h) * 60 + Number(m)

export function parseHours(text = '') {
  const range = text.match(/(\d{1,2})\.(\d{2})\s*[–-]\s*(\d{1,2})\.(\d{2})/)
  if (!range) return null
  const closedDays = DAYS.flatMap((d, i) => (new RegExp(`${d}\\s+tutup`, 'i').test(text) ? [i] : []))
  return { open: toMinutes(range[1], range[2]), close: toMinutes(range[3], range[4]), openText: `${range[1]}.${range[2]}`, closeText: `${range[3]}.${range[4]}`, closedDays }
}

function nowWib(date = new Date()) {
  const wib = new Date(date.getTime() + 7 * 3600e3)
  return { day: wib.getUTCDay(), minutes: wib.getUTCHours() * 60 + wib.getUTCMinutes() }
}

// { open: boolean, label: 'Buka · tutup 20.00' } or null when the hours can't be read
export function openStatus(text, date) {
  const h = parseHours(text)
  if (!h) return null
  const { day, minutes } = nowWib(date)
  if (!h.closedDays.includes(day) && minutes >= h.open && minutes < h.close) return { open: true, label: `Buka · tutup ${h.closeText}` }
  // Next opening: later today, otherwise the next day that isn't closed
  if (!h.closedDays.includes(day) && minutes < h.open) return { open: false, label: `Tutup · buka ${h.openText}` }
  for (let d = 1; d <= 7; d++) {
    const next = (day + d) % 7
    if (!h.closedDays.includes(next)) return { open: false, label: `Tutup · buka ${d === 1 ? 'besok' : DAYS[next]} ${h.openText}` }
  }
  return { open: false, label: 'Tutup' }
}
