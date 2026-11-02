import { useEffect, useMemo, useState } from 'react'
import { Check, Plus, Search, X } from 'lucide-react'
import { products } from '../lib/data.js'
import { BUDGETS, budgetById } from '../lib/budgets.js'
import { formatPrice, modelName } from '../lib/format.js'
import { COMPARE_MAX, useCompare } from '../lib/compare.js'
import ProductImage from './ProductImage.jsx'

// Search-and-pick panel for the compare page: right-hand drawer on desktop, bottom sheet on phones.
// Mount it with a `key` so each opening starts from `initialBudget`.
export default function ComparePicker({ onClose, initialBudget = '' }) {
  const { slugs, toggle, has } = useCompare()
  const [q, setQ] = useState('')
  const [budget, setBudget] = useState(initialBudget)
  const [showIncomplete, setShowIncomplete] = useState(false)
  const full = slugs.length >= COMPARE_MAX

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const test = budgetById(budget)?.test
    return products
      .filter((p) => showIncomplete || p.price) // models without price also lack specs: nothing to compare
      .filter((p) => !test || test(p))
      .filter((p) => !needle || `${p.name} ${p.brand}`.toLowerCase().includes(needle))
      .sort((a, b) => (a.price || Infinity) - (b.price || Infinity) || a.name.localeCompare(b.name))
  }, [q, budget, showIncomplete])

  const chip = (active) =>
    `shrink-0 border px-3 py-1.5 font-ui text-xs font-semibold transition ${
      active ? 'border-ev-ink bg-ev-ink text-white' : 'border-black/10 bg-white text-ev-text hover:border-ev-ink'
    }`

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Pilih motor untuk dibandingkan">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Tutup" />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] animate-fade-up flex-col bg-white sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[28rem]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <div>
            <p className="font-display text-2xl uppercase leading-none text-ev-ink">Pilih motor</p>
            <p className="mt-1 text-xs text-ev-gray">{slugs.length} dari {COMPARE_MAX} dipilih</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center" aria-label="Tutup">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3 border-b border-black/10 px-5 py-4">
          <label className="relative block">
            <span className="sr-only">Cari motor</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ev-gray" />
            <input
              type="search"
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama atau merek…"
              className="w-full border border-black/10 bg-ev-soft py-3 pl-10 pr-3 text-sm outline-none focus:border-ev-red focus:bg-white"
            />
          </label>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Budget">
            <button type="button" onClick={() => setBudget('')} aria-pressed={!budget} className={chip(!budget)}>Semua harga</button>
            {BUDGETS.map((b) => (
              <button key={b.id} type="button" onClick={() => setBudget(b.id)} aria-pressed={budget === b.id} className={chip(budget === b.id)}>
                {b.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-ev-gray">
            <input type="checkbox" checked={showIncomplete} onChange={(e) => setShowIncomplete(e.target.checked)} className="accent-ev-red" />
            Tampilkan juga motor tanpa harga &amp; spesifikasi
          </label>
        </div>

        {full && (
          <p className="bg-ev-soft px-5 py-2.5 text-xs text-ev-ink">Sudah {COMPARE_MAX} motor. Hapus salah satu untuk menambah yang lain.</p>
        )}

        <ul className="flex-1 divide-y divide-black/5 overflow-y-auto">
          {list.map((p) => {
            const selected = has(p.slug)
            const disabled = full && !selected
            const specLine = [p.specs['Jarak Tempuh'], p.specs['Kecepatan Max']].filter(Boolean).join(' · ')
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => toggle(p.slug)}
                  disabled={disabled}
                  aria-pressed={selected}
                  className={`flex w-full items-center gap-4 px-5 py-3 text-left transition ${selected ? 'bg-ev-red/5' : 'hover:bg-ev-soft'} disabled:opacity-40`}
                >
                  <span className="size-16 shrink-0 bg-white ring-1 ring-black/[0.06]">
                    <ProductImage product={p} className="size-full p-1.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-ui text-[10px] font-semibold uppercase tracking-[0.15em] text-ev-gray">{p.brand}</span>
                    <span className="block truncate text-sm font-bold text-ev-ink">{modelName(p)}</span>
                    <span className="block text-xs text-ev-gray">{formatPrice(p.price)}{specLine && ` · ${specLine}`}</span>
                  </span>
                  <span className={`grid size-8 shrink-0 place-items-center ${selected ? 'bg-ev-red text-white' : 'bg-ev-soft text-ev-ink'}`}>
                    {selected ? <Check className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>
              </li>
            )
          })}
          {!list.length && <li className="px-5 py-12 text-center text-sm text-ev-gray">Tidak ada motor yang cocok.</li>}
        </ul>

        <div className="border-t border-black/10 p-4">
          <button type="button" onClick={onClose} className="btn-red w-full">
            {slugs.length ? `Bandingkan ${slugs.length} motor` : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  )
}
