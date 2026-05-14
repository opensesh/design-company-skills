import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { formatRelative, truncate } from '@/lib/format'
import type { Commit } from '@/lib/api'

export function CommitsCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<Commit[]>('/api/github/commits', refreshToken)

  return (
    <DataCard<Commit[]>
      title="Recent Commits"
      service="GitHub"
      result={result}
      loading={loading}
      emptyMessage="No recent commits"
      render={(commits) => (
        <ItemList>
          {commits.slice(0, 8).map((c) => (
            <Item
              key={c.sha + c.date}
              prefix={c.sha}
              title={truncate(c.message, 50)}
              meta={`${c.author} · ${c.repo.split('/').pop()} · ${formatRelative(c.date)}`}
              href={c.url}
            />
          ))}
        </ItemList>
      )}
    />
  )
}
