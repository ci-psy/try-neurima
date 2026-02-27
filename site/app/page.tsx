import { Footer, Reveal } from './components'
import { Counter } from './counter'
import { AudioPlayer } from './audio-player'
import AppShowcase from './app-showcase'

export default function Home() {
  return (
    <main id="main">
      {/* Hero */}
      <section id="hero" className="min-h-[100svh] flex flex-col justify-center px-6">
        <div className="animate-fade-up max-w-[960px] mx-auto w-full">
          <h1 className="text-[clamp(36px,6vw,64px)] font-semibold tracking-tight leading-[1.08] mb-6">
            Same music.
            <br />
            Different mind.
          </h1>
          <p className="text-[17px] text-secondary leading-relaxed max-w-[600px] mb-10">
            You won't hear it. Your subconscious will.
          </p>
          <a href="#" className="pill pill-hero" aria-label="Download Neurima for iOS">
            <span className="pill-hero-icon">
              <svg className="w-[18px] h-[18px] shrink-0 block" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </span>
            <span className="pill-hero-text">Download for iOS</span>
            <span className="pill-hero-arrow">
              <svg className="w-6 h-6 shrink-0 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 16 16 12 12 8"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </span>
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-24">
        <div className="max-w-[960px] mx-auto">
          <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-10">
            How it works
          </h2>
          <div className="flex flex-col gap-6 text-[16px] text-secondary leading-[1.75] max-w-[600px]">
            <Reveal><p>Binaural beats alter frequency.</p></Reveal>
            <Reveal><p>Reduce stress. Sharpen focus.</p></Reveal>
            <Reveal><p>They're audible.</p></Reveal>
            <Reveal><p>This limits their benefit.</p></Reveal>
            <div className="h-4" />
            <Reveal><p>Neurima alters time.</p></Reveal>
            <Reveal><p>Imperceptible Musical Augments.</p></Reveal>
            <Reveal><p>Below awareness and interference.</p></Reveal>
            <Reveal><p>No ceiling.</p></Reveal>
          </div>
        </div>
      </section>

      {/* Research */}
      <section className="px-6 py-24">
        <div className="max-w-[960px] mx-auto">
          <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-10">
            Published research
          </h2>
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-14 py-4">
              <Counter end={71} label="Participants" />
              <Counter end={0} label="Adverse events" />
              <Counter end={86.67} suffix="%" decimals={2} label="Reported relaxation" />
              <Counter end={80} suffix="%+" label="More resilience to stress" />
            </div>
            <a href="https://www.researchgate.net/publication/340902239_Neurological_Benefits_of_Imperceptible_Desynchronization_at_the_Audio_Sample_Level" className="pill-ghost mt-8 inline-flex" target="_blank" rel="noopener noreferrer" aria-label="Read the paper (opens in new tab)">
              Read the paper
              <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="max-w-[960px] mx-auto">
          <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-10">
            No fine print
          </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <Reveal className="h-full stagger-1">
                <div className="card-wrap h-full">
                  <div className="card-spotlight" />
                  <div className="card p-5 h-full">
                    <div className="text-[15px] font-medium mb-1">Your music, unchanged</div>
                    <p className="text-[14px] text-secondary leading-relaxed">
                      No synthetic tones. No white noise. Neurima works with songs in your library.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal className="h-full stagger-2">
                <div className="card-wrap h-full">
                  <div className="card-spotlight" />
                  <div className="card p-5 h-full">
                    <div className="text-[15px] font-medium mb-1">Nothing leaves your device</div>
                    <p className="text-[14px] text-secondary leading-relaxed">
                      No accounts. No analytics. No servers. All processing happens on device.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal className="h-full stagger-3">
                <div className="card-wrap h-full">
                  <div className="card-spotlight" />
                  <div className="card p-5 h-full">
                    <div className="text-[15px] font-medium mb-1">Free, no catches</div>
                    <p className="text-[14px] text-secondary leading-relaxed">
                      No ads. No subscriptions. No in-app purchases. Free means free.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
        </div>
      </section>

      {/* Audio demo */}
      <section className="px-6 py-24">
        <div className="max-w-[960px] mx-auto">
          <div className="mb-10">
            <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-5">
              Hear it for yourself
            </h2>
            <p className="text-[16px] text-secondary leading-[1.75] max-w-[600px]">
              This recording has a 20-sample shift. Put on headphones. Try to spot it.
            </p>
          </div>
          <Reveal>
            <div className="card-wrap max-w-[600px]">
              <div className="card-spotlight" />
              <div className="card p-6 sm:p-8">
                <div className="flex items-center gap-2 text-muted mb-4">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                  </svg>
                  <span className="text-[13px]">Headphones required</span>
                </div>
                <AudioPlayer
                  src="/Chopin-waltz-op64-no1_L20.mp3"
                  label="Chopin Waltz demo with 20-sample desync"
                  downloadUrl="/Chopin-waltz-op64-no1_L20.mp3"
                />
              </div>
            </div>
          </Reveal>
          <p className="text-[12px] text-muted mt-3">
            Frédéric Chopin, Waltz in D&#x266d; Major, Op. 64 No. 1 &middot;{' '}
            <a href="https://commons.wikimedia.org/wiki/File:Waltz_Op._64_no._1_in_D_flat_major.mp3" className="underline hover:text-secondary transition-colors" target="_blank" rel="noopener noreferrer">
              Wikimedia Commons
            </a>{' '}(CC0)
          </p>
        </div>
      </section>

      {/* App showcase */}
      <AppShowcase />

      <Footer />
    </main>
  )
}
