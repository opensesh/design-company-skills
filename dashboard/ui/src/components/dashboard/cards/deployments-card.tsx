import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { Sparkline, bucketByDay } from '@/components/dashboard/sparkline'
import { Badge } from '@/components/ui/badge'
import { formatRelative } from '@/lib/format'
import type { Deployment } from '@/lib/api'
import type { ComponentProps } from 'react'

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>['variant']>

const STATE_VARIANT: Record<string, BadgeVariant> = {
  READY: 'default',
  BUILDING: 'secondary',
  ERROR: 'destructive',
  CANCELED: 'outline',
  QUEUED: 'secondary',
}

function summarizeDeployments(deployments: Deployment[]): string {
  const DAY = 24 * 60 * 60 * 1000
  const since = Date.now() - DAY
  const todays = deployments.filter((d) => d.created > since)
  const failed = todays.filter((d) => d.state === 'ERROR').length
  const latest = deployments[0]

  const parts: string[] = []
  if (latest) {
    parts.push(`Last: ${latest.state} ${formatRelative(new Date(latest.created))}`)
  }
  if (todays.length) {
    parts.push(`${todays.length} today`)
  }
  if (failed > 0) {
    parts.push(`${failed} failed`)
  }
  return parts.join(' · ')
}

export function DeploymentsCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<Deployment[]>('/api/vercel/deployments', refreshToken)

  return (
    <DataCard<Deployment[]>
      title="Deployments"
      service="Vercel"
      result={result}
      loading={loading}
      emptyMessage="No recent deployments"
      summary={summarizeDeployments}
      render={(deployments) => {
        const buckets = bucketByDay(deployments.map((d) => d.created), 14)
        return (
          <div className="space-y-3">
            <Sparkline values={buckets} label="14d" trailingLabel={`${deployments.length} total`} />
            <ItemList>
              {deployments.slice(0, 8).map((d) => (
                <Item
                  key={d.uid}
                  title={d.name}
                  meta={`${d.target || 'preview'} · ${formatRelative(new Date(d.created))}`}
                  href={d.url}
                  badge={
                    <Badge variant={STATE_VARIANT[d.state] || 'outline'} className="font-mono text-[10px]">
                      {d.state}
                    </Badge>
                  }
                />
              ))}
            </ItemList>
          </div>
        )
      }}
    />
  )
}
