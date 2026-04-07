import type { Metadata } from 'next'
import { Footer } from '../components'

export const metadata: Metadata = {
  title: 'Acknowledgements - Neurima',
  description: 'Acknowledgements and thanks from Neurima.',
  alternates: {
    canonical: 'https://tryneurima.com/acknowledgements/',
  },
}

const profileLinks = [
  { href: 'https://kyrtinatreides.com/', label: 'Website' },
  { href: 'https://www.researchgate.net/profile/Kyrtin-Atreides', label: 'ResearchGate' },
  { href: 'https://scholar.google.com/citations?user=1njzkrQAAAAJ', label: 'Scholar' },
  { href: 'https://www.linkedin.com/in/kyrtin-atreides/', label: 'LinkedIn' },
  { href: 'https://kyrtin.substack.com/', label: 'Substack' },
] as const

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-fg)] transition-colors"
    >
      {children}
    </a>
  )
}

export default function AcknowledgementsPage() {
  return (
    <main id="main" className="min-h-screen px-6">
      <div className="max-w-[960px] mx-auto pt-[17.5vh] pb-24 animate-page-enter">
        <h1 className="text-[clamp(28px,4vw,36px)] font-semibold tracking-tight mb-2">Acknowledgements</h1>
        <p className="text-[14px] text-muted mb-12">Last updated: April 2026</p>

        <div className="space-y-10 text-[15px] text-secondary leading-[1.75]">
          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Kyrtin Atreides</h2>
            <p>
              Kyrtin Atreides developed the method behind Neurima through years of psychoacoustic
              self-experimentation aimed at improving quality of life. Neurima would not exist without his research,
              guidance, and generosity throughout the build process.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Find More From Kyrtin</h2>
            <ul className="space-y-2 list-disc list-inside">
              {profileLinks.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href}>{link.label}</ExternalLink>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
