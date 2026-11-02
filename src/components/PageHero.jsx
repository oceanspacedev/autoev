import { Link } from 'react-router-dom'

// Red slanted title band used at the top of inner pages
export default function PageHero({ title, eyebrow, children, crumbs = [] }) {
  return (
    <section className="relative overflow-hidden bg-ev-soft">
      <div className="slash-band bg-ev-red pb-16 pt-10 text-white sm:pt-14">
        <div className="container-ev">
          {crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4 font-ui text-xs font-semibold uppercase tracking-wider text-white/75">
              <Link to="/" className="hover:text-white">Beranda</Link>
              {crumbs.map((c) => (
                <span key={c.label}>
                  <span className="mx-2">/</span>
                  {c.to ? <Link to={c.to} className="hover:text-white">{c.label}</Link> : <span className="text-white">{c.label}</span>}
                </span>
              ))}
            </nav>
          )}
          {eyebrow && <p className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-black/70">{eyebrow}</p>}
          <h1 className="mt-1 text-4xl text-white sm:text-6xl">{title}</h1>
          {children && <div className="mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">{children}</div>}
        </div>
      </div>
    </section>
  )
}
