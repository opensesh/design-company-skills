# /dcs:dashboard

Unified dashboard command that generates pillar × timeframe reports from connected tools.

## Trigger

```bash
/dcs:dashboard [pillar] [timeframe]
```

## Parameters

### Pillar (optional)

| Value | Description | Default |
|-------|-------------|---------|
| `ops` | Operations — calendar, tasks, communication | All pillars |
| `design` | Design — code repos, design files, team activity | All pillars |
| `analytics` | Analytics — web traffic, links, subscribers | All pillars |
| omitted | All enabled pillars combined | ✓ |

### Timeframe (optional)

| Value | Aliases | Description | Default |
|-------|---------|-------------|---------|
| `daily` | `today`, `d` | Today's activity | ✓ |
| `weekly` | `week`, `w` | This week's summary | — |
| `quarterly` | `quarter`, `q` | Quarter-to-date metrics | — |
| `ytd` | `year`, `y` | Year-to-date overview | — |

---

## Argument Parsing Logic

```
/dcs:dashboard                    → all pillars, daily
/dcs:dashboard ops                → operations, daily
/dcs:dashboard weekly             → all pillars, weekly
/dcs:dashboard ops weekly         → operations, weekly
/dcs:dashboard design quarterly   → design, quarterly
/dcs:dashboard analytics ytd      → analytics, year-to-date
```

**Detection rules:**
1. No args → all pillars, daily (defaults)
2. One arg → detect if pillar or timeframe, fill default for other
   - Pillar keywords: `ops`, `operations`, `design`, `analytics`
   - Timeframe keywords: `daily`, `today`, `d`, `weekly`, `week`, `w`, `quarterly`, `quarter`, `q`, `ytd`, `year`, `y`
3. Two args → pillar first, timeframe second

---

## Config-Aware Behavior

This command reads from `~/.claude/dcs-config.yaml` and fetches data based on:
1. Which pillars are enabled
2. Which tools are connected in each pillar
3. Which outcomes are selected for the requested timeframe

### Pillar-Based Data Gathering

```yaml
# From config:
pillars:
  operations:
    outcomes:
      daily: [calendar_events, tasks_due, unread_emails]
      weekly: [week_overview, tasks_completed, team_activity]
      quarterly: [quarter_goals, budget_status, project_completions]
      ytd: [annual_goals, revenue_tracking, client_retention]
  design:
    outcomes:
      daily: [recent_commits, open_prs, design_updates]
      weekly: [team_contributions, design_versions, pr_activity]
      quarterly: [shipped_projects, design_velocity, system_coverage]
      ytd: [projects_shipped, design_maturity, component_growth]
  analytics:
    outcomes:
      daily: [pageviews, link_clicks]
      weekly: [traffic_trends, top_links, audience_growth]
      quarterly: [quarter_trends, campaign_performance, conversion_funnel]
      ytd: [annual_traffic, yoy_comparison, total_growth]
```

---

## Workflow

### Step 1: Parse Arguments

1. **Parse** command arguments
2. **Detect** pillar vs timeframe
3. **Apply defaults** for missing values
4. **Validate** pillar is enabled in config

### Step 2: Load Config

1. **Read** `~/.claude/dcs-config.yaml`
2. **Filter** to requested pillar(s)
3. **Get** outcomes for requested timeframe
4. **Map** outcomes to connected tools

### Step 3: Fetch Data by Pillar × Timeframe

Execute appropriate data gathering based on pillar and timeframe combination.

**Operations pillar:**
- Daily: Calendar events, tasks due, unread emails/messages
- Weekly: Meeting count, tasks completed, communication volume
- Quarterly: Quarter goals progress, budget status, project completions
- YTD: Annual goals, revenue tracking, client retention metrics

**Design pillar:**
- Daily: Recent commits, open PRs, design file updates
- Weekly: Team contributions, design versions, PR activity
- Quarterly: Shipped projects, design velocity, system coverage
- YTD: Total projects shipped, design maturity score, component growth

**Analytics pillar:**
- Daily: Page views, link clicks, new subscribers
- Weekly: Traffic trends, top links, audience growth
- Quarterly: Quarter trends, campaign performance, conversion funnel
- YTD: Annual traffic totals, YoY comparison, total growth metrics

### Step 4: Render Output

Generate report using the appropriate template for pillar × timeframe.

