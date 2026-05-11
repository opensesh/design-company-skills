import { Octokit } from 'octokit';
import { cached } from '../cache.js';
import { getEnv, getTrackedRepos, type TrackedRepo } from '../config.js';

let octokit: Octokit | null = null;

function getClient(): Octokit {
  if (!octokit) {
    const token = getEnv('GITHUB_PERSONAL_ACCESS_TOKEN');
    if (!token) {
      throw new Error('GITHUB_PERSONAL_ACCESS_TOKEN not set');
    }
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  repo: string;
  url: string;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  state: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  repo: string;
  url: string;
  labels: string[];
}

export async function getRecentCommits(
  repos?: TrackedRepo[],
  since?: Date
): Promise<Commit[]> {
  const targetRepos = repos || getTrackedRepos();
  const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000);

  return cached(
    `github:commits:${targetRepos.map(r => r.full).join(',')}:${sinceDate.toISOString().split('T')[0]}`,
    async () => {
      const client = getClient();
      const allCommits: Commit[] = [];

      for (const repo of targetRepos) {
        try {
          const { data } = await client.rest.repos.listCommits({
            owner: repo.owner,
            repo: repo.repo,
            since: sinceDate.toISOString(),
            per_page: 30,
          });

          const commits = data.map(c => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message.split('\n')[0],
            author: c.commit.author?.name || c.author?.login || 'unknown',
            date: c.commit.author?.date || '',
            repo: repo.full,
            url: c.html_url,
          }));

          allCommits.push(...commits);
        } catch (error) {
          console.error(`Failed to fetch commits for ${repo.full}:`, error);
        }
      }

      // Sort by date descending
      return allCommits.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    { ttl: 300 }
  );
}

export async function getOpenPRs(repos?: TrackedRepo[]): Promise<PullRequest[]> {
  const targetRepos = repos || getTrackedRepos();

  return cached(
    `github:prs:${targetRepos.map(r => r.full).join(',')}`,
    async () => {
      const client = getClient();
      const allPRs: PullRequest[] = [];

      for (const repo of targetRepos) {
        try {
          const { data } = await client.rest.pulls.list({
            owner: repo.owner,
            repo: repo.repo,
            state: 'open',
            per_page: 30,
          });

          const prs = data.map(pr => ({
            number: pr.number,
            title: pr.title,
            author: pr.user?.login || 'unknown',
            state: pr.state,
            draft: pr.draft || false,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            repo: repo.full,
            url: pr.html_url,
            labels: pr.labels.map(l => (typeof l === 'string' ? l : l.name || '')),
          }));

          allPRs.push(...prs);
        } catch (error) {
          console.error(`Failed to fetch PRs for ${repo.full}:`, error);
        }
      }

      // Sort by updated_at descending
      return allPRs.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    },
    { ttl: 300 }
  );
}

export async function getRepoActivity(repos?: TrackedRepo[]) {
  const [commits, prs] = await Promise.all([
    getRecentCommits(repos),
    getOpenPRs(repos),
  ]);

  return {
    commits,
    prs,
    summary: {
      total_commits: commits.length,
      total_open_prs: prs.length,
      draft_prs: prs.filter(p => p.draft).length,
    },
  };
}

export function isConfigured(): boolean {
  return !!getEnv('GITHUB_PERSONAL_ACCESS_TOKEN');
}
