import { useMemo } from 'react'

interface SparklineProps {
  values: number[]
  height?: number
  label?: string
  trailingLabel?: string
}

/**
 * Minimal inline SVG sparkline — pure SVG, no chart library, no axes,
 * no tooltips. Designed for a one-line trend cue above a card's data
 * list ("commits per day for the last N days").
 */
export function Sparkline({ values, height = 28, label, trailingLabel }: SparklineProps) {
  const { path, areaPath, max, dotX, dotY } = useMemo(() => {
    if (values.length === 0) return { path: '', areaPath: '', max: 0, dotX: 0, dotY: 0 }
    const max = Math.max(1, ...values)
    const w = 100
    const stepX = values.length > 1 ? w / (values.length - 1) : 0
    const points = values.map((v, i) => {
      const x = i * stepX
      const y = height - 2 - (v / max) * (height - 4)
      return { x, y }
    })
    const path = points
      .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
      .join(' ')
    const areaPath = `${path} L ${w},${height} L 0,${height} Z`
    const last = points[points.length - 1]
    return { path, areaPath, max, dotX: last.x, dotY: last.y }
  }, [values, height])

  if (values.length === 0) return null

  return (
    <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
      {label && <span className="shrink-0">{label}</span>}
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="flex-1 h-7"
        role="img"
        aria-label={label ? `${label} sparkline` : 'sparkline'}
      >
        <path d={areaPath} fill="var(--aperol)" fillOpacity="0.12" />
        <path d={path} fill="none" stroke="var(--aperol)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <circle cx={dotX} cy={dotY} r="1.5" fill="var(--aperol)" />
      </svg>
      {trailingLabel !== undefined && (
        <span className="shrink-0 font-mono tabular-nums">{trailingLabel}</span>
      )}
      {!trailingLabel && <span className="shrink-0 font-mono tabular-nums">peak {max}</span>}
    </div>
  )
}

/**
 * Bucket events by day going back `days` days from today. Returns an
 * array of length `days` with oldest first. Each bucket is the count of
 * events whose timestamp falls within that day in the local timezone.
 */
export function bucketByDay(timestamps: (string | number | Date)[], days = 14): number[] {
  const out = new Array(days).fill(0) as number[]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startOfWindow = today.getTime() - (days - 1) * 86_400_000

  for (const ts of timestamps) {
    const t = ts instanceof Date ? ts.getTime() : new Date(ts).getTime()
    if (isNaN(t)) continue
    if (t < startOfWindow) continue
    const dayIndex = Math.floor((t - startOfWindow) / 86_400_000)
    if (dayIndex >= 0 && dayIndex < days) out[dayIndex] += 1
  }
  return out
}
