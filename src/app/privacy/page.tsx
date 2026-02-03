import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Neurima',
  description: 'Neurima privacy policy. We collect no personal data.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-[color:var(--foreground)] transition-colors mb-12"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="text-4xl font-medium mb-2">Privacy Policy</h1>
        <p className="text-muted mb-12">Last updated: January 2026</p>

        <div className="space-y-12 text-muted">
          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Our Commitment</h2>
            <p>
              Neurima collects no personal data and requires no account.
              Everything stays on your device.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Data We Collect</h2>
            <p className="mb-4">
              We do not collect any personal data. Neurima operates entirely on your device
              without sending any information to external servers.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your music library access stays on your device
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                App settings are stored locally
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Playlist information never leaves your device
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No analytics or tracking tools are used
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Permissions We Request</h2>
            <p className="mb-4">
              Neurima requires certain permissions to function:
            </p>
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <h3 className="font-medium text-[color:var(--foreground)] mb-1">Media Library Access</h3>
                <p className="text-sm">
                  Required to access and play your music files. We only read the songs you select.
                </p>
              </div>
              <div className="glass rounded-xl p-4">
                <h3 className="font-medium text-[color:var(--foreground)] mb-1">Audio Playback</h3>
                <p className="text-sm">
                  Required to play music and apply offset modulation to the audio output.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Third-Party Services</h2>
            <p>
              Neurima does not integrate with any third-party analytics, advertising,
              or data collection services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Data Storage</h2>
            <p>
              All app data, including your preferences and settings, is stored locally on your device
              using standard iOS storage mechanisms. This data is automatically removed if you delete the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Children&apos;s Privacy</h2>
            <p>
              Neurima does not collect personal information from anyone, including children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Policy Changes</h2>
            <p>
              If we make changes to this privacy policy, we will update the app and notify users
              through the App Store update notes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Contact</h2>
            <p>
              Questions? Contact us through the App Store.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
