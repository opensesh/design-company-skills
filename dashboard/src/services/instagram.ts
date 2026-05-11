import { cached } from '../cache.js';
import { getEnv } from '../config.js';

const BASE_URL = 'https://graph.facebook.com/v21.0';

async function fetchMeta<T>(endpoint: string): Promise<T> {
  const token = getEnv('META_ACCESS_TOKEN');
  if (!token) {
    throw new Error('META_ACCESS_TOKEN not set');
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${endpoint}${separator}access_token=${token}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta Graph API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export interface InstagramMetrics {
  followers_count: number;
  follows_count: number;
  media_count: number;
  username: string;
  name?: string;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface MeAccountsResponse {
  data: Array<{
    id: string;
    instagram_business_account?: {
      id: string;
    };
  }>;
}

interface IGUserResponse {
  id: string;
  username: string;
  name?: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
}

interface IGMediaResponse {
  data: Array<{
    id: string;
    caption?: string;
    media_type: string;
    permalink: string;
    timestamp: string;
    like_count?: number;
    comments_count?: number;
  }>;
}

let cachedIGUserId: string | null = null;

async function getInstagramUserId(): Promise<string> {
  if (cachedIGUserId) {
    return cachedIGUserId;
  }

  // Get pages connected to the user
  const accounts = await fetchMeta<MeAccountsResponse>('/me/accounts');

  for (const page of accounts.data) {
    if (page.instagram_business_account?.id) {
      cachedIGUserId = page.instagram_business_account.id;
      return cachedIGUserId;
    }
  }

  throw new Error('No Instagram Business Account found connected to your Facebook pages');
}

export async function getMetrics(): Promise<InstagramMetrics> {
  return cached(
    'instagram:metrics',
    async () => {
      const userId = await getInstagramUserId();
      const data = await fetchMeta<IGUserResponse>(
        `/${userId}?fields=id,username,name,followers_count,follows_count,media_count`
      );

      return {
        followers_count: data.followers_count,
        follows_count: data.follows_count,
        media_count: data.media_count,
        username: data.username,
        name: data.name,
      };
    },
    { ttl: 600 }
  );
}

export async function getRecentPosts(limit = 10): Promise<InstagramPost[]> {
  return cached(
    `instagram:posts:${limit}`,
    async () => {
      const userId = await getInstagramUserId();
      const data = await fetchMeta<IGMediaResponse>(
        `/${userId}/media?fields=id,caption,media_type,permalink,timestamp,like_count,comments_count&limit=${limit}`
      );

      return data.data.map(post => ({
        id: post.id,
        caption: post.caption,
        media_type: post.media_type,
        permalink: post.permalink,
        timestamp: post.timestamp,
        like_count: post.like_count,
        comments_count: post.comments_count,
      }));
    },
    { ttl: 300 }
  );
}

export async function getActivity() {
  const [metrics, posts] = await Promise.all([
    getMetrics(),
    getRecentPosts(5),
  ]);

  const totalEngagement = posts.reduce(
    (sum, p) => sum + (p.like_count || 0) + (p.comments_count || 0),
    0
  );

  return {
    metrics,
    recent_posts: posts,
    summary: {
      followers: metrics.followers_count,
      total_posts: metrics.media_count,
      recent_engagement: totalEngagement,
    },
  };
}

export function isConfigured(): boolean {
  return !!getEnv('META_ACCESS_TOKEN');
}
