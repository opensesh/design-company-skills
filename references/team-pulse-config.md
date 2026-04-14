# Team Pulse Configuration Reference

This document describes the configuration schema for the Team Pulse plugin.

## Config Location

```
~/.claude/team-pulse-config.yaml
```

Run `/team-pulse-setup` for guided configuration, or copy the template from `templates/team-pulse-config.yaml`.

---

## Schema

### `figma`

Figma integration for tracking design activity.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `api_token` | string | Yes | Personal access token from Figma. Get it at Settings → Account → Personal access tokens. Needs "File content" scope. |
| `tracked_projects` | array | No* | List of Figma projects to monitor |
| `tracked_projects[].id` | string | Yes | Project ID (from URL: `figma.com/files/project/{id}`) |
| `tracked_projects[].name` | string | Yes | Display name for the project |
| `tracked_files` | array | No* | List of specific Figma files to monitor |
| `tracked_files[].key` | string | Yes | File key (from URL: `figma.com/design/{key}/...`) |
| `tracked_files[].name` | string | Yes | Display name for the file |

*At least one of `tracked_projects` or `tracked_files` is required.

### `github`

GitHub integration for tracking development activity. Uses your existing GitHub MCP connection.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tracked_repos` | array | Yes | List of repositories to monitor |
| `tracked_repos[].owner` | string | Yes | Repository owner (user or org) |
| `tracked_repos[].repo` | string | Yes | Repository name |

### `team`

Optional team member mapping for cleaner output.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `members` | array | No | List of team members |
| `members[].name` | string | Yes | Friendly display name |
| `members[].figma_handle` | string | No | Name as shown in Figma |
| `members[].github_username` | string | No | GitHub username |

### `preferences`

Customize the output behavior.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `activity_window_hours` | number | 24 | How far back to look for activity |
| `show_prs` | boolean | true | Include open pull requests |
| `show_commits` | boolean | true | Include recent commits |
| `show_versions` | boolean | true | Include Figma named versions |

---

## Example Configuration

```yaml
figma:
  api_token: "figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  tracked_projects:
    - id: "123456789"
      name: "Brand & Marketing"
  tracked_files:
    - key: "ABC123xyz"
      name: "Homepage Redesign"

github:
  tracked_repos:
    - owner: "open-session"
      repo: "webapp"
    - owner: "open-session"
      repo: "design-system"

team:
  members:
    - name: "Sarah"
      figma_handle: "Sarah Chen"
      github_username: "sarahc"
    - name: "Jake"
      github_username: "jakedev"

preferences:
  activity_window_hours: 24
  show_prs: true
  show_commits: true
  show_versions: true
```

---

## API Endpoints Used

### Figma REST API

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/files/{key}/meta` | File metadata: `last_touched_at`, `last_touched_by` |
| `GET /v1/files/{key}/versions` | Version history with user info |
| `GET /v1/projects/{id}/files` | List files in a project |

Rate limits: Tier 2 endpoints, ~30 req/min for paid plans.

### GitHub MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp__github__list_commits` | Recent commits per repo |
| `mcp__github__list_pull_requests` | Open PRs per repo |

---

## Troubleshooting

### "Figma API returned 403"
Your token may have expired or lack the correct scope. Generate a new token with "File content" read access.

### "No GitHub activity found"
Ensure your GitHub MCP is connected and you have access to the tracked repos.

### "Project not found"
Double-check the project ID. It should be the numeric ID from the Figma URL, not the project name.
