# Configuration Schema Reference (v2.0)

Complete reference for the DESIGN-OPS configuration file.

## Version History

| Version | Description |
|---------|-------------|
| 2.0 | Three-pillar structure with capability matrices |
| 1.0 | Original flat structure (deprecated) |

---

## File Locations

| File | Purpose | Location |
|------|---------|----------|
| Global config | Main configuration | `~/.claude/design-ops-config.yaml` |
| Project config | Per-project overrides | `.claude/design-ops.local.md` |
| Legacy config | Old team-pulse config (v1) | `~/.claude/team-pulse-config.yaml` |

---

## Configuration Structure Overview

```yaml
version: "2.0"
created: "2025-04-14"
updated: "2025-04-14"

pillars:
  operations:
    enabled: true/false
    tools: [...]
    outcomes:
      daily: [...]
      weekly: [...]
      quarterly: [...]
      ytd: [...]

  design:
    enabled: true/false
    tools: [...]
    outcomes:
      daily: [...]
      weekly: [...]
      quarterly: [...]
      ytd: [...]

  analytics:
    enabled: true/false
    tools: [...]
    outcomes:
      daily: [...]
      weekly: [...]
      quarterly: [...]
      ytd: [...]

team:
  members: [...]

preferences:
  activity_window_hours: 24
  show_prs: true
  show_commits: true
  show_versions: true

enabled_commands: [...]
```

---

## Metadata

```yaml
version: "2.0"           # Config schema version (required)
created: "2025-04-14"    # ISO date created
updated: "2025-04-14"    # ISO date last modified
```

---

## Pillars Structure

Each pillar (Operations, Design, Analytics) follows the same structure:

```yaml
pillars:
  {pillar_name}:
    enabled: true/false
    tools: [...]
    outcomes:
      daily: [...]
      weekly: [...]
      monthly: [...]
```

### Pillar: Operations

Covers coordination, scheduling, and task management tools.

**Common tools:** Notion, Google Workspace, Linear, Asana, Slack

### Pillar: Design

Covers creative work, code repositories, and design files.

**Common tools:** GitHub, GitLab, Figma, Sketch

### Pillar: Analytics

Covers metrics, insights, and reporting tools.

**Common tools:** Google Analytics, Dub.co, Substack, Plausible

---

## Tool Definition

Each tool in a pillar's `tools` array has this structure:

```yaml
tools:
  - id: string              # Unique tool identifier (e.g., "notion", "github")
    type: string            # Connection type: mcp | api | custom_wrapper | unavailable
    status: string          # connected | available | api_only | skipped | unavailable

    # For MCP connections
    mcp_name: string        # MCP server name as registered

    # Discovery metadata (populated by mcp-discovery skill)
    mcp_source: string      # official | vendor | community | none
    mcp_package: string     # npm package name (e.g., "@notionhq/notion-mcp-server") - null for HTTP MCPs
    mcp_type: string        # stdio | http - how the MCP connects
    mcp_url: string         # URL for HTTP MCPs (e.g., "https://mcp.figma.com/mcp")
    mcp_confidence: string  # high | medium | low
    validated: boolean      # Whether package was verified to exist
    install_cmd: string     # Explicit install command (optional, for non-standard installs)
    discovery_cached: string # ISO date when discovery was cached (optional)

    # For API connections
    auth:
      token: string         # Direct token (not recommended)
      token_env: string     # Environment variable name (recommended)

    # API documentation URL (for api_only tools or API supplements)
    api_docs_url: string    # URL to API documentation

    # API supplement for tools with both MCP and API access (optional)
    # Use when MCP provides basic access but API unlocks richer reporting
    api_supplement:
      enabled: boolean      # Whether API supplement is active
      token_env: string     # Environment variable for API token
      reason: string        # Why API supplement is useful

    # Capability matrix (auto-populated during setup)
    # For tools with both MCP and API, use via_mcp and via_api
    capabilities:
      data_types: [string]  # What data the tool provides
      reporting:
        daily: [string]     # Available daily metrics
        weekly: [string]    # Available weekly metrics
        monthly: [string]   # Available monthly metrics
      # For dual MCP+API tools, separate capabilities:
      via_mcp: [string]     # Capabilities available through MCP
      via_api: [string]     # Additional capabilities through direct API

    # Tool-specific tracking (optional)
    tracked_repos: [...]    # For GitHub/GitLab
    tracked_projects: [...] # For Figma/Notion
    tracked_files: [...]    # For Figma
    tracked_channels: [...] # For Slack

    # If unavailable or skipped
    reason: string          # Why tool isn't available

    # Community package warning (optional)
    warning: string         # Warning message for community packages
    warning_code: string    # community_package | low_downloads | outdated | none
```

