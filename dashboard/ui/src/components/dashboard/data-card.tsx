import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Plug, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApiResult } from '@/lib/api'

type Status = 'loading' | 'success' | 'error' | 'not-configured' | 'empty'

interface DataCardProps<T> {
  title: string
  service: string
  result: ApiResult<T> | null
  loading: boolean
  /** Render data when present. Receiving the unwrapped value. Return null/empty array to trigger empty state. */
  render: (data: T) => ReactNode
  /** Optional summary line shown above the data — synthesized "30-second glance" text. */
  summary?: (data: T) => string | null
  /** Used to decide if data is "empty" — defaults to checking arrays. */
  isEmpty?: (data: T) => boolean
  onRetry?: () => void
  emptyMessage?: string
}

function defaultIsEmpty(data: unknown): boolean {
  if (Array.isArray(data)) return data.length === 0
  if (data === null || data === undefined) return true
  return false
}

function statusOf<T>(
  result: ApiResult<T> | null,
  loading: boolean,
  isEmpty: (data: T) => boolean
): { status: Status; data?: T; error?: string } {
  if (loading && !result) return { status: 'loading' }
  if (!result) return { status: 'loading' }
  if (!result.configured) return { status: 'not-configured', error: result.error }
  if (!result.success) return { status: 'error', error: result.error }
  if (isEmpty(result.data)) return { status: 'empty', data: result.data }
  return { status: 'success', data: result.data }
}

const STATUS_DOT: Record<Status, string> = {
  loading: 'bg-warning animate-pulse',
  success: 'bg-success',
  empty: 'bg-muted-foreground/40',
  error: 'bg-danger',
  'not-configured': 'bg-muted-foreground/40',
}

export function DataCard<T>({
  title,
  service,
  result,
  loading,
  render,
  summary,
  isEmpty,
  onRetry,
  emptyMessage = 'No data',
}: DataCardProps<T>) {
  const { status, data, error } = statusOf<T>(
    result,
    loading,
    isEmpty ?? (defaultIsEmpty as (d: T) => boolean)
  )

  const dot = (
    <span
      aria-hidden
      className={cn('inline-block size-2 rounded-full shrink-0', STATUS_DOT[status])}
    />
  )

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <CardTitle className="text-[13px] font-semibold tracking-tight">
          {title}
        </CardTitle>
        {dot}
      </CardHeader>
      <CardContent className="px-4 py-3 min-h-[120px]">
        {status === 'loading' && <LoadingState />}
        {status === 'not-configured' && <NotConfiguredState service={service} />}
        {status === 'error' && <ErrorState message={error ?? 'Unknown error'} onRetry={onRetry} />}
        {status === 'empty' && <EmptyState message={emptyMessage} />}
        {status === 'success' && data !== undefined && (
          <div className="space-y-3 dops-fade-in">
            {summary && (() => {
              const s = summary(data)
              return s ? (
                <div className="text-[13px] font-medium leading-snug text-foreground/90">
                  {s}
                </div>
              ) : null
            })()}
            <div>{render(data)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-2 py-1" aria-label="Loading">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

function NotConfiguredState({ service }: { service: string }) {
  return (
    <div className="flex flex-col items-start gap-2 py-1">
      <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
        <Plug className="size-4" />
        <span>{service} not connected</span>
      </div>
      <p className="text-xs text-muted-foreground/80 leading-snug">
        Run <code className="font-mono text-foreground/90">/design-ops:setup</code> to
        connect, or load credentials and restart the server.
      </p>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-2 py-1">
      <div className="flex items-center gap-2 text-danger text-[13px]">
        <AlertTriangle className="size-4" />
        <span className="font-medium">Couldn’t fetch</span>
      </div>
      <p className="text-xs text-muted-foreground leading-snug break-words">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="mt-1 h-7 gap-1.5 text-xs"
        >
          <RefreshCw className="size-3" /> Retry
        </Button>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-start gap-2 py-1">
      <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
        <Inbox className="size-4" />
        <span>{message}</span>
      </div>
    </div>
  )
}
