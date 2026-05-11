import { cached } from '../cache.js';
import { getEnv } from '../config.js';

const BASE_URL = 'https://api.vercel.com';

async function fetchVercel<T>(endpoint: string): Promise<T> {
  const token = getEnv('VERCEL_TOKEN');
  if (!token) {
    throw new Error('VERCEL_TOKEN not set');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export interface Deployment {
  uid: string;
  name: string;
  url: string;
  state: string;
  created: number;
  ready?: number;
  target?: string;
  source?: string;
}

export interface Project {
  id: string;
  name: string;
  framework?: string;
  updatedAt: number;
}

interface DeploymentsResponse {
  deployments: Array<{
    uid: string;
    name: string;
    url: string;
    state: string;
    created: number;
    ready?: number;
    target?: string;
    source?: string;
  }>;
}

interface ProjectsResponse {
  projects: Array<{
    id: string;
    name: string;
    framework?: string;
    updatedAt: number;
  }>;
}

export async function getRecentDeployments(limit = 20): Promise<Deployment[]> {
  return cached(
    `vercel:deployments:${limit}`,
    async () => {
      const data = await fetchVercel<DeploymentsResponse>(
        `/v6/deployments?limit=${limit}`
      );
      return data.deployments.map(d => ({
        uid: d.uid,
        name: d.name,
        url: `https://${d.url}`,
        state: d.state,
        created: d.created,
        ready: d.ready,
        target: d.target,
        source: d.source,
      }));
    },
    { ttl: 300 }
  );
}

export async function getProjects(): Promise<Project[]> {
  return cached(
    'vercel:projects',
    async () => {
      const data = await fetchVercel<ProjectsResponse>('/v9/projects');
      return data.projects.map(p => ({
        id: p.id,
        name: p.name,
        framework: p.framework,
        updatedAt: p.updatedAt,
      }));
    },
    { ttl: 600 }
  );
}

export async function getActivity() {
  const deployments = await getRecentDeployments(10);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return {
    deployments,
    summary: {
      total_deployments: deployments.length,
      deployments_today: deployments.filter(d => now - d.created < day).length,
      successful: deployments.filter(d => d.state === 'READY').length,
      failed: deployments.filter(d => d.state === 'ERROR').length,
    },
  };
}

export function isConfigured(): boolean {
  return !!getEnv('VERCEL_TOKEN');
}
