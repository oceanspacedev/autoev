import { useEffect, useState } from 'react'
import { CalendarDays, Clock, Eye } from 'lucide-react'

const SESSION_KEY = 'autoev-visit-counted'
const DIGITS = 6

// Counts this visit once per browser session (the server also de-duplicates per visitor per day),
// then shows the totals. Renders nothing if the counter API isn't available, e.g. on static hosting.
export default function VisitCounter({ className = '' }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let counted = false
    try {
      counted = sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      // storage blocked: just count, the server de-duplicates anyway
    }
    const ctrl = new AbortController()
    fetch('/api/visits', { method: counted ? 'GET' : 'POST', signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (typeof data?.total !== 'number') return
        setStats(data)
        try {
          sessionStorage.setItem(SESSION_KEY, '1')
        } catch {
          // ignore
        }
      })
      .catch(() => {})
    return () => ctrl.abort()
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
