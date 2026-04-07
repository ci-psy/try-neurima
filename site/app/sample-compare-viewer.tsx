'use client'

import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { AudioVariant } from './audio-player'

type ComparisonData = {
  original: AudioVariant
  processed: AudioVariant
  originalBuffer: AudioBuffer
  processedBuffer: AudioBuffer
  sampleRate: number
  commonLength: number
  focusByChannel: number[]
  estimatedOffsetByChannel: number[]
  defaultChannel: number
}

const ZOOM_LEVELS = [64, 128, 256] as const
const SAMPLE_NUDGE_STEPS = [-10, -1, 1, 10] as const
const CANVAS_PAD_X = 20
const CANVAS_PAD_TOP = 18
const CANVAS_PAD_BOTTOM = 34

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function findFocusSample(original: Float32Array, processed: Float32Array, commonLength: number) {
  const step = Math.max(1, Math.floor(commonLength / 60000))
  let bestIndex = 0
  let bestScore = -1

  for (let i = 1; i < commonLength; i += step) {
    const diffScore = Math.abs(original[i] - processed[i])
    const shapeScore = Math.abs(original[i] - original[i - 1])
    const score = diffScore * 1.5 + shapeScore
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  return bestIndex
}

function estimateOffset(
  original: Float32Array,
  processed: Float32Array,
  commonLength: number,
  centerSample: number
) {
  const maxOffset = 96
  const halfWindow = 192
  const start = clamp(centerSample - halfWindow, 0, commonLength - 1)
  const end = clamp(centerSample + halfWindow, 0, commonLength - 1)

  let bestOffset = 0
  let bestScore = Number.POSITIVE_INFINITY

  for (let offset = -maxOffset; offset <= maxOffset; offset += 1) {
    let score = 0
    let count = 0

    for (let i = start; i <= end; i += 1) {
      const shiftedIndex = i + offset
      if (shiftedIndex < 0 || shiftedIndex >= commonLength) continue
      score += Math.abs(original[i] - processed[shiftedIndex])
      count += 1
    }

    if (!count) continue

    const normalizedScore = score / count
    if (normalizedScore < bestScore) {
      bestScore = normalizedScore
      bestOffset = offset
    }
  }

  return bestOffset
}

async function decodeBuffer(context: AudioContext, src: string) {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`Could not load ${src}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return context.decodeAudioData(arrayBuffer.slice(0))
}

export function SampleCompareViewer({
  variants,
  title = 'See the shift',
  description = 'Overlayed samples from the same moment in the original and IMA files.',
  playbackTime,
  selectedVariantId,
  onSeekRequest,
}: {
  variants: AudioVariant[]
  title?: string
  description?: string
  playbackTime?: number
  selectedVariantId?: string
  onSeekRequest?: (time: number) => void
}) {
  const readyVariants = useMemo(
    () => variants.filter((variant) => Boolean(variant.src && variant.downloadUrl)),
    [variants]
  )

  const comparisonPair = useMemo(() => {
    const original = readyVariants.find((variant) => variant.id === 'original') ?? readyVariants[0]
    const processed = readyVariants.find((variant) => variant.id !== original?.id) ?? readyVariants[1]

    if (!original?.src || !processed?.src || original.id === processed.id) {
      return null
    }

    return { original, processed }
  }, [readyVariants])

  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [zoomSamples, setZoomSamples] = useState<(typeof ZOOM_LEVELS)[number]>(128)
  const [viewerSample, setViewerSample] = useState<number | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!comparisonPair) {
      setComparison(null)
      setStatus('idle')
      return
    }

    const pair = comparisonPair

    let cancelled = false

    async function loadComparison() {
      setStatus('loading')
      setErrorMessage(null)

      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

      if (!AudioContextCtor) {
        setStatus('error')
        setErrorMessage('This browser does not support the sample viewer.')
        return
      }

      const context = new AudioContextCtor()

      try {
        const [originalBuffer, processedBuffer] = await Promise.all([
          decodeBuffer(context, pair.original.src!),
          decodeBuffer(context, pair.processed.src!),
        ])

        if (cancelled) return

        if (originalBuffer.sampleRate !== processedBuffer.sampleRate) {
          setStatus('error')
          setErrorMessage('Both comparison files need the same sample rate for a sample-level view.')
          return
        }

        const channelCount = Math.min(originalBuffer.numberOfChannels, processedBuffer.numberOfChannels, 2)
        const commonLength = Math.min(originalBuffer.length, processedBuffer.length)

        const focusByChannel: number[] = []
        const estimatedOffsetByChannel: number[] = []
        const channelScores: number[] = []

        for (let channel = 0; channel < channelCount; channel += 1) {
          const originalData = originalBuffer.getChannelData(channel)
          const processedData = processedBuffer.getChannelData(channel)
          const focusSample = findFocusSample(originalData, processedData, commonLength)

          focusByChannel.push(focusSample)
          estimatedOffsetByChannel.push(
            estimateOffset(originalData, processedData, commonLength, focusSample)
          )

          const step = Math.max(1, Math.floor(commonLength / 48000))
          let score = 0
          for (let i = 0; i < commonLength; i += step) {
            score += Math.abs(originalData[i] - processedData[i])
          }
          channelScores.push(score)
        }

        const defaultChannel =
          channelScores[1] != null && channelScores[1] > channelScores[0] ? 1 : 0

        setComparison({
          original: pair.original,
          processed: pair.processed,
          originalBuffer,
          processedBuffer,
          sampleRate: originalBuffer.sampleRate,
          commonLength,
          focusByChannel,
          estimatedOffsetByChannel,
          defaultChannel,
        })
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Could not load the comparison audio.')
      } finally {
        void context.close()
      }
    }

    void loadComparison()

    return () => {
      cancelled = true
    }
  }, [comparisonPair])

  const playbackSample = useMemo(() => {
    if (!comparison || typeof playbackTime !== 'number') return null

    return clamp(Math.floor(playbackTime * comparison.sampleRate), 0, comparison.commonLength - 1)
  }, [comparison, playbackTime])

  useEffect(() => {
    if (!comparison) {
      setViewerSample(null)
      return
    }

    const referenceSample =
      comparison.focusByChannel[comparison.defaultChannel] ??
      comparison.focusByChannel[0] ??
      0

    setViewerSample(referenceSample)
  }, [comparison])

  const viewModel = useMemo(() => {
    if (!comparison) return null

    const rowCount = Math.min(
      2,
      comparison.originalBuffer.numberOfChannels,
      comparison.processedBuffer.numberOfChannels
    )
    const windowSize = zoomSamples
    const referenceSample =
      comparison.focusByChannel[comparison.defaultChannel] ??
      comparison.focusByChannel[0] ??
      0
    const maxStart = Math.max(0, comparison.commonLength - windowSize)
    const startSample = clamp(referenceSample - Math.floor(windowSize / 2), 0, maxStart)
    const endSample = Math.min(comparison.commonLength - 1, startSample + windowSize - 1)

    return {
      rowCount,
      referenceSample,
      playbackSample,
      startSample,
      endSample,
      windowSize,
    }
  }, [comparison, playbackSample, zoomSamples])

  const currentSample = viewerSample ?? viewModel?.referenceSample ?? 0
  const emphasizedVariantId =
    selectedVariantId === comparisonPair?.original.id || selectedVariantId === comparisonPair?.processed.id
      ? selectedVariantId
      : comparisonPair?.processed.id

  const seekToClientX = (clientX: number) => {
    if (!comparison || !viewModel || !onSeekRequest) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const width = Math.max(320, Math.floor(rect.width))
    const plotWidth = width - CANVAS_PAD_X * 2
    const ratio = clamp((clientX - rect.left - CANVAS_PAD_X) / plotWidth, 0, 1)
    const sample = Math.round(viewModel.startSample + ratio * Math.max(1, viewModel.windowSize - 1))

    setViewerSample(sample)
    onSeekRequest(sample / comparison.sampleRate)
  }

  const onCanvasPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!comparison || !viewModel || !onSeekRequest) return

    event.preventDefault()
    seekToClientX(event.clientX)

    const onMove = (moveEvent: PointerEvent) => seekToClientX(moveEvent.clientX)
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const nudgeBySamples = (delta: number) => {
    if (!comparison || !onSeekRequest) return

    const nextSample = clamp(currentSample + delta, 0, comparison.commonLength - 1)
    setViewerSample(nextSample)
    onSeekRequest(nextSample / comparison.sampleRate)
  }

  useEffect(() => {
    if (!comparison || !viewModel) return

    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(320, Math.floor(rect.width))
      const height = viewModel.rowCount > 1 ? 312 : 248
      const dpr = window.devicePixelRatio || 1

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.height = `${height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const styles = getComputedStyle(document.documentElement)
      const fg = styles.getPropertyValue('--color-fg').trim() || '#111111'
      const secondary = styles.getPropertyValue('--color-text-secondary').trim() || '#606060'
      const muted = styles.getPropertyValue('--color-text-muted').trim() || '#8a8a8a'
      const border = styles.getPropertyValue('--color-border').trim() || '#d9d9d9'

      const plotWidth = width - CANVAS_PAD_X * 2
      const plotHeight = height - CANVAS_PAD_TOP - CANVAS_PAD_BOTTOM
      const rowGap = viewModel.rowCount > 1 ? 16 : 0
      const rowHeight = (plotHeight - rowGap * (viewModel.rowCount - 1)) / viewModel.rowCount
      const amplitude = rowHeight * 0.34
      const labelStep = viewModel.windowSize <= 64 ? 8 : viewModel.windowSize <= 128 ? 16 : 32
      const sampleDenominator = Math.max(1, viewModel.windowSize - 1)
      const originalSelected = emphasizedVariantId === comparison.original.id
      const processedSelected = emphasizedVariantId === comparison.processed.id

      for (let i = 0; i < viewModel.windowSize; i += labelStep) {
        const ratio = i / sampleDenominator
        const x = CANVAS_PAD_X + ratio * plotWidth

        ctx.strokeStyle = border
        ctx.globalAlpha = 0.45
        ctx.beginPath()
        ctx.moveTo(x, CANVAS_PAD_TOP)
        ctx.lineTo(x, height - CANVAS_PAD_BOTTOM + 4)
        ctx.stroke()
        ctx.globalAlpha = 1

        ctx.fillStyle = muted
        ctx.font = '11px ui-sans-serif, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${viewModel.startSample + i}`, x, height - 12)
      }

      const drawStems = (sampleXs: number[], ys: number[], baseline: number, color: string, alpha: number) => {
        ctx.strokeStyle = color
        ctx.globalAlpha = alpha
        ctx.lineWidth = 1
        for (let i = 0; i < ys.length; i += 1) {
          ctx.beginPath()
          ctx.moveTo(sampleXs[i], baseline)
          ctx.lineTo(sampleXs[i], ys[i])
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      const drawPath = (sampleXs: number[], ys: number[], color: string, alpha: number, widthValue: number) => {
        ctx.strokeStyle = color
        ctx.globalAlpha = alpha
        ctx.lineWidth = widthValue
        ctx.beginPath()
        ys.forEach((y, index) => {
          const x = sampleXs[index]
          if (index === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      const markerSample = clamp(viewModel.referenceSample, viewModel.startSample, viewModel.endSample)
      const markerRatio =
        markerSample != null ? (markerSample - viewModel.startSample) / sampleDenominator : null
      const markerX = markerRatio != null ? CANVAS_PAD_X + markerRatio * plotWidth : null

      const playheadSample =
        viewModel.playbackSample != null &&
        viewModel.playbackSample >= viewModel.startSample &&
        viewModel.playbackSample <= viewModel.endSample
          ? clamp(viewModel.playbackSample, viewModel.startSample, viewModel.endSample)
          : currentSample >= viewModel.startSample && currentSample <= viewModel.endSample
            ? currentSample
            : null
      const playheadRatio =
        playheadSample != null ? (playheadSample - viewModel.startSample) / sampleDenominator : null
      const playheadX = playheadRatio != null ? CANVAS_PAD_X + playheadRatio * plotWidth : null

      for (let channelIndex = 0; channelIndex < viewModel.rowCount; channelIndex += 1) {
        const rowTop = CANVAS_PAD_TOP + channelIndex * (rowHeight + rowGap)
        const baseline = rowTop + rowHeight / 2
        const rowBottom = rowTop + rowHeight

        ctx.strokeStyle = border
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(CANVAS_PAD_X, baseline)
        ctx.lineTo(width - CANVAS_PAD_X, baseline)
        ctx.stroke()

        if (channelIndex < viewModel.rowCount - 1) {
          ctx.globalAlpha = 0.6
          ctx.beginPath()
          ctx.moveTo(CANVAS_PAD_X, rowBottom + rowGap / 2)
          ctx.lineTo(width - CANVAS_PAD_X, rowBottom + rowGap / 2)
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        ctx.fillStyle = muted
        ctx.font = '11px ui-sans-serif, system-ui, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(channelIndex === 0 ? 'Left' : 'Right', CANVAS_PAD_X, rowTop + 12)

        const estimatedOffset = comparison.estimatedOffsetByChannel[channelIndex] ?? 0
        ctx.textAlign = 'right'
        ctx.fillText(
          `${estimatedOffset > 0 ? '+' : ''}${estimatedOffset} samples`,
          width - CANVAS_PAD_X,
          rowTop + 12
        )

        const originalData = comparison.originalBuffer.getChannelData(channelIndex)
        const processedData = comparison.processedBuffer.getChannelData(channelIndex)
        const sampleXs: number[] = []
        const originalYs: number[] = []
        const processedYs: number[] = []

        for (let i = 0; i < viewModel.windowSize; i += 1) {
          const sampleIndex = viewModel.startSample + i
          const ratio = i / sampleDenominator
          const x = CANVAS_PAD_X + ratio * plotWidth
          const originalY = baseline - originalData[sampleIndex] * amplitude
          const processedY = baseline - processedData[sampleIndex] * amplitude

          sampleXs.push(x)
          originalYs.push(originalY)
          processedYs.push(processedY)
        }

        drawStems(sampleXs, originalYs, baseline, secondary, originalSelected ? 0.34 : 0.12)
        drawStems(sampleXs, processedYs, baseline, fg, processedSelected ? 0.36 : 0.12)
        drawPath(sampleXs, originalYs, secondary, originalSelected ? 0.92 : 0.28, originalSelected ? 2.5 : 1.25)
        drawPath(sampleXs, processedYs, fg, processedSelected ? 0.98 : 0.32, processedSelected ? 2.5 : 1.25)

        if (markerX != null) {
          ctx.strokeStyle = fg
          ctx.globalAlpha = 0.1
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(markerX, rowTop)
          ctx.lineTo(markerX, rowBottom)
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        if (playheadX != null) {
          ctx.strokeStyle = fg
          ctx.globalAlpha = 0.95
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(playheadX, rowTop)
          ctx.lineTo(playheadX, rowBottom)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
    }

    draw()

    const resizeObserver = new ResizeObserver(() => draw())
    resizeObserver.observe(canvas)

    return () => resizeObserver.disconnect()
  }, [comparison, selectedVariantId, viewModel])

  if (!comparisonPair) {
    return null
  }

  return (
    <div className="sample-viewer-shell">
      <div className="sample-viewer-header">
        <div>
          <h3 className="sample-viewer-title">{title}</h3>
          <p className="sample-viewer-copy">
            {description}
          </p>
        </div>
        <div className="sample-viewer-legend" aria-label="Waveform legend">
          <span
            className={`sample-viewer-legend-item ${
              emphasizedVariantId === comparisonPair.original.id
                ? 'sample-viewer-legend-item-active'
                : 'sample-viewer-legend-item-muted'
            }`}
          >
            <span className="sample-viewer-legend-swatch sample-viewer-legend-swatch-original" />
            {comparisonPair.original.shortLabel}
          </span>
          <span
            className={`sample-viewer-legend-item ${
              emphasizedVariantId === comparisonPair.processed.id
                ? 'sample-viewer-legend-item-active'
                : 'sample-viewer-legend-item-muted'
            }`}
          >
            <span className="sample-viewer-legend-swatch sample-viewer-legend-swatch-processed" />
            {comparisonPair.processed.shortLabel}
          </span>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="sample-viewer-state">Loading sample view…</div>
      ) : null}

      {status === 'error' ? (
        <div className="sample-viewer-state">{errorMessage ?? 'Could not load the sample view.'}</div>
      ) : null}

      {status === 'ready' && comparison && viewModel ? (
        <>
          <div className="sample-viewer-toolbar">
            <div className="sample-viewer-control">
              <span className="sample-viewer-label">Zoom</span>
              <div className="sample-viewer-segmented" role="tablist" aria-label="Zoom">
                {ZOOM_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    role="tab"
                    aria-selected={zoomSamples === level}
                    onClick={() => setZoomSamples(level)}
                    className={`sample-viewer-segment ${zoomSamples === level ? 'sample-viewer-segment-active' : ''}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="sample-viewer-control">
              <span className="sample-viewer-label">Nudge Samples</span>
              <div className="sample-viewer-segmented" role="group" aria-label="Sample nudge">
                {SAMPLE_NUDGE_STEPS.map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => nudgeBySamples(step)}
                    className="sample-viewer-segment"
                  >
                    {step > 0 ? `+${step}` : step}
                  </button>
                ))}
              </div>
            </div>

            <div className="sample-viewer-metrics">
              <span>{comparison.sampleRate.toLocaleString()} Hz</span>
              <span>
                L {comparison.estimatedOffsetByChannel[0] ?? 0}
                {comparison.estimatedOffsetByChannel[1] != null ? ` · R ${comparison.estimatedOffsetByChannel[1]}` : ''}
              </span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="sample-viewer-canvas"
            aria-label="Sample-level audio comparison"
            onPointerDown={onCanvasPointerDown}
          />

          <div className="sample-viewer-footer">
            <span>
              Fixed on the marked shift. Use this window for precise scrubbing.
            </span>
            <span>
              Samples {viewModel.startSample.toLocaleString()}–{viewModel.endSample.toLocaleString()}
            </span>
          </div>
        </>
      ) : null}
    </div>
  )
}