---

## Output Templates

### Daily Template (All Pillars)

```markdown
## Dashboard — {Day}, {Month} {Date}

{If operations enabled:}
### Operations
**Schedule**
- {time} — {event title}

**Tasks Due**
- [ ] {task name}

**Communications**
- {count} unread emails ({flagged} flagged)
- {count} unread Slack messages

{If design enabled:}
### Design
**Recent Commits**
- **{repo}** — {author}: "{message}" ({time ago})

**Open PRs**
- #{number} "{title}" — {author} ({age})

**Figma Activity**
- **{file name}** — {editor}, {time ago}

{If analytics enabled:}
### Analytics
**Today's Numbers**
- Page views: {count} ({change} vs yesterday)
- Link clicks: {count}
- Top page: {page} ({views} views)

---

**Heads Up**
- {synthesized insight 1}
- {synthesized insight 2}
```

### Weekly Template (All Pillars)

```markdown
## Week of {Start Date} – {End Date}

{If operations enabled:}
### Operations Summary
**Meetings:** {count} this week ({comparison})
**Tasks:** {completed} of {planned} completed ({percentage}%)
**Communication:** {emails} emails, {messages} Slack messages

{If design enabled:}
### Development Summary
**Commits:** {total}
{For each team member:}
- {name}: {count} commits

**Pull Requests:**
- Opened: {count}
- Merged: {count}
- Avg review time: {hours} hours

### Design Summary
**Figma activity:**
- {versions} named versions created
- {files} files modified
- Most active: {file name}

{If analytics enabled:}
### Analytics Summary
**Traffic:** {sessions} sessions ({change} vs last week)
**Top pages:**
1. {page} — {views} views
2. {page} — {views} views

**Link performance:**
- Total clicks: {count}
- Top link: "{name}" — {clicks} clicks

---

### Patterns & Insights
- {pattern 1}
- {pattern 2}

### Focus for Next Week
1. {priority 1}
2. {priority 2}
```

### Quarterly Template (All Pillars)

```markdown
## Q{N} {Year} Dashboard

{If operations enabled:}
### Operations — Quarter Summary
**Goals Progress**
| Goal | Target | Actual | Status |
|------|--------|--------|--------|
| {goal} | {target} | {actual} | {status} |

**Projects Completed:** {count}
**Budget Status:** {amount} of {total} ({percentage}%)

{If design enabled:}
### Design — Quarter Summary
**Shipped Projects:** {count}
- {project name} — {date shipped}

**Design Velocity**
- PRs merged: {count}
- Avg cycle time: {days} days
- Design iterations: {count}

**System Coverage**
- Components documented: {count}
- Design token coverage: {percentage}%

{If analytics enabled:}
### Analytics — Quarter Summary
**Traffic Trends**
| Month | Sessions | Change |
|-------|----------|--------|
| {month} | {count} | {change} |

**Campaign Performance**
- Total campaigns: {count}
- Best performer: {name} ({metric})
- Conversion rate: {percentage}%

---

### Quarter Highlights
- {highlight 1}
- {highlight 2}

### Areas for Improvement
- {area 1}
- {area 2}
```

### YTD Template (All Pillars)

```markdown
## Year-to-Date Dashboard — {Year}

{If operations enabled:}
### Operations — YTD Summary
**Annual Goals**
| Goal | Progress | On Track |
|------|----------|----------|
| {goal} | {progress}% | {yes/no} |

**Client Retention:** {percentage}%
**Projects Delivered:** {count}
**Revenue:** ${amount} of ${target} ({percentage}%)

{If design enabled:}
### Design — YTD Summary
**Projects Shipped:** {count}
**Design Maturity**
- Design system adoption: {percentage}%
- Component reuse rate: {percentage}%
- Accessibility compliance: {percentage}%

**Growth Metrics**
- New components: {count}
- Documentation pages: {count}
- Design tokens: {count}

{If analytics enabled:}
### Analytics — YTD Summary
**Annual Traffic:** {total} sessions
**Year-over-Year:** {change}% vs {last_year}

**Growth by Quarter**
| Quarter | Sessions | Growth |
|---------|----------|--------|
| Q1 | {count} | {change}% |
| Q2 | {count} | {change}% |
| Q3 | {count} | {change}% |
| Q4 | {count} | {change}% |

**Total Growth:** {total_growth}%

---

### Year Highlights
- {highlight 1}
- {highlight 2}

### Remaining Goals
- {goal 1}
- {goal 2}
```

