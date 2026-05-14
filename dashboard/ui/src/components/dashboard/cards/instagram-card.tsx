import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { formatNumber } from '@/lib/format'
import type { InstagramMetrics } from '@/lib/api'

function summarizeInstagram(m: InstagramMetrics): string {
  return `${formatNumber(m.followers_count)} followers · ${formatNumber(m.media_count)} posts`
}

export function InstagramCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<InstagramMetrics>(
    '/api/instagram/metrics',
    refreshToken
  )

  return (
    <DataCard<InstagramMetrics>
      title="Instagram"
      service="Instagram"
      result={result}
      loading={loading}
      isEmpty={(m) => !m}
      summary={summarizeInstagram}
      render={(m) => (
        <div className="grid grid-cols-2 gap-2">
          <Metric value={formatNumber(m.followers_count)} label="Followers" />
          <Metric value={formatNumber(m.follows_count)} label="Following" />
          <Metric value={formatNumber(m.media_count)} label="Posts" />
          <Metric value={`@${m.username}`} label="Account" mono />
        </div>
      )}
    />
  )
}

function Metric({ value, label, mono }: { value: string; label: string; mono?: boolean }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2.5 text-center">
      <div
        className={`text-xl font-bold tabular-nums text-foreground leading-tight ${
          mono ? 'font-mono text-sm' : ''
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  )
}
