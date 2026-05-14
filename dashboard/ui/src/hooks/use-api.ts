import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchApi, type ApiResult } from '@/lib/api'

interface UseApiState<T> {
  result: ApiResult<T> | null
  loading: boolean
}

/**
 * Fetches a single API endpoint and re-fetches when `refreshToken` changes.
 * `refreshToken` lets the parent coordinate a global refresh without each
 * card managing its own timer.
 */
export function useApi<T>(endpoint: string, refreshToken: number = 0) {
  const [state, setState] = useState<UseApiState<T>>({ result: null, loading: true })
  const aborted = useRef(false)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    const result = await fetchApi<T>(endpoint)
    if (!aborted.current) setState({ result, loading: false })
  }, [endpoint])

  useEffect(() => {
    aborted.current = false
    void load()
    return () => {
      aborted.current = true
    }
  }, [load, refreshToken])

  return state
}
