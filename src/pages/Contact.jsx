import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin, Navigation } from 'lucide-react'
import { showrooms, site } from '../lib/data.js'
import { mapsUrl, whatsappMessage } from '../lib/format.js'
import { openStatus } from '../lib/hours.js'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import { usePageTitle } from '../lib/title.js'

// Pre-filled WhatsApp chats for the most common questions
const TOPICS = [
  { title: 'Tanya harga & stok', message: 'Hai kak, saya mau tanya harga dan stok sepeda listrik. Bisa dibantu?' },
  { title: 'Cash & kredit', message: 'Hai kak, saya mau tanya pembelian sepeda listrik secara cash atau kredit. Bisa dibantu?' },
  { title: 'Service', message: 'Hai kak, saya mau service sepeda listrik. Bisa dibantu jadwalnya?' },
  { title: 'Sparepart', message: 'Hai kak, saya cari sparepart sepeda listrik. Bisa dibantu cek stoknya?' },
]

// "AUTO EV PASIR KOJA" -> "Auto EV Pasir Koja"
const displayName = (name) => name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bEv\b/g, 'EV')
const embed = (query) => `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=m&z=15&output=embed`

const HEAD_OFFICE = {
  id: 'kantor-pusat',
  name: 'Kantor Pusat Auto EV',
  city: 'Jakarta Utara',
  province: 'Kantor pusat',
  address: site.headOffice.address,
  hours: site.headOffice.hours,
  map: site.headOffice.mapEmbed,
  headOffice: true,
}

const SHOWROOMS = showrooms.map((s) => ({
  ...s,
  id: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: displayName(s.name),
  map: embed(`${s.name}, ${s.address}`),
}))

// Provinces by number of showrooms, then the head office as its own group
const GROUPS = [
  ...[...new Set(SHOWROOMS.map((s) => s.province))]
    .map((p) => ({ label: p, items: SHOWROOMS.filter((s) => s.province === p).sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => b.items.length - a.items.length),
  { label: HEAD_OFFICE.province, items: [HEAD_OFFICE] },
]

// Re-render every minute so the open/closed note stays current
function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])
  return now
}

// Plain-text open/closed note, e.g. "buka sampai 20.00"
function statusText(hours, now) {
  const status = openStatus(hours, now)
  return status ? status.label.replace(/^Buka · tutup /, 'buka sampai ').replace(/^Tutup · buka /, 'tutup, buka ').replace(/^Tutup$/, 'tutup') : ''
}

const FADE_MS = 500

