# Design Company Skills

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A Claude Code plugin providing a design company toolkit: brand guidelines, design system quality checks, team activity dashboards, and Figma + GitHub integration.

**Works in:**
- **Claude Code CLI** (terminal)
- **Claude Desktop** (Code tab)
- **VS Code Extension** (Claude integration)

---

## Quick Start

### Installation

**Terminal (Recommended):**
```bash
# Clone the plugin
git clone https://github.com/opensesh/design-company-skills.git ~/design-company-skills

# Add to Claude Code
claude plugin add ~/design-company-skills

# Run setup wizard
/dcs:setup
```

**Claude Desktop:**
1. [Download ZIP](https://github.com/opensesh/design-company-skills/archive/refs/heads/main.zip)
2. Extract to a folder (e.g., `Documents/design-company-skills`)
3. Open Claude Desktop → Code tab
4. Click **+** → **Plugins** → **Add plugin**
5. Select the extracted folder
6. Run `/dcs:setup` to configure

### Verify Installation

```bash
/dcs:help
```

You should see a list of all available commands and skills.

---

## Commands

All commands use the `/dcs:` prefix (Design Company Skills).

### Setup & Configuration

| Command | Description |
|---------|-------------|
| `/dcs:setup` | Interactive onboarding wizard |
| `/dcs:configure` | Update specific settings |
| `/dcs:status` | Show current config and health |
| `/dcs:test` | Run diagnostics |
| `/dcs:help` | Command reference |

### Daily Workflows

| Command | Description |
|---------|-------------|
| `/dcs:daily-brief` | Morning overview — calendar, priorities, tasks |
| `/dcs:meeting-brief` | Create focused meeting agendas |
| `/dcs:meeting-recap` | Document meetings with action items |

### Weekly Workflows

| Command | Description |
|---------|-------------|
| `/dcs:weekly-recap` | End-of-week reflection and planning |

### Team Workflows

| Command | Description |
|---------|-------------|
| `/dcs:team-pulse` | Activity dashboard — Figma + GitHub |
| `/dcs:team-pulse-setup` | Configure team tracking |

### Creative & Analysis

| Command | Description |
|---------|-------------|
| `/dcs:devils-advocate` | Challenge assumptions, red-team thinking |
| `/dcs:social-post` | Create social media content |
| `/dcs:site-analysis` | Analyze any website |
| `/dcs:kickoff-prep` | Project kickoff materials |

### Tools

| Command | Description |
|---------|-------------|
| `/dcs:add-tool` | Connect new MCP with guided setup |
| `/dcs:customize` | Update preferences |

---

## Auto-Activating Skills

Skills activate automatically based on context — no command needed.

| Skill | Triggers On |
|-------|-------------|
| `brand-guidelines` | Brand, colors (Aperol, Charcoal, Vanilla), brand voice |
| `frontend-design` | UI work, component creation |
| `design-system-quality` | Code reviews, design system compliance |
| `brand-voice` | Content writing, copywriting |
| `design-feedback` | Design critique, visual review |
| `accessibility-audit` | Accessibility checks |
| `systematic-debugging` | Debugging, error investigation |
| `verification-before-completion` | Task completion verification |

---

## Integrations

### Figma

Track design activity across your team:
- Recent file edits
- Named versions
- Who's working on what

**Setup:** Run `/dcs:setup` and follow the Figma configuration steps.

### GitHub

Track development activity via MCP:
- Recent commits
- Open PRs
- Repository activity

**Setup:** Connect GitHub MCP, then run `/dcs:setup`.

### Team Member Mapping

Map platform handles to friendly names for cleaner output:
- Figma handles → Display names
- GitHub usernames → Display names

---

## Configuration

### Global Config

Stored at `~/.claude/dcs-config.yaml`:
- Figma API token and tracked projects
- GitHub repos to monitor
- Team member mappings
- Workflow preferences

### Project-Local Config

Per-project overrides at `.claude/design-company-skills.local.md`:
- Project-specific Figma files
- Project-specific repos
- Custom preferences

See [`references/config-schema.md`](references/config-schema.md) for complete documentation.

---

## Repository Structure

```
design-company-skills/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/                    # Slash commands
│   ├── setup.md                 # /dcs:setup
│   ├── configure.md             # /dcs:configure
│   ├── status.md                # /dcs:status
│   ├── test.md                  # /dcs:test
│   ├── help.md                  # /dcs:help
│   ├── daily-brief.md           # /dcs:daily-brief
│   ├── team-pulse.md            # /dcs:team-pulse
│   └── ...
├── skills/                      # Auto-activating skills
│   ├── brand-guidelines/
│   │   └── SKILL.md
│   ├── frontend-design/
│   │   └── SKILL.md
│   ├── design-system-quality/
│   │   └── SKILL.md
│   └── *.md                     # Flat skill files
├── templates/
│   ├── dcs-config.template.yaml
│   └── project-local.template.md
└── references/
    ├── config-schema.md
    ├── troubleshooting.md
    └── mcp-setup/
```

---

## Troubleshooting

### Commands not found

1. Verify plugin is installed: `claude plugin list`
2. Re-add plugin: `claude plugin add ~/design-company-skills`
3. Check for typos in command names

### Config not loading

1. Check file exists: `ls ~/.claude/dcs-config.yaml`
2. Run `/dcs:test` for diagnostics
3. See [`references/troubleshooting.md`](references/troubleshooting.md)

### Integration issues

Run `/dcs:test` to check:
- Figma API connectivity
- GitHub MCP availability
- Config validation

---

## Updating

```bash
cd ~/design-company-skills
git pull origin main
```

Your config at `~/.claude/dcs-config.yaml` is preserved.

---

## Creating Custom Skills

Use the template at [`templates/skill-template.md`](templates/skill-template.md) or the [`skill-creator`](skills/skill-creator.md) guide.

Skills should:
- Have clear activation triggers
- Include YAML frontmatter with name, description, version
- Provide 2 example scenarios
- List related skills

---

## Contributing

1. Fork and clone the repo
2. Add your skill/command to the appropriate folder
3. Follow existing patterns (see templates)
4. Test with Claude Code
5. Submit a PR with usage examples

---

## License

[Apache 2.0](LICENSE)

---

## Support

- **Issues:** [GitHub Issues](https://github.com/opensesh/design-company-skills/issues)
- **Docs:** [`references/`](references/) folder
- **Troubleshooting:** [`references/troubleshooting.md`](references/troubleshooting.md)
