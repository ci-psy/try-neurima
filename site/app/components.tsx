'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

/* ── Site nav (tab bar) ── */
export function Nav() {
  const pathname = usePathname()
  const isStory = pathname?.startsWith('/story')
  const isFaq = pathname?.startsWith('/faq')
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)

      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
    <a href="#main" className="skip-to-content">Skip to content</a>
    <nav className={`sticky top-0 z-50 px-6 transition-[backdrop-filter,background,border-color] duration-300 ${scrolled ? 'backdrop-blur-xl bg-[var(--color-nav-bg)] border-b border-[var(--color-nav-border)]' : 'border-b border-transparent'}`}>
      <div className="flex items-center justify-between py-3 max-w-[960px] mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <Image alt="Neurima" src="/icon-dark.png" width={28} height={28} className="w-full h-full object-cover dark:block hidden" />
            <Image alt="Neurima" src="/icon-light.png" width={28} height={28} className="w-full h-full object-cover dark:hidden block" />
          </div>
          <span className="text-[15px] font-medium">Neurima</span>
        </Link>
        <div className="flex items-center gap-4 text-[14px]">
          <Link href="/story/" className={`flex items-center gap-1.5 transition-colors ${isStory ? 'text-[var(--color-fg)]' : 'text-secondary hover:text-[var(--color-fg)]'}`}>
            <svg className="w-[15px] h-[15px] hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Story
          </Link>
          <Link href="/faq/" className={`flex items-center gap-1.5 transition-colors ${isFaq ? 'text-[var(--color-fg)]' : 'text-secondary hover:text-[var(--color-fg)]'}`}>
            <svg className="w-[15px] h-[15px] hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            FAQs
          </Link>
          <a href="#" className="pill-ghost" aria-label="Download Neurima for iOS">
            <svg className="w-[15px] h-[15px] shrink-0 block" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Download
          </a>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-fg)] transition-opacity duration-300"
        style={{ width: `${progress * 100}%`, opacity: scrolled ? 0.15 : 0 }}
        aria-hidden
      />
    </nav>
    </>
  )
}

/* ── Site footer ── */
export function Footer() {
  const pathname = usePathname()

  const footerLinks = [
    { href: '/story/', label: 'Story' },
    { href: '/faq/', label: 'FAQs' },
    { href: '/privacy/', label: 'Privacy' },
    { href: '/terms/', label: 'Terms' },
  ] as const

  return (
    <footer className="px-6 py-10 border-t border-[var(--color-nav-border)]">
      <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-[13px] text-muted">
          <span>&copy; {new Date().getFullYear()} Neurima</span>
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${pathname?.startsWith(href.replace(/\/$/, '')) ? 'text-secondary' : 'hover:text-secondary'}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <ThemeSwitcher />
      </div>
    </footer>
  )
}

/* ── Card spotlight tracker ── */
export function CardSpotlight() {
  useEffect(() => {
    const handler = ({ clientX, clientY }: MouseEvent) => {
      const cards = document.querySelectorAll('.card-spotlight')
      for (const card of cards) {
        const el = card as HTMLElement
        const bcr = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${clientX - bcr.left}px`)
        el.style.setProperty('--my', `${clientY - bcr.top}px`)
      }
    }

    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return null
}

/* ── Segmented theme switcher (footer) ── */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const options = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'Auto' },
  ] as const

  return (
    <div className="theme-switcher" suppressHydrationWarning>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`theme-switcher-option ${theme === opt.value ? 'active' : ''}`}
          aria-pressed={theme === opt.value}
          suppressHydrationWarning
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ── Scroll-triggered reveal ── */
export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveal = () => {
      el.classList.add('revealed')
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    // Immediately reveal elements already in the viewport
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal()
    } else {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}
