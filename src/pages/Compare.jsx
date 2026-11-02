import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trophy, X } from 'lucide-react'
import { products, productBySlug, SPEC_KEYS } from '../lib/data.js'
import { firstNumber, formatPrice, whatsappUrl } from '../lib/format.js'
import { COMPARE_MAX, useCompare } from '../lib/compare.js'
import PageHero from '../components/PageHero.jsx'
import ProductImage from '../components/ProductImage.jsx'
import SpecIcon from '../components/SpecIcon.jsx'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'

// Which direction is "better" for each row, so the winner can be highlighted
const BETTER = {
  Harga: 'low',
  'Jarak Tempuh': 'high',
  'Kecepatan Max': 'high',
  'Beban Max': 'high',
  'Durasi Charger': 'low',
}

function bestIndex(values, direction) {
  const nums = values.map(firstNumber)
  const valid = nums.filter((n) => n != null)
  if (!direction || valid.length < 2 || new Set(valid).size === 1) return -1
  const target = direction === 'high' ? Math.max(...valid) : Math.min(...valid)
  return nums.indexOf(target)
}

function AddProduct({ exclude, onAdd }) {
  const [value, setValue] = useState('')
  const options = useMemo(
    () => products.filter((p) => !exclude.includes(p.slug)).sort((a, b) => a.name.localeCompare(b.name)),
    [exclude],
  )
  return (
    <label className="flex aspect-square flex-col items-center justify-center gap-3 border-2 border-dashed border-black/15 bg-white p-4 text-center">
      <Plus className="size-8 text-ev-red" />
      <span className="font-display text-lg uppercase text-ev-ink">Tambah motor</span>
      <select
        value={value}
        onChange={(e) => { onAdd(e.target.value); setValue('') }}
        className="w-full border border-black/10 bg-ev-light px-2 py-2 text-xs outline-none focus:border-ev-red"
      >
        <option value="">Pilih motor…</option>
        {options.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
      </select>
    </label>
  )
}

export default function Compare() {
  const { slugs, toggle } = useCompare()
  const items = slugs.map(productBySlug).filter(Boolean)
  const rows = [
    { key: 'Harga', values: items.map((p) => p.price), display: (v) => formatPrice(v) },
    ...SPEC_KEYS.map((k) => ({ key: k, values: items.map((p) => p.specs[k]), display: (v) => v ?? '—' })),
  ]
  const cols = `minmax(6.5rem,0.6fr) repeat(${COMPARE_MAX}, minmax(9.5rem,1fr))`

  return (
    <>
      <PageHero title="Bandingkan" eyebrow="Adu spesifikasi" crumbs={[{ label: 'Bandingkan' }]}>
        Pilih hingga {COMPARE_MAX} motor. Nilai terbaik di tiap baris ditandai merah.
      </PageHero>

      <section className="bg-ev-soft py-12 pb-28">
        <div className="container-ev">
          {items.length === 0 && (
            <div className="mb-8 bg-white p-6 text-sm">
              Belum ada motor yang dipilih. Tambahkan langsung di bawah, atau buka <Link to="/koleksi" className="font-bold text-ev-red underline">Koleksi</Link> dan klik "Bandingkan" di kartu motor.
            </div>
          )}

          <div className="-mx-4 overflow-x-auto px-4 pb-2">
            <div className="grid min-w-[35rem] gap-px bg-black/10 sm:min-w-[44rem]" style={{ gridTemplateColumns: cols }}>
              {/* Header row: photos */}
              <div className="sticky left-0 z-10 bg-ev-soft" />
              {Array.from({ length: COMPARE_MAX }, (_, i) => items[i]).map((p, i) =>
                p ? (
                  <div key={p.slug} className="relative bg-white p-4">
                    <button type="button" onClick={() => toggle(p.slug)} className="absolute right-2 top-2 z-10 grid size-8 place-items-center bg-ev-light hover:bg-ev-red hover:text-white" aria-label={`Hapus ${p.name}`}>
                      <X className="size-4" />
                    </button>
                    <Link to={`/koleksi/${p.slug}`} className="block aspect-square bg-ev-light">
                      <ProductImage product={p} eager className="size-full p-4" />
                    </Link>
                    <p className="eyebrow mt-3 text-[11px]">{p.brand}</p>
                    <Link to={`/koleksi/${p.slug}`} className="font-display text-xl uppercase leading-tight text-ev-ink hover:text-ev-red">{p.name}</Link>
                  </div>
                ) : (
                  <div key={`empty-${i}`} className="bg-ev-soft p-4">
                    <AddProduct exclude={slugs} onAdd={(slug) => slug && toggle(slug)} />
                  </div>
                ),
              )}

              {/* Spec rows */}
              {rows.map((row) => {
                const best = bestIndex(row.values, BETTER[row.key])
                return (
                  <div key={row.key} className="contents">
                    <div className="sticky left-0 z-10 flex items-center gap-2 bg-ev-light p-3 font-ui text-[11px] font-bold uppercase text-ev-gray sm:p-4 sm:text-xs">
                      {row.key !== 'Harga' && <SpecIcon name={row.key} className="size-4 text-ev-red" />}
                      {row.key}
                    </div>
                    {Array.from({ length: COMPARE_MAX }, (_, i) => (
                      <div key={i} className={`p-4 ${best === i ? 'bg-ev-red/10' : 'bg-white'}`}>
                        {items[i] && (
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-display text-base uppercase sm:text-lg ${best === i ? 'text-ev-red' : 'text-ev-ink'}`}>
                            {best === i && <Trophy className="size-4" />}
                            {row.display(row.values[i])}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* CTA row */}
              <div className="sticky left-0 z-10 bg-ev-soft" />
              {Array.from({ length: COMPARE_MAX }, (_, i) => (
                <div key={i} className="bg-white p-4">
                  {items[i] && (
                    <a href={whatsappUrl(items[i].name)} target="_blank" rel="noreferrer" className="btn-wa w-full px-3 text-xs">
                      <WhatsAppIcon className="size-4" /> Tanya
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
