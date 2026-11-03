import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { articles, articleBySlug } from '../lib/data.js'
import { brandSlug } from '../lib/format.js'
import { ArticleCover, ArticleMeta } from '../components/ArticleBits.jsx'
import { Breadcrumb } from '../components/PageHero.jsx'
import NotFound from './NotFound.jsx'
import { usePageTitle } from '../lib/title.js'

export default function Article() {
  const { slug } = useParams()
  const article = articleBySlug(slug)

  usePageTitle(article ? article.title : 'Halaman tidak ditemukan')

  if (!article) return <NotFound />
  const more = articles.filter((a) => a.slug !== slug).slice(0, 3)

  return (
    <>
      <article>
        <header className="border-b border-black/5 bg-white">
          <div className="container-ev max-w-4xl py-8 sm:py-10">
            <Breadcrumb crumbs={[{ label: 'Artikel', to: '/artikel' }, ...(article.topic ? [{ label: article.topic, to: `/artikel?topik=${brandSlug(article.topic)}` }] : [])]} />
            <h1 className="mt-4 text-3xl leading-tight sm:text-5xl">{article.title}</h1>
            <ArticleMeta article={article} className="mt-4" />
          </div>
        </header>

        <div className="container-ev max-w-4xl">
          {article.cover && <img src={article.cover} alt="" className="mt-8 aspect-video w-full object-cover sm:mt-10" />}
          {/* Content is the site's own WordPress articles, cleaned at build time (scripts removed) */}
          <div className="prose-ev mx-auto max-w-2xl py-12" dangerouslySetInnerHTML={{ __html: article.html }} />

          <div className="mx-auto mb-16 flex max-w-2xl flex-col items-start justify-between gap-4 border-y border-black/10 py-6 sm:flex-row sm:items-center">
            <p className="font-display text-xl uppercase text-ev-ink">Tertarik punya sepeda listrik?</p>
            <Link to="/koleksi" className="btn-black">Lihat koleksi <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </article>

      <section className="bg-ev-soft py-16 pb-28">
        <div className="container-ev">
          <h2 className="text-3xl">Baca juga</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {more.map((a) => (
              <Link key={a.slug} to={`/artikel/${a.slug}`} className="group block">
                <ArticleCover article={a} />
                <ArticleMeta article={a} className="mt-4" />
                <h3 className="mt-1.5 line-clamp-2 font-sans text-base font-bold normal-case leading-snug text-ev-ink transition group-hover:text-ev-red">{a.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
