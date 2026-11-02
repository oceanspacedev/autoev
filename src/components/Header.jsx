import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { site } from '../lib/data.js'
import { whatsappUrl } from '../lib/format.js'
import { NAV } from '../lib/nav.js'
import { WhatsAppIcon } from './BrandIcons.jsx'

export default function Header() {
  const { pathname } = useLocation()
  // Remember which page the menu was opened on, so navigating closes it
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === pathname
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-40 bg-black text-white transition-shadow ${scrolled ? 'shadow-lg shadow-black/30' : ''}`}>
      <div className="container-ev flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link to="/" className="shrink-0" aria-label="Auto EV — beranda">
          <img src={site.logo} alt="Auto EV" className="h-8 w-auto lg:h-10" />
        </Link>

        <nav className="hidden items-center gap-7 xl:flex" aria-label="Menu utama">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative whitespace-nowrap py-2 font-ui text-[13px] font-semibold uppercase tracking-wider transition hover:text-ev-red ${
                  isActive ? 'text-ev-red after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-ev-red' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="btn-red hidden whitespace-nowrap px-4 py-2.5 text-xs sm:inline-flex">
            <WhatsAppIcon className="size-4" /> Chat Kami
          </a>
          <button
            type="button"
            onClick={() => setOpenOn(open ? null : pathname)}
            className="grid size-10 place-items-center xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/10 bg-black transition-[max-height] duration-300 xl:hidden ${open ? 'max-h-[28rem]' : 'max-h-0'}`}
      >
        <nav className="container-ev flex flex-col py-3" aria-label="Menu mobile">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `border-b border-white/5 py-3.5 font-display text-xl uppercase ${isActive ? 'text-ev-red' : 'text-white'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="btn-red mt-4">
            <WhatsAppIcon className="size-4" /> Chat via WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
