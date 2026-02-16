'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

/* ── Mouse position tracker + ambient glow ── */
export function MouseGlow() {
  useEffect(() => {
    const glow = document.getElementById('cursor-glow')
    if (!glow) return

    const handler = ({ clientX, clientY }: MouseEvent) => {
      glow.style.setProperty('--gx', `${clientX}px`)
      glow.style.setProperty('--gy', `${clientY}px`)

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

  return (
    <div
      id="cursor-glow"
      className="glow pointer-events-none fixed w-[500px] h-[500px] rounded-full blur-3xl"
    />
  )
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}
