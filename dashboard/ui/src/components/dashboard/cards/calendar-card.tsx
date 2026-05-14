import { useApi } from '@/hooks/use-api'
import { DataCard } from '@/components/dashboard/data-card'
import { Item, ItemList } from '@/components/dashboard/item-list'
import { formatTime, truncate } from '@/lib/format'
import type { CalendarEvent } from '@/lib/api'

function summarizeCalendar(events: CalendarEvent[]): string | null {
  if (events.length === 0) return null
  const now = Date.now()
  const upcoming = events.find((e) => new Date(e.start).getTime() > now)
  const label = events.length === 1 ? 'meeting' : 'meetings'
  if (upcoming) {
    return `${events.length} ${label} · next ${formatTime(upcoming.start)}`
  }
  return `${events.length} ${label} · all complete`
}

export function CalendarCard({ refreshToken }: { refreshToken: number }) {
  const { result, loading } = useApi<CalendarEvent[]>('/api/google/calendar', refreshToken)

  return (
    <DataCard<CalendarEvent[]>
      title="Today’s Calendar"
      service="Google Calendar"
      result={result}
      loading={loading}
      emptyMessage="No events today"
      summary={summarizeCalendar}
      render={(events) => (
        <ItemList>
          {events.slice(0, 6).map((e) => (
            <Item
              key={e.id}
              prefix={formatTime(e.start)}
              title={truncate(e.summary, 42)}
              meta={e.attendees > 1 ? `${e.attendees} attendees` : null}
              href={e.htmlLink}
            />
          ))}
        </ItemList>
      )}
    />
  )
}
