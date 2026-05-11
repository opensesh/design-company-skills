import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as github from '../services/github.js';
import * as notion from '../services/notion.js';
import * as vercel from '../services/vercel.js';
import * as dub from '../services/dub.js';
import * as instagram from '../services/instagram.js';
import * as figma from '../services/figma.js';
import * as google from '../services/google.js';
import { getStats, clearAll } from '../cache.js';
import { loadConfig, getTrackedRepos, getTrackedFigmaFiles } from '../config.js';

interface TimeframeQuery {
  timeframe?: 'daily' | 'weekly' | 'quarterly';
  repo?: string;
}

function getDateRange(timeframe: string): { since: Date; days: number } {
  const now = new Date();
  switch (timeframe) {
    case 'weekly':
      return { since: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), days: 7 };
    case 'quarterly':
      return { since: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), days: 90 };
    case 'daily':
    default:
      return { since: new Date(now.getTime() - 24 * 60 * 60 * 1000), days: 1 };
  }
}

async function wrapHandler<T>(
  service: string,
  isConfigured: () => boolean,
  handler: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; configured: boolean }> {
  if (!isConfigured()) {
    return {
      success: false,
      configured: false,
      error: `${service} not configured - missing API credentials`,
    };
  }

  try {
    const data = await handler();
    return { success: true, configured: true, data };
  } catch (error) {
    return {
      success: false,
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function registerApiRoutes(app: FastifyInstance) {
  // Health check
  app.get('/api/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      cache: getStats(),
      services: {
        github: github.isConfigured(),
        notion: notion.isConfigured(),
        vercel: vercel.isConfigured(),
        dub: dub.isConfigured(),
        instagram: instagram.isConfigured(),
        figma: figma.isConfigured(),
        google: google.isConfigured(),
      },
    };
  });

  // Config info
  app.get('/api/config', async () => {
    const config = loadConfig();
    return {
      tracked_repos: getTrackedRepos(),
      tracked_figma_files: getTrackedFigmaFiles(),
      preferences: config.preferences,
      pillars: {
        operations: config.pillars.operations.enabled,
        design: config.pillars.design.enabled,
        analytics: config.pillars.analytics.enabled,
      },
    };
  });

  // Cache management
  app.post('/api/cache/clear', async () => {
    clearAll();
    return { success: true, message: 'Cache cleared' };
  });

  // GitHub endpoints
  app.get(
    '/api/github/commits',
    async (request: FastifyRequest<{ Querystring: TimeframeQuery }>) => {
      const { timeframe = 'daily', repo } = request.query;
      const { since } = getDateRange(timeframe);

      let repos = getTrackedRepos();
      if (repo) {
        repos = repos.filter(r => r.full === repo || r.repo === repo);
      }

      return wrapHandler('GitHub', github.isConfigured, () =>
        github.getRecentCommits(repos, since)
      );
    }
  );

  app.get(
    '/api/github/prs',
    async (request: FastifyRequest<{ Querystring: TimeframeQuery }>) => {
      const { repo } = request.query;

      let repos = getTrackedRepos();
      if (repo) {
        repos = repos.filter(r => r.full === repo || r.repo === repo);
      }

      return wrapHandler('GitHub', github.isConfigured, () =>
        github.getOpenPRs(repos)
      );
    }
  );

  app.get(
    '/api/github/activity',
    async (request: FastifyRequest<{ Querystring: TimeframeQuery }>) => {
      const { repo } = request.query;

      let repos = getTrackedRepos();
      if (repo) {
        repos = repos.filter(r => r.full === repo || r.repo === repo);
      }

      return wrapHandler('GitHub', github.isConfigured, () =>
        github.getRepoActivity(repos)
      );
    }
  );

  // Notion endpoints
  app.get('/api/notion/tasks', async () => {
    return wrapHandler('Notion', notion.isConfigured, () =>
      notion.getTasksDueToday()
    );
  });

  app.get('/api/notion/pages', async () => {
    return wrapHandler('Notion', notion.isConfigured, () =>
      notion.searchRecentPages(20)
    );
  });

  app.get('/api/notion/activity', async () => {
    return wrapHandler('Notion', notion.isConfigured, () => notion.getActivity());
  });

  // Vercel endpoints
  app.get('/api/vercel/deployments', async () => {
    return wrapHandler('Vercel', vercel.isConfigured, () =>
      vercel.getRecentDeployments(20)
    );
  });

  app.get('/api/vercel/activity', async () => {
    return wrapHandler('Vercel', vercel.isConfigured, () => vercel.getActivity());
  });

  // Dub.co endpoints
  app.get('/api/dub/links', async () => {
    return wrapHandler('Dub', dub.isConfigured, () => dub.getLinks(20));
  });

  app.get(
    '/api/dub/analytics',
    async (request: FastifyRequest<{ Querystring: TimeframeQuery }>) => {
      const { timeframe = 'weekly' } = request.query;
      const interval =
        timeframe === 'daily' ? 'day' : timeframe === 'quarterly' ? 'month' : 'week';

      return wrapHandler('Dub', dub.isConfigured, () => dub.getAnalytics(interval));
    }
  );

  app.get('/api/dub/activity', async () => {
    return wrapHandler('Dub', dub.isConfigured, () => dub.getActivity());
  });

  // Instagram endpoints
  app.get('/api/instagram/metrics', async () => {
    return wrapHandler('Instagram', instagram.isConfigured, () =>
      instagram.getMetrics()
    );
  });

  app.get('/api/instagram/posts', async () => {
    return wrapHandler('Instagram', instagram.isConfigured, () =>
      instagram.getRecentPosts(10)
    );
  });

  app.get('/api/instagram/activity', async () => {
    return wrapHandler('Instagram', instagram.isConfigured, () =>
      instagram.getActivity()
    );
  });

  // Figma endpoints
  app.get('/api/figma/activity', async () => {
    return wrapHandler('Figma', figma.isConfigured, () =>
      figma.getTrackedFilesActivity()
    );
  });

  // Google endpoints
  app.get('/api/google/calendar', async () => {
    return wrapHandler('Google', google.isConfigured, () =>
      google.getTodaysEvents()
    );
  });

  app.get(
    '/api/google/calendar/upcoming',
    async (request: FastifyRequest<{ Querystring: { days?: string } }>) => {
      const days = parseInt(request.query.days || '7', 10);
      return wrapHandler('Google', google.isConfigured, () =>
        google.getUpcomingEvents(days)
      );
    }
  );

  app.get('/api/google/email', async () => {
    return wrapHandler('Google', google.isConfigured, () =>
      google.getUnreadEmails(20)
    );
  });

  app.get('/api/google/activity', async () => {
    return wrapHandler('Google', google.isConfigured, () => google.getActivity());
  });

  // Google OAuth routes (for setup)
  app.get('/auth/google', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authUrl = google.getAuthUrl();
      return reply.redirect(authUrl);
    } catch (error) {
      return {
        success: false,
        error: 'Google OAuth not configured',
        message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables',
      };
    }
  });

  app.get(
    '/auth/google/callback',
    async (
      request: FastifyRequest<{ Querystring: { code?: string; error?: string } }>,
      reply: FastifyReply
    ) => {
      const { code, error } = request.query;

      if (error) {
        return reply.type('text/html').send(`
          <html>
            <body style="font-family: system-ui; padding: 2rem;">
              <h1>OAuth Error</h1>
              <p>${error}</p>
              <a href="/">Return to Dashboard</a>
            </body>
          </html>
        `);
      }

      if (!code) {
        return reply.type('text/html').send(`
          <html>
            <body style="font-family: system-ui; padding: 2rem;">
              <h1>Missing Authorization Code</h1>
              <a href="/">Return to Dashboard</a>
            </body>
          </html>
        `);
      }

      try {
        const tokens = await google.exchangeCodeForTokens(code);
        return reply.type('text/html').send(`
          <html>
            <body style="font-family: system-ui; padding: 2rem;">
              <h1>Google OAuth Success</h1>
              <p>Save this refresh token in 1Password as GOOGLE_REFRESH_TOKEN:</p>
              <pre style="background: #f0f0f0; padding: 1rem; overflow-x: auto;">${tokens.refresh_token}</pre>
              <p>Then restart the dashboard server.</p>
              <a href="/">Return to Dashboard</a>
            </body>
          </html>
        `);
      } catch (err) {
        return reply.type('text/html').send(`
          <html>
            <body style="font-family: system-ui; padding: 2rem;">
              <h1>Token Exchange Failed</h1>
              <p>${err instanceof Error ? err.message : 'Unknown error'}</p>
              <a href="/">Return to Dashboard</a>
            </body>
          </html>
        `);
      }
    }
  );

  // Aggregated dashboard data
  app.get(
    '/api/dashboard',
    async (request: FastifyRequest<{ Querystring: TimeframeQuery }>) => {
      const { timeframe = 'daily' } = request.query;

      const results = await Promise.allSettled([
        github.isConfigured() ? github.getRepoActivity() : Promise.resolve(null),
        notion.isConfigured() ? notion.getActivity() : Promise.resolve(null),
        vercel.isConfigured() ? vercel.getActivity() : Promise.resolve(null),
        dub.isConfigured() ? dub.getActivity() : Promise.resolve(null),
        instagram.isConfigured() ? instagram.getActivity() : Promise.resolve(null),
        figma.isConfigured()
          ? figma.getTrackedFilesActivity()
          : Promise.resolve(null),
        google.isConfigured() ? google.getActivity() : Promise.resolve(null),
      ]);

      const [
        githubResult,
        notionResult,
        vercelResult,
        dubResult,
        instagramResult,
        figmaResult,
        googleResult,
      ] = results;

      return {
        timeframe,
        timestamp: new Date().toISOString(),
        pillars: {
          operations: {
            notion:
              notionResult.status === 'fulfilled'
                ? { success: true, data: notionResult.value }
                : { success: false, error: notionResult.reason?.message },
            google:
              googleResult.status === 'fulfilled'
                ? { success: true, data: googleResult.value }
                : { success: false, error: googleResult.reason?.message },
          },
          design: {
            github:
              githubResult.status === 'fulfilled'
                ? { success: true, data: githubResult.value }
                : { success: false, error: githubResult.reason?.message },
            figma:
              figmaResult.status === 'fulfilled'
                ? { success: true, data: figmaResult.value }
                : { success: false, error: figmaResult.reason?.message },
          },
          analytics: {
            vercel:
              vercelResult.status === 'fulfilled'
                ? { success: true, data: vercelResult.value }
                : { success: false, error: vercelResult.reason?.message },
            dub:
              dubResult.status === 'fulfilled'
                ? { success: true, data: dubResult.value }
                : { success: false, error: dubResult.reason?.message },
            instagram:
              instagramResult.status === 'fulfilled'
                ? { success: true, data: instagramResult.value }
                : { success: false, error: instagramResult.reason?.message },
          },
        },
      };
    }
  );
}
