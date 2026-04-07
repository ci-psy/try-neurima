import fs from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

export type DocSectionId = 'getting-started' | 'guides' | 'research'

export type DocInlineToken =
  | { type: 'text'; content: string }
  | { type: 'code'; content: string }
  | { type: 'strong'; content: string }
  | { type: 'link'; content: string; href: string; external: boolean }

export type DocBlock =
  | { type: 'heading'; level: 2 | 3; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'image'; alt: string; src: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; text: string }

export type DocHeading = {
  id: string
  level: 2 | 3
  text: string
}

export type DocArticle = {
  id: string
  title: string
  description: string
  section: DocSection
  href: string
  slug: string[]
  blocks: DocBlock[]
  headings: DocHeading[]
  searchText: string
  readTimeMinutes: number
}

export type DocSection = {
  id: DocSectionId
  title: string
  description: string
  itemLabel: string
  href: string
  anchor: string
  articles: DocArticle[]
}

type DocSectionDefinition = {
  id: DocSectionId
  title: string
  description: string
  itemLabel: string
}

type DocArticleDefinition = {
  id: string
  section: DocSectionId
  slug: string
  sourcePath: string
  description: string
}

const DOCS_SOURCE_ROOT = path.join(process.cwd(), 'content', 'docs-source')

const sectionDefinitions: DocSectionDefinition[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'First-run requirements, adding audio, and first playback.',
    itemLabel: 'Getting started',
  },
  {
    id: 'guides',
    title: 'Guides',
    description: 'Player behavior, pathways, Circadian, Sound Lab, visualization, and operational setup.',
    itemLabel: 'Guide',
  },
  {
    id: 'research',
    title: 'Research',
    description: 'The IMA playback model and a manual Audacity workflow.',
    itemLabel: 'Research',
  },
]

const articleDefinitions: DocArticleDefinition[] = [
  {
    id: 'start-here',
    section: 'getting-started',
    slug: 'start-here',
    sourcePath: 'Getting Started/Start Here.md',
    description: 'Requirements, ways to add audio, and default first-session setup.',
  },
  {
    id: 'first-listen',
    section: 'getting-started',
    slug: 'first-listen',
    sourcePath: 'Getting Started/First Listen.md',
    description: 'First playback, player basics, and the next guides to visit.',
  },
  {
    id: 'player-playlist',
    section: 'guides',
    slug: 'player-playlist',
    sourcePath: 'Guides/Player & Playlist.md',
    description: 'Playback controls, display switching, gestures, and queue management.',
  },
  {
    id: 'optimization-pathways-circadian',
    section: 'guides',
    slug: 'optimization-pathways-circadian',
    sourcePath: 'Guides/Optimization, Pathways & Circadian.md',
    description: 'Range selection, pathway management, and daily scheduling.',
  },
  {
    id: 'behavior-mode-channel-affinity',
    section: 'guides',
    slug: 'behavior-mode-channel-affinity',
    sourcePath: 'Guides/Behavior Mode & Channel Affinity.md',
    description: 'Timing behavior, locked playback, and stereo-channel routing.',
  },
  {
    id: 'calibration-profile',
    section: 'guides',
    slug: 'calibration-profile',
    sourcePath: 'Guides/Calibration Profile.md',
    description: 'Processing defaults, Signal Trace, and preview controls.',
  },
  {
    id: 'sound-lab',
    section: 'guides',
    slug: 'sound-lab',
    sourcePath: 'Guides/Sound Lab.md',
    description: 'Ambient piano, sound design, sessions, and export.',
  },
  {
    id: 'visualization',
    section: 'guides',
    slug: 'visualization',
    sourcePath: 'Guides/Visualization.md',
    description: 'Sphere customization, chart settings, and rendering controls.',
  },
  {
    id: 'data-permissions-media-library',
    section: 'guides',
    slug: 'data-permissions-media-library',
    sourcePath: 'Guides/Data, Permissions & Media Library.md',
    description: 'Permissions, local-audio compatibility, audio-source options, and configuration transfer.',
  },
  {
    id: 'how-ima-works',
    section: 'research',
    slug: 'how-ima-works',
    sourcePath: 'Research/How IMA Works.md',
    description: 'The IMA playback model in plain language.',
  },
  {
    id: 'manual-ima-audacity',
    section: 'research',
    slug: 'manual-ima-audacity',
    sourcePath: 'Research/Manual IMA in Audacity.md',
    description: 'A manual Audacity workflow for fixed channel desync.',
  },
]

