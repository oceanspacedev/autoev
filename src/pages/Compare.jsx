import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Scale, Search, Trophy, X } from 'lucide-react'
import { productBySlug, SPEC_KEYS } from '../lib/data.js'
import { BUDGETS, inBudget, topPicks } from '../lib/budgets.js'
import { firstNumber, formatPrice, modelName, whatsappUrl } from '../lib/format.js'
import { COMPARE_MAX, useCompare } from '../lib/compare.js'
import ComparePicker from '../components/ComparePicker.jsx'
import PageHero from '../components/PageHero.jsx'
import ProductImage from '../components/ProductImage.jsx'
import SpecIcon from '../components/SpecIcon.jsx'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import { usePageTitle } from '../lib/title.js'

// Which direction wins for each comparable row, and how the win is described under the motor
const BETTER = {
  Harga: { dir: 'low', win: 'Harga termurah' },
  'Jarak Tempuh': { dir: 'high', win: 'Jarak terjauh' },
  'Kecepatan Max': { dir: 'high', win: 'Paling kencang' },
  'Beban Max': { dir: 'high', win: 'Beban terbesar' },
  'Durasi Charger': { dir: 'low', win: 'Cas tercepat' },
}

// Every column holding the best value wins (ties included); no winner when all values are equal
function bestIndexes(nums, dir) {
  const valid = nums.filter((n) => n != null)
  if (!dir || valid.length < 2 || new Set(valid).size === 1) return []
  const target = dir === 'high' ? Math.max(...valid) : Math.min(...valid)
  return nums.flatMap((n, i) => (n === target ? [i] : []))
}

