```
██████╗ ███████╗███████╗██╗ ██████╗ ███╗   ██╗     ██████╗ ██████╗ ███████╗
██╔══██╗██╔════╝██╔════╝██║██╔════╝ ████╗  ██║    ██╔═══██╗██╔══██╗██╔════╝
██║  ██║█████╗  ███████╗██║██║  ███╗██╔██╗ ██║    ██║   ██║██████╔╝███████╗
██║  ██║██╔══╝  ╚════██║██║██║   ██║██║╚██╗██║    ██║   ██║██╔═══╝ ╚════██║
██████╔╝███████╗███████║██║╚██████╔╝██║ ╚████║    ╚██████╔╝██║     ███████║
╚═════╝ ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝ ╚═╝     ╚══════╝
```

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/version-v2.1.0-blue)]()
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-blueviolet.svg)]()

**A Claude Code plugin for design companies and entrepreneurs.**

> Connect your tools. Get daily briefs. Track your team.

---

## What It Does

DESIGN-OPS connects your existing tools and gives you automated insights across three pillars:

| Pillar | What You Get |
|--------|--------------|
| **Operations** | Calendar events, tasks due, email summaries |
| **Design** | Figma activity, GitHub commits, PR reviews |
| **Analytics** | Page views, link clicks, traffic trends |

---

## Quick Start

### Option 1: Terminal

Clone the repo and run the install script.

```bash
git clone https://github.com/opensesh/DESIGN-OPS
bash DESIGN-OPS/.design-ops/install.sh
```

### Option 2: Claude Code

Paste this prompt into Claude Code and it will handle the rest.

```
Clone github.com/opensesh/DESIGN-OPS and run the install script.
```

*Works in Claude Code CLI, desktop app, or IDE extensions.*

Installs globally to `~/.claude/plugins/design-ops/`.

### Updating

```bash
cd DESIGN-OPS
bash .design-ops/update.sh
```

Or manually:

```bash
cd DESIGN-OPS
git pull
bash .design-ops/install.sh
```

**Note:** Start a new Claude Code session after updating.

### Your First Dashboard

```bash
/design-ops:setup              # Connect your tools (~5 min)
/design-ops:dashboard          # Get your daily overview
/design-ops:dashboard weekly   # Weekly summary
/design-ops:library            # Browse utility commands
```

