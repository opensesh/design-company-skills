# /dcs:help

Complete command reference for DESIGN-OPS.

## Trigger

User runs `/dcs:help` to see all available commands and skills.

---

## Output

```markdown
# DESIGN-OPS — Command Reference

## System Commands

| Command | Description |
|---------|-------------|
| `/dcs:setup` | Initial onboarding wizard — configure integrations and preferences |
| `/dcs:configure` | Update specific settings without full setup |
| `/dcs:status` | Show current config status and integration health |
| `/dcs:test` | Run diagnostics to verify everything works |
| `/dcs:add-tool` | Connect a new MCP or API with guided setup |
| `/dcs:help` | This command reference |
| `/dcs:library` | Browse utility commands by category |

---

## Dashboard Command

The unified dashboard command generates reports across pillars and timeframes:

```bash
/dcs:dashboard [pillar] [timeframe]
```

| Pillars | Timeframes |
|---------|------------|
| `ops` — Operations | `daily` (or `today`, `d`) |
| `design` — Design | `weekly` (or `week`, `w`) |
| `analytics` — Analytics | `quarterly` (or `quarter`, `q`) |
| omitted — All pillars | `ytd` (or `year`, `y`) |

**Examples:**
```bash
/dcs:dashboard                    # All pillars, daily (default)
/dcs:dashboard ops weekly         # Operations, weekly
/dcs:dashboard design quarterly   # Design, quarterly
/dcs:dashboard analytics ytd      # Analytics, year-to-date
/dcs:dashboard weekly             # All pillars, weekly
```

---

## Legacy Aliases

These commands remain for backwards compatibility:

| Command | Maps To |
|---------|---------|
| `/dcs:daily-brief` | `/dcs:dashboard daily` |
| `/dcs:weekly-recap` | `/dcs:dashboard weekly` |
| `/dcs:team-pulse` | `/dcs:dashboard design daily --team` |

---

## Utility Library

Browse with `/dcs:library` or `/dcs:library [category]`.

### Logistics
*Meeting prep, kickoffs, and project coordination*

| Command | Description |
|---------|-------------|
| `/dcs:meeting-brief` | Create focused meeting agendas |
| `/dcs:meeting-recap` | Document meetings with action items |
| `/dcs:kickoff-prep` | Generate project kickoff materials |

### Content
*Content creation for social and marketing*

| Command | Description |
|---------|-------------|
| `/dcs:social-post` | Create platform-optimized social content |

### Development
*Research, analysis, and ideation tools*

| Command | Description |
|---------|-------------|
| `/dcs:site-analysis` | Deep website analysis |
| `/dcs:devils-advocate` | Challenge assumptions |

---

## Auto-Activating Skills

These activate automatically based on context — no command needed:

| Skill | Triggers On |
|-------|-------------|
| `brand-guidelines` | Mentions of brand, colors (Aperol, Charcoal, Vanilla), brand voice |
| `frontend-design` | UI work, component creation, design implementation |
| `design-system-quality` | Design system reviews, token validation |
| `brand-voice` | Content writing, copywriting, messaging |
| `design-feedback` | Design critique, visual review |
| `accessibility-audit` | Accessibility checks, a11y reviews |
| `systematic-debugging` | Debugging, error investigation |
| `verification-before-completion` | Task completion, claiming "done" |

---

## Quick Start

1. **First time?** Run `/dcs:setup` to configure integrations
2. **Morning routine?** Run `/dcs:dashboard` (or `/dcs:daily-brief`)
3. **Weekly review?** Run `/dcs:dashboard weekly`
4. **Check team activity?** Run `/dcs:dashboard design`
5. **Something broken?** Run `/dcs:test`
6. **Find a utility?** Run `/dcs:library`

---

## Configuration

Config file: `~/.claude/dcs-config.yaml`

View current config: `/dcs:status`
Update config: `/dcs:configure`

---

## Getting Help

- **Issues:** https://github.com/opensesh/DESIGN-OPS/issues
- **Docs:** See /references folder in plugin directory
- **Troubleshooting:** /references/troubleshooting.md
```

---

## Contextual Help

If user runs `/dcs:help {topic}`:

**`/dcs:help dashboard`**
```markdown
## Dashboard Command Help

### Usage
```bash
/dcs:dashboard [pillar] [timeframe]
```

### Pillars
- `ops` / `operations` — Calendar, tasks, communication
- `design` — Code repos, design files, team activity
- `analytics` — Web traffic, links, subscribers
- omitted — All enabled pillars combined

### Timeframes
- `daily` / `today` / `d` — Today's activity
- `weekly` / `week` / `w` — This week's summary
- `quarterly` / `quarter` / `q` — Quarter-to-date
- `ytd` / `year` / `y` — Year-to-date

### Examples
```bash
/dcs:dashboard                    # All pillars, daily
/dcs:dashboard ops                # Operations, daily
/dcs:dashboard weekly             # All pillars, weekly
/dcs:dashboard design quarterly   # Design, quarterly
```

### Configuration
Dashboard reads from `~/.claude/dcs-config.yaml`:
- Which pillars are enabled
- Which tools are connected
- Which outcomes to include

Run `/dcs:configure` to adjust.
```

**`/dcs:help library`**
```markdown
## Library Command Help

### Usage
```bash
/dcs:library              # List all utility commands
/dcs:library [category]   # Filter by category
```

### Categories
- `logistics` — Meeting prep, kickoffs, project coordination
- `content` — Content creation for social and marketing
- `development` — Research, analysis, ideation tools

### Available Commands

**Logistics:**
- `/dcs:meeting-brief` — Create meeting agendas
- `/dcs:meeting-recap` — Document meetings
- `/dcs:kickoff-prep` — Project kickoff materials

**Content:**
- `/dcs:social-post` — Social media content

**Development:**
- `/dcs:site-analysis` — Website analysis
- `/dcs:devils-advocate` — Challenge assumptions

### Adding Commands
See `commands/library/_registry.yaml` for the registry format.
```

**`/dcs:help figma`**
```markdown
## Figma Integration Help

### Setup
Run `/dcs:setup` and select Figma integration, or run `/dcs:configure` → Figma.

### Token Generation
1. Go to https://www.figma.com/developers/api#access-tokens
2. Generate token with "File content" scope
3. Paste in setup wizard

### Tracking
- Track entire projects (all files in project)
- Or track specific files by key

### Troubleshooting
- Token expired? Regenerate and update via `/dcs:configure`
- Can't see projects? Check token has correct scope
- 403 errors? Token may have been revoked

See: /references/troubleshooting.md
```

**`/dcs:help github`**
```markdown
## GitHub Integration Help

### Setup
GitHub uses MCP — no separate token needed.

If GitHub MCP isn't connected:
1. Go to claude.ai/mcps
2. Install GitHub MCP
3. Authorize with your account
4. Re-run `/dcs:setup`

### Tracking
Add repos in owner/repo format (e.g., opensesh/webapp)

### Features
- Recent commits
- Open PRs
- Issue tracking

See: /references/mcp-setup/add-mcp-guide.md
```

---

## Command Not Found

If user runs `/dcs:help {unknown}`:

```markdown
I don't have specific help for "{topic}".

Try:
- `/dcs:help dashboard` — Dashboard command usage
- `/dcs:help library` — Utility command browser
- `/dcs:help figma` — Figma integration
- `/dcs:help github` — GitHub integration

Or search the documentation in /references/
```

---

*Version: 2.0*