### Connection Types

| Type | Description | When to Use |
|------|-------------|-------------|
| `mcp` | Native MCP server | MCP available and connected |
| `api` | Direct API calls | No suitable MCP, good API available |
| `custom_wrapper` | User-created MCP wrapper | API needs wrapping for MCP interface |
| `unavailable` | Cannot connect | No MCP or API available |

### Status Values

| Status | Symbol | Description |
|--------|--------|-------------|
| `connected` | ✓ | MCP/API working and ready |
| `available` | ○ | MCP exists, ready to install |
| `api_only` | ⚡ | No MCP; direct API integration |
| `skipped` | — | User chose to skip this tool |
| `unavailable` | ✗ | No viable connection method |

### MCP Source Values

| Source | Description |
|--------|-------------|
| `official` | Published by MCP protocol maintainers (`@modelcontextprotocol/*`) or tool vendor via HTTP |
| `vendor` | Published by tool vendor (e.g., `@notionhq/notion-mcp-server`, `@storybook/mcp`) |
| `community` | Community-maintained package |
| `none` | No MCP available |

### MCP Type Values

| Type | Description | Install Command |
|------|-------------|-----------------|
| `stdio` | Standard I/O transport (npm packages) | `claude mcp add {name} -- npx -y {package}` |
| `http` | HTTP transport (hosted services) | `claude mcp add --transport http {name} {url}` |

### MCP Confidence Values

| Confidence | Criteria |
|------------|----------|
| `high` | Official or vendor package, `validated: true`, verified working |
| `medium` | Community package with >5000 weekly downloads, updated recently, `validated: true` |
| `low` | Community package with low downloads, placeholder, or not recently updated |
| `none` | No MCP available for this tool |

---

## Tool Examples

### MCP Connection (Notion)

```yaml
- id: notion
  type: mcp
  mcp_name: "notion"
  status: connected

  # Discovery metadata
  mcp_source: official
  mcp_package: "@notionhq/notion-mcp-server"
  mcp_confidence: high
  discovery_cached: "2025-04-17"

  capabilities:
    data_types: [pages, databases, tasks, comments]
    reporting:
      daily: [recent_pages, task_counts]
      weekly: [page_activity, task_completion]
      monthly: [content_growth]
```

### Community MCP Connection (GitLab)

```yaml
- id: gitlab
  type: mcp
  mcp_name: "gitlab"
  status: available  # Not yet installed

  # Discovery metadata
  mcp_source: community
  mcp_package: "mcp-gitlab"
  mcp_confidence: medium
  discovery_cached: "2025-04-17"

  # Warning for community package
  warning: "Community package - not officially supported"
  warning_code: community_package

  capabilities:
    data_types: [projects, commits, merge_requests, pipelines]
    reporting:
      daily: [recent_commits, open_mrs]
      weekly: [contributions, ci_stats]
```

### Dual MCP + API Connection (Notion with API Supplement)

For tools where MCP provides basic access but API unlocks richer reporting:

```yaml
- id: notion
  type: mcp
  mcp_name: "notion"
  status: connected
  # API supplement for enhanced reporting
  api_supplement:
    enabled: true
    token_env: NOTION_API_KEY
    reason: "Enables batch queries and activity history for weekly reporting"
  capabilities:
    data_types: [pages, databases, tasks, comments, activity_log]
    # Separated by access method
    via_mcp:
      - search_pages
      - read_page
      - create_page
      - edit_page
    via_api:
      - database_query_full
      - activity_log
      - bulk_export
      - user_analytics
    reporting:
      daily: [recent_pages, task_counts]
      weekly: [page_activity, task_completion, team_activity]
      monthly: [content_growth, user_engagement]
```

