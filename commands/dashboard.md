# /design-ops:dashboard

Live web dashboard that runs as a local server with real-time updates.

**New in v2.0:** The dashboard now runs as a standalone web server with direct API integration for maximum performance (~50-100ms per API call vs ~500ms+ through MCP).

## Trigger

```bash
/design-ops:dashboard
```

## What It Does

1. **Verifies** that DESIGN-OPS is configured. If not, routes to
   `/design-ops:setup`.
2. **Verifies** the Notion tasks database ID is set in config. If
   missing, prompts the user for it (or skips if Notion isn't connected).
3. **Checks** if the dashboard server is already running.
4. **Tells the user how to start it** if not — they need to run it from
   their own terminal so 1Password / env credentials load correctly.
5. **Opens** the UI: `http://localhost:5173` in dev, or `:3847` after a
   production build.

## Features

### Three-Pillar Layout
- **Operations:** Calendar, Tasks, Email
- **Design:** Commits, PRs
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
| `VERCEL_TOKEN` | `op://DESIGN-OPS/Vercel-ops/credential` | Vercel API |
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
| `GET /api/vercel/deployments` | Recent deployments |
| `GET /api/dub/links` | Top performing links |
| `GET /api/instagram/metrics` | Follower metrics |
| `GET /api/dashboard` | Aggregated data for all services |

### Query Parameters

- `?timeframe=daily|weekly|quarterly` - Filter by timeframe
- `?repo=owner/name` - Filter by repository

---

## Workflow

The command is self-bootstrapping. Run through the checks in order
and short-circuit on the first missing piece.

### Step 0: Verify config

1. **Check** `~/.claude/design-ops-config.yaml` exists.
   - If missing: tell the user
     "DESIGN-OPS isn't configured yet. Run `/design-ops:setup` first,
     then come back to `/design-ops:dashboard`." Stop.
2. **Check** `pillars.operations.tools[id=notion].notion_tasks_database_id`
   is set in the config.
   - If missing AND Notion is connected: prompt the user
     "Paste the URL of your Notion tasks database — see the
     `### Notion — Tasks Database` block in `/design-ops:setup` for
     the format." Extract the 32-char hex ID, write it into the YAML.
   - If Notion isn't connected at all, skip this check; the Tasks
     card will render its "not connected" empty state.
3. **Check** dependencies installed: `dashboard/node_modules/` and
   `dashboard/ui/node_modules/` exist.
   - If either is missing: run `npm install` in `dashboard/`, then
     `npm install` in `dashboard/ui/`.

### Step 1: Check Server Status

```bash
curl -s -m 2 http://localhost:3847/api/health
```

If the server responds, jump to Step 3. If not, continue.

### Step 2: Start Server

The user must run this in **their own terminal** (the server inherits
env vars from the shell, so credentials need to be loaded there first):

```bash
cd ~/Documents/GitHub.nosync/DESIGN-OPS/dashboard
load-design-ops-secrets   # if using 1Password — refreshes env
npm run dev               # concurrently starts Fastify (:3847) + Vite (:5173)
```

`npm run dev` runs both the API server and the UI dev server in
parallel. Hot reload works on UI edits. For a production-style local
run: `npm run build && npm start` serves the built UI from Fastify on
:3847.

### Step 3: Open Browser

- **Dev mode** (after `npm run dev`): `http://localhost:5173` — Vite
  serves the UI with hot reload and proxies `/api/*` to Fastify.
- **Production mode** (after `npm run build && npm start`):
  `http://localhost:3847` — Fastify serves the built UI from
  `dashboard/ui/dist/`.

If `dashboard/ui/dist/` doesn't exist and the user hits :3847, they'll
see a "build required" placeholder page with instructions.

---

## Tech Stack

- **Runtime:** Node.js 20+
- **Server:** Fastify
- **Language:** TypeScript
- **API Clients:** Octokit, @notionhq/client, googleapis
- **Cache:** node-cache (5-min TTL)
- **Frontend:** React 19 + Vite + Tailwind v4 + shadcn/ui (local build,
  not committed to git)

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

### Service Shows "Not Connected"

The server reads tokens from `process.env` at startup. If a service
shows "not connected":

1. Run `load-design-ops-secrets` in the **same shell** where the server
   will start. (1Password recommended — see `/design-ops:setup` for the
   `op` references and item names.)
2. Verify the env var is populated: `echo ${#GITHUB_PERSONAL_ACCESS_TOKEN}`
   (length, not value — keep secrets out of scrollback).
3. Restart `npm run dev` in that same shell.

Common item-name drift to watch for: `Vercel-ops`, `Notion_API_Key`,
`Google OAuth` (with field labels `client id` (space) / `client_secret`
/ `refresh token`).

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
