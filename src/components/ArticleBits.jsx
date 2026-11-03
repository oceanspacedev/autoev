import { formatDate, readMinutes } from '../lib/format.js'

// Topic, date and reading time above an article title; `short` keeps only the date on phones,
// `narrow` also drops the reading time in the slim desktop side column
export function ArticleMeta({ article, short = false, narrow = false, className = '' }) {
  const sep = <span className="mx-1.5 text-black/20">/</span>
  return (
    <p className={`font-ui text-xs font-semibold uppercase tracking-wider text-ev-gray ${className}`}>
      {article.topic && (
        <span className={short ? 'hidden sm:inline' : undefined}>
          <span className="text-ev-red">{article.topic}</span>{sep}
        </span>
      )}
      {formatDate(article.date)}
      <span className={`${short ? 'hidden sm:inline' : ''} ${narrow ? 'lg:hidden' : ''}`}>
        {sep}<span className="whitespace-nowrap">{readMinutes(article.html)} menit baca</span>
      </span>
    </p>
  )
}

// Cover image with a branded fallback for the few articles that have none
export function ArticleCover({ article, zoom = 'group-hover:scale-105', className = '' }) {
  return (
    <div className={`aspect-video overflow-hidden bg-ev-light ${className}`}>
      {article.cover ? (
        <img src={article.cover} alt="" loading="lazy" className={`size-full object-cover transition duration-500 ${zoom}`} />
      ) : (
        <div className="grid size-full place-items-center bg-ev-ink">
          <img src="/img/brand/logo-putih.webp" alt="" className={`w-2/5 max-w-40 opacity-90 transition duration-500 ${zoom}`} />
        </div>
      )}
    </div>
  )
}
