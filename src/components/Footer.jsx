import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { site, showrooms } from '../lib/data.js'
import { NAV, SOCIAL_ICONS } from '../lib/nav.js'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="bg-black text-white/80">
      <div className="container-ev grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <img src={site.logo} alt="Auto EV" className="h-10 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-7">
            Showroom sepeda listrik dengan {site.brands.reduce((a, b) => a + b.count, 0)}+ model dari {site.brands.length} merek
            dan {showrooms.length} cabang di Jawa Barat, Banten &amp; Jawa Tengah.
          </p>
          <div className="mt-6 flex gap-3">
            {site.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.name]
              return (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 place-items-center border border-white/20 transition hover:border-ev-red hover:bg-ev-red hover:text-white"
                  aria-label={`${s.name} ${s.handle}`}
                >
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg text-white">Menu</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="transition hover:text-ev-red">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg text-white">Head Office</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6">
            <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-ev-red" />{site.headOffice.address}</li>
            <li className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-ev-red" />{site.headOffice.hours}</li>
          </ul>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <h2 className="text-lg text-white">Hubungi Kami</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="flex gap-3 transition hover:text-ev-red">
                <Phone className="size-4 shrink-0 text-ev-red" />{site.phone}
              </a>
            </li>
            {site.emails.map((e) => (
              <li key={e}>
                <a href={`mailto:${e}`} className="flex gap-3 break-all transition hover:text-ev-red">
                  <Mail className="size-4 shrink-0 text-ev-red" />{e}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-ev-red-dark py-4 text-center font-ui text-xs font-semibold text-white">
        Auto EV © 2022 – {YEAR} · {site.tagline}
      </div>
    </footer>
  )
}
