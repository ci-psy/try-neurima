'use client'

import { Reveal } from './components'
import { AudioPlayer, type AudioVariant } from './audio-player'

const homeComparisonVariants: AudioVariant[] = [
  {
    id: 'original',
    title: 'Original',
    shortLabel: 'Original',
    src: '/stellardrone-billions-and-billions-original.flac',
    downloadUrl: '/stellardrone-billions-and-billions-original.flac',
    note: 'Original reference file.',
  },
  {
    id: 'ima-type-a',
    title: 'IMA Type-A',
    shortLabel: 'IMA Type-A',
    src: '/stellardrone-billions-and-billions-ima-type-a-lch-desynch-20-samples.flac',
    downloadUrl: '/stellardrone-billions-and-billions-ima-type-a-lch-desynch-20-samples.flac',
    note: 'Type-A comparison file with a 20-sample left-channel desync.',
  },
]

const hasFullHomeComparison = homeComparisonVariants.every((variant) => variant.src && variant.downloadUrl)

export function HomeAudioDemo() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-[960px] mx-auto">
        <div className="mb-10">
          <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-5">
            Experience it for yourself
          </h2>
          <p className="text-[16px] text-secondary leading-[1.75] max-w-[600px]">
            {hasFullHomeComparison
              ? 'Compare the original clip with the IMA Type-A version. Use headphones.'
              : 'Listen to the IMA Type-A demo. The original comparison slot is ready and will appear here once the source file is staged.'}
          </p>
        </div>
        <Reveal>
          <div className="card-wrap max-w-[760px]">
            <div className="card-spotlight" />
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-2 text-muted mb-4">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                </svg>
                <span className="text-[13px]">Headphones required</span>
              </div>
              <AudioPlayer
                label="Stellardrone comparison demo"
                variants={homeComparisonVariants}
              />
              <p className="text-[12px] text-muted leading-relaxed mt-4 max-w-[560px]">
                The web demo switches between rendered files. In the app, Neurima applies IMA during playback, so the handoff is smoother.
              </p>
            </div>
          </div>
        </Reveal>
        <p className="text-[12px] text-muted mt-3">
          Stellardrone, &ldquo;Billions And Billions&rdquo; from{' '}
          <a href="https://stellardrone.bandcamp.com/album/a-moment-of-stillness" className="underline hover:text-secondary transition-colors" target="_blank" rel="noopener noreferrer">
            A Moment Of Stillness
          </a>{' '}
          &middot;{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline hover:text-secondary transition-colors" target="_blank" rel="noopener noreferrer">
            CC BY 4.0
          </a>{' '}
          &middot; IMA Type-A version is a modified derivative.
        </p>
      </div>
    </section>
  )
}
