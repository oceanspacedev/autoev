import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgePercent, ChevronLeft, ChevronRight, MapPin, Pause, Play, ShieldCheck, Star, Truck,
} from 'lucide-react'
import { articles, brands, featured, minPrice, products, showrooms, site } from '../lib/data.js'
import { brandSlug, formatDate, formatPrice } from '../lib/format.js'
import EvGlobe from '../components/EvGlobe.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import SpecIcon from '../components/SpecIcon.jsx'
import { ArticleCover, ArticleMeta } from '../components/ArticleBits.jsx'

const HERO_COUNT = 5
const HERO_INTERVAL = 4000
const SWIPE_MIN = 40
const PERK_ICONS = [BadgePercent, ShieldCheck, Truck]

function Hero() {
  const slides = featured.slice(0, HERO_COUNT)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)

  const go = (d) => setActive((i) => (i + d + slides.length) % slides.length)

  // A fresh timeout per slide, so picking a slide by hand restarts the countdown
  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setActive((i) => (i + 1) % slides.length), HERO_INTERVAL)
    return () => clearTimeout(t)
  }, [active, paused, slides.length])

  const p = slides[active]
  return (
    <section className="relative overflow-hidden bg-ev-soft" aria-roledescription="carousel" aria-label="Motor unggulan">
      <div className="grid grid-cols-1 lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr]">
        {/* Red slanted block */}
        <div className="slash-right relative z-10 flex flex-col justify-center bg-ev-red px-4 pb-12 pt-8 text-white sm:px-10 sm:pb-16 sm:pt-12 lg:pb-12 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-24">
          <p className="flex animate-fade-up items-center gap-3 font-ui text-sm font-bold uppercase tracking-[0.3em] text-white">
            <span className="h-0.5 w-10 bg-white" aria-hidden="true" /> {site.tagline}
          </p>
          <h1 className="mt-4 animate-fade-up text-5xl sm:mt-5 leading-[0.9] text-white [animation-delay:100ms] sm:text-7xl xl:text-8xl">
            Gas tanpa<br />bensin.
          </h1>
          <p className="mt-4 max-w-md animate-fade-up text-sm leading-6 sm:mt-6 sm:leading-7 text-white/90 [animation-delay:200ms] sm:text-base">
            {products.length}+ model sepeda listrik dari {brands.length} merek, mulai {formatPrice(minPrice)}.
            Bandingkan spesifikasinya, lalu tanya langsung ke tim kami.
          </p>
          <div className="mt-6 flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms] sm:mt-8">
            <Link to="/koleksi" className="btn-black">Cari Motor <ArrowRight className="size-4" /></Link>
          </div>
          <dl className="mt-10 hidden max-w-md animate-fade-up grid-cols-3 sm:grid border-t border-white/25 pt-6 [animation-delay:400ms]">
            {[
              [`${products.length}+`, 'Model'],
              [brands.length, 'Merek'],
              [showrooms.length, 'Showroom'],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="mt-1 font-ui text-xs font-bold uppercase tracking-[0.18em] text-white/80">{label}</dt>
                <dd className="font-display text-3xl text-white sm:text-4xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Auto-sliding featured products */}
        <div className="relative flex flex-col items-center justify-center px-6 pb-10 pt-4 sm:pt-10 lg:-ml-16 lg:py-14">
          <span
            key={p.brand}
            className="pointer-events-none absolute inset-x-0 top-[38%] -translate-y-1/2 animate-fade-up select-none text-center font-display text-[22vw] uppercase leading-none text-ev-ink/[0.05] lg:text-[11vw]"
            aria-hidden="true"
          >
            {p.brand}
          </span>

          <div
            className="relative w-full max-w-lg touch-pan-y overflow-hidden"
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - (touchX.current ?? 0)
              if (Math.abs(dx) > SWIPE_MIN) go(dx < 0 ? 1 : -1)
              touchX.current = null
            }}
          >
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {slides.map((s, i) => (
                <div
                  key={s.slug}
                  className="w-full shrink-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} dari ${slides.length}: ${s.name}`}
                  aria-hidden={i !== active}
                  inert={i !== active || undefined}
                >
                  <Link to={`/koleksi/${s.slug}`} className="mx-auto block w-[68%] sm:w-[85%]">
                    <ProductImage
                      product={s}
                      eager
                      className="aspect-square w-full drop-shadow-[0_30px_25px_rgba(0,0,0,0.18)]"
                    />
                  </Link>
                  <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow">{s.brand}</p>
                      <p className="font-display text-3xl uppercase text-ev-ink">{s.name}</p>
                      <p className="font-bold text-ev-ink">{formatPrice(s.price)}</p>
                    </div>
                    <Link to={`/koleksi/${s.slug}`} className="btn-red px-4 py-3 text-xs">Lihat Detail</Link>
                  </div>
                  <dl className="mt-5 grid grid-cols-3 border-t border-black/10 pt-4">
                    {['Jarak Tempuh', 'Kecepatan Max', 'Beban Max'].map((k) => (
                      <div key={k}>
                        <dt className="flex items-center gap-1.5 text-xs uppercase text-ev-gray"><SpecIcon name={k} className="size-3.5 text-ev-red" />{k.replace(' Max', '')}</dt>
                        <dd className="mt-1 font-display text-lg uppercase text-ev-ink">{s.specs[k] ?? '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex w-full max-w-lg items-center gap-2">
            <div className="flex flex-1 gap-2" role="tablist" aria-label="Pilih motor unggulan">
              {slides.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={s.name}
                  onClick={() => setActive(i)}
                  className={`group flex h-9 items-center transition-all ${i === active ? 'w-12' : 'w-7'}`}
                >
                  {/* Thin bar inside a taller button, so it's easy to tap */}
                  <span className={`relative block h-1.5 w-full overflow-hidden ${i === active ? 'bg-ev-red/25' : 'bg-black/15 group-hover:bg-black/30'}`}>
                    {i === active && (
                      <span
                        key={`${active}-${paused}`}
                        className={`absolute inset-0 origin-left bg-ev-red ${paused ? '' : 'hero-progress'}`}
                        style={{ '--hero-interval': `${HERO_INTERVAL}ms` }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => go(-1)} className="grid size-9 place-items-center border border-black/10 text-ev-ink transition hover:border-ev-red hover:bg-ev-red hover:text-white" aria-label="Motor sebelumnya">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => go(1)} className="grid size-9 place-items-center border border-black/10 text-ev-ink transition hover:border-ev-red hover:bg-ev-red hover:text-white" aria-label="Motor berikutnya">
              <ChevronRight className="size-4" />
            </button>
            <button type="button" onClick={() => setPaused((v) => !v)} className="grid size-9 place-items-center border border-black/10 text-ev-ink transition hover:border-ev-ink" aria-label={paused ? 'Putar slide' : 'Jeda slide'}>
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Perks() {
  return (
    <section className="bg-black text-white">
      <div className="container-ev grid grid-cols-3 divide-x divide-white/10">
        {site.perks.map((perk, i) => {
          const Icon = PERK_ICONS[i]
          return (
            <div
              key={perk.title}
              className="flex flex-col items-center gap-2 px-2 py-5 text-center sm:flex-row sm:gap-4 sm:px-6 sm:py-7 sm:text-left"
            >
              <Icon className="size-6 shrink-0 text-ev-red sm:size-7" aria-hidden="true" />
              <div>
                <p className="font-display text-base uppercase leading-none sm:text-2xl">{perk.title}</p>
                <p className="mt-1.5 text-xs leading-snug text-white/60 sm:text-sm">{perk.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function BrandStrip() {
  const row = [...brands, ...brands]
  return (
    <section
      className="brand-row overflow-hidden border-b border-black/5 bg-white py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] sm:py-5"
      aria-label="Merek yang tersedia"
    >
      {/* Two copies; each item carries its own trailing space so -50% loops without a jump */}
      <div className="brand-marquee flex w-max items-center">
        {row.map((b, i) => (
          <Link
            key={i}
            to={`/koleksi?merek=${brandSlug(b.name)}`}
            className="flex items-center gap-6 pr-6 font-display text-lg uppercase text-ev-ink/35 transition hover:text-ev-red sm:gap-10 sm:pr-10 sm:text-2xl"
            tabIndex={i >= brands.length ? -1 : undefined}
            aria-hidden={i >= brands.length || undefined}
          >
            {b.name}
            <span className="size-1.5 rounded-full bg-ev-red" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  )
}

function Picks() {
  const tabs = ['Semua', ...brands.slice(0, 6).map((b) => b.name)]
  const [tab, setTab] = useState('Semua')
  const list = useMemo(() => {
    if (tab === 'Semua') return featured.slice(0, 8)
    return products
      .filter((p) => p.brand === tab)
      .sort((a, b) => Number(!!b.price) - Number(!!a.price) || b.id - a.id)
      .slice(0, 8)
  }, [tab])
  const more = tab === 'Semua'
    ? { to: '/koleksi', label: `Lihat semua ${products.length} motor` }
    : { to: `/koleksi?merek=${brandSlug(tab)}`, label: `Lihat semua ${tab}` }

  return (
    <section className="bg-ev-soft py-14 sm:py-20">
      <div className="container-ev">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="Koleksi" title="Motor pilihan">Satu model terbaru dari tiap merek. Pilih merek untuk lihat lebih banyak.</SectionTitle>
          <Link to={more.to} className="group -my-2 hidden items-center gap-2 py-2 font-ui text-xs font-bold uppercase tracking-wider text-ev-ink hover:text-ev-red sm:inline-flex">
            {more.label} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="no-scrollbar -mx-4 mt-5 overflow-x-auto border-b border-black/10 px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter merek">
          <div className="flex w-max gap-6 sm:gap-8">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`relative pb-3 pt-3 font-ui text-xs font-bold uppercase tracking-wider transition ${
                  tab === t ? 'text-ev-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ev-red' : 'text-ev-gray hover:text-ev-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div key={tab} className="mt-8 grid animate-fade-up grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
        <Link to={more.to} className="btn-outline mt-10 w-full text-ev-ink sm:hidden">
          {more.label} <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}

// One-line versions of the four benefits from the old site's homepage copy
const EV_POINTS = [
  { title: 'Perawatan murah', text: 'Tanpa ganti oli, komponen lebih sedikit, lebih hemat di kantong.' },
  { title: 'Ramah lingkungan', text: 'Tanpa emisi gas buang, udara lebih bersih untuk generasi berikutnya.' },
  { title: 'Tanpa BBM', text: 'Cas sendiri di rumah, tidak perlu antre di SPBU.' },
  { title: 'Halus & senyap', text: 'Tanpa knalpot, tidak berisik saat berkendara.' },
]

// Mobile/tablet: columns dissolve (display: contents) and `order` lists points 01→04 under the globe.
// Desktop: two real columns either side of the globe.
const POINT_ORDER = ['order-2', 'order-3', 'order-4', 'order-5']

function EvPoint({ index, align = 'left' }) {
  const p = EV_POINTS[index]
  return (
    <Reveal delay={index * 90} className={`${POINT_ORDER[index]} lg:order-none ${align === 'right' ? 'lg:text-right' : ''}`}>
      <span className="font-ui text-xs font-bold tracking-[0.2em] text-ev-red">0{index + 1}</span>
      <h3 className="mt-2 text-xl sm:text-2xl">{p.title}</h3>
      <p className="mt-2 text-sm leading-7 text-ev-gray">{p.text}</p>
    </Reveal>
  )
}

function EvBenefits() {
  return (
    <section className="overflow-hidden bg-ev-soft py-14 sm:py-24">
      <div className="container-ev">
        <Reveal><SectionTitle align="center" eyebrow="Kendaraan listrik" title="Kenapa pindah ke listrik?" /></Reveal>
        <div className="mt-10 grid grid-cols-2 items-center gap-x-5 gap-y-8 sm:gap-10 lg:mt-16 lg:grid-cols-[1fr_1.3fr_1fr]">
          <div className="contents lg:grid lg:gap-20">
            <EvPoint index={0} align="right" />
            <EvPoint index={2} align="right" />
          </div>
          <div className="order-1 col-span-2 lg:order-none lg:col-span-1">
            <EvGlobe tone="light" src={site.evIllustration} alt="Selamatkan bumi, berkendara dengan kendaraan listrik" />
          </div>
          <div className="contents lg:grid lg:gap-20">
            <EvPoint index={1} />
            <EvPoint index={3} />
          </div>
        </div>
      </div>
    </section>
  )
}

const initials = (name) => name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

function Stars({ count, className = 'size-4' }) {
  return (
    <span className="flex text-amber-400" aria-label={`${count} dari 5 bintang`}>
      {Array.from({ length: count }, (_, i) => <Star key={i} className={`${className} fill-current`} />)}
    </span>
  )
}

function ReviewCard({ review, hidden }) {
  return (
    // Right padding (not flex gap) keeps the two copies exactly half the track, so the loop never jumps
    <div className="shrink-0 pr-4 sm:pr-5" aria-hidden={hidden || undefined}>
      <figure className="flex h-full w-64 flex-col gap-4 border border-black/[0.08] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(43,22,27,0.3)] sm:w-72 sm:p-6">
        <Stars count={review.rating} />
        <blockquote className="flex-1 text-[15px] font-semibold leading-relaxed text-ev-ink">“{review.text}”</blockquote>
        <figcaption className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ev-red font-ui text-xs font-bold text-white">
            {initials(review.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ev-ink">{review.name}</span>
            <span className="block text-xs text-ev-gray">{formatDate(review.date)}</span>
          </span>
        </figcaption>
      </figure>
    </div>
  )
}

function Testimonials() {
  const list = site.testimonials
  return (
    <section className="overflow-hidden bg-white py-14 sm:py-20">
      <div className="container-ev">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="Testimoni" title="Kata mereka">Ulasan asli pelanggan Auto EV di Google.</SectionTitle>
          <div className="flex items-center gap-3">
            <Stars count={5} className="size-5" />
            <p className="text-sm text-ev-gray"><strong className="text-ev-ink">{list.length}</strong> ulasan</p>
          </div>
        </Reveal>
      </div>

      {/* One endless row; the second copy is decorative and hidden from screen readers. Hover/focus pauses it. */}
      <div className="reviews-row mt-10 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <div className="reviews-marquee flex w-max py-2">
          {[...list, ...list].map((r, i) => (
            <ReviewCard key={i} review={r} hidden={i >= list.length} />
          ))}
        </div>
      </div>
    </section>
  )
}

function LatestArticles() {
  const [lead, ...rest] = articles.slice(0, 5)
  return (
    <section className="bg-ev-soft py-14 sm:py-20">
      <div className="container-ev">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="Artikel & Komunitas" title="Kabar terbaru" />
          <Link to="/artikel" className="group -my-2 hidden items-center gap-2 py-2 font-ui text-xs font-bold uppercase tracking-wider text-ev-ink hover:text-ev-red sm:inline-flex">
            Semua {articles.length} artikel <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <Reveal>
            <Link to={`/artikel/${lead.slug}`} className="group block md:grid md:grid-cols-2 md:items-center md:gap-8 lg:block">
              <ArticleCover article={lead} zoom="group-hover:scale-[1.03]" />
              <div>
                <ArticleMeta article={lead} className="mt-5 md:mt-0 lg:mt-5" />
                <h3 className="mt-2 font-sans text-xl font-bold normal-case leading-snug text-ev-ink transition group-hover:text-ev-red sm:text-2xl">
                  {lead.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-ev-gray sm:line-clamp-3 sm:text-base sm:leading-7">{lead.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-ui text-xs font-bold uppercase tracking-wider text-ev-red">
                  Baca selengkapnya <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>

          <ul className="divide-y divide-black/10 border-t border-black/10 lg:border-t-0">
            {rest.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={(i + 1) * 80} className="py-5 lg:first:pt-0 lg:last:pb-0">
                <Link to={`/artikel/${a.slug}`} className="group flex items-start gap-4 sm:gap-5">
                  <ArticleCover article={a} className="w-32 shrink-0 sm:w-44 lg:w-36 xl:w-40" />
                  <div className="min-w-0 flex-1">
                    <ArticleMeta article={a} short narrow />
                    <h3 className="mt-1.5 line-clamp-3 font-sans text-[15px] font-bold normal-case leading-snug text-ev-ink transition group-hover:text-ev-red sm:text-base">
                      {a.title}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
        <Link to="/artikel" className="btn-outline mt-8 w-full text-ev-ink sm:hidden">Semua {articles.length} artikel <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  )
}

function ShowroomCta() {
  const provinces = [...new Set(showrooms.map((s) => s.province))]
  return (
    // Black behind the slanted band so its cut-away corner blends into the footer
    <div className="bg-black">
      <section className="slash-band bg-ev-red pb-20 pt-12 text-white sm:pb-24 sm:pt-16">
        <div className="container-ev flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="flex items-center gap-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-white/85">
              <MapPin className="size-4" /> {provinces.join(' · ')}
            </p>
            <h2 className="mt-3 text-4xl text-white sm:text-6xl">{showrooms.length} showroom Auto EV</h2>
            <p className="mt-3 max-w-xl text-white/90">Datang, lihat motornya langsung, dan ngobrol dengan tim kami di cabang terdekat.</p>
          </div>
          <div className="flex w-full sm:w-auto">
            <Link to="/kontak#showroom" className="btn-black w-full sm:w-auto">Cari Showroom <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Perks />
      <BrandStrip />
      <Picks />
      <EvBenefits />
      <Testimonials />
      <LatestArticles />
      <ShowroomCta />
    </>
  )
}
