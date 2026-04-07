import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Compass,
  Globe,
  Headphones,
  Info,
  List,
  Map,
  MapPin,
  Music,
  Navigation,
  Search,
  Shield,
  Sliders,
  Target,
  Tool,
  type Icon,
} from 'react-feather'
import { Footer } from '../components'
import { type DocSectionId, getDocSections, getDocsHomeIntroParagraphs } from './docs-data'

export const metadata: Metadata = {
  title: 'Docs - Neurima',
  description: 'Documentation for local playback, Sound Lab, Circadian, and the IMA playback model.',
  alternates: {
    canonical: 'https://tryneurima.com/docs/',
  },
}

const sectionIcons = {
  'getting-started': Compass,
  guides: Map,
  research: Search,
} satisfies Record<DocSectionId, Icon>

const articleIcons: Record<string, Icon> = {
  'start-here': Navigation,
  'first-listen': Headphones,
  'player-playlist': List,
  'optimization-pathways-circadian': MapPin,
  'behavior-mode-channel-affinity': Sliders,
  'calibration-profile': Target,
  'sound-lab': Music,
  visualization: Globe,
  'data-permissions-media-library': Shield,
  'how-ima-works': Info,
  'manual-ima-audacity': Tool,
}

export default function DocsHomePage() {
  const introParagraphs = getDocsHomeIntroParagraphs()
  const sections = getDocSections()

  return (
    <main id="main" className="min-h-screen px-6">
      <div className="max-w-[960px] mx-auto pt-[17.5vh] pb-24 animate-page-enter">
        <section className="max-w-[720px]">
          <h1 className="text-[clamp(28px,4vw,36px)] font-semibold tracking-tight leading-[1.08]">
            Neurima Docs
          </h1>
          <div className="mt-5 grid gap-4">
            {introParagraphs.map((paragraph, index) => (
              <p key={index} className="text-[16px] leading-[1.85] text-secondary">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-4">
          {sections.map((section) => {
            const SectionIcon = sectionIcons[section.id]

            return (
              <div key={section.id} id={section.anchor} className="card-wrap scroll-mt-28">
                <div className="card p-6 sm:p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-[420px]">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)]">
                          <SectionIcon size={17} strokeWidth={1.9} />
                        </span>
                        <h2 className="text-[24px] font-semibold tracking-tight">{section.title}</h2>
                      </div>
                      <p className="mt-4 text-[15px] leading-[1.8] text-secondary">{section.description}</p>
                    </div>
                    <div className="grid w-full gap-3 lg:max-w-[620px]">
                      {section.articles.map((article) => {
                        const ArticleIcon = articleIcons[article.id]

                        return (
                          <Link key={article.href} href={article.href} className="docs-home-article">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-start gap-3">
                                {ArticleIcon ? (
                                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-muted">
                                    <ArticleIcon size={15} strokeWidth={1.9} />
                                  </span>
                                ) : null}
                                <div>
                                  <div className="text-[17px] font-medium tracking-tight">{article.title}</div>
                                  <p className="mt-2 text-[14px] leading-relaxed text-secondary">{article.description}</p>
                                </div>
                              </div>
                              <span className="shrink-0 text-[12px] uppercase tracking-[0.16em] text-muted">
                                {article.readTimeMinutes} min
                              </span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      </div>
      <Footer />
    </main>
  )
}
