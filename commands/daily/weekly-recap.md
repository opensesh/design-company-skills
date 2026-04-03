# /weekly-recap

End-of-week summary for personal reflection and planning.

## Trigger

User invokes `/weekly-recap` at the end of a week to review accomplishments, identify patterns, and prepare for the next week.

---

## Config-Aware Behavior

This command adapts based on the user's setup in `~/.claude/skills-config.yaml`.

### Check Available Resources

1. **Read user config** at `~/.claude/skills-config.yaml`
2. **Check MCP connections** for Calendar, Tasks, Email
3. **Adapt data gathering** based on what's connected

### Integration Levels

| Level | What's Connected | Behavior |
|-------|------------------|----------|
| **Full** | Calendar + Tasks + Email | Pull metrics automatically, focus on reflection |
| **Partial** | Calendar only | Show meeting count, ask about tasks/accomplishments |
| **Manual** | Nothing connected | Guide through reflection questions, still valuable |

---

## Workflow

### Step 1: Gather Data (Adaptive)

**If Calendar connected:**
- Count meetings this week
- Note busiest days
- Compare to typical week (if history available)

**If Task tool connected:**
- Tasks completed vs. planned
- Overdue items carried forward

**If Email connected:**
- Email volume (sent/received)
- Response patterns

**If nothing connected:**
- Skip to reflection questions directly

### Step 2: Reflection Questions

Guide the user through reflection. Adapt based on available data:

**With data:**
```
You had 11 meetings this week (3 more than usual).
Let's dig in — what did you accomplish that you're most satisfied with?
```

**Without data:**
```
Let's reflect on your week.
What were the highlights? What are you most satisfied with?
```

Core reflection prompts:
1. "What did you accomplish this week that you're most satisfied with?"
2. "What didn't get done that should have?"
3. "What drained your energy vs. gave you energy?"
4. "Any patterns you noticed?"

### Step 3: Generate Recap

Combine automated data (if available) with user reflection:

```
## Week of [Date Range]

### Accomplishments
- [Major accomplishment 1]
- [Major accomplishment 2]
- [Major accomplishment 3]

### Metrics (if available)
- Meetings: [X] ([change from typical])
- Tasks completed: [X of Y planned]
- [Other relevant metrics]

### Energy Audit
**Energizing:** [What gave energy]
**Draining:** [What drained energy]

### Didn't Get To
- [Item 1] - [Why / What to do about it]
- [Item 2]

### Patterns & Insights
[Observations about the week, trends, realizations]

### Wins to Celebrate
[Something to feel good about, even if small]

### Focus for Next Week
- [Priority 1]
- [Priority 2]
- [Priority 3]
```

### Step 4: Offer Follow-ups

- "Want me to block time for these priorities next week?"
- "Should I save this recap somewhere?"
- "Anything you want to carry forward to Monday's daily brief?"

---

## Graceful Degradation

| Source Unavailable | How to Handle |
|--------------------|---------------|
| Calendar | Ask: "Roughly how many meetings did you have?" |
| Tasks | Ask: "What did you get done this week?" |
| Email | Skip email metrics section |
| All sources | Full reflection mode — still highly valuable |

**The reflection is the core value.** Data just enriches it.

---

## Reflection Prompts (Backup)

Use these when user gives thin answers:

**For accomplishments:**
- What moved the needle most?
- What would you do again?
- What are you proud of?

**For drains:**
- What felt like a waste of time?
- What would you delegate or automate?
- What meeting should have been an email?

**For patterns:**
- Did this week feel typical or unusual?
- What would make next week better?
- What one thing would you change?

---

## Example Outputs

### Full Automation

```
## Week of March 25-29

### Accomplishments
- Shipped homepage redesign to staging
- Closed deal with Acme Corp ($12k project)
- Hired freelance developer for Q2 overflow

### Metrics
- Meetings: 11 (3 more than usual - lots of client calls)
- Tasks completed: 8 of 12 planned (67%)
- Emails sent: 47

### Energy Audit
**Energizing:** Design deep work on Wednesday, closing the Acme deal
**Draining:** Too many context switches, that 90-min meeting that could've been 30

### Didn't Get To
- Figma AI exploration - keep getting bumped (block time next week)
- Q1 case study writeup - need uninterrupted 2hrs

### Patterns & Insights
Meeting-heavy weeks kill my creative output. Need to protect Wednesday design time better.

### Wins to Celebrate
New client + new hire in the same week. Growth mode.

### Focus for Next Week
- Onboard new developer
- Finish case study (block Thursday AM)
- Start Acme discovery
```

### Manual Mode

```
## Week of March 25-29

(Based on your reflection)

### Accomplishments
- Shipped the homepage redesign you'd been pushing for
- Finally closed Acme after two months of back-and-forth
- Found a great freelancer for the overflow work

### Energy Audit
**Energizing:** Wednesday's focus time on design, the win with Acme
**Draining:** Context switching between projects, that long client meeting

### Didn't Get To
- Figma AI exploration — keeps slipping
- Q1 case study — need dedicated time

### Patterns & Insights
You mentioned meetings killing creative time. Consider protecting one full day for deep work?

### Focus for Next Week
- Onboard the new developer
- Block Thursday AM for case study (no meetings)
- Kick off Acme discovery

---

Want me to help you set up calendar access? Then next week's recap will include automatic metrics.
```

---

*Version: 2.0*
