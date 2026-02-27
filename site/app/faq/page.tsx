import type { Metadata } from 'next'
import { FAQ } from '../faq'
import { Footer } from '../components'

export const metadata: Metadata = {
  title: 'FAQ - Neurima',
  description: 'Frequently asked questions about Neurima',
  alternates: {
    canonical: 'https://tryneurima.com/faq/',
  },
}

export default function FAQPage() {
  return (
    <main id="main" className="min-h-screen px-6">
      <div className="max-w-[960px] mx-auto pt-[17.5vh] pb-24 animate-page-enter">
        <h1 className="text-[clamp(28px,4vw,36px)] font-semibold tracking-tight mb-2">Frequently Asked Questions</h1>
        <p className="text-[14px] text-muted mb-12">Last updated: February 2026</p>

        <FAQ />

        <div className="mt-16 text-[15px] text-secondary leading-relaxed">
          <p className="font-semibold text-[var(--color-fg)] mb-2">Have more questions?</p>
          <p>
            If you have any additional questions, do not hesitate to contact us at{' '}
            <a href="mailto:support@tryneurima.com" className="underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-fg)] transition-colors">
              support@tryneurima.com
            </a>
            .
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
