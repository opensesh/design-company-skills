# /meeting-brief

Interactive workflow to create a focused meeting agenda through guided questions.

## Trigger

User invokes `/meeting-brief` before an upcoming meeting to prepare an effective agenda.

---

## Config-Aware Behavior

This command adapts based on the user's setup in `~/.claude/skills-config.yaml`.

### Check Available Resources

1. **Read user config** at `~/.claude/skills-config.yaml`
2. **Check MCP connections** for Calendar
3. **Adapt workflow** — fetch meeting details if available, otherwise ask

### Integration Levels

| Level | What's Connected | Behavior |
|-------|------------------|----------|
| **Full** | Calendar connected | "Which meeting? [List today's/upcoming]" + auto-populate details |
| **Manual** | Nothing connected | Full interview flow |

---

## Workflow

### Step 0: Check Calendar (If Connected)

**If Calendar MCP available:**

```
Which meeting are you prepping for?

Today:
1. 9:00 AM - Design Review (Sarah, Jake)
2. 11:30 AM - Client Call: Acme Corp
3. 2:00 PM - 1:1 with Jake

Or describe a different meeting.
```

If user selects from list, pre-populate:
- Meeting title
- Attendees
- Duration
- Any existing description

**If Calendar not connected:**
- Skip to Step 1 interview

### Step 1: Interview

Ask these questions one at a time, adapting based on answers.

**Skip questions if data was auto-populated from calendar.**

1. **Meeting Context**
   "What's this meeting for? (e.g., project kickoff, status check, decision-making, brainstorm)"

2. **Attendees** (skip if known)
   "Who's attending and what are their roles?"

3. **Topics**
   "What topics need to be covered? List them in order of priority."

4. **Outcomes**
   "What decisions or outcomes do you need from this meeting?"

5. **Time** (skip if known)
   "How long is the meeting? (helps with time allocation)"

6. **Prep Required**
   "Is there anything attendees should review beforehand?"

### Step 2: Generate Agenda

Based on the interview, create a structured agenda:

```
## [Meeting Title]

**Date:** [If known]
**Duration:** [X minutes]
**Attendees:** [Names]

### Pre-Meeting
- [Any prep work or materials to review]

### Agenda

| Time | Topic | Owner | Goal |
|------|-------|-------|------|
| 0:00 | Opening & context | [Host] | Align on purpose |
| 0:05 | [Topic 1] | [Owner] | [Specific outcome] |
| ... | ... | ... | ... |
| [End-5] | Action items & next steps | All | Clear owners & deadlines |

### Desired Outcomes
- [ ] [Outcome 1]
- [ ] [Outcome 2]

### Parking Lot
(For topics that arise but aren't agenda items)
```

### Step 3: Offer Follow-ups

After presenting the agenda, offer relevant next steps:

**If Calendar connected:**
- "Want me to add this agenda to the calendar event?"
- "Should I draft a pre-meeting email to attendees?"

**Always:**
- "Any adjustments to the timing or topics?"
- "Want me to remind you 15 minutes before with prep notes?"

---

## Time Allocation Guidelines

Use these defaults when allocating time:

| Meeting Length | Opening | Main Topics | Wrap-up |
|---------------|---------|-------------|---------|
| 30 min | 2 min | 23 min | 5 min |
| 60 min | 5 min | 45 min | 10 min |
| 90 min | 5 min | 70 min | 15 min |

For multiple topics, weight by priority:
- High priority: 40% of topic time
- Medium priority: 35% of topic time
- Low priority: 25% of topic time

---

## Agenda Best Practices

Built into the output:

1. **Every topic has an owner** — Someone responsible for leading it
2. **Every topic has a goal** — "Discuss X" is weak; "Decide X" is strong
3. **Time-boxed** — Prevents runaway discussions
4. **Outcomes are specific** — Checkboxes, not vague hopes
5. **Buffer exists** — Always end 5 min early for wrap-up

---

## Graceful Degradation

| Source Unavailable | How to Handle |
|--------------------|---------------|
| Calendar | Full interview flow (works fine, just more questions) |
| After creating agenda | Can't auto-add to calendar, but can copy/paste |

**This command works perfectly without any MCPs.** Calendar just speeds it up.

---

## Example Interaction

### With Calendar Connected

**User:** `/meeting-brief`

**Claude:**
```
Which meeting are you prepping for?

Today:
1. 9:00 AM - Design Review (Sarah, Jake) - 30 min
2. 11:30 AM - Client Call: Acme Corp - 60 min
3. 2:00 PM - 1:1 with Jake - 30 min

Or describe a different meeting.
```

**User:** "2 - the Acme call"

**Claude:** "Got it — the Acme Corp call at 11:30 (60 min). What topics need to be covered?"

**User:** "Project timeline, budget review, next phase kickoff"

**Claude:** "What decisions or outcomes do you need?"

**User:** "Approve timeline, confirm budget, get sign-off on phase 2"

**Claude generates:**

```
## Client Call: Acme Corp

**Duration:** 60 minutes
**Attendees:** [From calendar + you]

### Agenda

| Time | Topic | Owner | Goal |
|------|-------|-------|------|
| 0:00 | Opening | You | Set context, confirm goals |
| 0:05 | Project Timeline | You | Get approval on proposed timeline |
| 0:20 | Budget Review | You | Confirm budget alignment |
| 0:40 | Phase 2 Kickoff | You | Get sign-off to proceed |
| 0:50 | Questions & Next Steps | All | Clarify anything, assign actions |
| 0:55 | Buffer | All | Address overflow |

### Desired Outcomes
- [ ] Timeline approved
- [ ] Budget confirmed
- [ ] Phase 2 sign-off received

Want me to add this to the calendar event?
```

### Without Calendar

**User:** `/meeting-brief`

**Claude:** "What's this meeting for?"

[Full interview flow continues...]

---

*Version: 2.0*
