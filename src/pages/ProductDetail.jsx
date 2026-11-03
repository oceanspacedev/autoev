import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, MapPin, Plus } from 'lucide-react'
import { products, productBySlug, SPEC_KEYS } from '../lib/data.js'
import { brandSlug, formatPrice, parseDescription, whatsappUrl } from '../lib/format.js'
import { useCompare } from '../lib/compare.js'
import { Breadcrumb } from '../components/PageHero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import SpecIcon from '../components/SpecIcon.jsx'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import NotFound from './NotFound.jsx'
import { usePageTitle } from '../lib/title.js'

// Stretch the last spec so odd counts don't leave an empty grey cell (2 columns on phones, 3 from sm)
const specSpan = (i, n) =>
  i !== n - 1 ? '' : `${n % 2 ? 'col-span-2' : ''} ${n % 3 === 2 ? 'sm:col-span-2' : n % 3 === 1 ? 'sm:col-span-3' : 'sm:col-span-1'}`

export default function ProductDetail() {
  const { slug } = useParams()
  const product = productBySlug(slug)
  // Selected photo resets when navigating to another product
  const [pick, setPick] = useState({ slug, index: 0 })
  const active = pick.slug === slug ? pick.index : 0
  const setActive = (index) => setPick({ slug, index })
  const { has, toggle, slugs } = useCompare()

  // Leave room at the bottom of the page for the phone ask bar
  useEffect(() => {
    if (!product) return
    document.body.classList.add('has-ask-bar')
    return () => document.body.classList.remove('has-ask-bar')
  }, [product])

  usePageTitle(product ? product.name : 'Halaman tidak ditemukan')

  if (!product) return <NotFound />

  const image = product.images[active] ?? product.images[0]
  const hasColors = product.images.filter((i) => i.color).length > 1
  const specs = SPEC_KEYS.filter((k) => product.specs[k])
  // Same brand, models with a price first, then newest
  const related = products
    .filter((p) => p.brand === product.brand && p.slug !== product.slug)
    .sort((a, b) => Boolean(b.price) - Boolean(a.price) || b.id - a.id)
    .slice(0, 4)
  const description = parseDescription(product.description)
  const inCompare = has(product.slug)

  return (
    <>
      <section className="bg-ev-soft">
        <div className="container-ev pb-16 pt-6">
          <Breadcrumb
            crumbs={[
              { label: 'Koleksi', to: '/koleksi' },
              { label: product.brand, to: `/koleksi?merek=${brandSlug(product.brand)}` },
              { label: product.name },
            ]}
          />

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            {/* Gallery */}
            <div>
              <div className="relative aspect-square overflow-hidden bg-white">
                <span className="pointer-events-none absolute -left-2 top-4 select-none font-display text-8xl uppercase leading-none text-ev-ink/[0.04] sm:text-[9rem]" aria-hidden="true">
                  {product.brand}
                </span>
                <ProductImage key={image?.src} product={product} image={image} eager className="relative size-full animate-fade-up p-8 sm:p-12" />
              </div>

              {hasColors ? (
                <div className="mt-5">
                  <p className="font-ui text-xs font-bold uppercase tracking-wider text-ev-gray">
                    Warna: <span className="text-ev-ink">{image.color?.label ?? '—'}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.images.map((img, i) => (
                      <button
                        key={img.src}
                        type="button"
                        onClick={() => setActive(i)}
                        aria-label={img.color?.label ?? `Foto ${i + 1}`}
                        aria-pressed={i === active}
                        className={`size-10 rounded-full ring-offset-2 ring-offset-ev-soft transition ${i === active ? 'ring-2 ring-ev-red' : 'ring-1 ring-black/15 hover:ring-black/40'}`}
                        style={{ background: img.color?.hex ?? '#ddd' }}
                      />
                    ))}
                  </div>
                </div>
              ) : product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Foto ${i + 1}`}
                      aria-pressed={i === active}
                      className={`aspect-square bg-white p-1 transition ${i === active ? 'ring-2 ring-ev-red' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <ProductImage product={product} image={img} className="size-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <Link to={`/koleksi?merek=${brandSlug(product.brand)}`} className="eyebrow hover:underline">{product.brand}</Link>
              <h1 className="mt-2 text-4xl leading-none sm:text-6xl">{product.name}</h1>
              <div className="mt-5 flex items-baseline gap-3">
                <p className={`text-3xl font-bold ${product.price ? 'text-ev-ink' : 'text-ev-red'}`}>{formatPrice(product.price)}</p>
                {product.regularPrice && <p className="text-ev-gray line-through">{formatPrice(product.regularPrice)}</p>}
              </div>
              {!product.price && <p className="mt-1 text-sm text-ev-gray">Hubungi kami untuk harga dan promo terbaru.</p>}

              {specs.length > 0 ? (
                <dl className="mt-8 grid grid-cols-2 gap-px bg-black/10 sm:grid-cols-3">
                  {specs.map((k, i) => (
                    <div key={k} className={`bg-white p-4 ${specSpan(i, specs.length)}`}>
                      <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-ev-gray">
                        <SpecIcon name={k} className="size-4 text-ev-red" /> {k}
                      </dt>
                      <dd className="mt-2 font-display text-xl uppercase text-ev-ink">{product.specs[k]}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-8 border-l-4 border-ev-red bg-white p-4 text-sm">Spesifikasi lengkap model ini bisa ditanyakan langsung ke tim kami via WhatsApp.</p>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {/* On phones and tablets this lives in the sticky ask bar instead */}
                <a href={whatsappUrl(product.name)} target="_blank" rel="noreferrer" className="btn-wa hidden sm:col-span-2 lg:flex">
                  <WhatsAppIcon className="size-5" /> Tanya motor ini
                </a>
                <button type="button" onClick={() => toggle(product.slug)} aria-pressed={inCompare} className={inCompare ? 'btn-black' : 'btn-outline text-ev-ink'}>
                  {inCompare ? <Check className="size-4" /> : <Plus className="size-4" />}
                  {inCompare ? 'Dibandingkan' : 'Bandingkan'}
                </button>
                <Link to="/kontak#showroom" className="btn-outline text-ev-ink"><MapPin className="size-4" /> Cek di Showroom</Link>
              </div>

              {product.description && (
                <div className="mt-10 border-t border-black/10 pt-6">
                  <h2 className="text-xl">Tentang motor ini</h2>
                  {description.lines.map((line) => <p key={line} className="mt-3 text-sm leading-7">{line}</p>)}
                  {description.terms.length > 0 && (
                    <>
                      <h3 className="mt-6 font-ui text-xs font-bold uppercase tracking-wider text-ev-gray">Ketentuan garansi</h3>
                      <ul className="mt-2 space-y-1.5 text-sm leading-6">
                        {description.terms.map((t) => (
                          <li key={t} className="flex gap-2.5"><span className="mt-3 h-px w-3 shrink-0 bg-ev-red" aria-hidden="true" />{t}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Phones and tablets: price and the ask button stay in reach; sits above the compare bar when that's open */}
      <div className={`fixed inset-x-0 z-20 border-t border-black/10 bg-white/95 backdrop-blur lg:hidden ${slugs.length ? 'bottom-[4.75rem] sm:bottom-[5.25rem]' : 'bottom-0'}`}>
        <div className="container-ev flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ev-gray">{product.name}</p>
            <p className={`font-bold leading-tight ${product.price ? 'text-ev-ink' : 'text-ev-red'}`}>{formatPrice(product.price)}</p>
          </div>
          <a href={whatsappUrl(product.name)} target="_blank" rel="noreferrer" className="btn-wa shrink-0 px-5">
            <WhatsAppIcon className="size-5" /> Tanya motor ini
          </a>
        </div>
      </div>

      {related.length > 0 && (
        <section className="py-16 pb-28">
          <div className="container-ev">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl">Lainnya dari {product.brand}</h2>
              <Link to={`/koleksi?merek=${brandSlug(product.brand)}`} className="font-ui text-sm font-bold uppercase text-ev-red hover:underline">Lihat semua →</Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
