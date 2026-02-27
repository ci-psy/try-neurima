import Link from 'next/link'
import { Footer } from './components'

export default function NotFound() {
  return (
    <main id="main" className="min-h-screen px-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-page-enter">
        <span className="inline-block text-[12px] text-muted tracking-wide uppercase border border-[var(--color-border)] rounded-full px-3 py-1 mb-4">404</span>
        <h1 className="text-[clamp(36px,6vw,64px)] font-semibold tracking-tight leading-tight mb-3">
          Imperceptible.
        </h1>
        <p className="text-[17px] text-secondary mb-8">
          Unlike our audio shifts, you'll definitely<br className="sm:hidden" /> notice this one's missing.
        </p>
        <Link href="/" className="pill-ghost">
          Back to home
        </Link>
      </div>
      <Footer />
    </main>
  )
}
