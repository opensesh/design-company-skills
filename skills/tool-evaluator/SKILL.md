# Tool Evaluator Skill

Sub-agent skill for evaluating tools during `/design-ops:setup`. Coordinates MCP availability checks and API capability evaluation.

## Purpose

When a user selects tools in the setup flow, this skill:
1. Checks if the tool is already installed and connected
2. Invokes the `mcp-discovery` skill for unknown tools
3. Returns a unified result with connection type and status

## Trigger

Invoked by `/design-ops:setup` during tool evaluation phase. Should run as a background sub-agent.

---

## Input

```yaml
tools:
  - name: "notion"
    pillar: "operations"
  - name: "figma"
    pillar: "design"
  - name: "substack"
    pillar: "analytics"
```

## Output

Returns a capability matrix for each tool, including discovery metadata:

```yaml
results:
  - tool: notion
    connection_type: mcp
    mcp_name: "notion"
    status: connected    # connected | available | api_only | unavailable | skipped

    # Discovery metadata (from mcp-discovery skill)
    mcp_source: official          # official | vendor | community | none
    mcp_package: "@notionhq/notion-mcp-server"
    mcp_confidence: high          # high | medium | low

    # Capabilities
    capabilities:
      data_types: [pages, databases, tasks, comments]
      reporting:
        daily: [recent_pages, task_counts, recent_comments]
        weekly: [page_activity, task_completion]
        monthly: [content_growth]

    setup_required: false
    warning: null

  - tool: figma
    connection_type: api
    status: api_only

    # Discovery metadata
    mcp_source: official
    mcp_package: null    # MCP exists but is code-focused
    mcp_confidence: low
    api_docs_url: "https://www.figma.com/developers/api"

    capabilities:
      data_types: [files, versions, comments, users]
      reporting:
        daily: [files_edited, active_users]
        weekly: [design_versions, comment_activity]
        monthly: [project_progress]

    setup_required: true
    setup_instructions: "Generate API token at figma.com/developers"
    note: "Official MCP is code-focused. Use API for reporting."

  - tool: gitlab
    connection_type: mcp
    status: available

    # Discovery metadata
    mcp_source: community
    mcp_package: "mcp-gitlab"
    mcp_confidence: medium

    capabilities:
      data_types: [projects, commits, merge_requests, issues, pipelines]
      reporting:
        daily: [recent_commits, open_mrs]
        weekly: [contributions, mr_activity]

    setup_required: true
    setup_instructions: "claude mcp add gitlab -- npx -y mcp-gitlab"
    warning: "Community package - not officially supported"
    warning_code: community_package

  - tool: instagram
    connection_type: unavailable
    status: unavailable

    mcp_source: none
    mcp_confidence: none

    reason: "API limited to business accounts with complex approval process"
    alternatives: ["Buffer", "Later", "Sprout Social"]
```

---

## Evaluation Process

### Step 1: Check if Already Installed

Read `~/.claude/settings.json` and check for MCP servers:

```bash
cat ~/.claude/settings.json | jq '.mcpServers'
```

For each tool, check:
1. Is there an MCP with matching name?
2. Is it responding to basic queries?

If installed and responding → status: `connected`

### Step 2: Invoke mcp-discovery Skill

If not installed, delegate to the `mcp-discovery` skill:

```yaml
skill: mcp-discovery
input:
  tool: "gitlab"
  pillar: "design"
```

The discovery skill returns:
- `mcp_source`: official | vendor | community | none
- `mcp_package`: npm package name (or null)
- `mcp_confidence`: high | medium | low
- `api_docs_url`: API documentation URL
- `recommendation`: mcp | api | both | unavailable
- `warning`: any warnings about community packages

### Step 3: Determine Status from Discovery

Based on `discovery_result.recommendation`:

| Recommendation | Confidence | Status | Connection Type |
|----------------|------------|--------|-----------------|
| mcp | high | available | mcp |
| mcp | medium | available (with warning) | mcp |
| mcp | low | api_only suggested | api |
| api | — | api_only | api |
| unavailable | — | unavailable | unavailable |

### Step 4: Build Capability Matrix

For connected/available tools, populate capabilities from known data:

**Operations pillar:**
- Notion, Google Workspace, Linear, Slack: See known capabilities below

**Design pillar:**
- GitHub, GitLab, Figma: See known capabilities below

**Analytics pillar:**
- GA4, Dub.co, Plausible, Substack: See known capabilities below

---

## Known Tool Capabilities

### Operations Pillar

**Notion**
- Data types: pages, databases, blocks, comments, users
- Daily: recent_pages, task_counts, recent_comments
- Weekly: page_activity, task_completion

**Google Workspace**
- Data types: calendar_events, emails, documents
- Daily: todays_events, unread_emails
- Weekly: event_count, email_volume

**Linear**
- Data types: issues, projects, cycles, teams, labels
- Daily: issues_due, assigned_issues
- Weekly: issues_completed, cycle_progress

**Slack**
- Data types: messages, channels, reactions
- Daily: unread_counts, mentions
- Weekly: channel_activity

### Design Pillar

**GitHub**
- Data types: repos, commits, prs, issues, actions
- Daily: recent_commits, open_prs
- Weekly: team_contributions, pr_activity

