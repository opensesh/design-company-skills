import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { Badge } from '@/components/ui/badge'
import { truncate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { NotionTask } from '@/lib/api'

const PRIORITY_VARIANT: Record<string, string> = {
  urgent: 'bg-danger/15 text-danger border-danger/30',
  high: 'bg-warning/15 text-warning border-warning/30',
  medium: 'bg-muted text-muted-foreground border-border',
  low: 'bg-muted text-muted-foreground border-border',
}

function priorityBadgeClass(priority?: string): string {
  if (!priority) return ''
  return PRIORITY_VARIANT[priority.toLowerCase()] ?? PRIORITY_VARIANT.medium
}

function summarizeTasks(tasks: NotionTask[]): string {
  const overdue = tasks.filter((t) => t.is_overdue).length
  const inProgress = tasks.filter((t) => t.is_in_progress).length
  const parts: string[] = []
  parts.push(`${tasks.length} active`)
  if (overdue > 0) parts.push(`${overdue} overdue`)
  if (inProgress > 0) parts.push(`${inProgress} in progress`)
  return parts.join(' · ')
}

export function TasksCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<NotionTask[]>('/api/notion/tasks', refreshToken)

  return (
    <DataCard<NotionTask[]>
      title="Tasks"
      service="Notion"
      result={result}
      loading={loading}
      emptyMessage="Inbox zero — no active tasks"
      summary={summarizeTasks}
      render={(tasks) => (
        <ItemList>
          {tasks.slice(0, 8).map((t) => (
            <Item
              key={t.id}
              title={
                <span className="inline-flex items-center gap-1.5">
                  {t.is_overdue && (
                    <span
                      aria-label="overdue"
                      className="inline-block size-1.5 rounded-full bg-danger shrink-0"
                    />
                  )}
                  <span>{truncate(t.title, 50)}</span>
                </span>
              }
              meta={t.status}
              href={t.url}
              badge={
                t.priority ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-mono text-[10px] uppercase',
                      priorityBadgeClass(t.priority)
                    )}
                  >
                    {t.priority}
                  </Badge>
                ) : null
              }
            />
          ))}
        </ItemList>
      )}
    />
  )
}
