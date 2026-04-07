import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '../../components'
import { getDocArticles, getDocBySlug, getDocNeighbors, getDocSections } from '../docs-data'
import {
  DocsArticleBody,
  DocsArticleHeader,
  DocsMobileNav,
  DocsArticlePagination,
  DocsSidebar,
  DocsTableOfContents,
} from '../docs-ui'

export const dynamicParams = false

type DocPageProps = {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  return getDocArticles().map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getDocBySlug(slug)

  if (!article) {
    return {}
  }

  return {
    title: `${article.title} - Docs - Neurima`,
    description: article.description,
    alternates: {
      canonical: `https://tryneurima.com${article.href}`,
    },
  }
}

export default async function DocArticlePage({ params }: DocPageProps) {
  const { slug } = await params
  const article = getDocBySlug(slug)

  if (!article) {
    notFound()
  }

  const sections = getDocSections()
  const neighbors = getDocNeighbors(article.id)

  return (
    <main id="main" className="min-h-screen px-6">
      <div className="max-w-[1280px] mx-auto pt-[15vh] pb-24 animate-page-enter">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_220px]">
          <div className="hidden lg:block">
            <DocsSidebar sections={sections} currentHref={article.href} />
          </div>

          <article>
            <DocsArticleHeader article={article} />
            <DocsMobileNav
              sections={sections}
              currentHref={article.href}
              headings={article.headings}
            />
            <DocsArticleBody blocks={article.blocks} />
            <div className="mt-12">
              <DocsArticlePagination previous={neighbors.previous} next={neighbors.next} />
            </div>
          </article>

          <DocsTableOfContents headings={article.headings} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
