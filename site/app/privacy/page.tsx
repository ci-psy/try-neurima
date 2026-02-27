import type { Metadata } from 'next'
import { Footer } from '../components'

export const metadata: Metadata = {
  title: 'Privacy Policy - Neurima',
  description: 'Neurima Privacy Policy',
  alternates: {
    canonical: 'https://tryneurima.com/privacy/',
  },
}

export default function PrivacyPage() {
  return (
    <main id="main" className="min-h-screen px-6">
      <div className="max-w-[960px] mx-auto pt-[17.5vh] pb-24 animate-page-enter">
        <h1 className="text-[clamp(28px,4vw,36px)] font-semibold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[14px] text-muted mb-12">Last updated: February 2026</p>

        <div className="space-y-10 text-[15px] text-secondary leading-[1.75]">
          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Our Commitment</h2>
            <p>
              Neurima collects no personal data and requires no account. Everything stays on your device.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Data Collection</h2>
            <p className="mb-4">
              We do not collect any personal data. Neurima operates entirely on your device
              without sending any information to external servers.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Your music library access stays on your device</li>
              <li>App settings are stored locally</li>
              <li>Playlist information never leaves your device</li>
              <li>No analytics or tracking tools are used</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Permissions</h2>
            <p className="mb-4">Neurima requires certain permissions to function:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Media Library Access: Required to access and play your music files. We only read the songs you select.</li>
              <li>Audio Playback: Required to play music and apply desynchronization to the audio output.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Third-Party Services</h2>
            <p>
              Neurima does not integrate with any third-party analytics, advertising, or data collection services.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Data Storage</h2>
            <p>
              All app data, including your preferences and settings, is stored locally on your device
              using standard iOS storage mechanisms. This data is automatically removed if you delete the app.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Children&apos;s Privacy</h2>
            <p>
              Neurima does not collect personal information from anyone, including children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Policy Changes</h2>
            <p>
              If we make changes to this privacy policy, we will update the app and notify users
              through the App Store update notes.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-medium text-[var(--color-fg)] mb-3">Contact</h2>
            <p>
              Questions? Contact us at{' '}
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
