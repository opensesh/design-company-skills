import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { Badge } from '@/components/ui/badge'
import { formatRelative, truncate } from '@/lib/format'
import type { PullRequest } from '@/lib/api'

function summarizePRs(prs: PullRequest[]): string {
  const drafts = prs.filter((p) => p.draft).length
  const oldest = [...prs]
    .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())[0]
  const parts = [`${prs.length} open`]
  if (drafts > 0) parts.push(`${drafts} draft${drafts === 1 ? '' : 's'}`)
  if (oldest) parts.push(`oldest ${formatRelative(oldest.updated_at)}`)
  return parts.join(' · ')
}

export function PRsCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<PullRequest[]>('/api/github/prs', refreshToken)

  return (
    <DataCard<PullRequest[]>
      title="Open PRs"
      service="GitHub"
      result={result}
      loading={loading}
      emptyMessage="No open PRs"
      summary={summarizePRs}
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
