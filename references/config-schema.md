# Configuration Schema Reference

Complete reference for the Design Company Skills configuration file.

## File Locations

| File | Purpose | Location |
|------|---------|----------|
| Global config | Main configuration | `~/.claude/dcs-config.yaml` |
| Project config | Per-project overrides | `.claude/design-company-skills.local.md` |
| Legacy config | Old team-pulse config | `~/.claude/team-pulse-config.yaml` |

---

## Global Configuration

### Metadata

```yaml
version: 1.0           # Config schema version
created: "2025-04-13"  # ISO date created
updated: "2025-04-13"  # ISO date last modified
```

---

### Figma Integration

```yaml
figma:
  enabled: true/false
  api_token: string         # Personal access token

  tracked_projects:         # Projects to monitor
    - id: string            # Project ID from URL
      name: string          # Display name

  tracked_files:            # Specific files to monitor
    - key: string           # File key from URL
      name: string          # Display name
```

**Getting Your Token:**
1. Go to [Figma Developer Settings](https://www.figma.com/developers/api#access-tokens)
2. Generate token with "File content" scope
3. Store in `api_token` field

**Finding Project IDs:**
- URL: `figma.com/files/project/123456789`
- ID: `123456789`

**Finding File Keys:**
- URL: `figma.com/design/ABC123xyz/File-Name`
- Key: `ABC123xyz`

---

### GitHub Integration

```yaml
github:
  enabled: true/false

  tracked_repos:            # Repositories to monitor
    - owner: string         # GitHub username or org
      repo: string          # Repository name
```

**Note:** GitHub uses the MCP connection. No separate token needed.

---

### Slack Integration

```yaml
slack:
  enabled: true/false

  tracked_channels:
    - name: string          # Channel name without #
```

---

### Team Members

```yaml
team:
  members:
    - name: string          # Display name
      figma_handle: string  # Figma username
      github_username: string
      slack_username: string
```

Maps platform handles to friendly names for cleaner output.

---

### Workflow Preferences

```yaml
workflows:
  daily:
    - morning_brief
    - meeting_prep
  weekly:
    - weekly_recap
  team:
    - team_pulse
  as_needed:
    - design_feedback
    - brand_guidelines
    - devils_advocate
    - site_analysis
    - social_post
```

Enable/disable specific workflows by including or removing them from the lists.

---

### Display Preferences

```yaml
preferences:
  activity_window_hours: 24   # Look-back window (hours)
  show_prs: true              # Include PRs in output
  show_commits: true          # Include commits
  show_versions: true         # Include Figma versions
```

---

### Tools Detected

```yaml
tools_detected:
  - name: string              # MCP server name
    capabilities: [string]    # Detected capabilities
```

Auto-populated by `/dcs:setup` based on MCP configuration.

---

### Brand Configuration

```yaml
brand:
  name: string
  voice: string               # Voice descriptors
  colors:
    primary: string           # Hex color
    secondary: string
    accent: string
```

Optional. Used by brand-related skills.

---

## Project-Local Configuration

Project-specific overrides in `.claude/design-company-skills.local.md`.

### Frontmatter

```yaml
---
project_name: string
project_type: string          # web-app, design-system, etc.

figma_files:
  - key: string
    name: string

github_repos:
  - owner: string
    repo: string

preferences:
  activity_window_hours: 48   # Override global
---
```

### Body Content

Markdown content for project context, team notes, and instructions.

---

## Validation Rules

### Required Fields

For `/dcs:test` to pass:
- `version` must be present
- At least one of `figma` or `github` must be enabled
- `api_token` must be valid if Figma enabled

### Token Validation

Figma token is validated via:
```bash
curl -s -H "Authorization: Bearer {token}" "https://api.figma.com/v1/me"
```

GitHub is validated via MCP tool availability.

---

## Migration from Legacy Config

If `~/.claude/team-pulse-config.yaml` exists:

```yaml
# Legacy format
figma:
  api_token: ""
  tracked_projects: [...]

# New format adds:
version: 1.0
figma:
  enabled: true  # Explicit enable flag
  api_token: ""
  tracked_projects: [...]

# Plus additional sections
github: {...}
workflows: {...}
preferences: {...}
```

Run `/dcs:setup` to migrate automatically.

---

## Example Complete Config

```yaml
version: 1.0
created: "2025-04-13"
updated: "2025-04-13"

figma:
  enabled: true
  api_token: "figd_xxxxxxxxxxxx"
  tracked_projects:
    - id: "123456789"
      name: "Design System"
    - id: "987654321"
      name: "Marketing Site"
  tracked_files: []

github:
  enabled: true
  tracked_repos:
    - owner: "opensesh"
      repo: "webapp"
    - owner: "opensesh"
      repo: "design-system"

slack:
  enabled: false
  tracked_channels: []

team:
  members:
    - name: "Sarah Chen"
      figma_handle: "sarah.chen"
      github_username: "sarahc"
    - name: "Jake Miller"
      figma_handle: ""
      github_username: "jakemiller"

workflows:
  daily:
    - morning_brief
    - meeting_prep
  weekly:
    - weekly_recap
  team:
    - team_pulse
  as_needed:
    - design_feedback
    - brand_guidelines
    - devils_advocate

preferences:
  activity_window_hours: 24
  show_prs: true
  show_commits: true
  show_versions: true

tools_detected:
  - name: github
    capabilities: [code_search, pull_requests, issues]

brand:
  name: "Open Session"
  voice: "professional, warm, technical"
  colors:
    primary: "#FF6B35"
    secondary: "#1A1A1A"
```

---

## Troubleshooting

### Config Not Loading

1. Check file exists: `ls ~/.claude/dcs-config.yaml`
2. Check YAML syntax: `python -c "import yaml; yaml.safe_load(open('~/.claude/dcs-config.yaml'))"`
3. Run `/dcs:test` for diagnostics

### Token Issues

1. Regenerate token in Figma settings
2. Ensure "File content" scope is selected
3. Update config via `/dcs:configure`

### Missing Activity

1. Check `activity_window_hours` setting
2. Verify project IDs/file keys are correct
3. Ensure you have access to tracked items

---

*See also: `/dcs:configure`, `/dcs:test`, `/dcs:status`*
