# /do:setup

Main onboarding wizard for DESIGN-OPS. Guides users through connecting data sources across three business pillars: Operations, Design, and Analytics.

## Trigger

User runs `/do:setup` to configure the plugin. Works in:
- Claude Code CLI (terminal) — full interactive setup
- Claude Desktop (Code tab) — full interactive setup
- Claude Co-work (web) — read-only mode, directs to terminal

---

## Design Philosophy

This setup flow is **tool-agnostic** and **outcome-driven**:
- Ask what tools they use, discover how to connect
- Evaluate each tool for MCP or API capabilities
- Let users select what data they want in their briefs
- Adapt to whatever combination of tools the user has

---

## Pre-Flight Check

Before starting, detect the environment and existing setup:

### 1. Environment Detection

```
if (web/co-work environment detected):
  Show current config status
  Display: "For full setup, run /do:setup in Claude Code CLI"
  Exit early
```

### 2. Check Existing Configuration

1. **Check for existing config** at `~/.claude/do-config.yaml`
   - If exists, check version field
   - If v1.x: "Found v1 config. Want to migrate to the new pillar-based format?"
   - If v2.x: "You have an existing config. What would you like to do?"
   - Options: `Update existing` | `Start fresh` | `Just show status`

2. **Check for legacy config** at `~/.claude/team-pulse-config.yaml`
   - If exists without do-config: "Found legacy team-pulse config. Want to migrate it?"
   - Options: `Migrate to new format` | `Start fresh`

3. **Check existing skills** at `~/.claude/skills/`
   - Note any conflicting skill names
   - Plan to offer merge options if conflicts found

---

## Welcome Screen

Present the welcome message with ASCII art header:

```
██████╗ ███████╗███████╗██╗ ██████╗ ███╗   ██╗     ██████╗ ██████╗ ███████╗
██╔══██╗██╔════╝██╔════╝██║██╔════╝ ████╗  ██║    ██╔═══██╗██╔══██╗██╔════╝
██║  ██║█████╗  ███████╗██║██║  ███╗██╔██╗ ██║    ██║   ██║██████╔╝███████╗
██║  ██║██╔══╝  ╚════██║██║██║   ██║██║╚██╗██║    ██║   ██║██╔═══╝ ╚════██║
██████╔╝███████╗███████║██║╚██████╔╝██║ ╚████║    ╚██████╔╝██║     ███████║
╚═════╝ ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝ ╚═╝     ╚══════╝

A Claude Code plugin for design companies and entrepreneurs.

Works in:
• Claude Code (terminal)
• Claude Desktop (Code tab)
• VS Code Extension

We'll set up your data sources across three pillars:

1. Operations — Calendar, tasks, communication
2. Design — Code repos, design files
3. Analytics — Web, links, social

Let's get started.
```

---

## Chapter 1: Operations

**Goal**: Connect tools for coordination, scheduling, task management

### Step 1.1: Tool Selection

Use AskUserQuestion with checkboxes:

```markdown
## Operations — What tools do you use for coordination?

Select all that apply:
```

Options:
- `Notion` — Tasks, docs, wikis
- `Google Workspace` — Calendar, email, docs
- `Linear` — Issue tracking
- `Asana` — Project management
- `Slack` — Communication
- `Other` — Free text input
- `None / Skip this section`

### Step 1.2: Tool Evaluation (Async)

**For each selected tool, spawn a background sub-agent to evaluate:**

```markdown
[Checking your tools... ━━━━━━━━━━━━━━━━━━━━ 2/3]
```

Use the Task tool with `subagent_type: Explore` and `run_in_background: true`:

```yaml
task: tool_evaluation
input:
  tools: [notion, google_workspace]
  pillar: operations
```

The sub-agent for each tool:
1. Check if MCP exists and is connected (read `~/.claude/settings.json`)
2. If MCP connected, catalog its reporting capabilities
3. If MCP not connected but available, note it needs setup
4. If no MCP, evaluate if API exists for reporting
5. If no API suitable, mark as unavailable
6. Return capability matrix

### Step 1.3: Present Findings

Once evaluation completes, show what's actually available:

```markdown
## Here's what we found for your Operations tools:

┌──────────────────┬────────────┬─────────────────────────────────────┐
│ Tool             │ Connection │ Available Data                      │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ Notion           │ MCP ✓      │ Pages, databases, tasks, comments   │
│                  │            │ ↳ Daily: recent pages, task counts  │
│                  │            │ ↳ Weekly: page activity, updates    │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ Google Workspace │ MCP ✓      │ Calendar, Gmail, Drive              │
│                  │            │ ↳ Daily: today's events, emails     │
│                  │            │ ↳ Weekly: event count, email volume │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ Slack            │ MCP ⚠      │ Messages, channels (limited)        │
│                  │ needs setup│ ↳ Unread counts, recent messages    │
└──────────────────┴────────────┴─────────────────────────────────────┘
```

