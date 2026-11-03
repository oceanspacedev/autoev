import { Fragment } from 'react'
import { Link } from 'react-router-dom'

// Beranda / … trail; the last crumb (no `to`) is the current page
export function Breadcrumb({ crumbs = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`font-ui text-xs font-semibold uppercase tracking-wider text-ev-gray ${className}`}>
      <Link to="/" className="-my-2 inline-block py-2 hover:text-ev-red">Beranda</Link>
      {crumbs.map((c) => (
        <Fragment key={c.label}>
          <span className="mx-2">/</span>
          {c.to ? <Link to={c.to} className="-my-2 inline-block py-2 hover:text-ev-red">{c.label}</Link> : <span className="text-ev-ink">{c.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}

// Compact white title bar shared by every inner page; `actions` sits on the right on desktop
export default function PageHero({ title, children, crumbs = [], actions }) {
  return (
    <section className="border-b border-black/5 bg-white">
      <div className="container-ev py-8 sm:py-10">
        <Breadcrumb crumbs={crumbs} />
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl leading-none sm:text-6xl">{title}</h1>
            {children && <p className="mt-3 max-w-2xl text-sm leading-6 text-ev-gray sm:text-base sm:leading-7">{children}</p>}
          </div>
          {actions}
        </div>
      </div>
    </section>
  )
}