**GitLab**
- Data types: projects, commits, merge_requests, issues, pipelines
- Daily: recent_commits, open_mrs
- Weekly: contributions, ci_stats

**Figma** (API only for reporting)
- Data types: files, versions, comments, users
- Daily: files_edited, active_users
- Weekly: design_versions, comment_activity

### Analytics Pillar

**Google Analytics (GA4)**
- Data types: pageviews, sessions, events, goals
- Daily: session_count, top_pages
- Weekly: traffic_trends, source_breakdown

**Dub.co**
- Data types: links, clicks, referrers, geo
- Daily: click_counts
- Weekly: top_links

**Plausible** (API only)
- Data types: visitors, pageviews, sources
- Daily: visitor_count, top_pages
- Weekly: traffic_trends

**Substack** (API only, needs wrapper)
- Data types: subscribers, posts, email_stats
- Daily: new_subscribers
- Weekly: subscriber_growth, post_views

---

## Integration with Setup Flow

### During Chapter 1 (Operations)

```
User selects: [Notion, Google Workspace, Slack]
↓
Spawn tool-evaluator sub-agent:
  - Check Notion MCP → Found, connected → status: connected
  - Check Google Workspace MCP → Found, connected → status: connected
  - Check Slack MCP → Not found → invoke mcp-discovery
    → mcp-discovery returns: community, medium confidence, warning
  → Slack status: available (with warning)
↓
Return capability matrix
↓
Main agent presents findings with status indicators
```

### During Chapter 2 (Design)

```
User selects: [GitHub, Figma]
↓
Spawn tool-evaluator sub-agent:
  - Check GitHub MCP → Found, connected → status: connected
  - Check Figma MCP → Found, but code-focused → invoke mcp-discovery
    → mcp-discovery returns: official but code-focused, api recommended
  → Figma status: api_only (with note)
↓
Return capability matrix
↓
Main agent guides Figma API token setup
```

### During Chapter 3 (Analytics)

```
User selects: [GA4, Substack, Instagram]
↓
Spawn tool-evaluator sub-agent:
  - Check GA4 MCP → Found, connected → status: connected
  - Check Substack → invoke mcp-discovery
    → Returns: no MCP, API available, needs wrapper
  → Substack status: api_only (with wrapper option)
  - Check Instagram → invoke mcp-discovery
    → Returns: unavailable
  → Instagram status: unavailable
↓
Return capability matrix
↓
Main agent offers Substack wrapper creation, skips Instagram
```

---

## Error Handling

**MCP not responding:**
```yaml
tool: notion
connection_type: mcp
status: error
error: "MCP timeout - server not responding"
suggestion: "Restart Claude or check MCP server"
```

**Discovery failed:**
```yaml
tool: unknown_tool
connection_type: unknown
status: error
error: "Discovery could not determine connection method"
suggestion: "Check if tool has public API documentation"
```

---

## Usage Example

When invoked by setup flow:

```python
# Pseudo-code for sub-agent task

def evaluate_tools(tools: list[dict]) -> dict:
    results = []

    for tool_info in tools:
        tool = tool_info['name']

        # Step 1: Check if already installed
        mcp_info = check_installed_mcp(tool)

        if mcp_info.found and mcp_info.connected:
            results.append({
                'tool': tool,
                'connection_type': 'mcp',
                'status': 'connected',
                'mcp_source': 'installed',
                'mcp_confidence': 'high',
                'capabilities': get_capabilities(tool)
            })
        else:
            # Step 2: Invoke mcp-discovery skill
            discovery = invoke_skill('mcp-discovery', tool=tool)

            # Step 3: Determine status from discovery
            if discovery.recommendation == 'mcp':
                if discovery.mcp_confidence == 'high':
                    status = 'available'
                    warning = None
                else:
                    status = 'available'
                    warning = discovery.warning

                results.append({
                    'tool': tool,
                    'connection_type': 'mcp',
                    'status': status,
                    'mcp_source': discovery.mcp_source,
                    'mcp_package': discovery.mcp_package,
                    'mcp_confidence': discovery.mcp_confidence,
                    'capabilities': get_capabilities(tool),
                    'setup_instructions': f"claude mcp add {tool} -- npx -y {discovery.mcp_package}",
                    'warning': warning
                })

            elif discovery.recommendation == 'api':
                results.append({
                    'tool': tool,
                    'connection_type': 'api',
                    'status': 'api_only',
                    'mcp_source': discovery.mcp_source,
                    'api_docs_url': discovery.api_docs_url,
                    'capabilities': get_capabilities(tool),
                    'setup_required': True,
                    'note': discovery.note
                })

            else:
                results.append({
                    'tool': tool,
                    'connection_type': 'unavailable',
                    'status': 'unavailable',
                    'mcp_source': 'none',
                    'reason': discovery.reason,
                    'alternatives': discovery.alternatives
                })

    return {'results': results}
```

---

## References

- `skills/mcp-discovery/SKILL.md` — Dynamic MCP discovery
- `references/tool-registry.md` — Reference documentation (not source of truth)
- `references/config-schema.md` — Config structure for storing results

---

*Version: 2.0*
