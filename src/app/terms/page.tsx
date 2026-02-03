import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Neurima',
  description: 'Neurima terms of service.',
}

export default function TermsPage() {
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

        <h1 className="text-4xl font-medium mb-2">Terms of Service</h1>
        <p className="text-muted mb-12">Last updated: January 2026</p>

        <div className="space-y-12 text-muted">
          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using Neurima, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Description of Service</h2>
            <p>
              Neurima is a music player application that applies audio processing to your personal music library.
              The app modifies audio playback using timing offsets for wellness purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">User Responsibilities</h2>
            <p className="mb-4">
              You are responsible for your use of the app and any content you access through it.
              You agree to use Neurima only for lawful purposes and in accordance with these terms.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Use only music you have the right to access
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Not attempt to reverse engineer the app
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Not use the app for any illegal purpose
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Medical Disclaimer</h2>
            <p>
              Neurima is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease
              or medical condition. The app is intended for general wellness purposes only. Always consult a
              healthcare professional for medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Intellectual Property</h2>
            <p>
              The Neurima app, including its design, features, and underlying technology, is protected by copyright
              and other intellectual property laws. You may not copy, modify, or distribute the app without permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">IMA Research Usage</h2>
            <p>
              The Imperceptible Musical Augmentation (IMA) methodology was created by Kyrtin Atreides.
              While the research is publicly available, commercial use of IMA—including implementation in
              other applications, products, or services—requires express written permission from Kyrtin Atreides.
              Unauthorized commercial use is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Limitation of Liability</h2>
            <p>
              Neurima is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages
              arising from your use of the app. Use at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the app after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--foreground)] mb-4">Contact</h2>
            <p>
              Questions about these terms? Contact us through the App Store.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
