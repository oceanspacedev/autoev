import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { productBySlug } from '../lib/data.js'
import { COMPARE_MAX, useCompare } from '../lib/compare.js'
import ProductImage from './ProductImage.jsx'

export default function CompareBar() {
  const { slugs, toggle, clear } = useCompare()
  const { pathname } = useLocation()
  if (!slugs.length || pathname === '/bandingkan') return null
  const items = slugs.map(productBySlug)

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 animate-fade-up border-t-4 border-ev-red bg-black text-white" role="region" aria-label="Motor yang dibandingkan">
      <div className="container-ev flex items-center gap-3 py-3 sm:gap-5">
        <div className="flex gap-2">
          {Array.from({ length: COMPARE_MAX }, (_, i) => items[i]).map((p, i) =>
            p ? (
              <div key={p.slug} className="relative size-12 bg-white sm:size-14">
                <ProductImage product={p} eager className="size-full p-1" />
                <button
                  type="button"
                  onClick={() => toggle(p.slug)}
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ev-red"
                  aria-label={`Hapus ${p.name} dari perbandingan`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div key={i} className="hidden size-12 border border-dashed border-white/25 sm:block sm:size-14" />
            ),
          )}
        </div>
        <p className="hidden flex-1 text-sm md:block">
          <span className="font-display text-lg uppercase">{slugs.length} motor dipilih</span>
          <span className="block text-xs text-white/60">Pilih hingga {COMPARE_MAX} motor untuk dibandingkan</span>
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={clear} className="px-3 py-2 font-ui text-xs font-semibold uppercase text-white/60 hover:text-white">
            Hapus
          </button>
          <Link to="/bandingkan" className="btn-red px-4 py-3 text-xs">
            Bandingkan{slugs.length > 1 ? ` (${slugs.length})` : ''}
          </Link>
        </div>
      </div>
    </div>
  )
}
