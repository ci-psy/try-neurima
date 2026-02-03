'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

// Icon components defined outside Home for performance
const ExternalLinkIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
)

const APP_STORE_URL = 'APP_STORE_URL_PLACEHOLDER'

export default function Home() {
  const sectionsRef = useRef<HTMLElement[]>([])
  const [demoMode, setDemoMode] = useState<'focus' | 'calm'>('focus')
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check system preference and listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    // Scroll listener for header
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.3, rootMargin: '0px 0px -20% 0px' }
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="min-h-screen">
      {/* Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 py-4 transition-colors duration-300 ${scrolled ? 'header-blur' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image
                src={isDark ? "/icon-dark.png" : "/icon-light.png"}
                alt="Neurima"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium">Neurima</span>
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <button onClick={() => scrollToSection('experience')} className="opacity-60 hover:opacity-100 transition-opacity">
              Experience
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="opacity-60 hover:opacity-100 transition-opacity">
              How It Works
            </button>
            <button onClick={() => scrollToSection('research')} className="opacity-60 hover:opacity-100 transition-opacity">
              Results
            </button>
            <a href="/faq" className="opacity-60 hover:opacity-100 transition-opacity">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
            <a
              href={APP_STORE_URL}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Download
            </a>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop - solid background, no blur animation lag */}
        <div
          className="absolute inset-0 bg-[var(--background)]"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu content */}
        <nav className="relative h-full flex flex-col items-center justify-center gap-8 text-2xl font-medium">
          <button
            onClick={() => { scrollToSection('experience'); setMobileMenuOpen(false); }}
            className="opacity-60 hover:opacity-100 transition-opacity py-2"
          >
            Experience
          </button>
          <button
            onClick={() => { scrollToSection('how-it-works'); setMobileMenuOpen(false); }}
            className="opacity-60 hover:opacity-100 transition-opacity py-2"
          >
            How It Works
          </button>
          <button
            onClick={() => { scrollToSection('research'); setMobileMenuOpen(false); }}
            className="opacity-60 hover:opacity-100 transition-opacity py-2"
          >
            Results
          </button>
          <a
            href="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="opacity-60 hover:opacity-100 transition-opacity py-2"
          >
            FAQ
          </a>
          <a
            href={APP_STORE_URL}
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 inline-flex items-center gap-3 px-6 py-3 glass rounded-full text-base font-medium opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Download
          </a>
        </nav>
      </div>

      {/* Hero */}
      <section id="hero" ref={addToRefs} className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          {/* App Icon - switches based on color scheme */}
          <div className="w-28 h-28 mx-auto mb-8 rounded-[28px] overflow-hidden app-icon-glow">
            <Image
              src={isDark ? "/icon-dark.png" : "/icon-light.png"}
              alt="Neurima App Icon"
              width={112}
              height={112}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-6">
            Neurima
          </h1>

          <p className="text-xl md:text-2xl text-muted mb-12 leading-relaxed">
            Transform your music into wellness
          </p>

          <a
            href={APP_STORE_URL}
            className="inline-flex items-center gap-3 px-8 py-4 glass btn-glow rounded-full text-lg font-medium transition-all duration-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Download on the App Store
          </a>
        </div>
      </section>

      {/* Experience */}
      <section
        id="experience"
        ref={addToRefs}
        className="animate-on-scroll py-24 px-6"
      >
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-medium mb-5">
              What it feels like in 30 seconds
            </h2>
            <p className="text-muted mb-8 leading-relaxed">
              Neurima subtly offsets your stereo channels so your subconscious locks in.
              The result is a calmer, more focused state while you listen to the music you already love.
            </p>

            <div className="grid gap-4 mb-8">
              <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full circle-bg flex items-center justify-center">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <div>
                  <div className="font-medium">Immediate relief</div>
                  <div className="text-sm text-muted">Stress fades within a song or two.</div>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full circle-bg flex items-center justify-center">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <div>
                  <div className="font-medium">Deep focus</div>
                  <div className="text-sm text-muted">Mental noise quiets so work feels effortless.</div>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full circle-bg flex items-center justify-center">
                  <span className="text-sm font-semibold">3</span>
                </div>
                <div>
                  <div className="font-medium">Sleep support</div>
                  <div className="text-sm text-muted">Lower settings encourage natural relaxation.</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setDemoMode('focus')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${demoMode === 'focus' ? 'glass' : 'opacity-60 hover:opacity-100'}`}
              >
                Focus Mode
              </button>
              <button
                onClick={() => setDemoMode('calm')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${demoMode === 'calm' ? 'glass' : 'opacity-60 hover:opacity-100'}`}
              >
                Calm Mode
              </button>
            </div>
          </div>

          {/* Fake interactive UI */}
          <div className="relative">
            <div className="absolute -inset-6 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.25),transparent_60%)] opacity-60" />
            <div className="relative mx-auto w-[280px] sm:w-[320px] rounded-[32px] border border-[color:var(--border-color)] bg-[var(--background)] shadow-2xl overflow-hidden">
              <div className="h-10 flex items-center justify-center">
                <div className="w-24 h-3 rounded-full bg-[color:var(--border-color)]/60" />
              </div>
              <div className="px-5 pb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    <Image
                      src={isDark ? "/icon-dark.png" : "/icon-light.png"}
                      alt="Neurima"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Neurima</div>
                    <div className="text-xs text-muted">Now playing</div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs uppercase tracking-wider text-muted mb-2">Mode</div>
                  <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium">{demoMode === 'focus' ? 'Focus' : 'Calm'}</span>
                    <span className="text-xs text-muted">{demoMode === 'focus' ? '+18 ms offset' : '+6 ms offset'}</span>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs uppercase tracking-wider text-muted mb-2">Intensity</div>
                  <div className="glass rounded-xl px-4 py-4">
                    <div className="h-2 rounded-full bg-[color:var(--border-color)]">
                      <div className={`h-2 rounded-full ${demoMode === 'focus' ? 'bg-[rgba(120,119,198,0.6)] w-4/5' : 'bg-[rgba(120,119,198,0.4)] w-2/5'}`} />
                    </div>
                    <div className="flex justify-between text-xs text-muted mt-2">
                      <span>Calm</span>
                      <span>Focus</span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-4">
                  <div className="text-xs uppercase tracking-wider text-muted mb-3">Subtle shift</div>
                  <div className="flex items-end gap-1 h-10">
                    {[6, 10, 14, 18, 12, 16, 9, 13, 7, 15, 11, 17].map((h, i) => (
                      <div
                        key={i}
                        className={`w-2 rounded-full ${demoMode === 'focus' ? 'bg-[rgba(120,119,198,0.7)]' : 'bg-[rgba(120,119,198,0.4)]'}`}
                        style={{ height: `${h * 2}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 hidden md:block glass rounded-2xl px-4 py-2 text-xs text-muted">
              Tap to toggle modes
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section
        id="how-it-works"
        ref={addToRefs}
        className="animate-on-scroll py-24 px-6"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium mb-6">
            How It Works
          </h2>
          <p className="text-muted leading-relaxed">
            Neurima applies a tiny, fixed timing offset between the left and right channels of your music.
            You won&apos;t consciously notice it, but your brain does. That subtle mismatch increases subconscious
            processing, which quiets stress signals and opens a calmer, more focused state — all while you keep
            listening to the songs you already love.
          </p>
        </div>
      </section>

      {/* Research Stats */}
      <section
        id="research"
        ref={addToRefs}
        className="animate-on-scroll py-24 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-6">
            Results & Credibility
          </h2>
          <p className="text-center text-muted mb-12 max-w-2xl mx-auto">
            Evidence from early studies and measured user outcomes.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-2xl md:text-3xl font-semibold mb-2">80-95%</div>
              <div className="text-xs md:text-sm text-muted">Stress Threshold Increase</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-2xl md:text-3xl font-semibold mb-2">71</div>
              <div className="text-xs md:text-sm text-muted">Study Participants</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-2xl md:text-3xl font-semibold mb-2">Safe</div>
              <div className="text-xs md:text-sm text-muted">Zero Adverse Effects</div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-xl md:text-2xl font-semibold mb-2">Measurable</div>
              <div className="text-xs md:text-sm text-muted">Consumer EEG Verified</div>
            </div>
          </div>

          {/* Origin & Story */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-medium mb-3">Origin</h3>
              <p className="text-muted text-sm leading-relaxed">
                IMA was created by <span className="text-[color:var(--foreground)]">Kyrtin Atreides</span>, an AI researcher whose work spans psychoacoustics, ethics, and biotech.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-medium mb-3">Born from Necessity</h3>
              <p className="text-muted text-sm leading-relaxed">
                Suffering from migraines since childhood with no cure led him to create his own.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://www.researchgate.net/publication/340902239"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted hover:text-[color:var(--foreground)] transition-colors"
            >
              Read the research paper
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        ref={addToRefs}
        className="animate-on-scroll py-24 px-6"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium mb-6">
            Ready to transform your music?
          </h2>
          <p className="text-muted mb-8">
            Download Neurima and experience IMA for yourself.
          </p>
          <a
            href={APP_STORE_URL}
            className="inline-flex items-center gap-3 px-8 py-4 glass btn-glow rounded-full text-lg font-medium transition-all duration-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Download on the App Store
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-[color:var(--border-color)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <Image
                    src={isDark ? "/icon-dark.png" : "/icon-light.png"}
                    alt="Neurima"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium">Neurima</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Transform your music into wellness through Imperceptible Musical Augmentation.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-medium mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-muted">
                <li>
                  <button onClick={() => scrollToSection('experience')} className="hover:text-[color:var(--foreground)] transition-colors">
                    Experience
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[color:var(--foreground)] transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <a href="/faq" className="hover:text-[color:var(--foreground)] transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href={APP_STORE_URL} className="hover:text-[color:var(--foreground)] transition-colors inline-flex items-center gap-1">
                    Download
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            {/* Research */}
            <div>
              <h4 className="font-medium mb-4 text-sm">Research</h4>
              <ul className="space-y-3 text-sm text-muted">
                <li>
                  <a
                    href="https://www.researchgate.net/publication/340902239"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[color:var(--foreground)] transition-colors inline-flex items-center gap-1"
                  >
                    IMA Research Paper
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://kyrtinatreides.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[color:var(--foreground)] transition-colors inline-flex items-center gap-1"
                  >
                    Kyrtin Atreides
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <button onClick={() => scrollToSection('research')} className="hover:text-[color:var(--foreground)] transition-colors">
                    Study Results
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-muted">
                <li>
                  <a href="https://tryneurima.com/privacy/" className="hover:text-[color:var(--foreground)] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://tryneurima.com/terms/" className="hover:text-[color:var(--foreground)] transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-[color:var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted">
              &copy; {new Date().getFullYear()} Neurima. All rights reserved.
            </div>
            <div className="text-sm text-muted">
              Made with care for your wellbeing.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
