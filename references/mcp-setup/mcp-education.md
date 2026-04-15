# What is MCP?

A plain-language explanation for non-technical users.

---

## The Simple Version

**MCP (Model Context Protocol)** lets Claude connect to your other tools — like Calendar, Notion, or GitHub.

Think of it like giving Claude permission to look at (and sometimes update) the apps you already use.

---

## Understanding Connection Status

When DESIGN-OPS evaluates your tools, you'll see one of these statuses:

| Status | Symbol | What It Means |
|--------|--------|---------------|
| **Connected** | ✓ | Working and ready to use |
| **Connected (API recommended)** | ✓+ | MCP works, but API unlocks more data |
| **Available** | ⚠ | MCP installed but needs authentication |
| **Not installed** | ○ | MCP needs to be added first |
| **Unavailable** | ✗ | No MCP exists for this tool |

### "Available but not connected" — What does this mean?

This means:
- The MCP server is registered in your Claude settings ✓
- But it hasn't authenticated yet or isn't running ✗

**Why this matters:**
MCPs need to complete authentication on first use. Until then, Claude can't access the service's data.

**To connect:**
1. Ask Claude to access the tool (e.g., "List my Notion pages")
2. Complete any OAuth flow that appears
3. Try again — it should work now

---

## What Changes When You Connect an MCP

| Without MCP | With MCP |
|-------------|----------|
| "What meetings do I have today?" → Claude asks you to tell it | Claude checks your calendar directly |
| "What tasks are due?" → You copy-paste from Notion | Claude searches your Notion workspace |
| "What PRs need review?" → You list them manually | Claude checks GitHub for you |

**Bottom line:** Less copy-pasting, more automation.

---

## Is It Safe?

Yes, with reasonable precautions:

1. **You control access** — Each MCP requires explicit setup and authorization
2. **Read vs. write** — Many MCPs are read-only; you choose what Claude can modify
3. **Scoped permissions** — MCPs access specific tools, not your whole computer
4. **Revocable** — Remove an MCP anytime with `claude mcp remove [name]`

**What Claude can't do:**
- Access tools you haven't explicitly connected
- Share your data elsewhere
- Make changes without your commands triggering them

---

## Common MCPs and What They Enable

| MCP | What Claude Can Do |
|-----|-------------------|
| **Google Calendar** | See your schedule, help prep for meetings |
| **Notion** | Search your workspace, find tasks and docs |
| **GitHub** | Search code, review PRs, check issues |
| **Gmail** | Summarize emails, draft replies |
| **Supabase** | Query your database, check user data |
| **Firecrawl** | Deep-analyze any website |

---

## How to Think About It

MCPs are like browser extensions for Claude:
- They extend what Claude can do
- You install only what you need
- They work in the background
- You can remove them anytime

---

## MCP vs API — The Full Picture

### What's the relationship?

An MCP server is a **wrapper around an API** designed specifically for AI assistants like Claude. Think of it as a translator that makes APIs "speak Claude's language."

```
┌─────────────────────────────────────────────────────────────────────┐
│  Your Tool (Notion, GitHub, etc.)                                   │
│       ↓                                                             │
│  Raw API — Full access to everything the tool offers                │
│       ↓                                                             │
│  MCP Server — Simplified subset optimized for AI conversations      │
│       ↓                                                             │
│  Claude — Uses MCP to access your tools                             │
└─────────────────────────────────────────────────────────────────────┘
```

### The Trade-off

| Aspect | MCP | Raw API |
|--------|-----|---------|
| **Setup** | Easier (one command) | Requires tokens, config |
| **Basic tasks** | Great | Also works |
| **Advanced queries** | Limited | Full access |
| **Batch operations** | Usually not | Yes |
| **Activity history** | Rarely | Usually yes |

### Example: Notion

| Capability | Notion MCP | Notion API |
|------------|------------|------------|
| Search pages | ✓ | ✓ |
| Read page content | ✓ | ✓ |
| Create/edit pages | ✓ | ✓ |
| Query databases | Limited | ✓ Full |
| Batch operations | ✗ | ✓ |
| Activity history | ✗ | ✓ |
| User analytics | ✗ | ✓ |

### Example: GitHub

| Capability | GitHub MCP | GitHub API |
|------------|------------|------------|
| Search repos/code | ✓ | ✓ |
| Read files | ✓ | ✓ |
| Create PRs/issues | ✓ | ✓ |
| Org-wide analytics | Limited | ✓ |
| Webhook management | ✗ | ✓ |
| Action workflows | ✗ | ✓ |

### Example: Figma

| Capability | Figma MCP | Figma API |
|------------|-----------|-----------|
| Code generation | ✓ (primary use) | ✓ |
| File metadata | Limited | ✓ |
| Version history | ✗ | ✓ |
| Team activity | ✗ | ✓ |
| Comments | ✗ | ✓ |
| Export assets | Limited | ✓ |

### What DESIGN-OPS Does

For tools where the MCP is limited, DESIGN-OPS can:

1. **Help you set up direct API access** for richer reporting
2. **Create a custom MCP wrapper** that exposes more capabilities
3. **Use both together** — MCP for quick tasks, API for dashboards

### The Bottom Line

**Start with the MCP.** It's easier to set up and works great for basic tasks.

If you want deeper analytics or find it limiting, we'll help you add API access for specific features. You're never blocked — MCP-only is always valid.

---

## Do I Need MCPs?

**No.** Every command in Company Skills works without MCPs — they just work better with them.

| Scenario | Experience |
|----------|------------|
| No MCPs | Claude asks for information, you provide it |
| Some MCPs | Partially automated, Claude fetches what it can |
| All recommended MCPs | Fully automated workflows |

Start simple. Add MCPs when you feel the friction.

---

## Getting Started

Ready to connect something? See:
- [Recommended MCPs](recommended-mcps.md) — Our curated starter list
- [How to Add Any MCP](add-mcp-guide.md) — Step-by-step setup guide

Or run `/add-tool` in Claude Code for guided setup.

---

## Quick Reference

**See what's connected:**
```bash
claude mcp list
```

**Add a new MCP:**
```bash
claude mcp add [name] -- [command]
```

**Remove an MCP:**
```bash
claude mcp remove [name]
```

---

*Still have questions? The Claude Code docs have more detail: https://docs.anthropic.com/claude-code*