**When to use `api_supplement`:**
- MCP handles day-to-day operations (search, read, create)
- API supplement enables richer dashboard data (batch queries, history, analytics)
- Both are optional — MCP-only is always valid
- User was offered the API upgrade during setup via progressive disclosure

### HTTP MCP Connection (Figma)

```yaml
- id: figma
  type: mcp
  mcp_name: "figma"
  status: connected

  # Discovery metadata - HTTP-based MCP
  mcp_source: official
  mcp_package: null  # HTTP MCPs don't use npm packages
  mcp_type: http
  mcp_url: "https://mcp.figma.com/mcp"
  mcp_confidence: high
  validated: true
  install_cmd: "claude mcp add --transport http figma https://mcp.figma.com/mcp"
  api_docs_url: "https://www.figma.com/developers/api"

  capabilities:
    data_types: [files, versions, comments, design_context]
    reporting:
      daily: [files_edited, active_users]
      weekly: [design_versions]
      monthly: [project_progress]

  tracked_projects:
    - id: "123456789"
      name: "Design System"
```

### HTTP MCP Connection (Supabase)

```yaml
- id: supabase
  type: mcp
  mcp_name: "supabase"
  status: connected

  # Discovery metadata - HTTP-based MCP with dynamic registration
  mcp_source: official
  mcp_package: null
  mcp_type: http
  mcp_url: "https://api.supabase.com/mcp"
  mcp_confidence: high
  validated: true
  install_cmd: "claude mcp add supabase https://api.supabase.com/mcp"

  capabilities:
    data_types: [tables, queries, auth, storage]
    reporting:
      daily: [row_counts, active_users]
      weekly: [database_growth]
```

### API Connection (No MCP Available)

```yaml
- id: google_analytics
  type: api
  status: connected

  # Discovery metadata - No MCP available
  mcp_source: none
  mcp_package: null
  mcp_confidence: none
  validated: true
  api_docs_url: "https://developers.google.com/analytics"
  note: "Use Google Analytics Data API directly"

  # API auth
  auth:
    token_env: GA_SERVICE_ACCOUNT_KEY

  capabilities:
    data_types: [pageviews, sessions, events]
    reporting:
      daily: [session_count, top_pages]
      weekly: [traffic_trends]
```

### Custom Wrapper (Substack)

```yaml
- id: substack
  type: custom_wrapper
  mcp_name: "substack-wrapper"
  status: connected
  capabilities:
    data_types: [subscribers, posts, email_stats]
    reporting:
      daily: [new_subscribers]
      weekly: [subscriber_growth, post_views]
      monthly: [audience_trends]
```

### Unavailable Tool (Instagram)

```yaml
- id: instagram
  type: unavailable
  status: unavailable
  reason: "API limited to business accounts with complex approval process"
```

---

## Outcomes Configuration

Outcomes define what data to include in daily, weekly, quarterly, and year-to-date reports.

```yaml
outcomes:
  daily:
    - calendar_events      # From google_workspace
    - tasks_due            # From notion/linear
    - recent_commits       # From github
    - design_updates       # From figma
    - pageviews            # From google_analytics
    - link_clicks          # From dubco

  weekly:
    - week_overview        # From google_workspace
    - tasks_completed      # From notion/linear
    - team_contributions   # From github
    - design_versions      # From figma
    - traffic_trends       # From google_analytics
    - top_links            # From dubco

  quarterly:
    - quarter_goals        # From notion/linear
    - budget_status        # From notion
    - project_completions  # From notion/linear
    - shipped_projects     # From github/figma
    - design_velocity      # From github
    - quarter_trends       # From google_analytics
    - campaign_performance # From google_analytics

  ytd:
    - annual_goals         # From notion/linear
    - revenue_tracking     # From notion
    - client_retention     # From notion
    - projects_shipped     # From github/figma
    - design_maturity      # From figma
    - annual_traffic       # From google_analytics
    - yoy_comparison       # From google_analytics
```

### Outcome to Tool Mapping

Each outcome references a capability from a connected tool:

