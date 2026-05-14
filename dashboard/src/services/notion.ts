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

// Priority ordering supports the two common conventions:
// "Urgent/High/Medium/Low" labels and "P0..P3" numeric labels (P0 highest).
const PRIORITY_RANK: Record<string, number> = {
  urgent: 4, p0: 4,
  high: 3, p1: 3,
  medium: 2, med: 2, normal: 2, p2: 2,
  low: 1, p3: 1,
}

const DONE_STATUS_PATTERN = /^(done|complete|completed|closed|shipped|cancell?ed|wont do|won't do|won_t_do|archived)$/i
const IN_PROGRESS_PATTERN = /^(in[ _-]?progress|doing|active|started|in[ _-]?review)$/i

const PRIORITY_NAME_PATTERN = /^(priority|prio|importance)$/i
const STATUS_NAME_PATTERN = /^(status|state)$/i
const DUE_NAME_PATTERN = /^(due|deadline|due\s*date|target|when)$/i

type DetectedSchema = {
  priorityProp?: string
  statusProp?: string
  dueProp?: string
}

/**
 * Inspect a single page's properties to learn the schema once. We name-match
 * Priority / Status / Due where possible (more reliable than type-based
 * guessing across schemas with multiple select or date columns).
 */
function detectSchema(props: Record<string, { type: string }>): DetectedSchema {
  const schema: DetectedSchema = {}
  for (const [name, prop] of Object.entries(props)) {
    if (!schema.priorityProp && PRIORITY_NAME_PATTERN.test(name) &&
        (prop.type === 'select' || prop.type === 'status')) {
      schema.priorityProp = name
    } else if (!schema.statusProp && STATUS_NAME_PATTERN.test(name) &&
        (prop.type === 'status' || prop.type === 'select')) {
      schema.statusProp = name
    } else if (!schema.dueProp && DUE_NAME_PATTERN.test(name) && prop.type === 'date') {
      schema.dueProp = name
    }
  }
  // Fallbacks: if no name-matched date column, use the first date column.
  if (!schema.dueProp) {
    for (const [name, prop] of Object.entries(props)) {
      if (prop.type === 'date') { schema.dueProp = name; break }
    }
  }
  return schema
}

async function queryTargetedTaskDb(databaseId: string): Promise<NotionTask[]> {
  const client = getClient()
  const response = await client.databases.query({
    database_id: databaseId,
    page_size: 100,
    sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
  })

  const today = new Date().toISOString().split('T')[0]
  const tasks: NotionTask[] = []
  let schema: DetectedSchema | null = null

  for (const page of response.results) {
    if (page.object !== 'page' || !('properties' in page)) continue
    const props = page.properties
    if (!schema) schema = detectSchema(props)

    let title = 'Untitled'
    let status = ''
    let dueDate: string | null = null
    let priority: string | undefined

    for (const [name, prop] of Object.entries(props)) {
      if (prop.type === 'title' && prop.title.length > 0) {
        title = prop.title.map(t => t.plain_text).join('')
        continue
      }
      if (name === schema.statusProp) {
        if (prop.type === 'status' && prop.status?.name) status = prop.status.name
        else if (prop.type === 'select' && prop.select?.name) status = prop.select.name
        continue
      }
      if (name === schema.priorityProp) {
        if (prop.type === 'select' && prop.select?.name) priority = prop.select.name
        else if (prop.type === 'status' && prop.status?.name) priority = prop.status.name
        continue
      }
      if (name === schema.dueProp && prop.type === 'date' && prop.date?.start) {
        dueDate = prop.date.start
        continue
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
    const overdueDiff = Number(b.is_overdue) - Number(a.is_overdue)
    if (overdueDiff) return overdueDiff
    const aRank = PRIORITY_RANK[(a.priority ?? '').toLowerCase()] ?? 0
    const bRank = PRIORITY_RANK[(b.priority ?? '').toLowerCase()] ?? 0
    if (aRank !== bRank) return bRank - aRank
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
