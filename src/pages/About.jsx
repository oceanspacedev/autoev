import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Images, Settings, ShoppingBag, Store, Wrench } from 'lucide-react'
import { brands, products, showrooms, site } from '../lib/data.js'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { usePageTitle } from '../lib/title.js'

const SERVICE_ICONS = [Store, ShoppingBag, Settings, Wrench]

// Showrooms grouped by province (largest first), each city once with how many branches it has
const NETWORK = Object.entries(
  showrooms.reduce((acc, s) => {
    const cities = (acc[s.province] ??= {})
    cities[s.city] = (cities[s.city] ?? 0) + 1
    return acc
  }, {}),
)
  .map(([province, cities]) => ({ province, cities: Object.entries(cities), total: Object.values(cities).reduce((a, b) => a + b, 0) }))
  .sort((a, b) => b.total - a.total)

// Mosaic: one large tile plus small ones filling two rows (3 columns on phones, 4 from tablet up)
const MOSAIC = { base: 3, sm: 5 }

function Statement() {
  const stats = [
    { value: `${products.length}+`, label: 'Model' },
    { value: brands.length, label: 'Merek' },
    { value: showrooms.length, label: 'Showroom' },
    { value: '2022', label: 'Sejak' },
  ]
  return (
    <section className="bg-ev-soft py-16 sm:py-24">
      <div className="container-ev grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-20">
        <Reveal>
          <p className="eyebrow">Cerita kami</p>
          <h2 className="mt-3 text-5xl leading-[0.95] sm:text-7xl">
            Autohemat<span className="text-ev-red">.</span>
            <br />
            Autogaya<span className="text-ev-red">.</span>
          </h2>
          <p className="mt-8 max-w-xl text-base leading-8 text-ev-text">{site.about}</p>
        </Reveal>
        <Reveal delay={120} className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-black/10 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-5xl leading-none text-ev-red sm:text-6xl">{s.value}</p>
              <p className="mt-3 font-ui text-xs font-bold uppercase tracking-[0.2em] text-ev-gray">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-ev">
        <Reveal><SectionTitle eyebrow="Layanan" title="Yang kami kerjakan">Dari pilih motor sampai perawatan, semua bisa di satu tempat.</SectionTitle></Reveal>
        <ol className="mt-10 border-t border-black/10">
          {site.services.map((s, i) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length]
            return (
              <Reveal
                as="li"
                key={s.title}
                delay={i * 60}
                className="group grid grid-cols-[3rem_1fr_auto] items-start gap-x-4 gap-y-2 border-b border-black/10 py-6 sm:grid-cols-[4.5rem_13rem_1fr_auto] sm:items-center sm:gap-x-8 sm:py-8"
              >
                <span className="font-display text-3xl leading-none text-ev-red sm:text-5xl">0{i + 1}</span>
                <h3 className="text-2xl transition group-hover:text-ev-red sm:text-3xl">{s.title}</h3>
                <p className="col-start-2 col-end-4 text-sm leading-6 text-ev-gray sm:col-start-auto sm:col-end-auto sm:text-base sm:leading-7">{s.text}</p>
                <Icon className="row-start-1 col-start-3 size-6 text-ev-ink/30 transition group-hover:text-ev-red sm:col-start-auto sm:row-start-auto sm:size-7" strokeWidth={1.5} />
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function Network() {
  const max = NETWORK[0]?.total ?? 1
  return (
    <section className="bg-ev-soft py-14 sm:py-20">
      <div className="container-ev grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <Reveal>
          <SectionTitle eyebrow="Jaringan" title={`${showrooms.length} showroom`}>
            Tersebar di {NETWORK.length} provinsi. Datang ke cabang terdekat untuk lihat motornya langsung.
          </SectionTitle>
          <Link to="/kontak#showroom" className="btn-black mt-8">Lihat alamat lengkap <ArrowRight className="size-4" /></Link>
        </Reveal>
        <ul className="space-y-8">
          {NETWORK.map((p, i) => (
            <Reveal as="li" key={p.province} delay={i * 80}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-2xl">{p.province}</h3>
                <p className="font-display text-3xl leading-none text-ev-red">{p.total} <span className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-ev-gray">cabang</span></p>
              </div>
              <div className="mt-3 h-2 bg-black/[0.06]">
                <div className="h-full bg-ev-red" style={{ width: `${(p.total / max) * 100}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-ev-gray">
                {p.cities.map(([city, n], j) => (
                  <span key={city}>
                    {j > 0 && <span className="text-black/35"> · </span>}
                    <span className="whitespace-nowrap">{city.replace(/^Kabupaten /, 'Kab. ')}{n > 1 && ` (${n})`}</span>
                  </span>
                ))}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Customers() {
  const [open, setOpen] = useState(null)
  const photos = site.customerGallery
  if (!photos.length) return null
  const shown = photos.slice(0, MOSAIC.sm)
  const visibility = (i) => (i < MOSAIC.base ? '' : 'hidden sm:block')
  return (
    <section className="py-14 pb-24 sm:py-20 sm:pb-28">
      <div className="container-ev">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="Pelanggan" title="Keluarga Auto EV">Sebagian pelanggan yang sudah membawa pulang sepeda listrik dari Auto EV.</SectionTitle>
          <button type="button" onClick={() => setOpen(0)} className="btn-outline text-ev-ink"><Images className="size-4" /> Semua {photos.length} foto</button>
        </Reveal>

        <Reveal delay={100} className="mt-10 grid auto-rows-[9rem] grid-cols-3 gap-2 sm:auto-rows-[13rem] sm:grid-cols-4 sm:gap-3 lg:auto-rows-[17rem]">
          {shown.map((ph, i) => (
            <button
              key={ph.src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Perbesar foto ${ph.alt}`}
              className={`group overflow-hidden bg-ev-light ${i === 0 ? 'col-span-2 row-span-2' : ''} ${visibility(i)}`}
            >
              <img src={ph.src} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
            </button>
          ))}
        </Reveal>

      </div>
      <Lightbox images={photos} index={open} onChange={setOpen} />
    </section>
  )
}

export default function About() {
  usePageTitle('Tentang Kami')
  const provinces = NETWORK.map((p) => p.province)
  return (
    <>
      <PageHero title="Tentang Kami" crumbs={[{ label: 'Tentang Kami' }]}>
        Showroom sepeda dan motor listrik dengan {showrooms.length} cabang di {provinces.slice(0, -1).join(', ')} dan {provinces.at(-1)}.
      </PageHero>
      <Statement />
      <Services />
      <Network />
      <Customers />
    </>
  )
}