function QuickBudgets({ active, onPick, onBrowse }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-ev-ink">Bandingkan cepat sesuai budget</h2>
          <p className="mt-1 text-sm text-ev-gray">Kami pilihkan 3 motor dengan jarak tempuh terjauh di budget itu, sebisa mungkin dari merek berbeda.</p>
        </div>
        {active && (
          <button type="button" onClick={() => onBrowse(active)} className="inline-flex items-center gap-1.5 font-ui text-xs font-bold uppercase tracking-wider text-ev-red hover:underline">
            Pilih sendiri di budget ini <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {BUDGETS.map((b) => {
          const count = inBudget(b.id).length
          const on = active === b.id
          return (
            <button
              key={b.id}
              type="button"
              disabled={count < 2}
              onClick={() => onPick(b.id)}
              aria-pressed={on}
              className={`shrink-0 border px-4 py-2.5 text-left transition disabled:opacity-40 ${
                on ? 'border-ev-red bg-ev-red text-white' : 'border-black/10 bg-white text-ev-ink hover:border-ev-ink'
              }`}
            >
              <span className="block text-sm font-bold">{b.label}</span>
              <span className={`block text-xs ${on ? 'text-white/80' : 'text-ev-gray'}`}>{count} motor</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Phones: motors side by side in 3 equal columns (no sideways scrolling), a sticky strip of names,
// and one block per spec with the label on top and the three values underneath.
function MobileCompare({ slots, rows, winsFor, onRemove, onAdd }) {
  return (
    <div className="-mx-4 md:hidden">
      <div className="grid grid-cols-3 gap-px bg-black/10">
        {slots.map((p, i) =>
          p ? (
            <div key={p.slug} className="relative flex flex-col bg-white p-2.5">
              <button type="button" onClick={() => onRemove(p.slug)} className="absolute right-1 top-1 z-10 grid size-7 place-items-center text-ev-gray" aria-label={`Hapus ${p.name}`}>
                <X className="size-3.5" />
              </button>
              <Link to={`/koleksi/${p.slug}`} className="block aspect-square">
                <ProductImage product={p} eager className="size-full p-1" />
              </Link>
              <p className="mt-2 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-ev-gray">{p.brand}</p>
              <Link to={`/koleksi/${p.slug}`} className="line-clamp-2 text-[13px] font-bold leading-tight text-ev-ink">{modelName(p)}</Link>
              <p className="mt-1 text-xs font-bold text-ev-ink">{formatPrice(p.price)}</p>
              {winsFor(i).length > 0 && (
                <ul className="mt-2 space-y-0.5 border-t border-black/5 pt-2">
                  {winsFor(i).map((w) => (
                    <li key={w} className="flex items-start gap-1 text-xs font-semibold leading-tight text-ev-red">
                      <Trophy className="mt-px size-3 shrink-0" />{w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={onAdd}
              className="flex min-h-48 flex-col items-center justify-center gap-1.5 bg-white text-ev-gray"
            >
              <span className="grid size-10 place-items-center border-2 border-dashed border-black/15"><Plus className="size-5" /></span>
              <span className="font-ui text-xs font-bold uppercase tracking-wider">Tambah</span>
            </button>
          ),
        )}
      </div>

      {/* Names stay visible while scrolling through the specs */}
      <div className="sticky top-16 z-10 grid grid-cols-3 gap-px border-y border-black/10 bg-black/10">
        {slots.map((p, i) => (
          <p key={i} className="truncate bg-ev-ink px-2.5 py-2 text-xs font-bold text-white">
            {p ? modelName(p) : '—'}
          </p>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        {rows.map((row) => (
          <section key={row.key} className="bg-white">
            <h3 className="flex items-center gap-2 px-3 pt-3 font-ui text-xs font-bold uppercase tracking-wider text-ev-gray">
              {row.key !== 'Harga' && <SpecIcon name={row.key} className="size-3.5 text-ev-red" />}
              {row.key}
            </h3>
            <div className="grid grid-cols-3 divide-x divide-black/5 pb-3 pt-2">
              {slots.map((p, i) => {
                const best = row.best.includes(i)
                const n = row.nums[i]
                return (
                  <div key={i} className="px-2.5">
                    {p ? (
                      <>
                        <p className={`flex items-start gap-1 text-[13px] font-bold leading-tight ${best ? 'text-ev-red' : 'text-ev-ink'}`}>
                          {best && <Trophy className="mt-px size-3 shrink-0" />}
                          <span className="min-w-0 break-words">{row.show(row.raw[i])}</span>
                        </p>
                        {row.rule && n != null && row.max > 0 && (
                          <div className="mt-1.5 h-1 bg-ev-soft">
                            <div className={`h-full ${best ? 'bg-ev-red' : 'bg-ev-ink/25'}`} style={{ width: `${(n / row.max) * 100}%` }} />
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-[13px] text-ev-gray/50">—</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 px-2">
        {slots.map((p, i) =>
          p ? (
            <a key={i} href={whatsappUrl(p.name)} target="_blank" rel="noreferrer" className="btn-wa px-1 py-3 text-xs">
              <WhatsAppIcon className="size-3.5" /> Tanya
            </a>
          ) : <span key={i} />,
        )}
      </div>
    </div>
  )
}

export default function Compare() {
  usePageTitle('Bandingkan')
  const { slugs, toggle, clear, replace } = useCompare()
  const [picker, setPicker] = useState(null) // null = closed, otherwise { budget, n } (n re-keys each opening)
  const [preset, setPreset] = useState('')
  const items = slugs.map(productBySlug).filter(Boolean)
  const openPicker = (budget = '') => setPicker((cur) => ({ budget, n: (cur?.n ?? 0) + 1 }))

  const pickBudget = (id) => {
    replace(topPicks(inBudget(id), COMPARE_MAX).map((p) => p.slug))
    setPreset(id)
  }

  const rows = [
    { key: 'Harga', raw: items.map((p) => p.price), show: (v) => formatPrice(v) },
    ...SPEC_KEYS.map((k) => ({ key: k, raw: items.map((p) => p.specs[k]), show: (v) => v ?? '—' })),
  ].map((row) => {
    const rule = BETTER[row.key]
    const nums = rule ? row.raw.map((v) => (row.key === 'Harga' ? v || null : firstNumber(v))) : []
    const max = Math.max(...nums.filter((n) => n != null), 0)
    return { ...row, rule, nums, max, best: rule ? bestIndexes(nums, rule.dir) : [] }
  })
  const winsFor = (i) => rows.filter((r) => r.best.includes(i)).map((r) => r.rule.win)
  const cols = `minmax(6.5rem,0.6fr) repeat(${COMPARE_MAX}, minmax(10rem,1fr))`
  const slots = Array.from({ length: COMPARE_MAX }, (_, i) => items[i])

  return (
    <>
      <PageHero
        title="Bandingkan"
        crumbs={[{ label: 'Bandingkan' }]}
        actions={
          items.length > 0 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => openPicker()} className="btn-black flex-1 sm:flex-none"><Search className="size-4" /> Pilih motor</button>
              <button type="button" onClick={() => { clear(); setPreset('') }} className="btn-outline text-ev-ink">Kosongkan</button>
            </div>
          )
        }
      >
        Adu harga dan spesifikasi hingga {COMPARE_MAX} motor. Nilai terbaik di tiap baris ditandai merah.
      </PageHero>

      <section className="bg-ev-soft py-8 pb-28 sm:py-10">
        <div className="container-ev space-y-8">
          <QuickBudgets active={preset} onPick={pickBudget} onBrowse={(id) => openPicker(id)} />

          {items.length === 0 ? (
            <div className="flex flex-col items-center bg-white px-6 py-16 text-center">
              <Scale className="size-10 text-ev-red" />
              <p className="mt-4 font-display text-3xl uppercase text-ev-ink">Belum ada motor</p>
              <p className="mt-2 max-w-md text-sm text-ev-gray">Pilih budget di atas untuk perbandingan instan, atau cari motor yang ingin Anda adu.</p>
              <button type="button" onClick={() => openPicker()} className="btn-red mt-6"><Search className="size-4" /> Pilih motor</button>
            </div>
          ) : (
            <>
            <MobileCompare
              slots={slots}
              rows={rows}
              winsFor={winsFor}
              onRemove={(slug) => { toggle(slug); setPreset('') }}
              onAdd={() => openPicker(preset)}
            />
            <div className="hidden overflow-x-auto md:block">
              <div className="grid min-w-[44rem] gap-px bg-black/10" style={{ gridTemplateColumns: cols }}>
                {/* Motors */}
                <div className="sticky left-0 z-10 bg-ev-soft" />
                {slots.map((p, i) =>
                  p ? (
                    <div key={p.slug} className="relative flex flex-col bg-white p-4">
                      <button type="button" onClick={() => { toggle(p.slug); setPreset('') }} className="absolute right-2 top-2 z-10 grid size-8 place-items-center text-ev-gray hover:bg-ev-red hover:text-white" aria-label={`Hapus ${p.name}`}>
                        <X className="size-4" />
                      </button>
                      <Link to={`/koleksi/${p.slug}`} className="block aspect-[4/3] bg-white">
                        <ProductImage product={p} eager className="size-full p-2" />
                      </Link>
                      <p className="mt-3 font-ui text-xs font-semibold uppercase tracking-[0.15em] text-ev-gray">{p.brand}</p>
                      <Link to={`/koleksi/${p.slug}`} className="text-base font-bold leading-snug text-ev-ink hover:text-ev-red">{modelName(p)}</Link>
                      <p className="mt-1 text-sm font-bold text-ev-ink">{formatPrice(p.price)}</p>
                      {winsFor(i).length > 0 && (
                        <ul className="mt-3 space-y-1 border-t border-black/5 pt-3">
                          {winsFor(i).map((w) => (
                            <li key={w} className="flex items-center gap-1.5 text-xs font-semibold text-ev-red"><Trophy className="size-3.5" />{w}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div key={`empty-${i}`} className="bg-white p-4">
                      <button
                        type="button"
                        onClick={() => openPicker(preset)}
                        className="flex size-full min-h-56 flex-col items-center justify-center gap-2 border-2 border-dashed border-black/10 text-ev-gray transition hover:border-ev-red hover:text-ev-red"
                      >
                        <Plus className="size-7" />
                        <span className="font-ui text-xs font-bold uppercase tracking-wider">Tambah motor</span>
                      </button>
                    </div>
                  ),
                )}

                {/* Specs, with a bar for every comparable number */}
                {rows.map((row) => (
                  <div key={row.key} className="contents">
                    <div className="sticky left-0 z-10 flex items-center gap-2 bg-ev-light p-3 font-ui text-xs font-bold uppercase text-ev-gray sm:p-4 sm:text-xs">
                      {row.key !== 'Harga' && <SpecIcon name={row.key} className="size-4 shrink-0 text-ev-red" />}
                      {row.key}
                    </div>
                    {slots.map((p, i) => {
                      const best = row.best.includes(i)
                      const n = row.nums[i]
                      return (
                        <div key={i} className="bg-white p-3 sm:p-4">
                          {p && (
                            <>
                              <p className={`flex items-center gap-1.5 text-sm font-bold sm:text-base ${best ? 'text-ev-red' : 'text-ev-ink'}`}>
                                {best && <Trophy className="size-3.5 shrink-0" />}
                                {row.show(row.raw[i])}
                              </p>
                              {row.rule && n != null && row.max > 0 && (
                                <div className="mt-2 h-1.5 bg-ev-soft">
                                  <div className={`h-full transition-all duration-500 ${best ? 'bg-ev-red' : 'bg-ev-ink/25'}`} style={{ width: `${(n / row.max) * 100}%` }} />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* Ask */}
                <div className="sticky left-0 z-10 bg-ev-soft" />
                {slots.map((p, i) => (
                  <div key={i} className="bg-white p-3 sm:p-4">
                    {p && (
                      <a href={whatsappUrl(p.name)} target="_blank" rel="noreferrer" className="btn-wa w-full px-3 text-xs">
                        <WhatsAppIcon className="size-4" /> Tanya
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
            </>
          )}
        </div>
      </section>

      {picker && <ComparePicker key={picker.n} initialBudget={picker.budget} onClose={() => setPicker(null)} />}
    </>
  )
}
