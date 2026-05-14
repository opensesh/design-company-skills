import { useEffect, useState } from 'react'
import { fetchHealth, type HealthResponse } from '@/lib/api'

interface FooterProps {
  refreshToken: number
}

export function Footer({ refreshToken }: FooterProps) {
  const [health, setHealth] = useState<HealthResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const h = await fetchHealth()
      if (!cancelled) setHealth(h)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshToken])

  if (!health) {
    return (
      <footer className="flex items-center justify-between px-6 py-3 border-t border-border bg-card text-xs text-muted-foreground">
        <span>Checking services…</span>
        <span>Open Session · DESIGN-OPS</span>
      </footer>
    )
  }

  const services = Object.entries(health.services)
  const connected = services.filter(([, v]) => v).length
  const total = services.length
  const cache = health.cache

  return (
    <footer className="flex items-center justify-between px-6 py-3 border-t border-border bg-card text-xs text-muted-foreground">
      <span>
        {connected} / {total} services connected
        {connected < total && (
          <>
            {' · '}
            <span className="text-foreground/70">
              {services.filter(([, v]) => !v).map(([k]) => k).join(', ')} not configured
            </span>
          </>
        )}
      </span>
      <span className="font-mono tabular-nums">
        cache {cache.keys} keys · {cache.hits} hits · {cache.misses} misses
      </span>
    </footer>
  )
}
