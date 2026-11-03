import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { site } from '../lib/data.js'
import { whatsappUrl } from '../lib/format.js'
import { NAV } from '../lib/nav.js'
import { WhatsAppIcon } from './BrandIcons.jsx'

export default function Header() {
  const { pathname } = useLocation()
  // Remember which page the menu was opened on, so navigating closes it
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === pathname
  // Same trick for the search field
  const [searchOn, setSearchOn] = useState(null)
  const onCollection = pathname === '/koleksi'
  const searching = searchOn === pathname && !onCollection
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const submitSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/koleksi?q=${encodeURIComponent(q)}` : '/koleksi')
    setQuery('')
  }
  // Close the search field on a click/tap outside it (or its toggle) and on Escape
  const searchRef = useRef(null)
  const searchToggleRef = useRef(null)
  useEffect(() => {
    if (!searching) return
    const onPointer = (e) => {
      if (!searchRef.current?.contains(e.target) && !searchToggleRef.current?.contains(e.target)) setSearchOn(null)
    }
    const onKey = (e) => e.key === 'Escape' && setSearchOn(null)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [searching])

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

        <nav className="hidden items-center gap-4 lg:flex xl:gap-7" aria-label="Menu utama">
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

        <div className="flex items-center gap-1 sm:gap-2">
          {!onCollection && (
            <button
              ref={searchToggleRef}
              type="button"
              onClick={() => { setSearchOn(searching ? null : pathname); setOpenOn(null) }}
              className="grid size-10 place-items-center transition hover:text-ev-red"
              aria-expanded={searching}
              aria-controls="site-search"
              aria-label={searching ? 'Tutup pencarian' : 'Cari motor'}
            >
              {searching ? <X className="size-5" /> : <Search className="size-5" />}
            </button>
          )}
          <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="btn-red whitespace-nowrap px-3 py-2.5 text-xs sm:px-4">
            <WhatsAppIcon className="size-4" /> Chat<span className="hidden sm:inline"> Kami</span>
          </a>
          <button
            type="button"
            onClick={() => { setOpenOn(open ? null : pathname); setSearchOn(null) }}
            className="grid size-10 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {searching && (
        <form ref={searchRef} id="site-search" role="search" onSubmit={submitSearch} className="fade-in border-t border-white/10 bg-black">
          <div className="container-ev flex items-center gap-3 py-3">
            <Search className="size-5 shrink-0 text-white/50" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama motor atau merek…"
              aria-label="Cari motor"
              className="min-w-0 flex-1 bg-transparent py-2 text-base text-white outline-none placeholder:text-white/40"
            />
            <button type="submit" className="btn-red shrink-0 px-4 py-2.5 text-xs">Cari</button>
          </div>
        </form>
      )}

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/10 bg-black transition-[max-height] duration-300 lg:hidden ${open ? 'max-h-[28rem]' : 'max-h-0'}`}
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
        </nav>
      </div>
    </header>
  )
}
