import { useCallback, useEffect, useState } from 'react'

const AUTO_REFRESH_MS = 60_000

export function useRefresh() {
  const [token, setToken] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const refresh = useCallback(() => {
    setToken((t) => t + 1)
    setLastRefresh(new Date())
  }, [])

  useEffect(() => {
    const id = setInterval(refresh, AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  return { token, refresh, lastRefresh }
}
