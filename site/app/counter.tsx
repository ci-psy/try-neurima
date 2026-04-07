'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  end: number
  suffix?: string
  decimals?: number
  duration?: number
  label: string
}

export function Counter({ end, suffix = '', decimals = 0, duration = 1600, label }: CounterProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          observer.unobserve(el)

          const start = performance.now()
          const step = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(eased * end)
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value)

  return (
    <div ref={ref}>
      <div className="text-[32px] sm:text-[42px] font-semibold tracking-tight leading-none mb-2">
        {display}{suffix}
      </div>
      <div className="text-[13px] text-muted">{label}</div>
    </div>
  )
}
