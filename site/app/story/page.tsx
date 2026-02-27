'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Footer } from '../components'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function StoryPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollHintVisible, setScrollHintVisible] = useState(true)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reveals = document.querySelectorAll('.reveal')
      reveals.forEach(el => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => el.classList.add('revealed'),
        })
      })
    }, containerRef)
    
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 60) setScrollHintVisible(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main id="main" ref={containerRef} className="min-h-screen bg-[var(--color-bg)]">

      <div
        className={`scroll-hint ${scrollHintVisible ? '' : 'scroll-hint-hidden'}`}
        aria-hidden
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <div className="w-full px-6">
        <div className="pt-[17.5vh] max-w-[960px] mx-auto text-left flex flex-col gap-12 sm:gap-20 pb-24 animate-page-enter">
          
          <h1 className="reveal text-[clamp(24px,4vw,32px)] font-semibold text-[var(--color-fg)] leading-tight max-w-[640px]">
            A Short Story
          </h1>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            In 1839, <a href="https://en.wikipedia.org/wiki/Heinrich_Wilhelm_Dove" target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-fg)] transition-colors">Heinrich Wilhelm Dove</a> made a discovery.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            He played slightly different frequencies into the left and right ears.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            He proved the brain resolves this difference subconsciously.
          </p>
          
          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            This became the basis for binaural beats.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            <a href="https://pubmed.ncbi.nlm.nih.gov/30073406/" target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-fg)] transition-colors">Clinically proven</a> to deepen relaxation and sharpen focus.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            For nearly two centuries, the science remained largely unchanged.
          </p>
          
          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Binaural beats are audible.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Conscious hearing triggers cognitive interference.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            This limits what they can deliver.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            In 2015, <a href="https://kyrtinatreides.com/" target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-fg)] transition-colors">Kyrtin Atreides</a> searched for a different approach.
          </p>
          
          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            He had struggled with chronic migraines his entire life.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            He thought the deviation could stay entirely subconscious.
          </p>
          
          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            No conscious interference means no limit on benefits.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            That insight became IMA.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Imperceptible Musical Augments.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Binaural beats alter frequency.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            IMA alters time.
          </p>
          
          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Shifting one audio channel creates a deviation.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            The deviation is consciously undetectable.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            But the subconscious notices.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            It merges both signals into one.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Lower shifts address stress.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Higher shifts increase focus.
          </p>
          
          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Extended listening promotes neural plasticity.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            This reopens a window that normally closes with age.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            EEG readings validated this.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Across 71 participants.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Kyrtin shared the research for free.
          </p>
          
          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Labs ignored it.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Too simple to sell.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Anyone with an audio editor can do it.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            But the friction is high.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Neurima removes the friction.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Processing is instant.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            A small gift for you.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Benefits remain where they belong.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Public domain.
          </p>

          <p className="reveal text-[clamp(16px,2vw,18px)] font-normal text-secondary leading-relaxed max-w-[640px]">
            Free.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
