import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { Badge } from '@/components/ui/badge'
import { formatNumber, truncate } from '@/lib/format'
import type { DubLink } from '@/lib/api'

export function LinksCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<DubLink[]>('/api/dub/links', refreshToken)

  return (
    <DataCard<DubLink[]>
      title="Top Links"
      service="Dub.co"
      result={result}
      loading={loading}
      emptyMessage="No links tracked"
      render={(links) => (
        <ItemList>
          {links.slice(0, 8).map((l) => (
            <Item
              key={l.id}
              title={l.key}
              meta={truncate(l.url, 36)}
              href={l.shortLink}
              badge={
                <Badge variant="outline" className="font-mono text-[10px]">
                  {formatNumber(l.clicks)}
                </Badge>
              }
            />
          ))}
        </ItemList>
      )}
    />
  )
}
