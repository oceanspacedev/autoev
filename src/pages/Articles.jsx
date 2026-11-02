import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { articles, site } from '../lib/data.js'
import { formatDate } from '../lib/format.js'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { SOCIAL_ICONS } from '../lib/nav.js'

function Community() {
  const [open, setOpen] = useState(null)
  const photos = site.communityPhotos
  return (
    <section className="bg-ev-ink py-16 text-white">
      <div className="container-ev grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionTitle light eyebrow="Komunitas" title="Auto EVers">
            Komunitas pengguna sepeda listrik Auto EV: tempat tukar info, sunmori bareng, dan ikut acara seru bareng Auto EV.
          </SectionTitle>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/artikel/komunitas-auto-evers" className="btn-red">Kenalan dengan Auto EVers <ArrowRight className="size-4" /></Link>
            {site.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.name]
              return (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-white/80 transition hover:text-white">
                  <Icon className="size-4" /> {s.handle}
                </a>
              )
            })}
          </div>
        </Reveal>
        <Reveal delay={120} className="grid grid-cols-2 gap-3">
          {photos.map((ph, i) => (
            <button
              key={ph.src}
              type="button"
              onClick={() => setOpen(i)}
              className={`group relative overflow-hidden ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-[4/3]'}`}
            >
              <img src={ph.src} alt={ph.caption} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left text-xs font-semibold">{ph.caption}</span>
            </button>
          ))}
        </Reveal>
      </div>
      <Lightbox images={photos} index={open} onChange={setOpen} />
    </section>
  )
}

export default function Articles() {
  const [lead, ...rest] = articles
  return (
    <>
      <PageHero title="Artikel" eyebrow="Kabar, tips & komunitas" crumbs={[{ label: 'Artikel' }]}>
        Cerita dari showroom, tips merawat sepeda listrik, dan keseruan komunitas Auto EVers.
      </PageHero>

      <section className="py-14">
        <div className="container-ev">
          <Reveal>
            <Link to={`/artikel/${lead.slug}`} className="group grid items-center gap-8 bg-ev-soft lg:grid-cols-2">
              <div className="aspect-[16/10] overflow-hidden">
                {lead.cover && <img src={lead.cover} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" />}
              </div>
              <div className="p-6 lg:p-10">
                <p className="eyebrow">Terbaru · {formatDate(lead.date)}</p>
                <h2 className="mt-3 font-sans text-2xl font-bold normal-case leading-snug transition group-hover:text-ev-red sm:text-3xl">{lead.title}</h2>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-ev-gray">{lead.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-ui text-sm font-bold uppercase text-ev-red">Baca <ArrowRight className="size-4" /></span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <Community />

      <section className="py-16 pb-28">
        <div className="container-ev grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 80}>
              <Link to={`/artikel/${a.slug}`} className="group block">
                <div className="aspect-[16/10] overflow-hidden bg-ev-light">
                  {a.cover
                    ? <img src={a.cover} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                    : <div className="grid size-full place-items-center bg-ev-red font-display text-3xl uppercase text-white">Auto EV</div>}
                </div>
                <p className="mt-4 font-ui text-xs font-semibold uppercase text-ev-gray">{formatDate(a.date)}</p>
                <h3 className="mt-2 line-clamp-2 font-sans text-lg font-bold normal-case leading-snug transition group-hover:text-ev-red">{a.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ev-gray">{a.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
