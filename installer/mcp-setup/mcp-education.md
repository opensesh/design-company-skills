# What is MCP?

A plain-language explanation for non-technical users.

---

## The Simple Version

**MCP (Model Context Protocol)** lets Claude connect to your other tools — like Calendar, Notion, or GitHub.

Think of it like giving Claude permission to look at (and sometimes update) the apps you already use.

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
