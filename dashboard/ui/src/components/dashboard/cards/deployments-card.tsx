import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
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

export function DeploymentsCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<Deployment[]>('/api/vercel/deployments', refreshToken)

  return (
    <DataCard<Deployment[]>
      title="Deployments"
      service="Vercel"
      result={result}
      loading={loading}
      emptyMessage="No recent deployments"
      render={(deployments) => (
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
      )}
    />
  )
}
