'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type AudioVariant = {
  id: string
  title: string
  shortLabel: string
  src?: string
  downloadUrl?: string
  note?: string
}

interface AudioPlayerProps {
  label: string
  variants: AudioVariant[]
  onStateChange?: (state: {
    currentTime: number
    duration: number
    playing: boolean
    activeVariantId: string
  }) => void
}

const FADE_OUT_MS = 70
const FADE_IN_MS = 90
const FADE_OUT_S = FADE_OUT_MS / 1000
const FADE_IN_S = FADE_IN_MS / 1000

function clampVolume(value: number) {
  return Math.max(0, Math.min(1, value))
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function formatTime(s: number) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function waitForMetadata(audio: HTMLAudioElement) {
  if (audio.readyState >= 1 && Number.isFinite(audio.duration)) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    const onLoaded = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Could not load audio metadata.'))
    }
    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('error', onError)
    }

    audio.addEventListener('loadedmetadata', onLoaded, { once: true })
    audio.addEventListener('error', onError, { once: true })
  })
}

function fadeAudio(
  audio: HTMLAudioElement,
  fromVolume: number,
  toVolume: number,
  durationMs: number
) {
  return new Promise<void>((resolve) => {
    const safeFrom = clampVolume(fromVolume)
    const safeTo = clampVolume(toVolume)

    if (durationMs <= 0) {
      audio.volume = safeTo
      resolve()
      return
    }

    const start = performance.now()

    const step = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / durationMs))
      const nextVolume = safeFrom + (safeTo - safeFrom) * progress
      audio.volume = clampVolume(nextVolume)

      if (progress < 1) {
        requestAnimationFrame(step)
        return
      }

      audio.volume = safeTo
      resolve()
    }

    requestAnimationFrame(step)
  })
}