**Daily Outcomes:**
| Outcome | Source Tool | Capability |
|---------|-------------|------------|
| `calendar_events` | google_workspace | `todays_events` |
| `tasks_due` | notion, linear | `task_counts` |
| `recent_commits` | github | `recent_commits` |
| `design_updates` | figma | `files_edited` |
| `pageviews` | google_analytics | `session_count` |
| `link_clicks` | dubco | `click_counts` |

**Weekly Outcomes:**
| Outcome | Source Tool | Capability |
|---------|-------------|------------|
| `week_overview` | google_workspace | `event_count` |
| `tasks_completed` | notion, linear | `task_completion` |
| `team_contributions` | github | `team_contributions` |
| `design_versions` | figma | `design_versions` |
| `traffic_trends` | google_analytics | `traffic_trends` |
| `top_links` | dubco | `top_links` |

**Quarterly Outcomes:**
| Outcome | Source Tool | Capability |
|---------|-------------|------------|
| `quarter_goals` | notion, linear | `goal_tracking` |
| `budget_status` | notion | `budget_tracking` |
| `project_completions` | notion, linear | `project_status` |
| `shipped_projects` | github, figma | `release_history` |
| `design_velocity` | github | `pr_velocity` |
| `quarter_trends` | google_analytics | `quarter_comparison` |
| `campaign_performance` | google_analytics | `campaign_metrics` |

**Year-to-Date Outcomes:**
| Outcome | Source Tool | Capability |
|---------|-------------|------------|
| `annual_goals` | notion, linear | `annual_tracking` |
| `revenue_tracking` | notion | `revenue_metrics` |
| `client_retention` | notion | `client_metrics` |
| `projects_shipped` | github, figma | `annual_releases` |
| `design_maturity` | figma | `system_coverage` |
| `annual_traffic` | google_analytics | `annual_totals` |
| `yoy_comparison` | google_analytics | `year_comparison` |

Commands read the outcomes list and fetch data from the corresponding tool's capabilities.

---

## Team Configuration

```yaml
team:
  members:
    - name: "Jordan Smith"      # Display name
      handles:
        figma: "jordan.smith"   # Figma username
        github: "jordansmith"  # GitHub username
        notion: "Jordan Smith" # Notion display name
        slack: "jordan"           # Slack handle

    - name: "Taylor Lee"
      handles:
        figma: "taylor.lee"
        github: "taylorl"
```

Maps platform handles to friendly names for cleaner output in reports.

---

## Preferences

```yaml
preferences:
  activity_window_hours: 24   # Look-back window (default: 24h)
  show_prs: true              # Include open PRs in output
  show_commits: true          # Include recent commits
  show_versions: true         # Include Figma named versions
```

---

## Dashboard Customization (v2.1)

Control how the dashboard displays data, sections, and layout.

### Section Visibility

Show or hide specific sections within each pillar:

```yaml
dashboard:
  sections:
    operations:
      schedule: true          # Calendar events
      tasks: true             # Task list
      emails: false           # Hide email count
      content: true           # Content pipeline

    design:
      commits: true           # Recent commits
      pull_requests: true     # Open PRs
      design_files: true      # Figma activity
      issues: false           # Hide issues

    analytics:
      traffic: true           # Web traffic metrics
      links: true             # Link analytics
      social: true            # Social channels
      subscribers: false      # Hide subscriber counts
```

### Timeframe Preferences

Set default dashboard behavior:

```yaml
dashboard:
  timeframe:
    default: daily            # daily | weekly | quarterly | ytd
    remember_last: true       # Remember user's last selection

  sections_behavior:
    default_open: first       # all | none | first
    mobile_default_open: none # Mobile-specific behavior
    remember_collapsed: true  # Remember which sections user collapsed
```

### Layout Options

Control the dashboard layout:

```yaml
dashboard:
  layout:
    mode: three-column        # three-column | two-column | single-column | compact
    pillar_order:             # Custom pillar order (default: operations, design, analytics)
      - design
      - operations
      - analytics
    card_size: normal         # compact | normal | expanded
    show_charts: true         # Show chart visualizations
    show_insights: true       # Show AI-generated insights
```

### Data Freshness Settings

Control caching and refresh behavior:

