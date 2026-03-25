'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Are there any subscription fees or in-app purchases?',
    a: "Nope. We believe wellness tools should be accessible to everyone. Neurima is completely free with no ads, no subscriptions, and no in-app purchases. Your wellbeing shouldn't come with a price tag.",
  },
  {
    q: 'Is this binaural beats?',
    a: 'No. Unlike binaural beats which use simple tones at slightly different frequencies, Neurima applies a fixed desynchronization at the audio sample level to any music you choose. This engages your subconscious audio processing, essentially doubling the resources devoted to what you hear.',
  },
  {
    q: 'What does Circadian do?',
    a: 'Circadian bypasses your paths and dynamically adjusts the desynchronization based on your circadian rhythm. Higher values promote alertness during the day, lower values encourage relaxation at night. It uses your wake time and your energy chronotype to determine the desynchronization throughout the day.',
  },
  {
    q: 'What effects can I expect?',
    a: 'In research studies, effects were demonstrated within the duration of a single song. Participants reported relaxation, improved focus, faster sleep onset with calming music, and a natural meditative state while listening. The underlying research suggests potential neuroplasticity benefits with long-term use.',
  },
  {
    q: 'How do I maximize the benefits?',
    a: 'Focus intently while listening, use high-quality audio formats (ALAC, FLAC, or high-bitrate files), and consider using wired headphones for the best signal quality. Varying your music selection helps maintain effectiveness over time.',
  },
  {
    q: 'Why do effects diminish with the same songs?',
    a: 'Every modified audio source searches for a new optimized processing path, and repeated exposure to the same source reinforces a specific pathway. Variety keeps the effect fresh by engaging new neural pathways, so mix up your listening regularly.',
  },
  {
    q: 'Does it work with streaming services?',
    a: "Unfortunately, no. Streaming services use content protection that prevents real-time audio processing at the system level - even for temporary, ephemeral processing that never stores anything.\n\nBuilding our own streaming integration would require licensing agreements with every major label and platform simultaneously, which isn't feasible for an independent app.\n\nThat said, if a major streaming platform wanted to integrate this functionality, we'd be happy to assist - and it wouldn't cost them anything. Wellness should be accessible.\n\nFor now, the best approach is to bring your own music: import audio files via the Files app, or use DRM-free tracks from your library (purchased or matched via iCloud Music Library).",
  },
  {
    q: 'What headphones should I use?',
    a: "Any stereo headphones will work, but higher quality audio delivery can enhance the effect - even for frequencies outside the consciously discernible range.\n\nFor best results, consider a USB-C DAC adapter that supports hi-res audio (96kHz or higher), paired with quality wired headphones and hi-res audio files. USB DACs can deliver true high-resolution output on iOS.\n\nImportant note about Bluetooth: iOS only supports the AAC codec for Bluetooth audio, which caps at 44.1-48kHz regardless of what your headphones support. Hi-res Bluetooth codecs like LDAC and aptX HD are only available on Android. Bluetooth still works great for convenience, but for maximum audio quality, wired with a USB DAC is the way to go.\n\nFor reference: most Bluetooth headphones max out at 44.1\u201348kHz. A good USB DAC can deliver 96kHz, 192kHz, or even higher.",
  },
  {
    q: 'Does Neurima support hi-res audio?',
    a: "Yes! Neurima fully supports high-resolution audio files (ALAC, FLAC) at sample rates up to 384kHz.\n\nFor USB DACs: Neurima automatically negotiates the highest sample rate your DAC supports. Once a high rate is achieved (like 96kHz), it stays there to avoid iOS audio quirks with rate switching. Lower-rate tracks are upsampled with high quality.\n\nFor Bluetooth: iOS limits all Bluetooth audio to 44.1-48kHz using AAC codec, regardless of headphone capabilities. Your hi-res files still play correctly, just resampled to the Bluetooth limit.\n\nFor Mac 3.5mm output: Macs have built-in DACs in their headphone jacks that typically support up to 96kHz - no external DAC needed for hi-res with wired headphones.\n\nNote: The desync effect requires headphones (stereo separation to each ear). Playing through speakers won't produce the intended effect, though you can still enjoy your music.",
  },
  {
    q: 'What do the desync numbers mean?',
    a: "The desync value represents a timing difference in audio samples between your left and right ears. Higher numbers create a stronger effect.\n\nThe defaults are 60 for lossy audio (MP3, AAC) and 120 for lossless (FLAC, ALAC). These values were chosen because lossless files typically have higher sample rates (96kHz vs 44.1kHz). Since the desync is measured in samples, not time, doubling the sample rate means you need roughly double the desync to achieve a similar perceptual effect. This keeps the experience consistent regardless of audio quality.",
  },
  {
    q: 'Will this damage my music files?',
    a: 'No. Neurima uses real-time digital signal processing (DSP) that only affects audio as it plays. Your original files are never modified, altered, or even written to. The desynchronization is applied in memory during playback and discarded immediately after. Your music library remains completely untouched.',
  },
  {
    q: 'Will this hurt me?',
    a: "No. In the research study, all 71 participants had zero adverse events. The audio desync is imperceptible to your conscious hearing - you won't notice any difference in how your music sounds. Neurima uses non-invasive audio processing only; there's no radiation, no electrical stimulation, nothing but slightly modified audio timing that your subconscious processes naturally.",
  },
  {
    q: 'Are there long-term benefits?',
    a: "Beyond the relaxation and focus that research participants have reported, regular use may support neuroplasticity - your brain's ability to form new neural pathways. Listening to varied music with Neurima engages your auditory processing in novel ways, potentially strengthening cognitive flexibility over time.\n\nNew music builds new pathways, while familiar music reinforces existing ones. This is why variety in your listening helps maintain and compound benefits with continued use.",
  },
  {
    q: "What's the difference between Type-A and Type-B?",
    a: "IMA Type-A uses standard stereo headphones to deliver the desync effect through your ear canals. This is the mode available on iOS and works with any headphones, including haptic devices like bone conduction headphones.\n\nIMA Type-B adds a haptic device (tested with bone conduction) as a second output, delivering the desynchronization through both air conduction (regular headphones) and haptic pathways simultaneously. This dual-pathway approach may enhance the neurological effect. Other haptic interfaces (wearables, tactile transducers) could theoretically work too.\n\nType-B requires simultaneous audio output to two devices (e.g., USB headphones + Bluetooth bone conduction). iOS does not currently support Bluetooth in its multiRoute audio category, so dual-output is limited to wired configurations or iOS audio sharing features.\n\nType-B will be available on macOS, which supports Aggregate Devices for multi-output audio routing.",
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-2 max-w-[600px]">
      {faqs.map((faq, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="card-wrap card-hover">
            <div className="card">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
              >
                <span className="text-[15px] font-medium leading-snug">{faq.q}</span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id={`faq-panel-${i}`}
                role="region"
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-[14px] text-secondary leading-relaxed whitespace-pre-line">{faq.a}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
