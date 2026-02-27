'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'

function DeviceMockup({ darkSrc, lightSrc, alt, label, width = 200 }: {
  darkSrc: string
  lightSrc: string
  alt: string
  label: string
  width?: number
}) {
  return (
    <div className="flex flex-col items-center -space-y-6">
      <div style={{ width }}>
        <Image src={darkSrc} alt={alt} width={621} height={1268} className="w-full h-auto dark:block hidden" />
        <Image src={lightSrc} alt={alt} width={621} height={1268} className="w-full h-auto dark:hidden block" />
      </div>
      <span className="text-[16px] text-secondary">{label}</span>
    </div>
  )
}

export default function AppShowcase() {
  const ref = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const centerY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [30, -30])
  const flankY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [45, -15])
  const mobileY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [10, -10])

  return (
    <section ref={ref} className="px-6 py-24 sm:overflow-hidden">
      <div className="max-w-[960px] mx-auto">
        <h2 className="text-[clamp(26px,4vw,36px)] font-semibold tracking-tight leading-tight mb-12">
          What you'll see
        </h2>

        {/* Desktop: staggered fan */}
        <div className="hidden sm:flex justify-center items-start gap-6">
          <motion.div style={{ y: flankY, rotate: -3 }} className="mt-10">
            <DeviceMockup
              darkSrc="/screenshots/viz_dark.png"
              lightSrc="/screenshots/viz-light.png"
              alt="Neurima visualizer view"
              label="Visualizer"
              width={260}
            />
          </motion.div>

          <motion.div style={{ y: centerY }}>
            <DeviceMockup
              darkSrc="/screenshots/player_dark.png"
              lightSrc="/screenshots/player_light.png"
              alt="Neurima player view"
              label="Player"
              width={280}
            />
          </motion.div>

          <motion.div style={{ y: flankY, rotate: 3 }} className="mt-10">
            <DeviceMockup
              darkSrc="/screenshots/circadian_dark.png"
              lightSrc="/screenshots/circadian_light.png"
              alt="Neurima circadian view"
              label="Circadian"
              width={260}
            />
          </motion.div>
        </div>

        {/* Mobile: horizontal snap scroll */}
        <motion.div style={{ y: mobileY }} className="showcase-phones sm:hidden">
          <DeviceMockup
            darkSrc="/screenshots/viz_dark.png"
            lightSrc="/screenshots/viz-light.png"
            alt="Neurima visualizer view"
            label="Visualizer"
            width={180}
          />
          <DeviceMockup
            darkSrc="/screenshots/player_dark.png"
            lightSrc="/screenshots/player_light.png"
            alt="Neurima player view"
            label="Player"
            width={180}
          />
          <DeviceMockup
            darkSrc="/screenshots/circadian_dark.png"
            lightSrc="/screenshots/circadian_light.png"
            alt="Neurima circadian view"
            label="Circadian"
            width={180}
          />
        </motion.div>
      </div>
    </section>
  )
}