```yaml
dashboard:
  freshness:
    show_indicators: true     # Show "Updated 5m ago" on sections
    warn_stale_data: true     # Highlight data older than threshold

    # Cache durations by data type (in minutes)
    cache_duration:
      calendar_events: 5      # Refresh every 5 minutes
      tasks: 15               # Refresh every 15 minutes
      commits: 30             # Refresh every 30 minutes
      traffic: 60             # Refresh hourly
      social: 60              # Refresh hourly
      links: 30               # Refresh every 30 minutes

    # Stale data thresholds (in minutes)
    stale_threshold:
      warning: 60             # Show warning after 1 hour
      error: 1440             # Show error after 24 hours
```

### Quick Actions

Configure quick action buttons in header:

```yaml
dashboard:
  quick_actions:
    - id: github
      icon: github
      url: https://github.com/opensesh
      label: "Open GitHub"

    - id: figma
      icon: figma
      url: https://figma.com/files/recent
      label: "Open Figma"

    - id: calendar
      icon: calendar
      url: https://calendar.google.com
      label: "Open Calendar"
```

### Complete Dashboard Configuration Example

```yaml
dashboard:
  # Section visibility
  sections:
    operations:
      schedule: true
      tasks: true
      emails: false

    design:
      commits: true
      pull_requests: true
      design_files: true

    analytics:
      traffic: true
      links: true
      social: false

  # Timeframe behavior
  timeframe:
    default: daily
    remember_last: true

  sections_behavior:
    default_open: first
    mobile_default_open: none
    remember_collapsed: true

  # Layout
  layout:
    mode: three-column
    card_size: normal
    show_charts: true
    show_insights: true

  # Freshness
  freshness:
    show_indicators: true
    warn_stale_data: true
    cache_duration:
      calendar_events: 5
      tasks: 15
      commits: 30
      traffic: 60

  # Quick actions
  quick_actions:
    - id: github
      icon: github
      url: https://github.com/opensesh

    - id: figma
      icon: figma
      url: https://figma.com/files/recent
```

---

## Enabled Commands

Auto-computed based on connected tools:

```yaml
enabled_commands:
  - dashboard        # Core command - requires any pillar enabled
  - daily_brief      # Legacy alias - requires any operations/design tool
  - weekly_recap     # Legacy alias - requires any operations/design tool
  - team_pulse       # Legacy alias - requires figma OR github
```

### Command Requirements

| Command | Required Tools |
|---------|----------------|
| `dashboard` | At least one pillar with connected tools |
| `daily_brief` | At least one operations or design tool |
| `weekly_recap` | At least one operations or design tool |
| `team_pulse` | Figma OR GitHub with team tracking |

### Dashboard Timeframes

The `/design-ops:dashboard` command supports multiple timeframes:

| Timeframe | Aliases | Data Scope |
|-----------|---------|------------|
| `daily` | `today`, `d` | Last 24 hours |
| `weekly` | `week`, `w` | Current week |
| `quarterly` | `quarter`, `q` | Current quarter |
| `ytd` | `year`, `y` | Year-to-date |

---

## Complete Example (v2.0)

