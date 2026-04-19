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
│  - npm view @modelcontextprotocol/server-{tool}             │
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
| **high** | Official | Package from `@modelcontextprotocol/*`, vendor namespace, or official HTTP MCP |
| **high** | Vendor | Published by tool vendor (e.g., `@notionhq/notion-mcp-server`, `@storybook/mcp`) |
| **high** | HTTP | Official HTTP MCPs (e.g., Figma, Supabase, Vercel) with `validated: true` |
| **medium** | Community (popular) | >5000 weekly downloads, updated in last 3 months, `validated: true` |
| **low** | Community (obscure) | <1000 downloads, placeholder packages, or not updated in 6+ months |
| **none** | Unavailable | No MCP available for this tool |

---

## Known Tools (Fast Path)

For the 42 most common tools, we use a **verified registry** (`known-tools.yaml`) that has been validated against npm and official documentation. All entries have `validated: true`.

### Registry Schema (v2.0)

```yaml
# skills/mcp-discovery/known-tools.yaml

version: "2.0"
last_validated: "2026-04-19"
validation_method: "npm view + official docs"

# Each tool entry includes:
# - mcp_source: official | vendor | community | none
# - mcp_package: npm package name (null for HTTP MCPs)
# - mcp_type: stdio | http
# - mcp_url: URL for HTTP MCPs
# - mcp_confidence: high | medium | low | none
# - validated: true (verified to exist)
# - install_cmd: explicit install command (optional)
# - warning: caution message (optional)
# - env_required: required environment variables
```

### Example Entries (Verified)

```yaml
# Vendor stdio MCP (high confidence)
notion:
  mcp_source: vendor
  mcp_package: "@notionhq/notion-mcp-server"
  mcp_type: stdio
  mcp_confidence: high
  validated: true
  env_required:
    - NOTION_API_KEY

# Official stdio MCP (deprecated but functional)
github:
  mcp_source: official
  mcp_package: "@modelcontextprotocol/server-github"
  mcp_type: stdio
  mcp_confidence: high
  validated: true
  warning: "Package marked deprecated on npm"
  env_required:
    - GITHUB_PERSONAL_ACCESS_TOKEN

# Official HTTP MCP
figma:
  mcp_source: official
  mcp_package: null
  mcp_type: http
  mcp_url: "https://mcp.figma.com/mcp"
  mcp_confidence: high
  validated: true
  install_cmd: "claude mcp add --transport http figma https://mcp.figma.com/mcp"

# Official HTTP MCP
supabase:
  mcp_source: official
  mcp_package: null
  mcp_type: http
  mcp_url: "https://api.supabase.com/mcp"
  mcp_confidence: high
  validated: true
  install_cmd: "claude mcp add supabase https://api.supabase.com/mcp"

# Community MCP (medium confidence)
linear:
  mcp_source: community
  mcp_package: "mcp-server-linear"
  mcp_type: stdio
  mcp_confidence: medium
  validated: true
  warning: "Community package by dvcrn"

# No MCP available (API only)
google_analytics:
  mcp_source: none
  mcp_package: null
  mcp_confidence: none
  validated: true
  api_docs: "https://developers.google.com/analytics"
  recommendation: api
  note: "Use Google Analytics Data API directly."
```

### Registry Summary (42 tools)

| Pillar | Total | MCP Available | API Only | Unavailable |
|--------|-------|---------------|----------|-------------|
| Operations | 12 | 8 | 3 | 1 |
| Design | 10 | 7 | 1 | 2 |
| Analytics | 12 | 3 | 7 | 2 |
| Infrastructure | 8 | 6 | 2 | 0 |
| **Total** | **42** | **24** | **13** | **5** |

This is the **source of truth** for DESIGN-OPS tool recommendations. All packages have been verified to exist.

---

## Discovery Implementation

### Step 1: Check Known Tools Registry (Fast Path)

```bash
# First, check known-tools.yaml for validated entries
# If found with validated: true, return immediately
# This prevents unnecessary npm queries for known tools
```

### Step 2: npm Package Search

```bash
# Check for official MCP packages (modelcontextprotocol namespace)
npm view @modelcontextprotocol/server-{tool} --json 2>/dev/null

# Check for vendor package patterns
npm view @{tool}hq/{tool}-mcp-server --json 2>/dev/null  # e.g., @notionhq/notion-mcp-server
npm view @{tool}/mcp --json 2>/dev/null                   # e.g., @storybook/mcp
npm view mcp-server-{tool} --json 2>/dev/null             # e.g., mcp-server-linear
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
- Not a placeholder (version > 0.0.1)

### Step 4: HTTP MCP Detection

Some tools provide HTTP-based MCPs instead of npm packages:

| Tool | HTTP MCP URL | Install Command |
|------|--------------|-----------------|
| Figma | `https://mcp.figma.com/mcp` | `claude mcp add --transport http figma https://mcp.figma.com/mcp` |
| Supabase | `https://api.supabase.com/mcp` | `claude mcp add supabase https://api.supabase.com/mcp` |
| Vercel | `https://mcp.vercel.com` | `claude mcp add --transport http vercel https://mcp.vercel.com` |

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

## MCP Installation Types

### stdio MCPs (npm packages)

Standard npm packages that run via standard I/O:

```bash
# Generic install pattern
claude mcp add {name} -- npx -y {package}

# Examples
claude mcp add notion -- npx -y @notionhq/notion-mcp-server
claude mcp add github -- npx -y @modelcontextprotocol/server-github
claude mcp add linear -- npx -y mcp-server-linear
```

### HTTP MCPs (hosted services)

HTTP-based MCPs that connect to hosted services:

```bash
# Generic install pattern
claude mcp add --transport http {name} {url}

# Examples
claude mcp add --transport http figma https://mcp.figma.com/mcp
claude mcp add --transport http vercel https://mcp.vercel.com
claude mcp add supabase https://api.supabase.com/mcp
```

### Detection Logic

When generating install commands:

```yaml
if mcp_type == "http":
  if install_cmd exists:
    use install_cmd  # Explicit command takes precedence
  else:
    generate: "claude mcp add --transport http {name} {mcp_url}"

elif mcp_type == "stdio":
  if install_cmd exists:
    use install_cmd
  else:
    generate: "claude mcp add {name} -- npx -y {mcp_package}"
```

---

## Validation Before Install

Before installing any package, the discovery flow SHOULD:

1. Run `npm view {package} --json` to verify existence
2. If 404, log warning and fall back to `recommendation: api`
3. Check for deprecation warnings in npm response
4. Cache validation results for session

This prevents issues if packages are unpublished or renamed.

---

## References

- `skills/mcp-discovery/known-tools.yaml` — Source of truth for tool recommendations
- `references/config-schema.md` — Config fields populated by discovery
- `skills/tool-evaluator/SKILL.md` — Parent skill that invokes discovery

---

*Version: 2.0*