---

## Single Pillar Templates

When a specific pillar is requested, show only that pillar's data with expanded detail.

### Operations Only

```markdown
## Operations Dashboard — {Timeframe Title}

{Full operations section with expanded detail}
{Additional operations-specific metrics not shown in combined view}
```

### Design Only

```markdown
## Design Dashboard — {Timeframe Title}

{Full design section with expanded detail}
{Team member breakdown}
{Repository-level detail}
```

### Analytics Only

```markdown
## Analytics Dashboard — {Timeframe Title}

{Full analytics section with expanded detail}
{Source/medium breakdown}
{Geographic data if available}
```

---

## Graceful Degradation

### Pillar Disabled

If requested pillar is disabled:

```markdown
The {pillar} pillar is not enabled in your config.

Run `/dcs:configure` to enable it, or try:
- `/dcs:dashboard` (all enabled pillars)
- `/dcs:dashboard {other_pillar}`
```

### No Data for Timeframe

If no outcomes configured for timeframe:

```markdown
No {timeframe} outcomes configured for {pillar}.

Your current config has outcomes for: {available_timeframes}

To add {timeframe} outcomes, run `/dcs:configure`.
```

### No Config

```markdown
DESIGN-OPS isn't configured yet.

Run `/dcs:setup` to connect your tools and start getting automated dashboards.

Or tell me what you'd like to review, and I'll help manually.
```

---

## Outcome to Tool Mapping

### Daily Outcomes

| Outcome | Tool | Capability |
|---------|------|------------|
| `calendar_events` | google_workspace | todays_events |
| `tasks_due` | notion, linear | task_counts |
| `unread_emails` | google_workspace | unread_emails |
| `recent_commits` | github | recent_commits |
| `open_prs` | github | open_prs |
| `design_updates` | figma | files_edited |
| `pageviews` | google_analytics | session_count |
| `link_clicks` | dubco | click_counts |

### Weekly Outcomes

| Outcome | Tool | Capability |
|---------|------|------------|
| `week_overview` | google_workspace | event_count |
| `tasks_completed` | notion, linear | task_completion |
| `team_contributions` | github | team_contributions |
| `design_versions` | figma | design_versions |
| `traffic_trends` | google_analytics | traffic_trends |
| `top_links` | dubco | top_links |

### Quarterly Outcomes

| Outcome | Tool | Capability |
|---------|------|------------|
| `quarter_goals` | notion, linear | goal_tracking |
| `budget_status` | notion | budget_tracking |
| `shipped_projects` | github, figma | release_history |
| `design_velocity` | github | pr_velocity |
| `quarter_trends` | google_analytics | quarter_comparison |
| `campaign_performance` | google_analytics | campaign_metrics |

### YTD Outcomes

| Outcome | Tool | Capability |
|---------|------|------------|
| `annual_goals` | notion, linear | annual_tracking |
| `revenue_tracking` | notion | revenue_metrics |
| `projects_shipped` | github, figma | annual_releases |
| `design_maturity` | figma | system_coverage |
| `annual_traffic` | google_analytics | annual_totals |
| `yoy_comparison` | google_analytics | year_comparison |

---

## Follow-up Offers

After presenting any dashboard:

```markdown
---

**Want me to:**
- Drill down into any section?
- Compare to a different timeframe?
- Export this as a document?
```

---

## Examples

### Example: Default (All Pillars, Daily)

```bash
/dcs:dashboard
```

Shows combined daily dashboard across all enabled pillars.

### Example: Operations Weekly

```bash
/dcs:dashboard ops weekly
```

Shows operations-only weekly summary with meeting count, tasks completed, and communication volume.

### Example: Design Quarterly

```bash
/dcs:dashboard design quarterly
```

Shows design-only quarterly summary with shipped projects, design velocity, and system coverage metrics.

### Example: Analytics YTD

```bash
/dcs:dashboard analytics ytd
```

Shows analytics-only year-to-date summary with annual traffic totals and YoY comparisons.

### Example: Just Timeframe

```bash
/dcs:dashboard weekly
```

Shows all enabled pillars with weekly timeframe.

---

*Version: 1.0*