### Step 1.4: Handle Unconnected Tools

For tools that need connection:

```markdown
### Slack MCP is available but not connected.

To connect:
1. Add the Slack MCP to your Claude settings
2. Visit: [setup guide link]

What would you like to do?
```

Options:
- `Skip for now` — Continue without this tool
- `I'll set this up` — Pause setup, user sets up MCP, then resume

If user chooses to set up, provide the specific MCP installation command:
```bash
claude mcp add slack -- npx -y @anthropic/mcp-slack
```

### Step 1.5: Outcome Mapping

Based on available capabilities, ask what they want in their briefs:

```markdown
## Based on your connected tools, here's what we can include:

**Daily Brief (Operations):**
☑ Today's calendar events (from Google Workspace)
☑ Tasks due today (from Notion)
☐ Unread emails (from Google Workspace)
☐ Unread Slack messages (requires Slack setup)

**Weekly Recap (Operations):**
☑ Week overview - events attended (from Google Workspace)
☑ Tasks completed this week (from Notion)
☐ Team activity summary (requires Slack)

[Confirm selections]
```

Options are pre-checked based on connected tools. Disabled options show why they're unavailable.

---

## Chapter 2: Design

**Goal**: Connect tools for creative and development work

### Step 2.1: Tool Selection

```markdown
## Design — What tools do you use for design & code?

**Code:**
```

Options:
- `GitHub` — Repos, PRs, issues
- `GitLab`
- `Bitbucket`
- `Other` — Free text input

```markdown
**Creative:**
```

Options:
- `Figma` — Design files
- `Sketch`
- `Adobe XD`
- `Other` — Free text input
- `None / Skip this section`

### Step 2.2: Tool Evaluation

Same async evaluation pattern as Operations.

### Step 2.3: Present Findings

```markdown
## Here's what we found for your Design tools:

┌──────────────────┬────────────┬─────────────────────────────────────┐
│ Tool             │ Connection │ Available Data                      │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ GitHub           │ MCP ✓      │ Repos, commits, PRs, issues         │
│                  │            │ ↳ Daily: recent commits, open PRs   │
│                  │            │ ↳ Weekly: team contributions        │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ Figma            │ API ✓      │ Files, versions, comments, users    │
│                  │ (not MCP)  │ ↳ Daily: files edited, active users │
│                  │            │ ↳ Weekly: design versions created   │
└──────────────────┴────────────┴─────────────────────────────────────┘
```

### Step 2.4: Figma Special Handling

The official Figma MCP is code-focused, not for reporting. Detect this:

```markdown
### Figma Evaluation

MCP Status: Available (code-focused, not for reporting)
API Status: Available (supports reporting data)

The official Figma MCP is designed for code generation workflows.
For team activity tracking, we'll use the Figma API directly.

To enable Figma reporting:
1. Go to: figma.com/developers/api#access-tokens
2. Generate a token with "File content" scope
3. Enter your token below:
```

Accept token, validate via API call:
```bash
curl -s -H "Authorization: Bearer {token}" "https://api.figma.com/v1/me"
```

If valid, ask which projects to track.

### Step 2.5: GitHub Project Selection

If GitHub MCP connected:

```markdown
### GitHub Configuration

GitHub is connected via MCP. Which repositories should I track?
```

Options:
- Show recently accessed repos if discoverable
- Allow manual entry: "Enter repo names (owner/repo format)"
- Option: "Track all repos I have access to"

### Step 2.6: Outcome Mapping

```markdown
## Based on your Design tools, here's what we can include:

**Daily (Design):**
☑ Recent commits (from GitHub) — last 24h
☑ Open PRs needing review (from GitHub)
☑ Figma files edited today (from Figma API)
☐ Who's working on what (requires team tracking setup)

**Weekly (Design):**
☑ Team contribution summary (commits by person)
☑ Design versions created (from Figma)
☑ PR/merge activity (from GitHub)

[Confirm selections]
```

---

## Chapter 3: Analytics

**Goal**: Connect tools for metrics and insights

### Step 3.1: Tool Selection

```markdown
## Analytics — What tools do you use for metrics?

**Web Analytics:**
```

