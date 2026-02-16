import Image from 'next/image'
import Link from 'next/link'
import { Reveal, ThemeSwitcher } from './components'
import { FAQ } from './faq'

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--color-nav-bg)] border-b border-[var(--color-nav-border)]">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden">
              <Image alt="Neurima" src="/icon-dark.png" width={28} height={28} className="w-full h-full object-cover dark:block hidden" />
              <Image alt="Neurima" src="/icon-light.png" width={28} height={28} className="w-full h-full object-cover dark:hidden block" />
            </div>
            <span className="text-[15px] font-medium">Neurima</span>
          </div>
          <div className="flex items-center gap-4 text-[14px]">
            <a href="#how" className="hidden sm:block text-secondary hover:text-[var(--color-fg)] transition-colors">How It Works</a>
            <a href="#faq" className="hidden sm:block text-secondary hover:text-[var(--color-fg)] transition-colors">FAQ</a>
            <a href="#" className="pill-ghost">
              <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-up max-w-[640px]">
          <h1 className="text-[clamp(36px,6vw,64px)] font-semibold tracking-tight leading-[1.08] mb-6">
            Of Sound Mind.
          </h1>
          <p className="text-[17px] text-secondary leading-relaxed max-w-[460px] mx-auto mb-10">
            A timing desynchronization between your ears. Imperceptible, except to your nervous system.
          </p>
          <a href="#" className="pill">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span>Download for iOS</span>
          </a>
        </div>
      </section>

      {/* Audio demo */}
      <Reveal>
        <section className="px-6 py-24">
          <div className="max-w-[640px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-5">
                Hear it for yourself.
              </h2>
              <p className="text-[16px] text-secondary leading-[1.75]">
                A pre-processed sample with desynchronization applied.
              </p>
            </div>
            <div className="card-wrap">
              <div className="card-spotlight" />
              <div className="card p-6 sm:p-8">
                <div className="flex items-center gap-2 text-muted mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 13v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-2a2 2 0 012-2h3zm12 0v4a2 2 0 002 2h1a2 2 0 002-2v-2a2 2 0 00-2-2h-3zM6 13V9a6 6 0 1112 0v4" />
                  </svg>
                  <span className="text-[13px]">Headphones required</span>
                </div>
                {/* TODO: Replace with GitHub-hosted pre-processed audio file */}
                <p className="text-[14px] text-muted italic">Audio sample coming soon.</p>
              </div>
            </div>
            <p className="text-center text-[12px] text-muted mt-3">
              Chopin, Waltz in D&#x266d; Major, Op. 64 No. 1 &middot;{' '}
              <a href="https://commons.wikimedia.org/wiki/File:Waltz_Op._64_no._1_in_D_flat_major.mp3" className="underline hover:text-secondary transition-colors" target="_blank" rel="noopener noreferrer">
                Wikimedia Commons
              </a>{' '}(CC0)
            </p>
          </div>
        </section>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <section id="how" className="px-6 py-24">
          <div className="max-w-[640px] mx-auto text-center">
            <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-5">
              Not binaural beats.
            </h2>
            <p className="text-[16px] text-secondary leading-[1.75]">
              Binaural beats replace your music with synthetic tones. Neurima
              desynchronizes <em className="text-[var(--color-fg)] not-italic font-medium whitespace-nowrap">your own music</em> at the
              sample level using Imperceptible Musical Augments (IMA).
            </p>
          </div>
        </section>
      </Reveal>

      {/* Research */}
      <Reveal>
        <section className="px-6 py-24">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-5">
                Early research.
              </h2>
              <p className="text-[16px] text-secondary leading-[1.75] max-w-[520px] mx-auto">
                Kyrtin Atreides, a researcher whose work spans AI, psychoacoustics,
                ethics, and biotech, discovered IMA in 2015 while searching for
                a non-pharmaceutical approach to lifelong migraines. Across 71
                participants and EEG measurement, the study found measurable
                neurological response with zero adverse effects.{' '}
                <a href="https://www.researchgate.net/publication/340902239_Neurological_Benefits_of_Imperceptible_Desynchronization_at_the_Audio_Sample_Level" className="text-[var(--color-fg)] underline underline-offset-3 hover:text-secondary transition-colors whitespace-nowrap" target="_blank" rel="noopener noreferrer">Read&nbsp;the&nbsp;paper</a>.
              </p>
            </div>
            <div className="flex items-center justify-center gap-8 sm:gap-14 max-w-[640px] mx-auto py-4">
              <div className="text-center">
                <div className="text-[32px] sm:text-[42px] font-semibold tracking-tight leading-none mb-2">71</div>
                <div className="text-[13px] text-muted">Participants</div>
              </div>
              <div className="w-px h-12 bg-[var(--color-border)]" />
              <div className="text-center">
                <div className="text-[32px] sm:text-[42px] font-semibold tracking-tight leading-none mb-2">0</div>
                <div className="text-[13px] text-muted">Adverse effects</div>
              </div>
              <div className="w-px h-12 bg-[var(--color-border)]" />
              <div className="text-center">
                <div className="text-[32px] sm:text-[42px] font-semibold tracking-tight leading-none mb-2 whitespace-nowrap">30s&#8211;3m</div>
                <div className="text-[13px] text-muted">To feel it</div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Features */}
      <Reveal>
        <section className="px-6 py-24">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight text-center mb-10">
              No fine print.
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="card-wrap h-full">
                <div className="card-spotlight" />
                <div className="card p-5 h-full">
                  <div className="text-[15px] font-medium mb-1">Your music, unchanged.</div>
                  <p className="text-[14px] text-secondary leading-relaxed">
                    No synthetic tones. No white noise. Neurima works with the songs already in your library.
                  </p>
                </div>
              </div>
              <div className="card-wrap h-full">
                <div className="card-spotlight" />
                <div className="card p-5 h-full">
                  <div className="text-[15px] font-medium mb-1">Nothing leaves your device.</div>
                  <p className="text-[14px] text-secondary leading-relaxed">
                    No accounts. No analytics. No servers. Audio processing happens entirely on device.
                  </p>
                </div>
              </div>
              <div className="card-wrap h-full">
                <div className="card-spotlight" />
                <div className="card p-5 h-full">
                  <div className="text-[15px] font-medium mb-1">Free. No catches.</div>
                  <p className="text-[14px] text-secondary leading-relaxed">
                    No ads, no subscriptions, no in-app purchases. The app is free and will stay that way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <section id="faq" className="px-6 py-24">
          <div className="max-w-[640px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight">
                Common questions.
              </h2>
            </div>
            <FAQ />
          </div>
        </section>
      </Reveal>

      {/* CTA */}
      <Reveal>
        <section className="px-6 py-24">
          <div className="max-w-[640px] mx-auto text-center">
            <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-4">
              Try it with a song you know well.
            </h2>
            <p className="text-[16px] text-secondary mb-10">
              Most people notice something within 30 seconds.
            </p>
            <a href="#" className="pill">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span>Download for iOS</span>
            </a>
          </div>
        </section>
      </Reveal>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-[var(--color-nav-border)]">
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[13px] text-muted">
            <span>&copy; {new Date().getFullYear()} Neurima</span>
            <Link href="/privacy/" className="hover:text-secondary transition-colors">Privacy</Link>
            <Link href="/terms/" className="hover:text-secondary transition-colors">Terms</Link>
          </div>
          <ThemeSwitcher />
        </div>
      </footer>
    </main>
  )
}
