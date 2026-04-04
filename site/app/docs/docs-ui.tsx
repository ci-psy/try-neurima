import Link from 'next/link'
import type { DocArticle, DocBlock, DocHeading, DocSection } from './docs-data'
import { tokenizeDocInline } from './docs-data'

function DocInline({ text }: { text: string }) {
  const tokens = tokenizeDocInline(text)

  return (
    <>
      {tokens.map((token, index) => {
        const key = `${token.type}-${index}-${token.content}`

        if (token.type === 'text') {
          return <span key={key}>{token.content}</span>
        }

        if (token.type === 'code') {
          return (
            <code key={key} className="docs-inline-code">
              {token.content}
            </code>
          )
        }

        if (token.type === 'strong') {
          return (
            <strong key={key} className="font-semibold text-[var(--color-fg)]">
              {token.content}
            </strong>
          )
        }

        if (token.external) {
          return (
            <a
              key={key}
              href={token.href}
              target="_blank"
              rel="noopener noreferrer"
              className="docs-inline-link"
            >
              {token.content}
            </a>
          )
        }

        return (
          <Link key={key} href={token.href} className="docs-inline-link">
            {token.content}
          </Link>
        )
      })}
    </>
  )
}

function renderBlock(block: DocBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return block.level === 2 ? (
        <h2 key={`${block.id}-${index}`} id={block.id} className="docs-h2">
          {block.text}
        </h2>
      ) : (
        <h3 key={`${block.id}-${index}`} id={block.id} className="docs-h3">
          {block.text}
        </h3>
      )

    case 'paragraph':
      return (
        <p key={`paragraph-${index}`} className="docs-copy">
          <DocInline text={block.text} />
        </p>
      )

    case 'list':
      return block.ordered ? (
        <ol key={`list-${index}`} className="docs-list docs-list-ordered">
          {block.items.map((item, itemIndex) => (
            <li key={`${index}-${itemIndex}`} className="docs-list-item">
              <DocInline text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul key={`list-${index}`} className="docs-list">
          {block.items.map((item, itemIndex) => (
            <li key={`${index}-${itemIndex}`} className="docs-list-item">
              <DocInline text={item} />
            </li>
          ))}
        </ul>
      )

    case 'callout':
      return (
        <div key={`callout-${index}`} className="docs-callout">
          <p className="docs-callout-copy">
            <DocInline text={block.text} />
          </p>
        </div>
      )

    case 'image':
      const isDesktopScreenshot = block.src.includes('neurima-audacity-step')
      return (
        <figure
          key={`image-${index}`}
          className={`docs-figure ${isDesktopScreenshot ? 'docs-figure-wide' : ''}`}
        >
          <a
            href={block.src}
            target="_blank"
            rel="noopener noreferrer"
            className="docs-screenshot-link"
            aria-label={block.alt ? `${block.alt} (opens full-size image in new tab)` : 'Open full-size screenshot in new tab'}
          >
            <img
              src={block.src}
              alt={block.alt}
              className={`docs-screenshot ${isDesktopScreenshot ? 'docs-screenshot-desktop' : ''}`}
            />
          </a>
          <figcaption className="docs-figure-caption">
            {block.alt ? (
              <p className="text-[13px] leading-relaxed text-muted">{block.alt}</p>
            ) : null}
          </figcaption>
        </figure>
      )

    case 'table':
      return (
        <div key={`table-${index}`} className="docs-table-wrap card-wrap">
          <div className="card overflow-x-auto">
            <table className="docs-table">
              <thead>
                <tr>
                  {block.headers.map((header, headerIndex) => (
                    <th key={`${index}-header-${headerIndex}`}>
                      <DocInline text={header} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${index}-row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${index}-cell-${rowIndex}-${cellIndex}`}>
                        <DocInline text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

    default:
      return null
  }
}

export function DocsArticleBody({ blocks }: { blocks: DocBlock[] }) {
  return <div className="docs-prose">{blocks.map(renderBlock)}</div>
}

export function DocsSidebar({
  sections,
  currentHref,
}: {
  sections: DocSection[]
  currentHref: string
}) {
  return (
    <aside className="flex flex-col gap-4">
      <div className="lg:sticky lg:top-[92px] flex flex-col gap-4">
        <div className="docs-sidebar-nav">
          {sections.map((section) => (
            <div key={section.id}>
              <Link href={section.href} className="docs-sidebar-section-title">
                {section.title}
              </Link>
              <div className="mt-2 flex flex-col gap-1">
                {section.articles.map((article) => (
                  <Link
                    key={article.href}
                    href={article.href}
                    className={`docs-sidebar-link ${article.href === currentHref ? 'docs-sidebar-link-active' : ''}`}
                    aria-current={article.href === currentHref ? 'page' : undefined}
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function DocsTableOfContents({ headings }: { headings: DocHeading[] }) {
  const topLevelHeadings = headings.filter((heading) => heading.level === 2)

  if (topLevelHeadings.length === 0) {
    return null
  }

  return (
    <aside className="hidden xl:block">
      <div className="docs-toc sticky top-[92px]">
        <div className="flex flex-col gap-2">
          {topLevelHeadings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className="docs-toc-link"
            >
              {heading.text}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function DocsArticlePagination({
  previous,
  next,
}: {
  previous: DocArticle | null
  next: DocArticle | null
}) {
  if (!previous && !next) {
    return null
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link href={previous.href} className="docs-pagination-card card-wrap">
          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Previous</div>
            <div className="mt-2 text-[16px] font-medium">{previous.title}</div>
            <p className="mt-2 text-[14px] leading-relaxed text-secondary">{previous.description}</p>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {next ? (
        <Link href={next.href} className="docs-pagination-card card-wrap">
          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Next</div>
            <div className="mt-2 text-[16px] font-medium">{next.title}</div>
            <p className="mt-2 text-[14px] leading-relaxed text-secondary">{next.description}</p>
          </div>
        </Link>
      ) : null}
    </div>
  )
}

export function DocsArticleHeader({ article }: { article: DocArticle }) {
  return (
    <header className="mb-10">
      <h1 className="text-[clamp(28px,4vw,36px)] font-semibold tracking-tight leading-[1.08]">
        {article.title}
      </h1>
      <p className="mt-4 max-w-[720px] text-[16px] leading-[1.8] text-secondary">
        {article.description}
      </p>
    </header>
  )
}