Options:
- `Google Analytics (GA4)`
- `Plausible`
- `Other` — Free text input

```markdown
**Link Analytics:**
```

Options:
- `Dub.co`
- `Bitly`
- `Other` — Free text input

```markdown
**Social/Content:**
```

Options:
- `Substack`
- `Instagram`
- `Twitter/X`
- `LinkedIn`
- `Other` — Free text input
- `None / Skip this section`

### Step 3.2: Tool Evaluation

Same async pattern. Analytics tools often need custom wrappers.

### Step 3.3: Present Findings

```markdown
## Here's what we found for your Analytics tools:

┌──────────────────┬────────────┬─────────────────────────────────────┐
│ Tool             │ Connection │ Available Data                      │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ Google Analytics │ MCP ✓      │ Pageviews, sessions, events, goals  │
│                  │            │ ↳ Daily: session count, top pages   │
│                  │            │ ↳ Weekly: traffic trends, sources   │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ Dub.co           │ MCP ✓      │ Link clicks, referrers, geo data    │
│                  │            │ ↳ Daily: click counts per link      │
│                  │            │ ↳ Weekly: top performing links      │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ Substack         │ No MCP     │ API available: subscribers, posts   │
│                  │ API ✓      │ ↳ Needs custom wrapper              │
│                  │            │ ↳ Can provide: subscriber count,    │
│                  │            │    post views, email open rates     │
├──────────────────┼────────────┼─────────────────────────────────────┤
│ Instagram        │ No MCP     │ API limited: basic profile only     │
│                  │ API ⚠      │ ↳ Business accounts only            │
│                  │            │ ↳ Follower counts, post engagement  │
└──────────────────┴────────────┴─────────────────────────────────────┘
```

### Step 3.4: Handle Custom Wrapper Creation

For tools that need custom wrappers (like Substack):

```markdown
### Substack

Substack has an API that supports reporting data.

We can create a custom MCP wrapper to pull:
- Subscriber count and growth
- Post view counts
- Email open rates

Would you like to set this up now?
```

Options:
- `Yes, guide me through it` — Trigger `mcp-builder` skill with Substack API context
- `Skip for now` — Mark as skipped, can add later

If user chooses to create wrapper:
1. Invoke `/mcp-builder` skill with Substack context
2. Guide through API token creation
3. Scaffold wrapper using mcp-builder
4. User registers wrapper in Claude settings
5. Continue setup with wrapper connected

### Step 3.5: Outcome Mapping

```markdown
## Based on your Analytics tools, here's what we can include:

**Daily (Analytics):**
☑ Page views today (from GA4)
☑ Link click counts (from Dub.co)
☐ New subscribers (requires Substack wrapper)

**Weekly (Analytics):**
☑ Traffic trends (from GA4)
☑ Top performing links (from Dub.co)
☐ Audience growth (requires Substack wrapper)
☐ Social engagement (requires Instagram setup)

Note: Some options are disabled because those tools aren't connected.
You can add them later with `/do:configure analytics`

[Confirm selections]
```

---

## Chapter 4: Skills Library

**Goal**: Select which utility skills to enable (optional, all available by default)

After completing pillar configuration, present the skills library:

```markdown
## Available Skills

DESIGN-OPS includes a library of utility skills. Select the ones you want to enable:

**Design Quality** (NEW)
☐ design-audit        — Automated design system compliance
☐ a11y-audit          — Accessibility compliance check (WCAG A/AA/AAA)

**Research & Inspiration** (NEW)
☐ competitor-scan     — Competitive design analysis
☐ mood-board          — Curated design inspiration
☐ variation-sprint    — Generate design variations

**Content Creation** (NEW)
☐ copy-variants       — Generate and A/B test copy variations
☐ content-brief       — Create content outlines for articles, blogs, case studies

**Development** (NEW)
☐ research-summary    — Synthesize research into actionable insights

**Auto-Activating Skills** (enabled by default)
☑ brand-guidelines    — Brand identity enforcement
☑ frontend-design     — UI component patterns
☑ design-system-quality — Design compliance review
☑ verification-before-completion — Quality gates
☑ systematic-debugging — 4-phase root cause analysis

Note: Auto-activating skills work automatically based on context.
The selectable skills above are invoked via `/do:library`.

[Enable selected] [Enable all] [Skip for now]
```

Store selections in config:

