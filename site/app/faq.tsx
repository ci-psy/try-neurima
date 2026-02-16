'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Is this binaural beats?',
    a: 'No. Binaural beats require specific synthetic tones. IMA works with any music because the desynchronization happens at the sample level, not the frequency level.',
  },
  {
    q: 'Is it safe?',
    a: 'No adverse effects were reported across any stage of testing. The desynchronization is too small to consciously hear.',
  },
  {
    q: 'What will I notice?',
    a: 'Participants in the pilot study self-reported reduced stress within 30 seconds to 3 minutes. Individual experiences vary.',
  },
  {
    q: 'Does it work with streaming?',
    a: "No. DRM prevents real-time audio processing at the system level. Use DRM-free tracks or files purchased through iTunes.",
  },
  {
    q: 'Does it modify my files?',
    a: 'No. Desynchronization is applied in memory during playback and discarded immediately. Your library stays untouched.',
  },
  {
    q: 'What does it cost?',
    a: 'Nothing. No ads, no subscriptions, no in-app purchases.',
  },
  {
    q: 'What is Circadian mode?',
    a: 'It adjusts desynchronization throughout the day based on your wake time. Stronger during the day, gentler at night.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-2">
      {faqs.map((faq, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="card-wrap card-hover">
            <div className="card">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
              >
                <span className="text-[15px] font-medium leading-snug">{faq.q}</span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-[14px] text-secondary leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
