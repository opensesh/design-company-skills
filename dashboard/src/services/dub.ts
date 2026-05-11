import { cached } from '../cache.js';
import { getEnv } from '../config.js';

const BASE_URL = 'https://api.dub.co';

async function fetchDub<T>(endpoint: string): Promise<T> {
  const token = getEnv('DUB_API_KEY');
  if (!token) {
    throw new Error('DUB_API_KEY not set');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Dub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export interface DubLink {
  id: string;
  domain: string;
  key: string;
  url: string;
  shortLink: string;
  clicks: number;
  createdAt: string;
  lastClicked?: string;
}

export interface DubAnalytics {
  clicks: number;
  leads: number;
  sales: number;
}

interface LinksResponse extends Array<{
  id: string;
  domain: string;
  key: string;
  url: string;
  shortLink: string;
  clicks: number;
  createdAt: string;
  lastClicked?: string;
}> {}

export async function getLinks(limit = 20): Promise<DubLink[]> {
  return cached(
    `dub:links:${limit}`,
    async () => {
      const data = await fetchDub<LinksResponse>(
        `/links?sort=clicks&limit=${limit}`
      );
      return data.map(link => ({
        id: link.id,
        domain: link.domain,
        key: link.key,
        url: link.url,
        shortLink: link.shortLink,
        clicks: link.clicks,
        createdAt: link.createdAt,
        lastClicked: link.lastClicked,
      }));
    },
    { ttl: 300 }
  );
}

export async function getAnalytics(
  interval: 'day' | 'week' | 'month' = 'week'
): Promise<DubAnalytics> {
  return cached(
    `dub:analytics:${interval}`,
    async () => {
      const data = await fetchDub<{ clicks: number; leads: number; sales: number }>(
        `/analytics?interval=${interval === 'day' ? '24h' : interval === 'week' ? '7d' : '30d'}`
      );
      return {
        clicks: data.clicks || 0,
        leads: data.leads || 0,
        sales: data.sales || 0,
      };
    },
    { ttl: 300 }
  );
}

export async function getActivity() {
  const [links, analytics] = await Promise.all([
    getLinks(10),
    getAnalytics('week'),
  ]);

  return {
    top_links: links,
    analytics,
    summary: {
      total_links: links.length,
      total_clicks: links.reduce((sum, l) => sum + l.clicks, 0),
      clicks_this_week: analytics.clicks,
    },
  };
}

export function isConfigured(): boolean {
  return !!getEnv('DUB_API_KEY');
}
