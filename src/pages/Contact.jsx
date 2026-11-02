import { useMemo, useState } from 'react'
import { Clock, Mail, MapPin, Navigation, Phone, Search } from 'lucide-react'
import { showrooms, site } from '../lib/data.js'
import { mapsUrl, whatsappUrl } from '../lib/format.js'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import { SOCIAL_ICONS } from '../lib/nav.js'

const PROVINCES = ['Semua', ...new Set(showrooms.map((s) => s.province))]

function ContactCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white p-6">
      <Icon className="size-6 text-ev-red" />
      <h2 className="mt-4 text-xl">{title}</h2>
      <div className="mt-2 space-y-1 text-sm leading-6">{children}</div>
    </div>
  )
}

export default function Contact() {
  const [province, setProvince] = useState('Semua')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return showrooms
      .filter((s) => province === 'Semua' || s.province === province)
      .filter((s) => !needle || `${s.name} ${s.address} ${s.city}`.toLowerCase().includes(needle))
  }, [province, q])

  return (
    <>
      <PageHero title="Kontak & Showroom" eyebrow="Kami siap bantu" crumbs={[{ label: 'Kontak & Showroom' }]}>
        Mau tanya harga, cicilan, atau lihat motornya langsung? Chat kami atau datang ke showroom terdekat.
      </PageHero>

      <section className="bg-ev-soft py-14">
        <div className="container-ev">
        <div className="grid gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
          <ContactCard icon={Phone} title="Telepon & WhatsApp">
            <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="block font-semibold text-ev-ink hover:text-ev-red">{site.phone}</a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-ui text-xs font-bold uppercase text-ev-wa hover:underline">
              <WhatsAppIcon className="size-4" /> Chat sekarang
            </a>
          </ContactCard>
          <ContactCard icon={Mail} title="Email">
            {site.emails.map((e) => <a key={e} href={`mailto:${e}`} className="block break-all hover:text-ev-red">{e}</a>)}
          </ContactCard>
          <ContactCard icon={MapPin} title="Head Office">
            <p>{site.headOffice.address}</p>
            <p className="flex items-center gap-1.5 text-ev-gray"><Clock className="size-3.5" /> {site.headOffice.hours}</p>
          </ContactCard>
          <ContactCard icon={SOCIAL_ICONS.Instagram} title="Sosial Media">
            {site.socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="block hover:text-ev-red">{s.name}: {s.handle}</a>
            ))}
          </ContactCard>
        </div>
        </div>
      </section>

      <section id="showroom" className="scroll-mt-20 py-16 pb-28">
        <div className="container-ev">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow="Jaringan showroom" title={`${showrooms.length} showroom Auto EV`}>
              Cari yang terdekat, lalu klik "Petunjuk arah" untuk membuka Google Maps.
            </SectionTitle>
            <label className="relative w-full sm:w-72">
              <span className="sr-only">Cari kota atau showroom</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ev-gray" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kota atau showroom…"
                className="w-full border border-black/10 bg-ev-light py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ev-red focus:bg-white"
              />
            </label>
          </Reveal>

          <div className="mt-6 flex flex-wrap gap-2">
            {PROVINCES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvince(p)}
                aria-pressed={province === p}
                className={`chip ${province === p ? 'border-ev-red bg-ev-red text-white' : 'border-black/10 hover:border-ev-ink'}`}
              >
                {p} <span className="opacity-60">{p === 'Semua' ? showrooms.length : showrooms.filter((s) => s.province === p).length}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <article key={s.name} className="group flex flex-col border border-black/10 bg-white p-6 transition hover:border-ev-red hover:shadow-lg">
                <p className="eyebrow text-[11px]">{s.city}</p>
                <h3 className="mt-1 text-xl leading-tight">{s.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-ev-gray">{s.address}</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-ev-ink"><Clock className="size-4 text-ev-red" /> {s.hours}</p>
                <a href={mapsUrl(`${s.name}, ${s.address}`)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 font-ui text-xs font-bold uppercase tracking-wider text-ev-red group-hover:underline">
                  <Navigation className="size-4" /> Petunjuk arah
                </a>
              </article>
            ))}
          </div>
          {!list.length && <p className="mt-8 bg-ev-soft p-8 text-center text-sm">Tidak ada showroom yang cocok. Coba kata kunci lain.</p>}

          <div className="mt-16">
            <h2 className="text-2xl">Lokasi Head Office</h2>
            <iframe
              title="Peta Head Office Auto EV"
              src={site.headOffice.mapEmbed}
              loading="lazy"
              className="mt-4 h-80 w-full border-0 grayscale transition hover:grayscale-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  )
}