**Prerequisites:** [Claude Code](https://claude.ai/code), Git

---

## Commands

All commands use the `/design-ops:` prefix (DESIGN-OPS).

### System Commands

| Command | Purpose |
|---------|---------|
| `/design-ops:setup` | Interactive onboarding wizard |
| `/design-ops:configure` | Update settings by pillar |
| `/design-ops:status` | Show current config and health |
| `/design-ops:test` | Run diagnostics |
| `/design-ops:add-tool` | Connect new MCP or API |
| `/design-ops:help` | Command reference |
| `/design-ops:library` | Browse utility commands |

### Dashboard Command

The unified dashboard generates reports across pillars and timeframes:

```bash
/design-ops:dashboard [pillar] [timeframe]
```

| Pillars | Timeframes |
|---------|------------|
| `ops` — Operations | `daily` / `today` / `d` |
| `design` — Design | `weekly` / `week` / `w` |
| `analytics` — Analytics | `quarterly` / `quarter` / `q` |
| omitted — All pillars | `ytd` / `year` / `y` |

**Examples:**
```bash
/design-ops:dashboard                    # All pillars, daily (default)
/design-ops:dashboard ops weekly         # Operations, weekly
/design-ops:dashboard design quarterly   # Design, quarterly
/design-ops:dashboard analytics ytd      # Analytics, year-to-date
```

### Legacy Aliases

| Command | Maps To |
|---------|---------|
| `/design-ops:daily-brief` | `/design-ops:dashboard daily` |
| `/design-ops:weekly-recap` | `/design-ops:dashboard weekly` |
| `/design-ops:team-pulse` | `/design-ops:dashboard design daily` |

### Utility Library (14 commands)

Browse with `/design-ops:library` or filter by category: `/design-ops:library design`

**Logistics (3)** — Meeting prep, kickoffs, project coordination
| Command | Purpose |
|---------|---------|
| `/design-ops:meeting-brief` | Create focused meeting agendas |
| `/design-ops:meeting-recap` | Document meetings with action items |
| `/design-ops:kickoff-prep` | Generate project kickoff materials |

**Content (3)** — Content creation for social and marketing
| Command | Purpose |
|---------|---------|
| `/design-ops:social-post` | Create platform-optimized social content |
| `/design-ops:copy-variants` | Generate and A/B test copy variations |
| `/design-ops:content-brief` | Create content briefs for articles, blogs, case studies |

**Development (3)** — Research, analysis, and ideation tools
| Command | Purpose |
|---------|---------|
| `/design-ops:site-analysis` | Deep website analysis |
| `/design-ops:devils-advocate` | Challenge assumptions |
| `/design-ops:research-summary` | Synthesize research into actionable insights |

**Design (5)** — Design quality, research, and variation tools
| Command | Purpose |
|---------|---------|
| `/design-ops:design-audit` | Automated design system compliance check |
| `/design-ops:a11y-audit` | Accessibility compliance check (WCAG A/AA/AAA) |
| `/design-ops:mood-board` | Curated design inspiration from web sources |
| `/design-ops:competitor-scan` | Competitive design analysis |
| `/design-ops:variation-sprint` | Generate design variations within brand constraints |

---

## Auto-Activating Skills

Skills activate automatically based on context — no command needed.

| Skill | Triggers On |
|-------|-------------|
| `brand-guidelines` | Brand colors (Aperol, Charcoal, Vanilla), voice, identity |
| `frontend-design` | UI components, layouts, design implementation |
| `design-system-quality` | Design system reviews, token validation |
| `brand-voice` | Content writing, copywriting, messaging |
| `design-feedback` | Design critique, visual review |
| `accessibility-audit` | Accessibility checks, a11y reviews |
| `systematic-debugging` | Debugging, error investigation |
| `verification-before-completion` | Task completion, claiming "done" |

---

## Three-Pillar Configuration

DESIGN-OPS uses a pillar-based config stored at `~/.claude/design-ops-config.yaml`:

```yaml
pillars:
  operations:
    tools: [notion, google_workspace, slack]
    outcomes:
      daily: [calendar_events, tasks_due]
      weekly: [week_overview, tasks_completed]
      quarterly: [quarter_goals, budget_status]
      ytd: [annual_goals, revenue_tracking]

  design:
    tools: [github, figma]
    outcomes:
      daily: [recent_commits, open_prs, design_updates]
      weekly: [team_contributions, design_versions]
      quarterly: [shipped_projects, design_velocity]
      ytd: [projects_shipped, design_maturity]

  analytics:
    tools: [google_analytics, dubco]
    outcomes:
      daily: [pageviews, link_clicks]
      weekly: [traffic_trends, top_links]
      quarterly: [quarter_trends, campaign_performance]
      ytd: [annual_traffic, yoy_comparison]
```

Run `/design-ops:setup` for guided configuration.

---

## Integrations

### Supported Tools

| Tool | Connection | Pillar |
|------|------------|--------|
| Notion | MCP | Operations |
| Google Workspace | MCP | Operations |
| Slack | MCP | Operations |
| GitHub | MCP | Design |
| Figma | API | Design |
| Google Analytics | MCP | Analytics |
| Dub.co | MCP | Analytics |

### Adding Custom Tools

For tools without native MCP support, DESIGN-OPS guides you through API wrapper creation:

```bash
/design-ops:add-tool substack    # Guided setup for any tool
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Config Schema](references/config-schema.md) | Complete configuration reference |
| [Tool Registry](references/tool-registry.md) | Known tools and connection types |
| [MCP Education](references/mcp-setup/mcp-education.md) | Understanding MCPs, connection status, MCP vs API |
| [Troubleshooting](references/troubleshooting.md) | Common issues and fixes |

---

## FAQ

**Can I use this without all three pillars?**
Yes. Enable only what you need. The plugin adapts to your connected tools.

**Having issues?**
Run `/design-ops:test` to diagnose. Still stuck? [hello@opensession.co](mailto:hello@opensession.co)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[Apache 2.0](LICENSE)

---

*Built with Claude Code by [Open Session](https://opensession.co)*