// Keeps the previous map on screen until the next one has loaded, then cross-fades to it
function MapFrame({ location }) {
  const [layers, setLayers] = useState([{ id: location.id, src: location.map, title: location.name, ready: false }])
  if (layers.at(-1).id !== location.id) {
    setLayers((ls) => [...ls.slice(-1), { id: location.id, src: location.map, title: location.name, ready: false }])
  }
  const dropHidden = (id) => setLayers((ls) => (ls.at(-1).id === id ? ls.slice(-1) : ls))
  // Once a map has loaded, fade it in and drop the ones underneath when the fade is done
  const markReady = (id) => {
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ready: true } : l)))
    setTimeout(() => dropHidden(id), FADE_MS + 100)
  }

  return (
    <div className="relative h-72 overflow-hidden bg-ev-light sm:h-96 lg:h-[28rem]">
      {layers.map((l, i) => (
        <iframe
          key={l.id}
          title={`Peta ${l.title}`}
          src={l.src}
          loading={i === 0 && layers.length === 1 ? 'lazy' : 'eager'}
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => markReady(l.id)}
          aria-hidden={i < layers.length - 1 || undefined}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          className={`absolute inset-0 size-full border-0 transition-opacity ${l.ready ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {!layers.at(-1).ready && <span className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-ev-red" aria-hidden="true" />}
    </div>
  )
}

function Locator() {
  const now = useNow()
  const [groupIndex, setGroupIndex] = useState(0)
  const group = GROUPS[groupIndex]
  const [activeId, setActiveId] = useState(group.items[0].id)
  const active = group.items.find((l) => l.id === activeId) ?? group.items[0]
  const rail = useRef(null)
  const mapRef = useRef(null)

  const pickGroup = (i) => {
    setGroupIndex(i)
    setActiveId(GROUPS[i].items[0].id)
  }
  const pick = (id) => {
    setActiveId(id)
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
  const slide = (dir) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: 'smooth' })
  // Which ends of the card rail are reachable, so the arrows can dim at the edges
  const [edges, setEdges] = useState({ start: true, end: false })
  const measure = (el) => {
    if (!el) return
    const start = el.scrollLeft <= 4
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }))
  }
  const railRef = (el) => {
    rail.current = el
    if (el) requestAnimationFrame(() => measure(el))
  }
  const status = statusText(active.hours, now)

  return (
    <section id="showroom" className="scroll-mt-20 py-8 pb-14 sm:py-12 sm:pb-20">
      <div className="container-ev">

        {/* Step 1: province */}
        <div className="grid grid-cols-2 border-l border-t border-black/10 sm:grid-cols-4" role="tablist" aria-label="Provinsi">
          {GROUPS.map((g, i) => {
            const on = i === groupIndex
            return (
              <button
                key={g.label}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => pickGroup(i)}
                className={`relative border-b border-r border-black/10 p-4 text-left transition sm:p-6 ${on ? 'bg-white' : 'bg-ev-soft hover:bg-white'}`}
              >
                {on && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ev-red" aria-hidden="true" />}
                <span className={`block font-display text-4xl leading-none sm:text-5xl ${on ? 'text-ev-red' : 'text-ev-ink/25'}`}>{g.items.length}</span>
                <span className={`mt-2 block font-sans text-sm font-bold sm:text-base ${on ? 'text-ev-ink' : 'text-ev-gray'}`}>{g.label}</span>
              </button>
            )
          })}
        </div>

        {/* Step 2: showroom cards in that province */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-ev-gray">{group.items.length} lokasi di {group.label === HEAD_OFFICE.province ? 'Jakarta' : group.label}</p>
          {!(edges.start && edges.end) && (
            <div className="flex gap-2">
              <button type="button" onClick={() => slide(-1)} disabled={edges.start} className="grid size-10 place-items-center border border-black/10 bg-white transition hover:border-ev-ink disabled:opacity-30 disabled:hover:border-black/10" aria-label="Geser ke kiri"><ChevronLeft className="size-4" /></button>
              <button type="button" onClick={() => slide(1)} disabled={edges.end} className="grid size-10 place-items-center border border-black/10 bg-white transition hover:border-ev-ink disabled:opacity-30 disabled:hover:border-black/10" aria-label="Geser ke kanan"><ChevronRight className="size-4" /></button>
            </div>
          )}
        </div>
        <div key={group.label} ref={railRef} onScroll={(e) => measure(e.currentTarget)} className="fade-in no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:scroll-px-0 sm:px-0">
          {group.items.map((l) => {
            const on = l.id === active.id
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => pick(l.id)}
                aria-pressed={on}
                className={`flex w-64 shrink-0 snap-start flex-col border bg-white p-4 text-left transition sm:w-72 sm:p-5 ${on ? 'border-ev-red' : 'border-black/10 hover:border-ev-ink'}`}
              >
                <span className="font-ui text-xs font-semibold uppercase tracking-wider text-ev-gray">{l.city}</span>
                <span className={`mt-1 font-sans text-base font-bold ${on ? 'text-ev-red' : 'text-ev-ink'}`}>{l.name}</span>
                <span className="mt-2 line-clamp-2 text-xs leading-5 text-ev-gray">{l.address}</span>
              </button>
            )
          })}
        </div>

        {/* Step 3: map follows the chosen showroom */}
        <div ref={mapRef} className="mt-6 grid scroll-mt-24 border border-black/10 bg-white lg:grid-cols-[1.6fr_1fr]">
          <MapFrame location={active} />
          <div key={active.id} className="fade-in flex flex-col p-5 sm:p-8">
            <p className="eyebrow text-xs">{active.headOffice ? 'Kantor pusat' : `${active.city} · ${active.province}`}</p>
            <h3 className="mt-2 text-3xl leading-tight">{active.name}</h3>
            <p className="mt-4 flex gap-2.5 text-sm leading-6 text-ev-text"><MapPin className="mt-1 size-4 shrink-0 text-ev-red" /> {active.address}</p>
            <p className="mt-2 flex gap-2.5 text-sm leading-6 text-ev-text">
              <Clock className="mt-1 size-4 shrink-0 text-ev-red" />
              <span>{active.hours}{status && <span className="block text-ev-gray">Sekarang {status}</span>}</span>
            </p>
            <div className="mt-6 flex items-center border-t border-black/10 pt-5 font-ui text-xs font-bold uppercase tracking-wider lg:mt-auto">
              <a href={mapsUrl(`${active.name}, ${active.address}`)} target="_blank" rel="noreferrer" className="group -my-2 inline-flex items-center gap-2 py-2 text-ev-ink hover:text-ev-red">
                <Navigation className="size-4 text-ev-red" /> Petunjuk arah <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Reach() {
  return (
    <section className="bg-ev-soft py-14 pb-24 sm:py-20 sm:pb-28">
      <div className="container-ev grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow">Hubungi kami</p>
          <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="mt-3 block font-display text-4xl leading-none text-ev-ink transition hover:text-ev-red sm:text-6xl">{site.phone}</a>
          <p className="mt-3 text-sm text-ev-gray">Telepon dan WhatsApp</p>

          <p className="mt-8 max-w-md border-t border-black/10 pt-6 text-sm leading-6 text-ev-gray">Email, alamat kantor pusat, dan sosial media ada di bagian bawah halaman.</p>
        </Reveal>

        <Reveal delay={100}>
          <p className="eyebrow">Langsung chat soal</p>
          <ul className="mt-3 border-t border-black/10">
            {TOPICS.map((t) => (
              <li key={t.title}>
                <a href={whatsappMessage(t.message)} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 border-b border-black/10 py-4 sm:py-5">
                  <span className="font-sans text-base font-bold text-ev-ink transition group-hover:text-ev-red sm:text-lg">{t.title}</span>
                  <ArrowRight className="size-4 text-ev-gray transition group-hover:translate-x-1 group-hover:text-ev-red" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ev-gray">Pesan WhatsApp sudah terisi, tinggal kirim.</p>
        </Reveal>
      </div>
    </section>
  )
}

export default function Contact() {
  usePageTitle('Kontak & Showroom')
  return (
    <>
      <PageHero title="Kontak & Showroom" crumbs={[{ label: 'Kontak & Showroom' }]}>
        {showrooms.length} showroom dan kantor pusat. Pilih provinsi dan showroom terdekat untuk melihat peta dan petunjuk arahnya.
      </PageHero>
      <Locator />
      <Reach />
    </>
  )
}
