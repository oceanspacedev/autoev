import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { articles, articleBySlug } from '../lib/data.js'
import { formatDate, whatsappUrl } from '../lib/format.js'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import NotFound from './NotFound.jsx'

export default function Article() {
  const { slug } = useParams()
  const article = articleBySlug(slug)

  useEffect(() => {
    if (article) document.title = `${article.title} — Auto EV`
    return () => { document.title = 'Auto EV — Sepeda Listrik Autohemat Autogaya' }
  }, [article])

  if (!article) return <NotFound />
  const more = articles.filter((a) => a.slug !== slug).slice(0, 3)

  return (
    <>
      <article>
        <header className="slash-band bg-ev-red pb-20 pt-10 text-white">
          <div className="container-ev max-w-4xl">
            <Link to="/artikel" className="inline-flex items-center gap-2 font-ui text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white">
              <ArrowLeft className="size-4" /> Semua artikel
            </Link>
            <p className="mt-6 font-ui text-xs font-bold uppercase tracking-[0.2em] text-black/70">{formatDate(article.date)}</p>
            <h1 className="mt-2 text-3xl leading-tight text-white sm:text-5xl">{article.title}</h1>
          </div>
        </header>

        <div className="container-ev max-w-4xl">
          {article.cover && <img src={article.cover} alt="" className="-mt-12 aspect-[16/9] w-full object-cover shadow-xl" />}
          {/* Content is the site's own WordPress articles, cleaned at build time (scripts removed) */}
          <div className="prose-ev mx-auto max-w-2xl py-12" dangerouslySetInnerHTML={{ __html: article.html }} />

          <div className="mx-auto mb-16 flex max-w-2xl flex-col items-start justify-between gap-4 border-y border-black/10 py-6 sm:flex-row sm:items-center">
            <p className="font-display text-xl uppercase text-ev-ink">Tertarik punya sepeda listrik?</p>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="btn-wa"><WhatsAppIcon className="size-4" /> Tanya Kami</a>
          </div>
        </div>
      </article>

      <section className="bg-ev-soft py-16 pb-28">
        <div className="container-ev">
          <h2 className="text-3xl">Baca juga</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {more.map((a) => (
              <Link key={a.slug} to={`/artikel/${a.slug}`} className="group block bg-white">
                <div className="aspect-[16/10] overflow-hidden bg-ev-light">
                  {a.cover && <img src={a.cover} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />}
                </div>
                <div className="p-5">
                  <p className="font-ui text-xs font-semibold uppercase text-ev-gray">{formatDate(a.date)}</p>
                  <h3 className="mt-2 text-lg leading-tight transition group-hover:text-ev-red">{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
