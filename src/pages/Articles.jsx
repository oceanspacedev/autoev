import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Award, Gift, MapPin, Mic, Wrench } from 'lucide-react'
import { articles, site } from '../lib/data.js'
import { brandSlug, whatsappMessage } from '../lib/format.js'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { ArticleCover, ArticleMeta } from '../components/ArticleBits.jsx'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import { usePageTitle } from '../lib/title.js'

const TOPICS = [...new Set(articles.map((a) => a.topic).filter(Boolean))]

// How many stories sit beside the lead on desktop: up to 4, chosen so the 3-column grid below has no orphan
function sideCount(n) {
  for (let s = Math.min(4, n); s > 0; s--) if ((n - s) % 3 === 0) return s
  return Math.min(4, n)
}

const PERK_ICONS = [Mic, Gift, Award, Wrench]

function Community() {
  const [open, setOpen] = useState(null)
  const { intro, perks, requirements, areas, photos } = site.community
  return (
    <section className="bg-ev-soft py-16 sm:py-24">
      <div className="container-ev grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <Reveal>
          <SectionTitle eyebrow="Komunitas" title="Auto EVers">{intro}</SectionTitle>

          <ul className="mt-8 grid grid-cols-2 gap-px bg-black/10">
            {perks.map((p, i) => {
              const Icon = PERK_ICONS[i % PERK_ICONS.length]
              return (
                <li key={p} className="flex items-center gap-3 bg-white p-4 sm:p-5">
                  <Icon className="size-5 shrink-0 text-ev-red" strokeWidth={1.75} />
                  <span className="text-sm font-semibold leading-snug text-ev-ink">{p}</span>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 text-xs leading-5 text-ev-gray">
            <span className="font-semibold text-ev-ink">Syarat gabung:</span> {requirements}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappMessage('Hai kak, saya mau gabung komunitas Auto EVers. Caranya gimana ya?')} target="_blank" rel="noreferrer" className="btn-red">
              <WhatsAppIcon className="size-4" /> Gabung via WhatsApp
            </a>
            <Link to="/artikel/komunitas-auto-evers" className="btn-outline text-ev-ink">Selengkapnya <ArrowRight className="size-4" /></Link>
          </div>
        </Reveal>

        {/* Tablet: the three tiles share one row */}
        <Reveal delay={120} className="grid grid-cols-2 gap-3 md:auto-rows-[15rem] md:grid-cols-4 lg:auto-rows-auto lg:grid-cols-2">
          {photos.map((ph, i) => (
            <button
              key={ph.src}
              type="button"
              onClick={() => setOpen(i)}
              className={`group relative overflow-hidden bg-ev-light ${i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square sm:aspect-[4/3]'} md:aspect-auto ${i === 0 ? 'lg:aspect-[16/9]' : 'lg:aspect-[4/3]'}`}
              aria-label={`Lihat foto: ${ph.caption}`}
            >
              <img src={ph.src} alt={ph.caption} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-left text-xs font-semibold text-white">{ph.caption}</span>
            </button>
          ))}
          <div className="flex aspect-square flex-col justify-between bg-ev-ink p-4 text-white sm:aspect-[4/3] sm:p-6 md:aspect-auto lg:aspect-[4/3]">
            <MapPin className="size-5 text-ev-red" />
            <div>
              <p className="font-display text-3xl uppercase leading-none sm:text-4xl">{areas.length} kota</p>
              <p className="mt-2 text-xs leading-5 text-white/70">{areas.join(', ')}</p>
            </div>
          </div>
        </Reveal>
      </div>
      <Lightbox images={photos} index={open} onChange={setOpen} />
    </section>
  )
}

// Thumbnail row on phones and tablets; with `card` it becomes a grid card on desktop
function ArticleRow({ article, card = false }) {
  return (
    <Link to={`/artikel/${article.slug}`} className={`group flex items-start gap-4 sm:gap-6 ${card ? 'lg:block' : 'lg:gap-5'}`}>
      <ArticleCover article={article} className={`w-32 shrink-0 sm:w-52 ${card ? 'lg:w-full' : 'lg:w-36 xl:w-40'}`} />
      <div className={`min-w-0 flex-1 ${card ? 'lg:mt-4' : ''}`}>
        <ArticleMeta article={article} short narrow={!card} />
        <h3 className="mt-1.5 line-clamp-3 font-sans text-[15px] font-bold normal-case leading-snug text-ev-ink transition group-hover:text-ev-red sm:line-clamp-2 sm:text-lg lg:text-base">
          {article.title}
        </h3>
        <p className={`mt-2 hidden text-sm leading-6 text-ev-gray sm:line-clamp-2 ${card ? '' : 'lg:hidden'}`}>{article.excerpt}</p>
      </div>
    </Link>
  )
}

export default function Articles() {
  usePageTitle('Artikel')
  const [params, setParams] = useSearchParams()
  const topic = TOPICS.find((t) => brandSlug(t) === params.get('topik')) ?? ''
  const list = topic ? articles.filter((a) => a.topic === topic) : articles
  const [lead, ...rest] = list
  const side = rest.slice(0, sideCount(rest.length))
  const grid = rest.slice(side.length)

  const pick = (t) => setParams(t ? { topik: brandSlug(t) } : {}, { replace: true, preventScrollReset: true })
  const tabs = [{ label: 'Semua', value: '', count: articles.length }, ...TOPICS.map((t) => ({ label: t, value: t, count: articles.filter((a) => a.topic === t).length }))]

  return (
    <>
      <PageHero title="Artikel" crumbs={[{ label: 'Artikel' }]}>
        Cerita dari showroom, tips merawat sepeda listrik, dan keseruan komunitas Auto EVers.
      </PageHero>

      <section className="pb-20 pt-6 sm:pb-24 sm:pt-10">
        <div className="container-ev">
          <div className="no-scrollbar -mx-4 overflow-x-auto border-b border-black/10 px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Topik artikel">
            <div className="flex w-max gap-6 sm:gap-8">
              {tabs.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  role="tab"
                  aria-selected={topic === t.value}
                  onClick={() => pick(t.value)}
                  className={`relative pb-3 pt-3 font-ui text-xs font-bold uppercase tracking-wider transition ${
                    topic === t.value ? 'text-ev-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ev-red' : 'text-ev-gray hover:text-ev-ink'
                  }`}
                >
                  {t.label} <span className="ml-0.5 font-semibold text-ev-gray/70">{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div key={topic} className="animate-fade-up">
            <div className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
              <Link to={`/artikel/${lead.slug}`} className="group block md:grid md:grid-cols-2 md:items-center md:gap-8 lg:block">
                <ArticleCover article={lead} zoom="group-hover:scale-[1.03]" />
                <div>
                  <ArticleMeta article={lead} className="mt-5 md:mt-0 lg:mt-5" />
                  <h2 className="mt-2 font-sans text-xl font-bold normal-case leading-snug text-ev-ink transition group-hover:text-ev-red sm:text-2xl lg:text-[1.75rem]">
                    {lead.title}
                  </h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-ev-gray sm:line-clamp-3 sm:text-base sm:leading-7">{lead.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-ui text-xs font-bold uppercase tracking-wider text-ev-red">
                    Baca selengkapnya <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>

              {side.length > 0 && (
                <ul className="divide-y divide-black/10 border-t border-black/10 lg:border-t-0">
                  {side.map((a) => (
                    <li key={a.slug} className="py-5 lg:first:pt-0 lg:last:pb-0">
                      <ArticleRow article={a} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {grid.length > 0 && (
              <ul className="divide-y divide-black/10 border-t border-black/10 lg:mt-14 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12 lg:divide-y-0 lg:pt-12">
                {grid.map((a, i) => (
                  <Reveal as="li" key={a.slug} delay={(i % 3) * 80} className="py-5 lg:py-0">
                    <ArticleRow article={a} card />
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <Community />
    </>
  )
}