export function AudioPlayer({ label, variants, onStateChange }: AudioPlayerProps) {
  const readyVariants = useMemo(
    () => variants.filter((variant) => Boolean(variant.src && variant.downloadUrl)),
    [variants]
  )

  const initialVariantId = readyVariants[0]?.id ?? variants[0]?.id ?? ''

  const [activeVariantId, setActiveVariantId] = useState(initialVariantId)
  const [activeAudioIndex, setActiveAudioIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [switchingToVariantId, setSwitchingToVariantId] = useState<string | null>(null)

  const primaryAudioRef = useRef<HTMLAudioElement>(null)
  const secondaryAudioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const activeAudioIndexRef = useRef(0)
  const switchingRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const trackGainsRef = useRef<[GainNode | null, GainNode | null]>([null, null])
  const graphReadyRef = useRef(false)

  const audioRefs = useMemo(() => [primaryAudioRef, secondaryAudioRef] as const, [])

  const activeVariant =
    variants.find((variant) => variant.id === activeVariantId) ??
    readyVariants[0] ??
    variants[0] ??
    null
  const activeVariantReady = Boolean(activeVariant?.src && activeVariant.downloadUrl)

  const getAudioAtIndex = useCallback(
    (index: number) => audioRefs[index]?.current ?? null,
    [audioRefs]
  )

  const getActiveAudio = useCallback(
    () => getAudioAtIndex(activeAudioIndexRef.current),
    [getAudioAtIndex]
  )

  const getInactiveAudio = useCallback(
    () => getAudioAtIndex(activeAudioIndexRef.current === 0 ? 1 : 0),
    [getAudioAtIndex]
  )

  const ensureAudioGraph = useCallback(async () => {
    if (graphReadyRef.current) {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume().catch(() => {})
      }
      return true
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    const primaryAudio = primaryAudioRef.current
    const secondaryAudio = secondaryAudioRef.current

    if (!AudioContextCtor || !primaryAudio || !secondaryAudio) {
      return false
    }

    const context = new AudioContextCtor()
    const masterGain = context.createGain()
    const trackGains: [GainNode, GainNode] = [context.createGain(), context.createGain()]

    masterGain.gain.value = clampVolume(volume)
    trackGains[0].gain.value = activeAudioIndexRef.current === 0 ? 1 : 0
    trackGains[1].gain.value = activeAudioIndexRef.current === 1 ? 1 : 0

    context.createMediaElementSource(primaryAudio).connect(trackGains[0])
    context.createMediaElementSource(secondaryAudio).connect(trackGains[1])
    trackGains[0].connect(masterGain)
    trackGains[1].connect(masterGain)
    masterGain.connect(context.destination)

    primaryAudio.volume = 1
    secondaryAudio.volume = 1

    audioContextRef.current = context
    masterGainRef.current = masterGain
    trackGainsRef.current = trackGains
    graphReadyRef.current = true

    if (context.state === 'suspended') {
      await context.resume().catch(() => {})
    }

    return true
  }, [volume])

  useEffect(() => {
    activeAudioIndexRef.current = activeAudioIndex
  }, [activeAudioIndex])

  useEffect(() => {
    if (activeVariantReady) return
    const nextReady = readyVariants[0]
    if (nextReady && nextReady.id !== activeVariantId) {
      setActiveVariantId(nextReady.id)
    }
  }, [activeVariantId, activeVariantReady, readyVariants])

  useEffect(() => {
    const audios = audioRefs.map((ref) => ref.current)

    const cleanups = audios.map((audio, index) => {
      if (!audio) return () => {}

      const onTime = () => {
        if (index !== activeAudioIndexRef.current || dragging) return
        setCurrentTime(audio.currentTime)
      }

      const onMeta = () => {
        if (index !== activeAudioIndexRef.current) return
        setDuration(audio.duration)
        setCurrentTime(audio.currentTime)
      }

      const onPlay = () => {
        if (index !== activeAudioIndexRef.current) return
        setPlaying(true)
      }

      const onPause = () => {
        if (index !== activeAudioIndexRef.current || switchingRef.current) return
        setPlaying(false)
      }

      const onEnd = () => {
        if (index !== activeAudioIndexRef.current) return
        setPlaying(false)
        setCurrentTime(0)
      }

      audio.addEventListener('timeupdate', onTime)
      audio.addEventListener('loadedmetadata', onMeta)
      audio.addEventListener('play', onPlay)
      audio.addEventListener('pause', onPause)
      audio.addEventListener('ended', onEnd)

      return () => {
        audio.removeEventListener('timeupdate', onTime)
        audio.removeEventListener('loadedmetadata', onMeta)
        audio.removeEventListener('play', onPlay)
        audio.removeEventListener('pause', onPause)
        audio.removeEventListener('ended', onEnd)
      }
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [audioRefs, dragging])

  useEffect(() => {
    const masterGain = masterGainRef.current
    if (masterGain && audioContextRef.current) {
      const now = audioContextRef.current.currentTime
      masterGain.gain.cancelScheduledValues(now)
      masterGain.gain.setValueAtTime(clampVolume(volume), now)
      return
    }

    const activeAudio = getActiveAudio()
    if (activeAudio) {
      activeAudio.volume = clampVolume(volume)
    }
  }, [getActiveAudio, volume])

  useEffect(() => {
    const activeAudio = getActiveAudio()
    const inactiveAudio = getInactiveAudio()

    if (!activeAudio) return

    if (!activeVariant?.src) {
      ;[activeAudio, inactiveAudio].forEach((audio) => {
        if (!audio) return
        audio.pause()
        audio.removeAttribute('src')
        audio.dataset.variantId = ''
        audio.load()
        audio.volume = 0
      })
      setPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      return
    }

    if (activeAudio.dataset.variantId !== activeVariant.id) {
      activeAudio.pause()
      activeAudio.src = activeVariant.src
      activeAudio.dataset.variantId = activeVariant.id
      activeAudio.load()
      setPlaying(false)
      setCurrentTime(0)
      setDuration(0)
    }

    if (graphReadyRef.current && masterGainRef.current) {
      activeAudio.volume = 1
      if (inactiveAudio) {
        inactiveAudio.volume = 1
      }

      masterGainRef.current.gain.value = clampVolume(volume)

      const activeGain = trackGainsRef.current[activeAudioIndexRef.current]
      const inactiveGain =
        trackGainsRef.current[activeAudioIndexRef.current === 0 ? 1 : 0]

      if (activeGain) activeGain.gain.value = 1
      if (inactiveGain) inactiveGain.gain.value = 0
    } else {
      activeAudio.volume = clampVolume(volume)

      if (inactiveAudio) {
        inactiveAudio.volume = 0
      }
    }
  }, [activeVariant?.id, activeVariant?.src, getActiveAudio, getInactiveAudio, volume])

  const switchVariant = useCallback(async (nextVariantId: string) => {
    if (nextVariantId === activeVariantId || switchingRef.current) return

    const nextVariant = readyVariants.find((variant) => variant.id === nextVariantId)
    if (!nextVariant?.src) return

    const currentAudio = getActiveAudio()
    const nextIndex = activeAudioIndexRef.current === 0 ? 1 : 0
    const nextAudio = getAudioAtIndex(nextIndex)

    if (!currentAudio || !nextAudio) return

    const resumeTime = currentAudio.currentTime
    const shouldResume = !currentAudio.paused && Boolean(currentAudio.currentSrc)
    const hasGraph = await ensureAudioGraph()
    const context = audioContextRef.current
    const currentGain = trackGainsRef.current[activeAudioIndexRef.current]
    const nextGain = trackGainsRef.current[nextIndex]

    switchingRef.current = true
    setIsSwitching(true)
    setSwitchingToVariantId(nextVariant.id)

    try {
      nextAudio.pause()
      nextAudio.src = nextVariant.src
      nextAudio.dataset.variantId = nextVariant.id
      nextAudio.load()

      await waitForMetadata(nextAudio)

      const safeTime = Math.min(
        resumeTime,
        Number.isFinite(nextAudio.duration) ? nextAudio.duration || resumeTime : resumeTime
      )

      nextAudio.currentTime = safeTime
      setCurrentTime(safeTime)
      setDuration(nextAudio.duration)

      if (shouldResume) {
        if (hasGraph && context && currentGain && nextGain) {
          const fadeOutStart = context.currentTime
          currentGain.gain.cancelScheduledValues(fadeOutStart)
          currentGain.gain.setValueAtTime(currentGain.gain.value, fadeOutStart)
          currentGain.gain.linearRampToValueAtTime(0, fadeOutStart + FADE_OUT_S)

          await wait(FADE_OUT_MS + 16)

          currentAudio.pause()
          currentAudio.volume = 1
          nextAudio.volume = 1
          nextGain.gain.cancelScheduledValues(context.currentTime)
          nextGain.gain.setValueAtTime(0, context.currentTime)
          await nextAudio.play()

          const fadeInStart = context.currentTime
          nextGain.gain.linearRampToValueAtTime(1, fadeInStart + FADE_IN_S)
          await wait(FADE_IN_MS + 16)
        } else {
          await fadeAudio(currentAudio, currentAudio.volume, 0, FADE_OUT_MS)
          currentAudio.pause()
          currentAudio.volume = 0
          nextAudio.volume = 0
          await nextAudio.play()
          await fadeAudio(nextAudio, 0, volume, FADE_IN_MS)
        }
      } else {
        currentAudio.pause()
        if (hasGraph && currentGain && nextGain) {
          currentAudio.volume = 1
          nextAudio.volume = 1
          currentGain.gain.value = 0
          nextGain.gain.value = 1
        } else {
          currentAudio.volume = 0
          nextAudio.volume = clampVolume(volume)
        }
      }

      activeAudioIndexRef.current = nextIndex
      setActiveAudioIndex(nextIndex)
      setActiveVariantId(nextVariant.id)
      setPlaying(shouldResume)
    } catch {
      nextAudio.pause()
      nextAudio.volume = 0
    } finally {
      switchingRef.current = false
      setIsSwitching(false)
      setSwitchingToVariantId(null)
    }
  }, [activeVariantId, ensureAudioGraph, getActiveAudio, getAudioAtIndex, readyVariants, volume])

  const toggle = () => {
    const audio = getActiveAudio()
    if (!audio || !activeVariantReady || switchingRef.current) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  const seek = useCallback(
    (clientX: number) => {
      const bar = progressRef.current
      const audio = getActiveAudio()
      if (!bar || !audio || !duration || !activeVariantReady || switchingRef.current) return
      const rect = bar.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      audio.currentTime = ratio * duration
      setCurrentTime(ratio * duration)
    },
    [activeVariantReady, duration, getActiveAudio]
  )

  const onSeekDown = (e: React.PointerEvent) => {
    if (!activeVariantReady || switchingRef.current) return
    setDragging(true)
    seek(e.clientX)
    const onMove = (ev: PointerEvent) => seek(ev.clientX)
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const seekVolume = useCallback(
    (clientX: number) => {
      const bar = volumeRef.current
      const audio = getActiveAudio()
      if (!bar || !audio) return
      const rect = bar.getBoundingClientRect()
      const v = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      audio.volume = v
      setVolume(v)
    },
    [getActiveAudio]
  )

  const onVolumeDown = (e: React.PointerEvent) => {
    seekVolume(e.clientX)
    const onMove = (ev: PointerEvent) => seekVolume(ev.clientX)
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const toggleMute = () => {
    const audio = getActiveAudio()
    if (!audio) return
    if (volume > 0) {
      audio.volume = 0
      setVolume(0)
    } else {
      audio.volume = 1
      setVolume(1)
    }
  }

  const progress = duration > 0 ? currentTime / duration : 0

  useEffect(() => {
    if (!onStateChange) return
    onStateChange({
      currentTime,
      duration,
      playing,
      activeVariantId,
    })
  }, [activeVariantId, currentTime, duration, onStateChange, playing])

  return (
    <div className={`audio-player ${isSwitching ? 'audio-player-switching' : ''}`} aria-label={label}>
      <audio ref={primaryAudioRef} preload="metadata" />
      <audio ref={secondaryAudioRef} preload="metadata" />

      {readyVariants.length > 1 ? (
        <div className="audio-variant-picker" role="tablist" aria-label="Audio comparison source">
          {readyVariants.map((variant) => {
            const isActive = variant.id === activeVariantId
            const isSwitchTarget = variant.id === switchingToVariantId

            return (
              <button
                key={variant.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-busy={isSwitchTarget || undefined}
                onClick={() => {
                  void switchVariant(variant.id)
                }}
                disabled={isSwitching}
                className={`audio-variant-pill ${isActive ? 'audio-variant-pill-active' : ''} ${isSwitchTarget ? 'audio-variant-pill-switching' : ''}`}
              >
                {variant.shortLabel}
              </button>
            )
          })}
        </div>
      ) : null}

      {activeVariant?.note ? <p className="audio-variant-note">{activeVariant.note}</p> : null}

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="audio-play-btn"
          aria-label={playing ? 'Pause' : 'Play'}
          disabled={!activeVariantReady}
        >
          {playing ? (
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="6" y1="4" x2="6" y2="20" />
              <line x1="18" y1="4" x2="18" y2="20" />
            </svg>
          ) : (
            <svg className="w-[18px] h-[18px] ml-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <span className="text-[11px] text-muted tabular-nums w-[34px] text-right shrink-0">
          {formatTime(currentTime)}
        </span>

        <div
          ref={progressRef}
          className={`audio-track group flex-1 ${activeVariantReady ? '' : 'audio-track-disabled'}`}
          onPointerDown={onSeekDown}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-disabled={!activeVariantReady}
        >
          <div className="audio-track-fill" style={{ width: `${progress * 100}%` }} />
          <div className="audio-track-thumb" style={{ left: `${progress * 100}%` }} />
        </div>

        <span className="text-[11px] text-muted tabular-nums w-[34px] shrink-0">
          {formatTime(duration)}
        </span>

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button onClick={toggleMute} className="audio-icon-btn" aria-label={volume === 0 ? 'Unmute' : 'Mute'}>
            {volume === 0 ? (
              <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : volume < 0.5 ? (
              <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            ) : (
              <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            )}
          </button>
          <div
            ref={volumeRef}
            className="audio-volume-track group"
            onPointerDown={onVolumeDown}
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
          >
            <div className="audio-track-fill" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="audio-downloads" aria-label="Audio downloads">
        {readyVariants.map((variant) => {
          return (
            <a
              key={variant.id}
              href={variant.downloadUrl}
              download
              className={`audio-download-link ${
                variant.id === activeVariantId ? 'audio-download-link-active' : ''
              }`}
            >
              Download {variant.shortLabel}
            </a>
          )
        })}
      </div>
    </div>
  )
}
