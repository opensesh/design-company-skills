# Data Adapters

Adapters transform raw MCP/API responses into normalized data contracts. This enables tool-agnostic templates that work with any connected service.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Raw Tool Response (GitHub API, Figma MCP, etc.)                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Adapter (github.yaml, figma.yaml, etc.)                           │
│  - Field mappings                                                   │
│  - Value transformations                                            │
│  - Fallback values                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Normalized Contract (code_activity, creative_activity, etc.)      │
│  - Standard field names                                             │
│  - Consistent value formats                                         │
│  - Source attribution                                               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Component Template (list-activity.html, stat-card.html)            │
│  - Renders any data matching the contract                           │
│  - No tool-specific logic                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Adapter File Structure

Each adapter is a YAML file that defines:

1. **Tool metadata** — Name, URL, MCP tool name
2. **Contract mapping** — Which normalized contract this adapter produces
3. **Field mappings** — How to extract values from raw response
4. **Transformations** — How to format/convert values
5. **Fallbacks** — Default values for missing fields

## Example: GitHub Adapter

```yaml
# github.yaml
tool:
  id: github
  name: GitHub
  url: https://github.com
  mcp: mcp__github__list_commits

contract: code_activity

mappings:
  title: "$.message"                    # JSONPath to commit message
  subtitle: "$.author.login + ' · ' + $.branch"
  type:
    value: "commit"                     # Static value
  time:
    source: "$.commit.author.date"
    transform: relative_time            # Convert to "2h ago"
  url: "$.html_url"
  author: "$.author.login"
  source:
    value: "GitHub"

fallbacks:
  subtitle: "Unknown author"
  time: "recently"
```

## Transformation Functions

| Function | Description | Example |
|----------|-------------|---------|
| `relative_time` | ISO date → "2h ago" | `2024-01-15T10:00:00Z` → `3h ago` |
| `truncate(n)` | Limit string length | `"Long message..."` → `"Long mess..."` |
| `uppercase` | Convert to uppercase | `"draft"` → `"DRAFT"` |
| `lowercase` | Convert to lowercase | `"PENDING"` → `"pending"` |
| `percentage` | Decimal to percentage | `0.42` → `"42%"` |
| `number_format` | Format with commas | `12450` → `"12,450"` |
| `duration` | Seconds to "2:34" | `154` → `"2:34"` |

## Adding a New Adapter

1. Create `adapters/{tool}.yaml`
2. Define the contract it produces
3. Map fields from raw response to contract
4. Test with `/design-ops:dashboard-html`

## Supported Adapters

### Operations

| Adapter | Contract | Source Tool |
|---------|----------|-------------|
| `google-calendar.yaml` | `schedule_event` | Google Calendar |
| `notion-tasks.yaml` | `task_item` | Notion |
| `linear.yaml` | `task_item` | Linear |

### Design

| Adapter | Contract | Source Tool |
|---------|----------|-------------|
| `github.yaml` | `code_activity` | GitHub |
| `gitlab.yaml` | `code_activity` | GitLab |
| `figma.yaml` | `creative_activity` | Figma |

### Analytics

| Adapter | Contract | Source Tool |
|---------|----------|-------------|
| `google-analytics.yaml` | `traffic_metric` | Google Analytics |
| `dub.yaml` | `link_metric` | Dub.co |
| `supabase.yaml` | `database_metric` | Supabase |

## Error Handling

If an adapter fails to transform data, it should return an error object:

```yaml
error:
  type: "transformation_error"
  tool: "github"
  message: "Failed to parse commit data"
  raw_error: "..."
```

The dashboard will render this as an `empty-state` component with guidance.
