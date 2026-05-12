import { Client } from '@notionhq/client';
import { cached } from '../cache.js';
import { getEnv } from '../config.js';

let notion: Client | null = null;

function getClient(): Client {
  if (!notion) {
    const token = getEnv('NOTION_API_KEY');
    if (!token) {
      throw new Error('NOTION_API_KEY not set');
    }
    notion = new Client({ auth: token });
  }
  return notion;
}

export interface NotionTask {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  url: string;
  priority?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  last_edited: string;
  url: string;
  icon?: string;
}

export async function searchRecentPages(limit = 20): Promise<NotionPage[]> {
  return cached(
    `notion:recent_pages:${limit}`,
    async () => {
      const client = getClient();

      const response = await client.search({
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
        page_size: limit,
      });

      return response.results
        .filter((r): r is Extract<typeof r, { object: 'page'; url: string }> =>
          r.object === 'page' && 'url' in r && 'last_edited_time' in r
        )
        .map(page => {
          const titleProp = 'properties' in page
            ? Object.values(page.properties).find(p => p.type === 'title')
            : null;

          let title = 'Untitled';
          if (titleProp && titleProp.type === 'title' && titleProp.title.length > 0) {
            title = titleProp.title.map(t => t.plain_text).join('');
          }

          const iconEmoji = 'icon' in page && page.icon?.type === 'emoji'
            ? page.icon.emoji
            : undefined;

          return {
            id: page.id,
            title,
            last_edited: (page as { last_edited_time: string }).last_edited_time,
            url: page.url,
            icon: iconEmoji,
          };
        });
    },
    { ttl: 300 }
  );
}

export async function getTasksDueToday(): Promise<NotionTask[]> {
  return cached(
    'notion:tasks_due_today',
    async () => {
      const client = getClient();
      const today = new Date().toISOString().split('T')[0];

      // Search for databases that might be task databases
      const searchResponse = await client.search({
        filter: { property: 'object', value: 'database' },
        page_size: 10,
      });

      console.log(`[Notion] Searching for tasks due: ${today}`);
      console.log(`[Notion] Found ${searchResponse.results.length} databases`);

      const tasks: NotionTask[] = [];

      for (const db of searchResponse.results) {
        if (db.object !== 'database') continue;

        const dbTitle = 'title' in db && Array.isArray(db.title) && db.title.length > 0
          ? db.title.map((t: { plain_text?: string }) => t.plain_text || '').join('')
          : 'Untitled';

        try {
          // Query the database for pages
          const queryResponse = await client.databases.query({
            database_id: db.id,
            page_size: 50,
          });

          console.log(`[Notion] Checking database "${dbTitle}" (${queryResponse.results.length} pages)`);

          for (const page of queryResponse.results) {
            if (page.object !== 'page' || !('properties' in page)) continue;

            const props = page.properties;

            // Try to find title
            const titleProp = Object.values(props).find(p => p.type === 'title');
            let title = 'Untitled';
            if (titleProp?.type === 'title' && titleProp.title.length > 0) {
              title = titleProp.title.map(t => t.plain_text).join('');
            }

            // Try to find due date
            let dueDate: string | null = null;
            for (const prop of Object.values(props)) {
              if (prop.type === 'date' && prop.date?.start) {
                const start = prop.date.start;
                if (start.startsWith(today)) {
                  dueDate = start;
                  break;
                }
              }
            }

            // Try to find status
            let status = 'Unknown';
            for (const prop of Object.values(props)) {
              if (prop.type === 'status' && prop.status?.name) {
                status = prop.status.name;
                break;
              } else if (prop.type === 'select' && prop.select?.name) {
                status = prop.select.name;
                break;
              }
            }

            if (dueDate) {
              console.log(`[Notion] Found task due today: "${title}"`);
              tasks.push({
                id: page.id,
                title,
                status,
                due_date: dueDate,
                url: page.url,
              });
            }
          }
        } catch (err) {
          console.log(`[Notion] Error querying database "${dbTitle}":`, err);
          continue;
        }
      }

      console.log(`[Notion] Total tasks found due today: ${tasks.length}`);
      return tasks;
    },
    { ttl: 300 }
  );
}

export async function getActivity() {
  const [recentPages, tasksDue] = await Promise.all([
    searchRecentPages(10),
    getTasksDueToday(),
  ]);

  return {
    recent_pages: recentPages,
    tasks_due_today: tasksDue,
    summary: {
      pages_edited_24h: recentPages.filter(p => {
        const edited = new Date(p.last_edited);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return edited > yesterday;
      }).length,
      tasks_due: tasksDue.length,
    },
  };
}

export function isConfigured(): boolean {
  return !!getEnv('NOTION_API_KEY');
}
