import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { Badge } from '@/components/ui/badge'
import { formatRelative, truncate } from '@/lib/format'
import type { PullRequest } from '@/lib/api'

export function PRsCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<PullRequest[]>('/api/github/prs', refreshToken)

  return (
    <DataCard<PullRequest[]>
      title="Open PRs"
      service="GitHub"
      result={result}
      loading={loading}
      emptyMessage="No open PRs"
      render={(prs) => (
        <ItemList>
          {prs.slice(0, 8).map((pr) => (
            <Item
              key={pr.repo + '#' + pr.number}
              prefix={`#${pr.number}`}
              title={truncate(pr.title, 45)}
              meta={`${pr.author} · ${pr.repo.split('/').pop()} · ${formatRelative(pr.updated_at)}`}
              href={pr.url}
              badge={pr.draft ? <Badge variant="secondary">Draft</Badge> : null}
            />
          ))}
        </ItemList>
      )}
    />
  )
}
