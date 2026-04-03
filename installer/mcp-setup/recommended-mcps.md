# Recommended MCPs

A curated starter list — install what fits your workflow.

---

## The Essentials

These four cover most daily workflows:

### 1. Google Calendar

**What it enables:**
- `/daily-brief` pulls your meetings automatically
- See your day at a glance
- Identify schedule conflicts

**Setup:**
```bash
claude mcp add google-calendar -- npx -y @anthropic/mcp-google-calendar
```

Then authenticate via browser when prompted.

---

### 2. Notion

**What it enables:**
- Search your workspace from Claude
- Pull tasks for daily briefs
- Find notes and docs quickly

**Setup:**
```bash
# Get your Notion API key from: https://www.notion.so/my-integrations
export NOTION_API_KEY="your-key-here"
claude mcp add notion -- npx -y @anthropic/mcp-notion
```

---

### 3. GitHub

**What it enables:**
- Search code across repos
- Check PR status
- Review issues and discussions

**Setup:**
```bash
# Uses your existing GitHub CLI auth, or set a token
claude mcp add github -- npx -y @anthropic/mcp-github
```

---

### 4. Firecrawl

**What it enables:**
- Deep website analysis with `/site-analysis`
- Scrape and understand any webpage
- Research competitors

**Setup:**
```bash
# Get API key from: https://firecrawl.dev
export FIRECRAWL_API_KEY="your-key-here"
claude mcp add firecrawl -- npx -y firecrawl-mcp
```

---

## Nice to Have

Add these based on your specific needs:

### Gmail

**What it enables:**
- Email summaries in daily briefs
- Draft replies based on context
- Search your inbox

**Setup:**
```bash
claude mcp add gmail -- npx -y @anthropic/mcp-gmail
```

---

### Supabase

**What it enables:**
- Query your database
- Check user metrics
- Debug data issues

**Setup:**
```bash
claude mcp add supabase -- npx -y @anthropic/mcp-supabase
```

---

### Linear / Jira / Asana

**What it enables:**
- Pull tasks and issues
- Track project progress
- Integrate with daily briefs

**Setup varies by tool** — check their MCP documentation.

---

## Installation Priority

**If you're just starting, install in this order:**

1. **Google Calendar** — immediate value for daily briefs
2. **GitHub** (if you code) — code search is invaluable
3. **Notion** (if you use it) — task and doc integration
4. **Firecrawl** — for research and analysis tasks

**Don't install everything at once.** Add MCPs as you feel friction.

---

## After Installing

When you connect an MCP, here's what changes:

```
✅ Google Calendar connected!

What you can now do:
• /daily-brief will show your meetings automatically
• Ask "What meetings do I have this week?"
• "Prep me for my 2pm call"

The Calendar MCP is read-only — Claude can see events but not modify them.
```

---

## Checking Your Setup

**See what's connected:**
```bash
claude mcp list
```

**Test a connection:**
```bash
# Just ask Claude something that uses the MCP
"What's on my calendar today?"
```

---

## Troubleshooting

**MCP not responding:**
1. Check if the service requires authentication
2. Verify API keys are set correctly
3. Try removing and re-adding: `claude mcp remove [name]` then add again

**"MCP not found" error:**
- Make sure you ran the add command correctly
- Check that npx can access the package
- Some MCPs require Node.js installed

**Permission denied:**
- Re-authenticate with the service
- Check that API keys have correct scopes

---

## More MCPs

The MCP ecosystem is growing. For the full list:
- https://github.com/anthropics/mcp-servers
- Community MCPs: https://github.com/topics/mcp-server

Or run `/add-tool` for guided setup of any MCP.

---

*Version: 1.0*
