import { Client } from '@notionhq/client'
import { cached } from '../cache.js'
import { getEnv, getNotionTasksDatabaseId } from '../config.js'

let notion: Client | null = null

function getClient(): Client {
  if (!notion) {
    const token = getEnv('NOTION_API_KEY')
    if (!token) {
      throw new Error('NOTION_API_KEY not set')
    }
    notion = new Client({ auth: token })
  }
  return notion
}

export interface NotionTask {
  id: string
  title: string
  status: string
  due_date: string | null
  url: string
  priority?: string
  is_overdue?: boolean
  is_in_progress?: boolean
}

export interface NotionPage {
  id: string
  title: string
  last_edited: string
  url: string
  icon?: string
}

export async function searchRecentPages(limit = 20): Promise<NotionPage[]> {
  return cached(
    `notion:recent_pages:${limit}`,
    async () => {
      const client = getClient()
      const response = await client.search({
        sort: { direction: 'descending', timestamp: 'last_edited_time' },
        page_size: limit,
      })

      return response.results
        .filter((r): r is Extract<typeof r, { object: 'page'; url: string }> =>
          r.object === 'page' && 'url' in r && 'last_edited_time' in r
        )
        .map(page => {
          const titleProp = 'properties' in page
            ? Object.values(page.properties).find(p => p.type === 'title')
            : null
          let title = 'Untitled'
          if (titleProp && titleProp.type === 'title' && titleProp.title.length > 0) {
            title = titleProp.title.map(t => t.plain_text).join('')
          }
          const iconEmoji = 'icon' in page && page.icon?.type === 'emoji'
            ? page.icon.emoji
            : undefined

          return {
            id: page.id,
            title,
            last_edited: (page as { last_edited_time: string }).last_edited_time,
            url: page.url,
            icon: iconEmoji,
          }
        })
    },
    { ttl: 300 }
  )
}

/**
 * Pulls tasks from the configured Notion database (notion_tasks_database_id
 * in design-ops-config.yaml). Detects property names by type rather than
 * hardcoded label so this works across slightly-different schemas.
 *
 * Returns up to 20 tasks, ranked by priority desc then due asc, excluding
 * statuses that look like Done/Complete. Overdue and in-progress flags are
 * surfaced so the UI can synthesize a "X due · Y in progress · Z overdue"
 * hero line.
 *
 * Falls back to the legacy iterate-every-shared-database behavior if no
 * database id is configured — useful for first-run users before /setup.
 */
export async function getTopTasks(): Promise<NotionTask[]> {
  const databaseId = getNotionTasksDatabaseId()
  if (!databaseId) {
    return getTasksDueTodayLegacy()
  }
  return cached(
    `notion:top_tasks:${databaseId}`,
    () => queryTargetedTaskDb(databaseId),
    { ttl: 300 }
  )
}

const PRIORITY_RANK: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  med: 2,
  normal: 2,
  low: 1,
}