const sectionById = new Map(sectionDefinitions.map((section) => [section.id, section]))

const wikiLinkEntries: Array<[string, string]> = [
  ['Website/_Website', '/docs/'],
  ['Website/Getting Started/_Getting Started', '/docs/#getting-started'],
  ['Website/Guides/_Guides', '/docs/#guides'],
  ['Website/Research/_Research', '/docs/#research'],
  ...articleDefinitions.map<[string, string]>((article) => [
    `Website/${article.sourcePath.replace(/\.md$/, '')}`,
    toArticleHref(article.section, article.slug),
  ]),
]

const wikiTargetToHref = new Map<string, string>(wikiLinkEntries)

function toArticleHref(section: DocSectionId, slug: string) {
  return `/docs/${section}/${slug}/`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['".]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function stripHtmlComments(markdown: string) {
  return markdown.replace(/<!--[\s\S]*?-->/g, '')
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isBlockBoundary(line: string, nextLine = '') {
  const trimmed = line.trim()
  return (
    trimmed.length === 0 ||
    trimmed.startsWith('# ') ||
    trimmed.startsWith('## ') ||
    trimmed.startsWith('### ') ||
    trimmed.startsWith('<- [[') ||
    trimmed.startsWith('![') ||
    trimmed.startsWith('> ') ||
    /^- /.test(trimmed) ||
    /^\d+\. /.test(trimmed) ||
    (trimmed.startsWith('|') && /^\s*\|?[-:\s|]+\|?\s*$/.test(nextLine.trim()))
  )
}

function normalizeSearchText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function markdownToPlainText(text: string) {
  return normalizeSearchText(
    text
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
  )
}

function tokenizeInlineMarkdown(text: string): DocInlineToken[] {
  const tokens: DocInlineToken[] = []
  const pattern = /(\[\[[^[\]]+\|[^[\]]+\]\]|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const raw = match[0]
    const index = match.index ?? 0

    if (index > lastIndex) {
      tokens.push({ type: 'text', content: text.slice(lastIndex, index) })
    }

    if (raw.startsWith('[[')) {
      const [, target = '', label = ''] = raw.match(/^\[\[([^|\]]+)\|([^\]]+)\]\]$/) ?? []
      const href = wikiTargetToHref.get(target) ?? '/docs/'
      tokens.push({ type: 'link', content: label || target, href, external: false })
    } else if (raw.startsWith('[')) {
      const [, label = '', href = ''] = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/) ?? []
      tokens.push({
        type: 'link',
        content: label,
        href,
        external: /^(https?:|mailto:)/.test(href),
      })
    } else if (raw.startsWith('**')) {
      tokens.push({ type: 'strong', content: raw.slice(2, -2) })
    } else {
      tokens.push({ type: 'code', content: raw.slice(1, -1) })
    }

    lastIndex = index + raw.length
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', content: text }]
}

function parseMarkdownDocument(markdown: string) {
  const lines = stripHtmlComments(markdown).split(/\r?\n/)
  let title = 'Untitled'
  const blocks: DocBlock[] = []
  const headings: DocHeading[] = []
  const headingIds = new Map<string, number>()
  let index = 0

  const pushHeading = (level: 2 | 3, text: string) => {
    const baseId = slugify(text)
    const seenCount = headingIds.get(baseId) ?? 0
    headingIds.set(baseId, seenCount + 1)
    const id = seenCount === 0 ? baseId : `${baseId}-${seenCount + 1}`
    blocks.push({ type: 'heading', level, text, id })
    headings.push({ id, level, text })
  }

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()
    const nextLine = lines[index + 1] ?? ''

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('# ')) {
      title = trimmed.slice(2).trim()
      index += 1
      continue
    }

    if (trimmed.startsWith('<- [[')) {
      index += 1
      continue
    }

    if (trimmed.startsWith('## ')) {
      pushHeading(2, trimmed.slice(3).trim())
      index += 1
      continue
    }

    if (trimmed.startsWith('### ')) {
      pushHeading(3, trimmed.slice(4).trim())
      index += 1
      continue
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imageMatch) {
      const [, alt, rawSrc] = imageMatch
      const src = rawSrc.startsWith('_screenshots/')
        ? `/docs/screenshots/${rawSrc.replace(/^_screenshots\//, '')}`
        : rawSrc
      blocks.push({ type: 'image', alt, src })
      index += 1
      continue
    }

    if (trimmed.startsWith('> ')) {
      const calloutLines: string[] = []
      while (index < lines.length && lines[index].trim().startsWith('> ')) {
        calloutLines.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'callout', text: calloutLines.join(' ') })
      continue
    }

    if (/^\d+\. /.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\. /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\. /, ''))
        index += 1
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    if (/^- /.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^- /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^- /, ''))
        index += 1
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    if (trimmed.startsWith('|') && /^\s*\|?[-:\s|]+\|?\s*$/.test(nextLine.trim())) {
      const headers = parseTableRow(lines[index])
      index += 2
      const rows: string[][] = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(parseTableRow(lines[index]))
        index += 1
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    const paragraphLines: string[] = []
    while (index < lines.length && !isBlockBoundary(lines[index], lines[index + 1] ?? '')) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
      continue
    }

    index += 1
  }

  const searchText = normalizeSearchText(
    [
      title,
      ...blocks.flatMap((block) => {
        if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'callout') {
          return [markdownToPlainText(block.text)]
        }

        if (block.type === 'list') {
          return block.items.map(markdownToPlainText)
        }

        if (block.type === 'table') {
          return [...block.headers, ...block.rows.flat()].map(markdownToPlainText)
        }

        if (block.type === 'image') {
          return [block.alt]
        }

        return []
      }),
    ].join(' ')
  )

  return { title, blocks, headings, searchText }
}

