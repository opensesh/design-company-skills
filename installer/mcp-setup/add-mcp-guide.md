# How to Add Any MCP

Step-by-step guide for connecting MCP servers to Claude Code.

---

## The Basics

There are two main types of MCP connections:

| Type | Auth Method | Example |
|------|-------------|---------|
| **OAuth-based** | Browser login | Google Calendar, Gmail |
| **API key-based** | Environment variable | Notion, Firecrawl, OpenAI |

---

## OAuth-Based MCPs (Browser Auth)

These open a browser window for authentication.

### General Pattern

```bash
claude mcp add --transport http [name] "[url]" --scope user
```

### Examples

**Google Calendar:**
```bash
claude mcp add google-calendar -- npx -y @anthropic/mcp-google-calendar
```

**Gmail:**
```bash
claude mcp add gmail -- npx -y @anthropic/mcp-gmail
```

**Google Drive:**
```bash
claude mcp add google-drive -- npx -y @anthropic/mcp-google-drive
```

### What Happens

1. Command runs
2. Browser opens for login
3. You authorize Claude's access
4. MCP becomes available

---

## API Key-Based MCPs

These require you to get an API key from the service and set it as an environment variable.

### General Pattern

```bash
# Step 1: Set the API key
export [KEY_NAME]="your-key-here"

# Step 2: Add the MCP
claude mcp add [name] -- npx -y [package-name]
```

### Examples

**Notion:**
```bash
# Get key from: https://www.notion.so/my-integrations
export NOTION_API_KEY="secret_abc123..."
claude mcp add notion -- npx -y @anthropic/mcp-notion
```

**Firecrawl:**
```bash
# Get key from: https://firecrawl.dev
export FIRECRAWL_API_KEY="fc-abc123..."
claude mcp add firecrawl -- npx -y firecrawl-mcp
```

**Supabase:**
```bash
# Get from your project settings
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"
claude mcp add supabase -- npx -y @anthropic/mcp-supabase
```

### Making Keys Persist

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# MCP API Keys
export NOTION_API_KEY="your-key"
export FIRECRAWL_API_KEY="your-key"
```

Then reload: `source ~/.zshrc`

---

## Managing MCPs

### List Connected MCPs

```bash
claude mcp list
```

### Remove an MCP

```bash
claude mcp remove [name]
```

### Check MCP Status

In Claude Code, ask:
```
What MCP servers are connected?
```

---

## Adding Custom MCPs

For MCPs not in the official registry:

### From npm

```bash
claude mcp add [name] -- npx -y [npm-package-name]
```

### From Local Path

```bash
claude mcp add [name] -- node /path/to/your/mcp-server.js
```

### From Docker

```bash
claude mcp add [name] -- docker run [image-name]
```

---

## Common Patterns by Service

### Productivity Tools

| Service | Command |
|---------|---------|
| Google Calendar | `claude mcp add google-calendar -- npx -y @anthropic/mcp-google-calendar` |
| Notion | `export NOTION_API_KEY="..." && claude mcp add notion -- npx -y @anthropic/mcp-notion` |
| Linear | `export LINEAR_API_KEY="..." && claude mcp add linear -- npx -y @anthropic/mcp-linear` |

### Development Tools

| Service | Command |
|---------|---------|
| GitHub | `claude mcp add github -- npx -y @anthropic/mcp-github` |
| Supabase | `export SUPABASE_URL="..." SUPABASE_KEY="..." && claude mcp add supabase -- npx -y @anthropic/mcp-supabase` |

### Research Tools

| Service | Command |
|---------|---------|
| Firecrawl | `export FIRECRAWL_API_KEY="..." && claude mcp add firecrawl -- npx -y firecrawl-mcp` |

---

## After Adding an MCP

### Verify It Works

Ask Claude something that uses the MCP:

```
"What's on my calendar today?" (for Calendar)
"Search my Notion for project notes" (for Notion)
"What PRs need review?" (for GitHub)
```

### Update Your Config

The `/install-skills` command will detect new MCPs. Run it again or use `/add-tool` to update your `skills-config.yaml`.

---

## Troubleshooting

### "Command not found" or npm errors

Make sure Node.js is installed:
```bash
node --version  # Should show v18+
npm --version   # Should show 8+
```

### Authentication Failures

**OAuth:**
- Make sure browser can open
- Check you're logged into the right account
- Try removing and re-adding the MCP

**API Keys:**
- Verify the key is correct (no extra spaces)
- Check the key has required permissions/scopes
- Make sure env var is exported (not just set)

### MCP Not Responding

1. Remove it: `claude mcp remove [name]`
2. Restart Claude Code
3. Re-add it

### Rate Limits

Some services rate-limit API calls. If you see rate limit errors:
- Wait a few minutes
- Check your plan limits on the service
- Consider caching strategies for heavy use

---

## Security Notes

1. **API keys are sensitive** — don't commit them to repos
2. **Use `.env` files** — keep keys out of shell history
3. **Scope narrowly** — only grant permissions Claude needs
4. **Review periodically** — remove MCPs you're not using

---

## Need Help?

- Run `/add-tool` in Claude Code for guided setup
- Check MCP docs: https://docs.anthropic.com/claude-code/mcp
- Community MCPs: https://github.com/topics/mcp-server

---

*Version: 1.0*