```yaml
version: "2.0"
created: "2025-04-14"
updated: "2025-04-14"

pillars:
  operations:
    enabled: true
    tools:
      - id: notion
        type: mcp
        mcp_name: "notion"
        status: connected
        capabilities:
          data_types: [pages, databases, tasks, comments]
          reporting:
            daily: [recent_pages, task_counts]
            weekly: [page_activity, task_completion]

      - id: google_workspace
        type: mcp
        mcp_name: "google-workspace"
        status: connected
        capabilities:
          data_types: [calendar, gmail, drive]
          reporting:
            daily: [todays_events, unread_emails]
            weekly: [event_count, email_volume]

    outcomes:
      daily: [calendar_events, tasks_due, unread_emails]
      weekly: [week_overview, tasks_completed]
      quarterly: [quarter_goals, budget_status]
      ytd: [annual_goals, revenue_tracking]

  design:
    enabled: true
    tools:
      - id: github
        type: mcp
        mcp_name: "github"
        status: connected
        capabilities:
          data_types: [repos, commits, prs, issues]
          reporting:
            daily: [recent_commits, open_prs]
            weekly: [team_contributions, pr_activity]
            quarterly: [release_history, pr_velocity]
            ytd: [annual_releases]
        tracked_repos:
          - owner: "opensesh"
            repo: "webapp"
          - owner: "opensesh"
            repo: "design-system"

      - id: figma
        type: api
        auth:
          token_env: FIGMA_API_TOKEN
        status: connected
        capabilities:
          data_types: [files, versions, comments, users]
          reporting:
            daily: [files_edited, active_users]
            weekly: [design_versions]
            quarterly: [project_completions]
            ytd: [system_coverage]
        tracked_projects:
          - id: "123456789"
            name: "Design System"

    outcomes:
      daily: [recent_commits, open_prs, design_updates]
      weekly: [team_contributions, design_versions, pr_activity]
      quarterly: [shipped_projects, design_velocity]
      ytd: [projects_shipped, design_maturity]

  analytics:
    enabled: true
    tools:
      - id: google_analytics
        type: mcp
        mcp_name: "ga4"
        status: connected
        capabilities:
          data_types: [pageviews, sessions, events]
          reporting:
            daily: [session_count, top_pages]
            weekly: [traffic_trends, source_breakdown]
            quarterly: [quarter_comparison, campaign_metrics]
            ytd: [annual_totals, year_comparison]

      - id: dubco
        type: mcp
        mcp_name: "dubco"
        status: connected
        capabilities:
          data_types: [links, clicks, referrers]
          reporting:
            daily: [click_counts]
            weekly: [top_links]
            quarterly: [link_performance]
            ytd: [total_clicks]

      - id: substack
        type: unavailable
        status: skipped
        reason: "User skipped wrapper creation"

    outcomes:
      daily: [pageviews, link_clicks]
      weekly: [traffic_trends, top_links]
      quarterly: [quarter_trends, campaign_performance]
      ytd: [annual_traffic, yoy_comparison]

team:
  members:
    - name: "Jordan Smith"
      handles:
        figma: "jordan.smith"
        github: "jordansmith"
        notion: "Jordan Smith"
    - name: "Taylor Lee"
      handles:
        figma: "taylor.lee"
        github: "taylorl"

preferences:
  activity_window_hours: 24
  show_prs: true
  show_commits: true
  show_versions: true

enabled_commands:
  - daily_brief
  - weekly_recap
  - team_pulse
  - analytics
```

---

## Migration from v1.0

If you have an existing v1.0 config, `/design-ops:setup` will offer to migrate it.

### v1.0 Structure (deprecated)

```yaml
version: 1.0
figma:
  enabled: true
  api_token: "..."
  tracked_projects: [...]

github:
  enabled: true
  tracked_repos: [...]

team:
  members: [...]

workflows:
  daily: [morning_brief]
  weekly: [weekly_recap]
```

### Migration Mapping

| v1.0 Field | v2.0 Location |
|------------|---------------|
| `figma.*` | `pillars.design.tools[id=figma]` |
| `github.*` | `pillars.design.tools[id=github]` |
| `slack.*` | `pillars.operations.tools[id=slack]` |
| `team.members` | `team.members` (restructured handles) |
| `workflows.*` | `pillars.*.outcomes` |

---

## Validation Rules

### Required Fields

For `/design-ops:test` to pass:
- `version` must be "2.0"
- At least one pillar must be enabled
- Enabled pillars must have at least one connected tool

### Token Validation

**Figma token:**
```bash
curl -s -H "Authorization: Bearer {token}" "https://api.figma.com/v1/me"
```

**MCP validation:**
Check that MCP server responds to basic queries.

---

## Troubleshooting

### Config Not Loading

1. Check file exists: `ls ~/.claude/design-ops-config.yaml`
2. Check YAML syntax: `python -c "import yaml; yaml.safe_load(open(...))" `
3. Run `/design-ops:test` for diagnostics

### Version Mismatch

If you see "Config version mismatch":
1. Back up current config
2. Run `/design-ops:setup` to migrate
3. Or manually update to v2.0 structure

### Tool Connection Issues

1. Check `status` field in config
2. Verify MCP is in `~/.claude/settings.json`
3. Test API token manually
4. Run `/design-ops:test` for specific tool tests

---

*See also: `/design-ops:configure`, `/design-ops:test`, `/design-ops:status`*

*Version: 2.0*
