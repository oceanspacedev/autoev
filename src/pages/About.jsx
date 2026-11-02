import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Settings, ShoppingBag, Store, Wrench } from 'lucide-react'
import { brands, products, showrooms, site } from '../lib/data.js'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import Lightbox from '../components/Lightbox.jsx'

const SERVICE_ICONS = [Store, ShoppingBag, Settings, Wrench]

export default function About() {
  const [open, setOpen] = useState(null)
  const stats = [
    { value: `${products.length}+`, label: 'Model' },
    { value: brands.length, label: 'Merek' },
    { value: showrooms.length, label: 'Showroom' },
    { value: '2022', label: 'Sejak' },
  ]

  return (
    <>
      <PageHero title="Tentang Kami" eyebrow={site.tagline} crumbs={[{ label: 'Tentang Kami' }]}>
        {site.about}
      </PageHero>

      <section className="py-16">
        <div className="container-ev">
        <div className="grid grid-cols-2 gap-px bg-black/10 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="bg-white p-6 text-center sm:p-10">
              <p className="font-display text-5xl text-ev-red sm:text-6xl">{s.value}</p>
              <p className="mt-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-ev-gray">{s.label}</p>
            </Reveal>
          ))}
        </div>
        </div>
      </section>

      <section className="bg-ev-soft py-14 sm:py-20">
        <div className="container-ev">
          <Reveal><SectionTitle eyebrow="Layanan" title="Yang kami kerjakan" /></Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {site.services.map((s, i) => {
              const Icon = SERVICE_ICONS[i]
              return (
                <Reveal key={s.title} delay={i * 80} className="flex gap-5 bg-white p-6 sm:p-8">
                  <span className="grid size-14 shrink-0 place-items-center bg-ev-red text-white"><Icon className="size-6" /></span>
                  <div>
                    <h3 className="text-2xl">{s.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-ev-gray">{s.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {site.customerGallery.length > 0 && (
        <section className="py-14 pb-28 sm:py-20">
          <div className="container-ev">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Galeri pelanggan" title="Keluarga Auto EV">Sebagian pelanggan yang sudah membawa pulang motor listrik dari Auto EV. Klik foto untuk memperbesar.</SectionTitle>
              <Link to="/kontak" className="btn-red">Hubungi Kami <ArrowRight className="size-4" /></Link>
            </Reveal>
            <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {site.customerGallery.map((pg, i) => (
                <button
                  key={pg.src}
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group aspect-[2/3] overflow-hidden bg-ev-light shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  aria-label={pg.alt}
                >
                  <img src={pg.src} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <Lightbox images={site.customerGallery} index={open} onChange={setOpen} />
        </section>
      )}
    </>
  )
}
