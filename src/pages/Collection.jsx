import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { brands, products } from '../lib/data.js'
import { brandSlug } from '../lib/format.js'
import ProductCard from '../components/ProductCard.jsx'

const PRICE_RANGES = [
  { id: '', label: 'Semua harga' },
  { id: 'lt5', label: 'Di bawah Rp 5 jt', test: (p) => p.price && p.price < 5e6 },
  { id: '5-7', label: 'Rp 5–7 jt', test: (p) => p.price >= 5e6 && p.price < 7e6 },
  { id: '7-10', label: 'Rp 7–10 jt', test: (p) => p.price >= 7e6 && p.price < 10e6 },
  { id: 'gt10', label: 'Rp 10 jt ke atas', test: (p) => p.price >= 10e6 },
  { id: 'tanya', label: 'Tanya harga', test: (p) => !p.price },
]

// Complete listings (price + specs) first: the newest models are often still missing both
const completeness = (p) => Number(!!p.price) + Number(Object.keys(p.specs).length > 0)

const SORTS = {
  rekomendasi: { label: 'Rekomendasi', fn: (a, b) => completeness(b) - completeness(a) || b.id - a.id },
  terbaru: { label: 'Terbaru', fn: (a, b) => b.id - a.id },
  murah: { label: 'Harga termurah', fn: (a, b) => (a.price || Infinity) - (b.price || Infinity) },
  mahal: { label: 'Harga tertinggi', fn: (a, b) => (b.price || 0) - (a.price || 0) },
  nama: { label: 'Nama A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
}

const matchesQuery = (p, q) => !q || `${p.name} ${p.brand}`.toLowerCase().includes(q)
const matchesPrice = (p, id) => {
  const range = PRICE_RANGES.find((r) => r.id === id)
  return !range?.test || range.test(p)
}

function Option({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center justify-between border-l-2 py-2 pl-3 pr-1 text-left text-sm transition ${
        active ? 'border-ev-red font-bold text-ev-ink' : 'border-transparent text-ev-gray hover:border-black/15 hover:text-ev-ink'
      }`}
    >
      <span>{label}</span>
      <span className={`text-xs ${active ? 'text-ev-red' : 'text-ev-gray/70'}`}>{count}</span>
    </button>
  )
}

// Same filter lists in the desktop sidebar and the phone sheet
function Filters({ brand, price, q, update }) {
  // Counts reflect the other active filters, so a choice never leads to an empty page by surprise
  const inPrice = products.filter((p) => matchesPrice(p, price) && matchesQuery(p, q))
  const inBrand = products.filter((p) => (!brand || brandSlug(p.brand) === brand) && matchesQuery(p, q))
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-ev-ink">Merek</h2>
        <div className="mt-3">
          <Option active={!brand} onClick={() => update('merek', '')} label="Semua merek" count={inPrice.length} />
          {brands.map((b) => {
            const slug = brandSlug(b.name)
            return (
              <Option
                key={b.name}
                active={brand === slug}
                onClick={() => update('merek', brand === slug ? '' : slug)}
                label={b.name}
                count={inPrice.filter((p) => p.brand === b.name).length}
              />
            )
          })}
        </div>
      </div>
      <div>
        <h2 className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-ev-ink">Harga</h2>
        <div className="mt-3">
          {PRICE_RANGES.map((r) => (
            <Option
              key={r.id}
              active={price === r.id}
              onClick={() => update('harga', r.id)}
              label={r.label}
              count={inBrand.filter((p) => matchesPrice(p, r.id)).length}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterSheet({ open, onClose, resultCount, onReset, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter motor">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Tutup filter" />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] animate-fade-up flex-col bg-white">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
          <p className="font-display text-2xl uppercase text-ev-ink">Filter</p>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center" aria-label="Tutup filter">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">{children}</div>
        <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-black/10 p-4">
          <button type="button" onClick={onReset} className="px-4 font-ui text-xs font-bold uppercase tracking-wider text-ev-gray hover:text-ev-ink">
            Reset
          </button>
          <button type="button" onClick={onClose} className="btn-red">Tampilkan {resultCount} motor</button>
        </div>
      </div>
    </div>
  )
}

export default function Collection() {
  const [params, setParams] = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(false)
  const brand = params.get('merek') ?? ''
  const price = params.get('harga') ?? ''
  const sort = SORTS[params.get('urut')] ? params.get('urut') : 'rekomendasi'
  const q = params.get('q') ?? ''
  const needle = q.trim().toLowerCase()

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const reset = () => {
    const next = new URLSearchParams()
    if (params.get('urut')) next.set('urut', params.get('urut'))
    setParams(next, { replace: true })
  }

  const list = useMemo(
    () => products
      .filter((p) => !brand || brandSlug(p.brand) === brand)
      .filter((p) => matchesPrice(p, price))
      .filter((p) => matchesQuery(p, needle))
      .sort(SORTS[sort].fn),
    [brand, price, sort, needle],
  )

  const activeBrand = brands.find((b) => brandSlug(b.name) === brand)
  const activePrice = PRICE_RANGES.find((r) => r.id === price && r.id)
  const activeCount = Number(!!brand) + Number(!!price)
  const filtered = brand || price || q

  const sortSelect = (
    <label className="flex min-w-0 items-center gap-2">
      <span className="hidden whitespace-nowrap text-sm text-ev-gray sm:inline">Urutkan</span>
      <select
        value={sort}
        onChange={(e) => update('urut', e.target.value === 'rekomendasi' ? '' : e.target.value)}
        className="w-full min-w-0 border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold text-ev-ink outline-none focus:border-ev-red"
        aria-label="Urutkan"
      >
        {Object.entries(SORTS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
      </select>
    </label>
  )

  return (
    <>
      {/* Compact header: products start above the fold */}
      <section className="border-b border-black/5 bg-white">
        <div className="container-ev py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="font-ui text-xs font-semibold uppercase tracking-wider text-ev-gray">
            <Link to="/" className="hover:text-ev-red">Beranda</Link>
            <span className="mx-2">/</span>
            {activeBrand ? <Link to="/koleksi" className="hover:text-ev-red">Koleksi</Link> : <span className="text-ev-ink">Koleksi</span>}
            {activeBrand && <><span className="mx-2">/</span><span className="text-ev-ink">{activeBrand.name}</span></>}
          </nav>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl leading-none sm:text-6xl">{activeBrand ? activeBrand.name : 'Koleksi'}</h1>
              <p className="mt-3 text-sm text-ev-gray sm:text-base">
                {products.length} model sepeda &amp; motor listrik dari {brands.length} merek.
              </p>
            </div>
            <label className="relative w-full lg:w-80">
              <span className="sr-only">Cari motor</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ev-gray" />
              <input
                type="search"
                value={q}
                onChange={(e) => update('q', e.target.value)}
                placeholder="Cari nama atau merek…"
                className="w-full border border-black/10 bg-ev-soft py-3 pl-10 pr-3 text-sm outline-none transition focus:border-ev-red focus:bg-white"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="bg-ev-soft pb-28">
        {/* Phone toolbar */}
        <div className="sticky top-16 z-20 border-b border-black/5 bg-ev-soft/95 backdrop-blur lg:hidden">
          <div className="container-ev grid grid-cols-2 gap-2 py-3">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex items-center justify-center gap-2 border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold text-ev-ink"
            >
              <SlidersHorizontal className="size-4" /> Filter{activeCount ? ` (${activeCount})` : ''}
            </button>
            {sortSelect}
          </div>
        </div>

        <div className="container-ev lg:grid lg:grid-cols-[14rem_1fr] lg:gap-12 lg:pt-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            {/* Capped to the viewport with its own scroll: 14 brands + price ranges are taller than most screens */}
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] no-scrollbar overflow-y-auto overscroll-contain pb-8 pr-3">
              <Filters brand={brand} price={price} q={needle} update={update} />
              {filtered && (
                <button type="button" onClick={reset} className="mt-8 inline-flex items-center gap-1.5 font-ui text-xs font-bold uppercase tracking-wider text-ev-red hover:underline">
                  <X className="size-3.5" /> Reset filter
                </button>
              )}
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-5 lg:pt-0">
              <p className="text-sm text-ev-gray">
                Menampilkan <strong className="text-ev-ink">{list.length}</strong> dari {products.length} motor
                {activePrice && <> · <span className="text-ev-ink">{activePrice.label}</span></>}
              </p>
              <div className="hidden lg:block">{sortSelect}</div>
              {filtered && (
                <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-ui text-xs font-bold uppercase text-ev-red lg:hidden">
                  <X className="size-3.5" /> Reset
                </button>
              )}
            </div>

            {list.length ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3">
                {list.map((p) => <ProductCard key={p.slug} product={p} />)}
              </div>
            ) : (
              <div className="bg-white px-6 py-20 text-center">
                <p className="font-display text-3xl uppercase text-ev-ink">Belum ketemu</p>
                <p className="mt-2 text-sm text-ev-gray">Coba kata kunci lain atau hapus filter.</p>
                <button type="button" onClick={reset} className="btn-red mt-6">Reset filter</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} resultCount={list.length} onReset={reset}>
        <Filters brand={brand} price={price} q={needle} update={update} />
      </FilterSheet>
    </>
  )
}
