# MCP Discovery Skill

Dynamic MCP package discovery at runtime. Instead of relying on a static registry, this skill verifies MCP availability by querying npm, GitHub, and vendor documentation.

## Purpose

When a user selects a tool during `/design-ops:setup`, this skill discovers the best connection method:
1. Check for official/vendor MCPs
2. Evaluate community packages (with quality metrics)
3. Find API documentation for direct integration
4. Return a recommendation with confidence level

## Why Dynamic Discovery?

- 100+ potential tools across operations/design/analytics
- Static registries become stale immediately
- New MCPs are published constantly
- Tool-agnostic design requires runtime discovery

---

## Trigger

Invoked by `tool-evaluator` skill during setup flow:

```yaml
skill: mcp-discovery
input:
  tool: "monday"
  pillar: "operations"
```

---

## Discovery Flow

```
User selects tool (e.g., "Monday.com")
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Check Known Tools (fast path)                      │
│  - Look up in known_tools.yaml for common tools             │
│  - If found with high confidence, return immediately        │
└─────────────────────────────────────────────────────────────┘
           │ not found
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Search npm for Official MCP                        │
│  - npm view @anthropic/mcp-{tool}                           │
│  - npm view @{vendor}/mcp-server                            │
│  - Check for vendor-published packages                      │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Search npm for Community MCPs                      │
│  - npm search {tool} mcp --json                             │
│  - Filter by: downloads > 1000, updated < 6 months          │
│  - Rank by quality metrics                                  │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Check Anthropic MCP Servers Repo                   │
│  - GitHub API: repos/anthropics/mcp-servers/contents        │
│  - Look for tool-specific server                            │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Discover API Documentation                         │
│  - Web search: "{tool} API documentation"                   │
│  - Check common patterns: api.{tool}.com, developers.{tool} │
│  - Scrape for authentication requirements                   │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Return Discovery Result                            │
│  - Recommendation: mcp | api | both | unavailable           │
│  - Confidence level based on source quality                 │
│  - Warning if community package                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Output Schema

```yaml
tool: monday
discovery_result:
  # MCP discovery
  mcp_found: true | false
  mcp_source: official | vendor | community | none
  mcp_package: "@monday/mcp-server"
  mcp_confidence: high | medium | low

  # Quality metrics (when available)
  npm_weekly_downloads: 5000
  npm_last_updated: "2025-03-15"
  github_stars: 120

  # API discovery
  api_available: true
  api_docs_url: "https://developer.monday.com/api-reference"
  api_auth_type: "api_key" | "oauth" | "token"

  # Final recommendation
  recommendation: mcp | api | both | unavailable
  status: connected | available | api_only | unavailable

  # Warnings
  warning: "Community package - not officially supported" | null
  warning_code: community_package | low_downloads | outdated | none