function countWords(text: string) {
  const trimmed = text.trim()
  if (!trimmed) {
    return 0
  }

  return trimmed.split(/\s+/).length
}

function buildDocsData() {
  const sections: DocSection[] = sectionDefinitions.map((definition) => ({
    id: definition.id,
    title: definition.title,
    description: definition.description,
    itemLabel: definition.itemLabel,
    href: `/docs/#${definition.id}`,
    anchor: definition.id,
    articles: [],
  }))

  const sectionsMap = new Map(sections.map((section) => [section.id, section]))

  const articles = articleDefinitions.map((definition) => {
    const section = sectionsMap.get(definition.section)

    if (!sectionById.get(definition.section) || !section) {
      throw new Error(`Unknown docs section: ${definition.section}`)
    }

    const filePath = path.join(DOCS_SOURCE_ROOT, definition.sourcePath)
    const markdown = fs.readFileSync(filePath, 'utf8')
    const parsed = parseMarkdownDocument(markdown)
    const article: DocArticle = {
      id: definition.id,
      title: parsed.title,
      description: definition.description,
      section,
      href: toArticleHref(definition.section, definition.slug),
      slug: [definition.section, definition.slug],
      blocks: parsed.blocks,
      headings: parsed.headings,
      searchText: parsed.searchText,
      readTimeMinutes: Math.max(2, Math.round(countWords(parsed.searchText) / 180)),
    }

    section.articles.push(article)
    return article
  })

  const homeMarkdown = fs.readFileSync(path.join(DOCS_SOURCE_ROOT, '_Website.md'), 'utf8')
  const homeDocument = parseMarkdownDocument(homeMarkdown)
  const homeIntroParagraphs = homeDocument.blocks
    .filter((block): block is Extract<DocBlock, { type: 'paragraph' }> => block.type === 'paragraph')
    .map((block) => block.text)

  const fallbackHomeIntro = [
    'Neurima is an experimental psychoacoustic audio player built around IMA for personal listening and general wellness exploration.',
    'It applies sample-level stereo timing desynchronization during playback, on device, without changing your source files.',
  ]

  return {
    homeIntroParagraphs: homeIntroParagraphs.length > 0 ? homeIntroParagraphs : fallbackHomeIntro,
    sections,
    articles,
  }
}

const getDocsDataCached = cache(buildDocsData)

export function getDocsHomeIntroParagraphs() {
  return getDocsDataCached().homeIntroParagraphs
}

export function getDocSections() {
  return getDocsDataCached().sections
}

export function getDocArticles() {
  return getDocsDataCached().articles
}

export function getDocBySlug(slug: string[]) {
  return getDocsDataCached().articles.find((article) => article.slug.join('/') === slug.join('/')) ?? null
}

export function getDocNeighbors(articleId: string) {
  const articles = getDocsDataCached().articles
  const currentIndex = articles.findIndex((article) => article.id === articleId)

  return {
    previous: currentIndex > 0 ? articles[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null,
  }
}

export function tokenizeDocInline(text: string) {
  return tokenizeInlineMarkdown(text)
}
