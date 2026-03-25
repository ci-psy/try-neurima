import type { Metadata } from 'next'
import { Footer } from '../components'

export const metadata: Metadata = {
  title: 'Terms of Service - Neurima',
  description: 'Neurima Terms of Service',
  alternates: {
    canonical: 'https://tryneurima.com/terms/',
  },
}

export default function TermsPage() {
  return (
    <main id="main" className="min-h-screen px-6">
      <div className="max-w-[960px] mx-auto pt-[17.5vh] pb-24 animate-page-enter">
        <h1 className="text-[clamp(28px,4vw,36px)] font-semibold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[14px] text-muted mb-12">Last updated: February 2026</p>

        <div className="space-y-10 text-[15px] text-secondary leading-[1.75]">
          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using Neurima, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Description of Service</h2>
            <p>
              Neurima is an experimental psychoacoustic research tool and music player.
              The app applies timing desynchronization to your personal music library for wellness purposes.
              The underlying research is promising but has not been through clinical trials.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">User Responsibilities</h2>
            <p className="mb-4">
              You are responsible for your use of the app and any content you access through it.
              You agree to use Neurima only for lawful purposes and in accordance with these terms.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Use only music you have the right to access</li>
              <li>Not use the app for any illegal purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Medical Disclaimer</h2>
            <p>
              Neurima is not therapy and is not a medical device. It is not intended to diagnose, treat, cure, or
              prevent any disease or medical condition. Always consult a healthcare professional for medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">IMA Research Usage</h2>
            <p>
              The Imperceptible Musical Augments (IMA) methodology was created by Kyrtin Atreides.
              While the research is publicly available, commercial use of IMA, including implementation in
              other applications, products, or services, requires express written permission from Kyrtin Atreides.
              Unauthorized commercial use is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Intellectual Property</h2>
            <p>
              The Neurima app, including its design, features, and underlying technology, is protected by copyright
              and other intellectual property laws. You may not copy, modify, or distribute the app without permission.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Limitation of Liability</h2>
            <p>
              Neurima is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages
              arising from your use of the app. Use at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the app after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Contact</h2>
            <p>
              Questions about these terms? Contact us at{' '}
              <a href="mailto:support@tryneurima.com" className="underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-fg)] transition-colors">
                support@tryneurima.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