const DONE_STATUS_PATTERN = /^(done|complete|completed|closed|shipped|cancell?ed|wont do|won't do|won_t_do|archived)$/i
const IN_PROGRESS_PATTERN = /^(in[ _-]?progress|doing|active|started)$/i

async function queryTargetedTaskDb(databaseId: string): Promise<NotionTask[]> {
  const client = getClient()
  // Query without server-side filters — the user's schema may not have a
  // standard "Status" property name, so we filter client-side after
  // detecting the property types.
  const response = await client.databases.query({
    database_id: databaseId,
    page_size: 100,
    sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
  })

  const today = new Date().toISOString().split('T')[0]
  const tasks: NotionTask[] = []

  for (const page of response.results) {
    if (page.object !== 'page' || !('properties' in page)) continue
    const props = page.properties

    let title = 'Untitled'
    let status = ''
    let dueDate: string | null = null
    let priority: string | undefined

    for (const prop of Object.values(props)) {
      switch (prop.type) {
        case 'title':
          if (prop.title.length > 0) {
            title = prop.title.map(t => t.plain_text).join('')
          }
          break
        case 'status':
          if (prop.status?.name) status = prop.status.name
          break
        case 'select':
          if (prop.select?.name) {
            // Heuristic: a select containing "urgent/high/medium/low" is the
            // priority column; otherwise treat it as status only if we
            // haven't found a real Status property yet.
            const name = prop.select.name.toLowerCase()
            if (PRIORITY_RANK[name] !== undefined && !priority) {
              priority = prop.select.name
            } else if (!status) {
              status = prop.select.name
            }
          }
          break
        case 'date':
          if (prop.date?.start && !dueDate) {
            dueDate = prop.date.start
          }
          break
      }
    }

    if (status && DONE_STATUS_PATTERN.test(status)) continue

    const url = 'url' in page ? page.url : ''
    const isOverdue = !!(dueDate && dueDate < today)
    const isInProgress = !!status && IN_PROGRESS_PATTERN.test(status)

    tasks.push({
      id: page.id,
      title,
      status: status || 'Unknown',
      due_date: dueDate,
      url,
      priority,
      is_overdue: isOverdue,
      is_in_progress: isInProgress,
    })
  }

  tasks.sort((a, b) => {
    // Overdue first.
    const overdueDiff = Number(b.is_overdue) - Number(a.is_overdue)
    if (overdueDiff) return overdueDiff
    // Then by priority (higher rank first).
    const aRank = PRIORITY_RANK[(a.priority ?? '').toLowerCase()] ?? 0
    const bRank = PRIORITY_RANK[(b.priority ?? '').toLowerCase()] ?? 0
    if (aRank !== bRank) return bRank - aRank
    // Then by soonest due date.
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
    if (a.due_date) return -1
    if (b.due_date) return 1
    return 0
  })

  return tasks.slice(0, 20)
}

/** Legacy fallback: iterate every shared database, dump anything due today. */
async function getTasksDueTodayLegacy(): Promise<NotionTask[]> {
  return cached(
    'notion:tasks_due_today_legacy',
    async () => {
      const client = getClient()
      const today = new Date().toISOString().split('T')[0]

      const searchResponse = await client.search({
        filter: { property: 'object', value: 'database' },
        page_size: 10,
      })

      const tasks: NotionTask[] = []

      for (const db of searchResponse.results) {
        if (db.object !== 'database') continue
        try {
          const queryResponse = await client.databases.query({
            database_id: db.id,
            page_size: 50,
          })

          for (const page of queryResponse.results) {
            if (page.object !== 'page' || !('properties' in page)) continue
            const props = page.properties

            const titleProp = Object.values(props).find(p => p.type === 'title')
            let title = 'Untitled'
            if (titleProp?.type === 'title' && titleProp.title.length > 0) {
              title = titleProp.title.map(t => t.plain_text).join('')
            }

            let dueDate: string | null = null
            for (const prop of Object.values(props)) {
              if (prop.type === 'date' && prop.date?.start) {
                const start = prop.date.start
                if (start.startsWith(today)) {
                  dueDate = start
                  break
                }
              }
            }

            let status = 'Unknown'
            for (const prop of Object.values(props)) {
              if (prop.type === 'status' && prop.status?.name) {
                status = prop.status.name
                break
              } else if (prop.type === 'select' && prop.select?.name) {
                status = prop.select.name
                break
              }
            }

            if (dueDate) {
              tasks.push({
                id: page.id,
                title,
                status,
                due_date: dueDate,
                url: 'url' in page ? page.url : '',
              })
            }
          }
        } catch {
          continue
        }
      }

      return tasks
    },
    { ttl: 300 }
  )
}

export async function getActivity() {
  const [recentPages, tasks] = await Promise.all([
    searchRecentPages(10),
    getTopTasks(),
  ])

  return {
    recent_pages: recentPages,
    tasks_due_today: tasks,
    summary: {
      pages_edited_24h: recentPages.filter(p => {
        const edited = new Date(p.last_edited)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return edited > yesterday
      }).length,
      tasks_total: tasks.length,
      tasks_overdue: tasks.filter(t => t.is_overdue).length,
      tasks_in_progress: tasks.filter(t => t.is_in_progress).length,
    },
  }
}

export function isConfigured(): boolean {
  return !!getEnv('NOTION_API_KEY')
}
