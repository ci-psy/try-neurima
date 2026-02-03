'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQ_DATA = [
  {
    question: "Is this binaural beats?",
    answer: "No. Unlike binaural beats which use simple tones at slightly different frequencies, Neurima applies a fixed offset at the audio sample level to any music you choose. This engages your subconscious audio processing, essentially doubling the resources devoted to what you hear."
  },
  {
    question: "What does Circadian Optimization do?",
    answer: "Circadian Optimization dynamically adjusts the offset based on your circadian rhythm. Higher values promote alertness, lower values encourage relaxation. It uses your wake-up time to determine where you are on your circadian curve."
  },
  {
    question: "What effects can I expect?",
    answer: "Most users experience stress reduction within 30 seconds to 3 minutes. With continued use, you may notice improved focus, better sleep quality, and a natural meditative state while listening. Long-term use may support neuroplasticity benefits."
  },
  {
    question: "How do I maximize the benefits?",
    answer: "Focus intently while listening, use high-quality audio formats (ALAC, FLAC, or high-bitrate files), and consider using wired headphones for the best signal quality. Varying your music selection helps maintain effectiveness over time."
  },
  {
    question: "Why do effects diminish with the same songs?",
    answer: "Your brain naturally attenuates repetitive stimuli within 24-48 hours. This is why Neurima works with your own music library. Variety keeps the effect fresh, so mix up your listening regularly."
  },
  {
    question: "Does it work with streaming services?",
    answer: "Currently, Neurima requires local audio files due to how streaming services protect their audio. We're exploring options for future streaming support."
  },
  {
    question: "What headphones should I use?",
    answer: "Wired headphones are recommended for the most reliable audio signal. Any quality headphones or earbuds will work. Bone conduction headphones can also be effective for some users."
  }
]

const APP_STORE_URL = 'APP_STORE_URL_PLACEHOLDER'

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium mb-2">FAQ</h1>
            <p className="text-muted">
              Everything you need to know about Neurima.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            Back to home
          </Link>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, index) => (
            <div key={faq.question} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 flex-shrink-0 text-muted transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 text-muted leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href={APP_STORE_URL}
            className="inline-flex items-center gap-3 px-6 py-3 glass btn-glow rounded-full text-base font-medium transition-all duration-300"
          >
            Download on the App Store
          </a>
        </div>
      </div>
    </main>
  )
}
