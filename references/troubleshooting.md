# Troubleshooting

Common issues and how to fix them.

---

## Commands don't appear after installation

### In Claude Desktop

1. Close and reopen Claude Desktop completely
2. Or type `/reload-plugins` in the Code tab

### In Terminal

1. Exit Claude Code by typing `exit`
2. Restart Claude: `claude`
3. Verify the plugin is loaded:
   ```bash
   claude plugin list
   ```
   You should see `company-skills` in the list.

---

## Plugin not found error

### Check the folder exists

**Mac:**
```bash
ls ~/company-skills
```

**Windows:**
```powershell
dir %USERPROFILE%\company-skills
```

If the folder doesn't exist, re-download or re-clone:

**Download method:**
1. Download: [company-skills ZIP](https://github.com/opensesh/company-skills/archive/refs/heads/main.zip)
2. Extract to a memorable location (e.g., `Documents/company-skills`)

**Git method:**
```bash
# Mac/Linux
git clone https://github.com/opensesh/company-skills.git ~/company-skills

# Windows
git clone https://github.com/opensesh/company-skills.git %USERPROFILE%\company-skills
```

### Re-add the plugin

**Mac/Linux:**
```bash
claude plugin add ~/company-skills
```

**Windows:**
```powershell
claude plugin add %USERPROFILE%\company-skills
```

---

## Config file issues

### Config not being saved

Check if the `.claude` directory exists:

**Mac/Linux:**
```bash
ls ~/.claude
```

If it doesn't exist, create it:
```bash
mkdir -p ~/.claude
```

**Windows:**
```powershell
dir %USERPROFILE%\.claude
```

If it doesn't exist:
```powershell
mkdir %USERPROFILE%\.claude
```

### Config looks wrong

The config lives at `~/.claude/skills-config.yaml`. You can:

1. View it:
   ```bash
   cat ~/.claude/skills-config.yaml
   ```

2. Reset it by running `/install-skills` again and choosing "Start fresh"

---

## Tool connectors not working

### In Claude Desktop

1. Click the **+** button next to the prompt box
2. Select **Connectors**
3. Verify the connector shows as "Connected"
4. If not connected, click it to authorize

### Check MCP status

In the Code tab, Claude can detect which MCPs are configured. Run:
```
What MCPs do I have connected?
```

Claude will list what's available and what's missing.

### Re-authorize a connector

1. Click **+** → **Connectors**
2. Click the connector you want to fix
3. Follow the authorization flow again

---

## Specific command issues

### /daily-brief shows nothing

This command works at any integration level:
- **With Calendar connected:** Shows your meetings automatically
- **Without Calendar:** Just tell Claude what's on your schedule

If connected but nothing shows, check your connector authorization (see above).

### /add-tool isn't working

The `/add-tool` command guides you through MCP setup. If it's failing:
1. Make sure you're in the **Code tab** (not Cowork)
2. Try running it with a specific tool: `/add-tool google-calendar`
3. Check the detailed guides in [`mcp-setup/`](mcp-setup/)

---

## Permission errors

### Can't write to ~/.claude

**Mac/Linux:**
```bash
chmod 755 ~/.claude
```

**Windows:** Run PowerShell as Administrator and check folder permissions.

### Plugin folder is read-only

If you downloaded the ZIP, some systems mark extracted files as read-only. Fix with:

**Mac/Linux:**
```bash
chmod -R 755 ~/company-skills
```

---

## Still stuck?

1. **Check the [GitHub Issues](https://github.com/opensesh/company-skills/issues)** — your problem might already be solved
2. **Open a new issue** with:
   - What you tried
   - What happened
   - Your OS (Mac, Windows, Linux)
   - How you installed (Desktop or Terminal)
