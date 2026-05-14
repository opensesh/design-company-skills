import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { formatRelative, truncate } from '@/lib/format'
import type { Email } from '@/lib/api'

export function EmailCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<Email[]>('/api/google/email', refreshToken)

  return (
    <DataCard<Email[]>
      title="Unread Important"
      service="Gmail"
      result={result}
      loading={loading}
      emptyMessage="No unread important emails"
      render={(emails) => (
        <ItemList>
          {emails.slice(0, 6).map((e) => (
            <Item
              key={e.id}
              title={truncate(e.subject || '(no subject)', 45)}
              meta={`${truncate(e.from, 28)} · ${formatRelative(e.date)}`}
            />
          ))}
        </ItemList>
      )}
    />
  )
}
