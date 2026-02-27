'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface AudioPlayerProps {
  src: string
  label: string
  downloadUrl: string
}

function formatTime(s: number) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function AudioPlayer({ src, label, downloadUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => { if (!dragging) setCurrentTime(audio.currentTime) }
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => { setPlaying(false); setCurrentTime(0) }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [dragging])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause() } else { audio.play() }
    setPlaying(!playing)
  }

  const seek = useCallback((clientX: number) => {
    const bar = progressRef.current
    const audio = audioRef.current
    if (!bar || !audio || !duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }, [duration])

  const onSeekDown = (e: React.PointerEvent) => {
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

  const seekVolume = useCallback((clientX: number) => {
    const bar = volumeRef.current
    const audio = audioRef.current
    if (!bar || !audio) return
    const rect = bar.getBoundingClientRect()
    const v = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.volume = v
    setVolume(v)
  }, [])

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
    const audio = audioRef.current
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

  return (
    <div className="audio-player" aria-label={label}>
      <audio ref={audioRef} preload="metadata">
        <source src={src} type="audio/mpeg" />
      </audio>

      {/* Main row: play, scrubber, time, volume, download */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="audio-play-btn"
          aria-label={playing ? 'Pause' : 'Play'}
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

        <span className="text-[11px] text-muted tabular-nums w-[34px] text-right shrink-0">{formatTime(currentTime)}</span>

        <div
          ref={progressRef}
          className="audio-track group flex-1"
          onPointerDown={onSeekDown}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="audio-track-fill"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="audio-track-thumb"
            style={{ left: `${progress * 100}%` }}
          />
        </div>

        <span className="text-[11px] text-muted tabular-nums w-[34px] shrink-0">{formatTime(duration)}</span>

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleMute}
            className="audio-icon-btn"
            aria-label={volume === 0 ? 'Unmute' : 'Mute'}
          >
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
            <div
              className="audio-track-fill"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>

        <a
          href={downloadUrl}
          download
          className="audio-icon-btn"
          aria-label="Download audio file"
          title="Download"
        >
          <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  )
}
