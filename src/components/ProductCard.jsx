import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { formatPrice, modelName } from '../lib/format.js'
import { useCompare } from '../lib/compare.js'
import ProductImage from './ProductImage.jsx'

export default function ProductCard({ product }) {
  const { has, toggle } = useCompare()
  const inCompare = has(product.slug)
  const specLine = [product.specs['Jarak Tempuh'], product.specs['Kecepatan Max']].filter(Boolean).join(' · ')
  const colors = product.images.filter((i) => i.color)
  const compareLabel = inCompare ? `Hapus ${product.name} dari perbandingan` : `Bandingkan ${product.name}`

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-white ring-1 ring-black/[0.06] transition duration-300 group-hover:shadow-[0_24px_48px_-24px_rgba(43,22,27,0.35)]">
        <ProductImage product={product} className="size-full p-5 transition duration-500 group-hover:scale-105 sm:p-7" />
        {product.onSale && (
          <span className="absolute left-3 top-3 bg-ev-red px-2 py-1 font-ui text-[10px] font-bold uppercase tracking-wider text-white">Promo</span>
        )}
        {colors.length > 1 && (
          <div className="absolute bottom-3 left-3 flex -space-x-1" aria-label={`${colors.length} pilihan warna`}>
            {colors.slice(0, 4).map((c) => (
              <span key={c.src} className="size-3.5 rounded-full ring-2 ring-white" style={{ background: c.color.hex }} title={c.color.label} />
            ))}
          </div>
        )}
        {/* Above the stretched card link, so it toggles instead of navigating */}
        <button
          type="button"
          onClick={() => toggle(product.slug)}
          aria-pressed={inCompare}
          aria-label={compareLabel}
          title={inCompare ? 'Dibandingkan' : 'Bandingkan'}
          className={`absolute right-3 top-3 z-10 grid size-9 place-items-center transition ${
            inCompare ? 'bg-ev-ink text-white' : 'bg-ev-soft text-ev-ink hover:bg-ev-ink hover:text-white'
          }`}
        >
          {inCompare ? <Check className="size-4" /> : <Plus className="size-4" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.15em] text-ev-gray">{product.brand}</p>
        <h3 className="mt-1 font-sans text-[15px] font-bold normal-case leading-snug text-ev-ink sm:text-base">
          {/* Stretched link: the whole card opens the product */}
          <Link to={`/koleksi/${product.slug}`} className="transition after:absolute after:inset-0 group-hover:text-ev-red">
            {modelName(product)}
          </Link>
        </h3>
        {specLine && <p className="mt-1 text-xs text-ev-gray">{specLine}</p>}
        <p className={`mt-auto pt-3 text-[15px] font-bold sm:text-base ${product.price ? 'text-ev-ink' : 'text-ev-red'}`}>
          {product.regularPrice && <span className="mr-2 text-xs font-medium text-ev-gray line-through">{formatPrice(product.regularPrice)}</span>}
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  )
}