```yaml
skills:
  design_quality:
    - design_audit
    - a11y_audit
  research:
    - competitor_scan
    - mood_board
    - variation_sprint
  content:
    - copy_variants
    - content_brief
  development:
    - research_summary
  auto_activating:
    - brand_guidelines
    - frontend_design
    - design_system_quality
    - verification_before_completion
    - systematic_debugging
```

---

## Team Member Mapping (Optional)

After skills selection:

```markdown
## Team Configuration (Optional)

Want cleaner output with real names instead of handles?

I can map:
- Figma handles → friendly names
- GitHub usernames → friendly names
- Platform handles → real names

This makes reports more readable.
```

Options:
- `Set up team members`
- `Skip — use handles as-is`

**If setting up team:**

```markdown
Add team members one at a time.

**Your info first:**
- Display name: [input]
- Figma handle (if using Figma): [input or skip]
- GitHub username (if using GitHub): [input or skip]
```

Loop: "Add another team member?" → Yes/Done

---

## Final Synthesis

Generate personalized configuration:

```markdown
## Your Setup Summary

### Connected Tools

**Operations:**
  ✓ Notion (MCP) — tasks, docs
  ✓ Google Workspace (MCP) — calendar, email

**Design:**
  ✓ GitHub (MCP) — repos, PRs
  ✓ Figma (API) — design files

**Analytics:**
  ✓ Google Analytics (MCP) — web traffic
  ✓ Dub.co (MCP) — link clicks
  ⚠ Substack — skipped (no wrapper created)

### Your Daily Brief will include:
- Today's calendar events
- Tasks due today
- Recent commits from your repos
- Figma file updates
- Page views and link clicks

### Your Weekly Recap will include:
- Week overview
- Team contribution summary
- Traffic trends
- Top performing content

### Commands enabled:
- `/do:daily-brief` — Morning overview
- `/do:weekly-recap` — End of week summary
- `/do:team-pulse` — Team activity dashboard
- `/do:analytics` — Metrics summary

[Save Configuration]
```

---

## Write Configuration

### Backup Existing

```bash
if [ -f ~/.claude/do-config.yaml ]; then
  cp ~/.claude/do-config.yaml ~/.claude/do-config.yaml.bak
fi
```

### Generate Config

Write to `~/.claude/do-config.yaml` using the v2 schema:

```yaml
version: "2.0"
created: "{ISO_DATE}"
updated: "{ISO_DATE}"

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
      daily: [calendar_events, tasks_due]
      weekly: [week_overview, tasks_completed]

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
        tracked_repos:
          - owner: "opensesh"
            repo: "webapp"
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
        tracked_projects:
          - id: "123456789"
            name: "Design System"
    outcomes:
      daily: [recent_commits, open_prs, design_updates]
      weekly: [team_contributions, design_versions, pr_activity]

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
            weekly: [traffic_trends]
      - id: substack
        type: unavailable
        status: skipped
        reason: "No wrapper created"
    outcomes:
      daily: [pageviews, link_clicks]
      weekly: [traffic_trends, top_links]

team:
  members:
    - name: "Jordan Smith"
      handles:
        figma: "jordan.smith"
        github: "jordansmith"

enabled_commands:
  - daily_brief
  - weekly_recap
  - team_pulse
  - analytics

preferences:
  activity_window_hours: 24
  show_prs: true
  show_commits: true
  show_versions: true
```

---

## Verification Tests

Run `/do:test` automatically:

```markdown
## Verifying Setup

Running verification tests...
```

Display checklist as tests complete:

```markdown
**Configuration:**
- [x] Config file created at ~/.claude/do-config.yaml
- [x] Config syntax valid (v2.0)

**Operations Pillar:**
- [x] Notion MCP: Connected, can search pages
- [x] Google Workspace MCP: Connected, can list events

**Design Pillar:**
- [x] GitHub MCP: Connected, can list repos
- [x] Figma API: Token valid, can fetch files

**Analytics Pillar:**
- [x] Google Analytics MCP: Connected
- [~] Substack: Skipped (can add later)

**Skills:**
- [x] All auto-activating skills loaded
- [x] No naming conflicts detected
```

---

## Completion Summary

