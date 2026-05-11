# /design-ops:dashboard

Live web dashboard that runs as a local server with real-time updates.

**New in v2.0:** The dashboard now runs as a standalone web server with direct API integration for maximum performance (~50-100ms per API call vs ~500ms+ through MCP).

## Trigger

```bash
/design-ops:dashboard
```

## What It Does

1. **Checks** if the dashboard server is already running
2. **Starts** the server if needed (`npm run dev` in background)
3. **Opens** `http://localhost:3847` in your browser
4. **Displays** real-time data from all connected services

## Features

### Three-Pillar Layout
- **Operations:** Calendar, Tasks, Email
- **Design:** Commits, PRs, Figma Activity
- **Analytics:** Deployments, Links, Social

### Timeframe Toggle
Switch between Daily, Weekly, and Quarterly views with a single click.

### Repo Filter
Filter GitHub commits and PRs by specific repository.

### Auto-Refresh
Data refreshes every 60 seconds automatically.

### Dark Mode
Automatically respects your system preference.

---

## Manual Usage

You can also run the dashboard independently of Claude Code:

```bash
cd ~/.claude/plugins/design-ops/dashboard
# Or if using local DESIGN-OPS repo:
cd ~/path/to/DESIGN-OPS/dashboard

# Install dependencies (first time only)
npm install

# Start the server
npm run dev
```

Then open `http://localhost:3847` in your browser.

---

## Required Environment Variables

The dashboard needs these environment variables (loaded via `load-design-ops-secrets`):

| Variable | 1Password Reference | Used By |
|----------|---------------------|---------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | `op://DESIGN-OPS/GitHub Token/credential` | GitHub API |
| `NOTION_API_KEY` | `op://DESIGN-OPS/Notion_API_Key/credential` | Notion API |
| `GOOGLE_CLIENT_ID` | Google OAuth | Google Calendar |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Google Calendar |
| `GOOGLE_REFRESH_TOKEN` | Google OAuth | Google Calendar |
| `FIGMA_ACCESS_TOKEN` | Figma token | Figma API |
| `VERCEL_TOKEN` | Vercel token | Vercel API |
| `DUB_API_KEY` | `op://DESIGN-OPS/Dub.co API/credential` | Dub.co API |
| `META_ACCESS_TOKEN` | `op://DESIGN-OPS/Meta Graph API/access token` | Instagram |

**Note:** Services without credentials will show "not configured" state with guidance.

---

## API Endpoints

The dashboard server exposes these endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Server status and service configuration |
| `GET /api/config` | Tracked repos and preferences |
| `GET /api/github/commits` | Recent commits (with timeframe/repo filters) |
| `GET /api/github/prs` | Open PRs (with repo filter) |
| `GET /api/notion/tasks` | Tasks due today |
| `GET /api/notion/pages` | Recently edited pages |
| `GET /api/google/calendar` | Today's events |
| `GET /api/google/email` | Unread important emails |
| `GET /api/figma/activity` | File activity and comments |
| `GET /api/vercel/deployments` | Recent deployments |
| `GET /api/dub/links` | Top performing links |
| `GET /api/instagram/metrics` | Follower metrics |
| `GET /api/dashboard` | Aggregated data for all services |

### Query Parameters

- `?timeframe=daily|weekly|quarterly` - Filter by timeframe
- `?repo=owner/name` - Filter by repository

---

## Workflow

### Step 1: Check Server Status

```bash
curl http://localhost:3847/api/health
```

If the server is running, you'll get a JSON response with service status.

### Step 2: Start Server (if needed)

```bash
cd DESIGN-OPS/dashboard
npm run dev
```

The server starts in ~2 seconds and logs:
```
DESIGN-OPS Dashboard
─────────────────────
Dashboard:  http://localhost:3847
API:        http://localhost:3847/api/health
```

### Step 3: Open Browser

Navigate to `http://localhost:3847` or let the command open it for you.

---

## Tech Stack

- **Runtime:** Node.js 20+
- **Server:** Fastify
- **Language:** TypeScript
- **API Clients:** Octokit, @notionhq/client, googleapis
- **Cache:** node-cache (5-min TTL)
- **Frontend:** Vanilla JS + CSS (no build required)

---

## CLI Alternative

For terminal-based output, use the legacy command:

```bash
/design-ops:daily_brief
/design-ops:weekly_recap
```

These generate markdown reports directly in the terminal.

---

## Troubleshooting

### Server Won't Start

1. Check Node.js version: `node --version` (needs 20+)
2. Install dependencies: `npm install`
3. Check for port conflicts: `lsof -i :3847`

### Service Shows "Not Configured"

Run `load-design-ops-secrets` to load 1Password credentials, then restart the server.

### Data Not Refreshing

Click the refresh button or check the network tab for API errors.

### Google OAuth Setup

1. Visit `http://localhost:3847/auth/google`
2. Complete OAuth flow
3. Copy the refresh token
4. Add to 1Password and re-run `load-design-ops-secrets`

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/design-ops:dashboard` | Open live web dashboard |
| `/design-ops:daily_brief` | CLI daily summary |
| `/design-ops:weekly_recap` | CLI weekly summary |
| `/design-ops:validate` | Validate tool connections |
| `/design-ops:status` | Quick status check |

---

*Version: 2.0*
