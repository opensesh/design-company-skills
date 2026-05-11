# DESIGN-OPS Live Dashboard

A real-time web dashboard for DESIGN-OPS with direct API integration.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm run dev

# Open in browser
open http://localhost:3847
```

## Features

- **Three-pillar layout**: Operations | Design | Analytics
- **Timeframe toggle**: Daily / Weekly / Quarterly
- **Repo filter**: Filter commits/PRs by repository
- **Auto-refresh**: Polls every 60 seconds
- **Dark mode**: Respects system preference
- **Direct APIs**: ~50-100ms per call (no MCP dependency)

## Environment Variables

The dashboard uses these environment variables:

| Variable | Service |
|----------|---------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub commits, PRs |
| `NOTION_API_KEY` | Notion tasks, pages |
| `GOOGLE_CLIENT_ID` | Google Calendar |
| `GOOGLE_CLIENT_SECRET` | Google Calendar |
| `GOOGLE_REFRESH_TOKEN` | Google Calendar |
| `FIGMA_ACCESS_TOKEN` | Figma activity |
| `VERCEL_TOKEN` | Vercel deployments |
| `DUB_API_KEY` | Dub.co links |
| `META_ACCESS_TOKEN` | Instagram metrics |

Load them via 1Password:

```bash
source ~/.zshrc
load-design-ops-secrets
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Server status |
| `GET /api/config` | Tracked repos/files |
| `GET /api/github/commits` | Recent commits |
| `GET /api/github/prs` | Open PRs |
| `GET /api/notion/tasks` | Tasks due today |
| `GET /api/google/calendar` | Today's events |
| `GET /api/vercel/deployments` | Recent deploys |
| `GET /api/dub/links` | Top links |
| `GET /api/instagram/metrics` | Follower count |
| `GET /api/figma/activity` | File activity |
| `GET /api/dashboard` | Aggregated data |

## Architecture

```
dashboard/
├── src/
│   ├── index.ts          # Entry point
│   ├── server.ts         # Fastify server
│   ├── config.ts         # Config loader
│   ├── cache.ts          # TTL cache
│   ├── routes/
│   │   ├── api.ts        # API routes
│   │   └── static.ts     # Static files
│   └── services/
│       ├── github.ts     # Octokit
│       ├── notion.ts     # @notionhq/client
│       ├── google.ts     # googleapis
│       ├── figma.ts      # REST API
│       ├── vercel.ts     # REST API
│       ├── dub.ts        # REST API
│       └── instagram.ts  # Graph API
└── public/
    ├── index.html        # SPA shell
    ├── app.js            # Frontend logic
    └── styles.css        # Brand styles
```

## Development

```bash
# Start with hot reload
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
npm start
```

## Configuration

The dashboard reads from `~/.claude/design-ops-config.yaml` for:
- Tracked repositories
- Tracked Figma files
- User preferences

---

Part of [DESIGN-OPS](https://github.com/opensesh/DESIGN-OPS)