```markdown
## ✓ Setup complete!

DESIGN-OPS is configured and ready.

### Next steps:
• Run `/do:status` to verify your configuration
• Run `/do:dashboard` for today's overview
• Run `/do:library` to explore utility commands

### Your Dashboard Commands
- `/do:dashboard` — All pillars, daily (default)
- `/do:dashboard ops weekly` — Operations, weekly
- `/do:dashboard design` — Design pillar focus
- `/do:dashboard analytics ytd` — Analytics, year-to-date

### Legacy Aliases (still work)
- `/do:daily-brief` — Same as `/do:dashboard daily`
- `/do:weekly-recap` — Same as `/do:dashboard weekly`
- `/do:team-pulse` — Same as `/do:dashboard design daily`

### Utility Library
Run `/do:library` to browse 14 utility commands:
- **logistics/** — meeting-brief, meeting-recap, kickoff-prep
- **content/** — social-post, copy-variants, content-brief
- **development/** — site-analysis, devils-advocate, research-summary
- **design/** — design-audit, a11y-audit, mood-board, competitor-scan, variation-sprint

### Auto-Activating Skills
These work automatically when relevant — no command needed:
- **brand-guidelines** — Triggers on brand/color/voice mentions
- **frontend-design** — Triggers on UI/component work
- **design-system-quality** — Triggers on design system reviews
- **verification-before-completion** — Triggers when claiming "done"
- **systematic-debugging** — Triggers on debugging/error investigation

### Configuration
- Config file: `~/.claude/do-config.yaml`
- View status: `/do:status` — Quick overview of what's configured
- Diagnose issues: `/do:test` — Deep diagnostics when troubleshooting
- Update settings: `/do:configure`

Something not working? Run `/do:test` to diagnose.
```

---

## Tool Evaluation Flow Reference

For **every tool** the user selects, follow this evaluation cascade:

```
┌─────────────────────────────────────────────────────────────┐
│  User selects: "Substack"                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Check for MCP                                      │
│  Is there an official or community MCP that supports        │
│  the reporting data we need (stats, usage, activity)?       │
│                                                             │
│  Check: ~/.claude/settings.json mcpServers                  │
│  Check: references/tool-registry.md for known MCPs          │
│                                                             │
│  ✗ Substack MCP not found / doesn't support reporting       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Evaluate the API                                   │
│  Does this tool have an API that supports:                  │
│  - Daily reporting data (recent activity, stats)            │
│  - Weekly aggregations (summaries, trends)                  │
│  - Monthly rollups (growth, comparisons)                    │
│                                                             │
│  Check: references/tool-registry.md for API info            │
│                                                             │
│  ✓ Substack has API for subscriber counts, post stats       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Offer Custom MCP Creation                          │
│  Walk user through creating a custom MCP wrapper:           │
│  1. Gather API credentials                                  │
│  2. Use /mcp-builder skill to scaffold wrapper              │
│  3. Test the wrapper                                        │
│  4. Register in Claude settings                             │
│                                                             │
│  Or: User skips, tool marked as "skipped"                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: If API Unavailable                                 │
│  - Inform user this tool can't be connected                 │
│  - Suggest alternatives if available                        │
│  - Mark as "unavailable" in config                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Connection Types Summary

| Type | Description | How to Detect | Setup Process |
|------|-------------|---------------|---------------|
| **MCP** | Native MCP server | In `~/.claude/settings.json` | Guide MCP installation |
| **API** | Direct API (plugin calls) | Token in config or env | Guide token creation |
| **Custom Wrapper** | User-created MCP | User registers after creation | `/mcp-builder` skill |
| **Unavailable** | No API/MCP support | API evaluation fails | Inform user, suggest alternatives |

---

## Error Handling

**If ~/.claude directory doesn't exist:**
```bash
mkdir -p ~/.claude
```

**If write fails:**
```markdown
Couldn't write config file. Check permissions for ~/.claude/

Manual fix:
1. Run: mkdir -p ~/.claude
2. Run: chmod 755 ~/.claude
3. Re-run /do:setup

Still stuck? See: references/troubleshooting.md
```

**If API validation fails:**
```markdown
API check failed for {service}.

This might be:
- Network issue (try again)
- Invalid credentials (re-enter)
- Service outage (check status page)

Continue setup without {service}? You can add it later with /do:configure.
```

---

## Re-Running Setup

If user runs `/do:setup` with existing config:

1. Show current config summary with pillar breakdown
2. Ask what to change:
   - "Update a pillar (Operations, Design, Analytics)"
   - "Add new tools"
   - "Modify team members"
   - "Start completely fresh"
3. Only modify selected sections
4. Run verification tests

---

## Non-Destructive Guarantees

1. **Never overwrite** existing files without asking
2. **Always backup** before changes: `*.yaml.bak`
3. **Show diff** of proposed config changes before writing
4. **Merge** new settings with existing (don't replace wholesale)
5. **Namespace** all commands with `do:` to avoid conflicts

---

*Version: 2.0*
