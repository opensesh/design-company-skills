# /daily-brief

Morning briefing that aggregates your calendar, tasks, email, and priorities into a focused daily overview.

## Trigger

User invokes `/daily-brief` to start their day with a consolidated view of what matters.

---

## Config-Aware Behavior

This command adapts based on the user's setup in `~/.claude/skills-config.yaml`.

### Check Available Resources

Before fetching data, determine what's available:

1. **Read user config** at `~/.claude/skills-config.yaml`
2. **Check MCP connections** for Calendar, Notion, Gmail
3. **Adapt workflow** based on what's connected

### Integration Levels

| Level | What's Connected | Behavior |
|-------|------------------|----------|
| **Full** | Calendar + Tasks + Email | Automated brief with all sections |
| **Partial** | Calendar only | Show meetings, ask about tasks/priorities |
| **Manual** | Nothing connected | Ask user for input, help prioritize |

---

## Workflow

### Step 1: Assess Available Data Sources

Check for these MCP servers:
- **Google Calendar** → Today's meetings and events
- **Notion** → Tasks due today or overdue
- **Gmail** → Unread/flagged emails from last 24 hours
- **Linear/Jira/Asana** → Alternative task sources

### Step 2: Gather Data (Adaptive)

**If Calendar connected:**
- Fetch today's events automatically
- Identify back-to-back meetings, gaps, conflicts

**If Task tool connected (Notion, Linear, etc.):**
- Pull tasks due today
- Include overdue items

**If Email connected:**
- Get unread/flagged email summaries
- Identify urgent items

**If nothing connected:**
- Skip to Step 3 with conversational prompt

### Step 3: Synthesize Briefing

**Full automation (all sources available):**

```
## Good morning

### Today's Schedule
[List meetings with times, attendees summary, and prep notes]

### Tasks Due Today
[Priority-ordered list]
[Include any overdue items]

### Email Requiring Attention
[Urgent/important emails grouped by topic]

### Heads Up
[Conflicts, gaps, concerns for the day]
```

**Partial automation (some sources):**

```
## Good morning

### Today's Schedule
[From Calendar]

### What's on Your Plate?
I don't have access to your tasks — what are your top priorities today?

[After user responds, synthesize into action plan]
```

**Manual mode (no sources):**

```
Good morning! I don't have access to your calendar or tasks yet.

Tell me: what's on your plate today? I'll help you prioritize and plan.

(Run /add-tool to connect your calendar for automated briefs.)
```

### Step 4: Offer Follow-ups

After presenting the briefing, offer relevant next steps:

- "Would you like me to prep you for [specific meeting]?"
- "Should I help prioritize these tasks?"
- "Want me to draft a reply to [urgent email]?"
- "I can block focus time around your meetings — want me to suggest times?"

---

## Output Style

- Concise, scannable
- No fluff or commentary
- Use bullet points
- Bold key names, times, and action items
- Personal tone ("You have 3 meetings today" not "There are 3 meetings scheduled")
- Warm but efficient

---

## Graceful Degradation

| Source Unavailable | How to Handle |
|--------------------|---------------|
| Calendar | Ask: "What meetings do you have today?" |
| Tasks | Ask: "What are your priorities for today?" |
| Email | Skip section, note: "(Email not connected)" |
| All sources | Full conversational mode — still valuable |

**Important:** Never fail. Always provide value, just adjust the approach.

---

## Example Outputs

### Full Automation

```
## Good morning

### Today's Schedule
- **9:00 AM** - Design review with Sarah (Figma link in calendar)
- **11:30 AM** - Client call: Acme Corp (prep: review proposal)
- **2:00 PM** - 1:1 with Jake

### Tasks Due Today
- [ ] Finalize homepage wireframes
- [ ] Send invoice to Acme
- [ ] Review PR from Jake

### Email Requiring Attention
- **[Urgent]** Sarah Chen - "Logo feedback needed by noon"
- **[Client]** Mike @ Acme - Question about timeline
- 4 other unread, none urgent

### Heads Up
- 30-min gap at 10:30 — good for logo feedback
- Acme call conflicts with usual lunch — eat early
```

### Partial Automation (Calendar only)

```
## Good morning

### Today's Schedule
- **9:00 AM** - Design review with Sarah
- **11:30 AM** - Client call: Acme Corp
- **2:00 PM** - 1:1 with Jake

### What Else is on Your Plate?
I see your meetings, but I don't have access to your task list.

What are your top priorities today? I'll help you fit them around your schedule.
```

### Manual Mode

```
Good morning! Let's plan your day.

I don't have access to your calendar or tasks yet, but I can still help.

**Quick questions:**
1. What meetings do you have today?
2. What must get done today?
3. Anything stressing you out?

(Pro tip: Run /add-tool to connect your calendar for automated briefs tomorrow.)
```

---

*Version: 2.0*