```

---

## Confidence Levels

| Level | Source | Criteria |
|-------|--------|----------|
| **high** | Official | Package from `@anthropic/*` or vendor namespace |
| **high** | Vendor | Published by tool vendor (e.g., `@linear/mcp-linear`) |
| **medium** | Community (popular) | >5000 weekly downloads, updated in last 3 months |
| **low** | Community (obscure) | <1000 downloads or not updated in 6+ months |

---

## Known Tools (Fast Path)

For the 15 most common tools, skip npm queries with cached known-good data:

```yaml
# skills/mcp-discovery/known-tools.yaml

known_tools:
  notion:
    mcp_source: official
    mcp_package: "@notionhq/notion-mcp-server"
    mcp_confidence: high
    api_docs: "https://developers.notion.com"
    recommendation: mcp

  github:
    mcp_source: official
    mcp_package: "@anthropic/mcp-github"
    mcp_confidence: high
    api_docs: "https://docs.github.com/en/rest"
    recommendation: mcp

  linear:
    mcp_source: vendor
    mcp_package: "@linear/mcp-linear"
    mcp_confidence: high
    api_docs: "https://developers.linear.app"
    recommendation: mcp

  figma:
    mcp_source: official
    mcp_package: null  # MCP is code-focused, not for reporting
    mcp_confidence: low
    api_docs: "https://www.figma.com/developers/api"
    recommendation: api
    note: "Official MCP is code-focused. Use API for reporting."

  google_calendar:
    mcp_source: official
    mcp_package: "@anthropic/mcp-google-calendar"
    mcp_confidence: high
    api_docs: "https://developers.google.com/calendar"
    recommendation: mcp

  gmail:
    mcp_source: official
    mcp_package: "@anthropic/mcp-gmail"
    mcp_confidence: high
    api_docs: "https://developers.google.com/gmail/api"
    recommendation: mcp

  slack:
    mcp_source: community
    mcp_package: null  # Multiple community options
    mcp_confidence: medium
    api_docs: "https://api.slack.com"
    recommendation: both
    warning: "Multiple community MCPs available. Verify before installing."

  asana:
    mcp_source: community
    mcp_package: null
    mcp_confidence: low
    api_docs: "https://developers.asana.com"
    recommendation: api
    note: "Limited community MCP. Direct API recommended."

  gitlab:
    mcp_source: community
    mcp_package: "mcp-gitlab"
    mcp_confidence: medium
    api_docs: "https://docs.gitlab.com/ee/api/"
    recommendation: mcp
    warning: "Community package. Verify before installing."

  bitbucket:
    mcp_source: none
    mcp_package: null
    mcp_confidence: none
    api_docs: "https://developer.atlassian.com/cloud/bitbucket/"
    recommendation: api

  google_analytics:
    mcp_source: official
    mcp_package: "@anthropic/mcp-google-analytics"
    mcp_confidence: high
    api_docs: "https://developers.google.com/analytics"
    recommendation: mcp

  dubco:
    mcp_source: community
    mcp_package: "mcp-dub"
    mcp_confidence: medium
    api_docs: "https://dub.co/docs/api-reference"
    recommendation: mcp

  plausible:
    mcp_source: none
    mcp_package: null
    mcp_confidence: none
    api_docs: "https://plausible.io/docs/stats-api"
    recommendation: api

  substack:
    mcp_source: none
    mcp_package: null
    mcp_confidence: none
    api_docs: null
    recommendation: api
    note: "Limited unofficial API. Custom wrapper via /mcp-builder."

  supabase:
    mcp_source: official
    mcp_package: "@anthropic/mcp-supabase"
    mcp_confidence: high
    api_docs: "https://supabase.com/docs/reference"
    recommendation: mcp
```

This is a **hint**, not a source of truth. The skill can still verify dynamically if needed.

---

## Discovery Implementation

### Step 2: npm Official Search

```bash
# Check for official Anthropic package
npm view @anthropic/mcp-{tool} --json 2>/dev/null

# Check for vendor package patterns
npm view @{tool}/mcp-server --json 2>/dev/null
npm view @{tool}/mcp-{tool} --json 2>/dev/null
```

### Step 3: npm Community Search

```bash
# Search for community packages
npm search {tool} mcp --json | jq '.[] | select(.name | contains("mcp"))'
```

**Quality filters:**
- Weekly downloads > 1000
- Updated within last 6 months
- Has README and documentation

### Step 4: Anthropic MCP Servers Check

```bash
# Check Anthropic's official MCP servers repository
gh api repos/anthropics/mcp-servers/contents
```

### Step 5: API Documentation Discovery

Web search for:
- `{tool} REST API documentation`
- `{tool} developer API`
- `{tool} API reference`

Common URL patterns:
- `https://api.{tool}.com`
- `https://developers.{tool}.com`
- `https://{tool}.com/developers`
- `https://docs.{tool}.com/api`

---

## Caching Strategy

1. **Session cache:** Discovery results cached for current session
2. **Config cache:** Successful discoveries written to user config
3. **Re-discovery:** Happens on explicit `/design-ops:setup` runs

```yaml
# In ~/.claude/design-ops-config.yaml
tools:
  - id: monday
    type: mcp
    mcp_package: "@monday/mcp-server"
    mcp_source: vendor
    mcp_confidence: high
    # Cached discovery result - prevents re-query
    discovery_cached: "2025-04-17"
```

---

## Community Package Warning

When a community MCP is the only option, return with warning:

```yaml
discovery_result:
  mcp_found: true
  mcp_source: community
  mcp_package: "some-community-mcp"
  mcp_confidence: low
  warning: "Community package - not officially supported"
  warning_code: community_package
  alternatives:
    - type: api
      description: "Direct API integration available"
      api_docs: "https://api.example.com"
```

The setup wizard will present this warning to the user:

```markdown
### Community Package Notice

{Tool} uses a community-maintained MCP package.

**Package:** `{package-name}`
**Downloads:** {weekly_downloads}/week
**Last updated:** {last_updated}

Community packages are not officially supported. They may:
- Stop working if not maintained
- Have security or reliability issues

**Alternatives:**
- Use direct API integration instead
- Wait for official MCP release

[Use community package] [Use direct API instead] [Skip this tool]
```

---

## Error Handling

### npm not available

```yaml
error: npm_unavailable
message: "npm not available for package discovery"
fallback: "Check references/tool-registry.md manually"
```

### Network timeout

```yaml
error: network_timeout
message: "Could not reach npm registry"
fallback: "Using cached known-tools data"
```

### Unknown tool

```yaml
error: unknown_tool
message: "No MCP or API found for {tool}"
recommendation: unavailable
suggestion: "Check if tool has public API documentation"
```

---

## Integration Points

### Called by: tool-evaluator skill

```yaml
# In tool-evaluator flow
for tool in selected_tools:
  # First check if already installed
  if tool_installed_in_settings(tool):
    status = "connected"
  else:
    # Invoke discovery
    discovery = invoke_skill("mcp-discovery", tool=tool)
    # Use discovery result for recommendation
```

### Writes to: config-schema

Discovery results populate these config fields:
- `mcp_source`: official | vendor | community | none
- `mcp_package`: npm package name
- `mcp_confidence`: high | medium | low

---

## References

- `references/tool-registry.md` — Reference documentation (not source of truth)
- `skills/tool-evaluator/SKILL.md` — Parent skill that invokes discovery
- `references/config-schema.md` — Config fields populated by discovery

---

*Version: 1.0*
