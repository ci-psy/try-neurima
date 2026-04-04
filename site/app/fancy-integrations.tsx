'use client'

import { useEffect, useRef } from 'react'
import VerticalCutReveal, { VerticalCutRevealRef } from './fancy/vertical-cut-reveal'
import NumberTicker, { NumberTickerRef } from './fancy/number-ticker'
import VariableFontHoverByLetter from './fancy/variable-font-hover-by-letter'
import CenterUnderline from './fancy/underline-center'
import { TextHighlighter } from './fancy/text-highlighter'

/* ── Hero headline with animated highlight on "Mind" ── */
export function HeroHeadline() {
  return (
    <>
      Of Sound{' '}
      <TextHighlighter
        triggerType="auto"
        highlightColor="var(--color-fg)"
        className="text-[var(--color-bg)]"
        direction="ltr"
        transition={{ type: "spring", duration: 1, delay: 0.4, bounce: 0 }}
      >
        Mind
      </TextHighlighter>
    </>
  )
}

/* ── Section heading with scroll-triggered vertical cut reveal ── */
export function SectionHeading({ text }: { text: string }) {
  const ref = useRef<VerticalCutRevealRef>(null)
  const sentinelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.startAnimation()
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span className="relative">
      <span ref={sentinelRef} className="pointer-events-none absolute inset-0" aria-hidden />
      <VerticalCutReveal
        ref={ref}
        autoStart={false}
        splitBy="words"
        staggerDuration={0.08}
        staggerFrom="first"
        containerClassName="justify-center"
      >
        {text}
      </VerticalCutReveal>
    </span>
  )
}

/* ── Stat number with scroll-triggered count-up ── */
export function StatNumber({ from, target }: { from: number; target: number }) {
  const ref = useRef<NumberTickerRef>(null)
  const sentinelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.startAnimation()
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span className="relative">
      <span ref={sentinelRef} className="pointer-events-none absolute inset-0" aria-hidden />
      <NumberTicker
        ref={ref}
        from={from}
        target={target}
        autoStart={false}
        transition={{ duration: 2, type: "tween", ease: "easeOut" }}
      />
    </span>
  )
}

/* ── Nav link with variable font weight on hover ── */
export function NavLetterSwap({ label }: { label: string }) {
  return (
    <VariableFontHoverByLetter
      label={label}
      fromFontVariationSettings="'wght' 400"
      toFontVariationSettings="'wght' 700"
      staggerDuration={0.03}
      transition={{ type: "spring", duration: 0.5 }}
    />
  )
}

/* ── Animated underline link ── */
export function UnderlineLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      <CenterUnderline>{children}</CenterUnderline>
    </a>
  )
}
