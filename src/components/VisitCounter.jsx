import { useEffect, useState } from 'react'
import { CalendarDays, Clock, Eye } from 'lucide-react'

const DAY_KEY = 'autoev-visit-day'
const DIGITS = 6
const todayWib = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())

// Counts a browser once per day (WIB): refreshes, new tabs and server restarts only read the totals.
// The server also de-duplicates per visitor per day. Renders nothing if the API isn't available,
// e.g. on static hosting.
export default function VisitCounter({ className = '' }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let alive = true
    let countNow = true
    try {
      const today = todayWib()
      countNow = localStorage.getItem(DAY_KEY) !== today
      // Mark before sending, so a second mount (React StrictMode, quick reload) doesn't count again
      if (countNow) localStorage.setItem(DAY_KEY, today)
    } catch {
      // storage blocked: count anyway, the server de-duplicates
    }
    // Not aborted on unmount: a counting POST that was sent should finish
    fetch('/api/visits', { method: countNow ? 'POST' : 'GET' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (alive && typeof data?.total === 'number') setStats(data)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (!stats) return null
  const digits = String(stats.total).padStart(DIGITS, '0').split('')
  const fmt = (n) => n.toLocaleString('id-ID')

  return (
    <div className={className}>
      <h2 className="text-lg text-white">Total Kunjungan</h2>
      <div className="mt-5 flex gap-1" aria-label={`${fmt(stats.total)} kunjungan`}>
        {digits.map((d, i) => (
          <span key={i} className="grid h-10 w-7 place-items-center bg-white/10 font-display text-2xl leading-none text-white" aria-hidden="true">
            {d}
          </span>
        ))}
      </div>
      <ul className="mt-5 max-w-60 space-y-2.5 text-sm">
        {[
          [Eye, 'Hari ini', stats.today],
          [Clock, 'Kemarin', stats.yesterday],
          [CalendarDays, 'Bulan ini', stats.month],
        ].map(([Icon, label, value]) => (
          <li key={label} className="flex items-center gap-3">
            <Icon className="size-4 shrink-0 text-ev-red" />
            <span className="flex-1">{label}</span>
            <span className="font-semibold text-white">{fmt(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
