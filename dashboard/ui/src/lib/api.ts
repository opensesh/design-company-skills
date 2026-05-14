// Envelope returned by every Fastify /api/* route in dashboard/src/routes/api.ts.
export type ApiResult<T> =
  | { success: true; configured: true; data: T }
  | { success: false; configured: false; error: string }
  | { success: false; configured: true; error: string }

export interface Commit {
  sha: string
  message: string
  author: string
  date: string
  repo: string
  url: string
}

export interface PullRequest {
  number: number
  title: string
  author: string
  state: string
  draft: boolean
  created_at: string
  updated_at: string
  repo: string
  url: string
  labels: string[]
}

export interface NotionTask {
  id: string
  title: string
  status: string
  due_date: string | null
  url: string
  priority?: string
}

export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  location?: string
  attendees: number
  htmlLink?: string
}

export interface Email {
  id: string
  threadId: string
  subject: string
  from: string
  date: string
  snippet: string
  labelIds: string[]
}

export interface Deployment {
  uid: string
  name: string
  url: string
  state: string
  created: number
  ready?: number
  target?: string
  source?: string
}

export interface DubLink {
  id: string
  domain: string
  key: string
  url: string
  shortLink: string
  clicks: number
  createdAt: string
  lastClicked?: string
}

export interface InstagramMetrics {
  followers_count: number
  follows_count: number
  media_count: number
  username: string
  name?: string
}

export interface HealthResponse {
  status: string
  timestamp: string
  cache: { hits: number; misses: number; keys: number; ksize: number; vsize: number }
  services: Record<string, boolean>
}

export async function fetchApi<T>(endpoint: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(endpoint)
    return (await response.json()) as ApiResult<T>
  } catch (error) {
    return {
      success: false,
      configured: true,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

export async function fetchHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch('/api/health')
    return (await response.json()) as HealthResponse
  } catch {
    return null
  }
}
