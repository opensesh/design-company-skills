import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { Badge } from '@/components/ui/badge'
import { truncate } from '@/lib/format'
import type { NotionTask } from '@/lib/api'

export function TasksCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<NotionTask[]>('/api/notion/tasks', refreshToken)

  return (
    <DataCard<NotionTask[]>
      title="Tasks Due"
      service="Notion"
      result={result}
      loading={loading}
      emptyMessage="No tasks due today"
      render={(tasks) => (
        <ItemList>
          {tasks.slice(0, 8).map((t) => (
            <Item
              key={t.id}
              title={truncate(t.title, 50)}
              meta={t.status}
              href={t.url}
              badge={t.priority ? <Badge variant="outline">{t.priority}</Badge> : null}
            />
          ))}
        </ItemList>
      )}
    />
  )
}
