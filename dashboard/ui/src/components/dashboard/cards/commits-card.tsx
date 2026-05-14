import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { formatRelative, truncate } from '@/lib/format'
import type { Commit } from '@/lib/api'

function summarizeCommits(commits: Commit[]): string {
  const repos = new Map<string, number>()
  for (const c of commits) repos.set(c.repo, (repos.get(c.repo) ?? 0) + 1)
  const topRepo = [...repos.entries()].sort((a, b) => b[1] - a[1])[0]
  const repoCount = repos.size
  const parts = [`${commits.length} commit${commits.length === 1 ? '' : 's'}`]
  if (repoCount > 1) parts.push(`${repoCount} repos`)
  if (topRepo && repoCount > 1) {
    parts.push(`mostly ${topRepo[0].split('/').pop()}`)
  }
  return parts.join(' · ')
}

export function CommitsCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<Commit[]>('/api/github/commits', refreshToken)

  return (
    <DataCard<Commit[]>
      title="Recent Commits"
      service="GitHub"
      result={result}
      loading={loading}
      emptyMessage="Quiet day — no commits in the last 24h"
      summary={summarizeCommits}
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
