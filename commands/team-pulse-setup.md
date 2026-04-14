# /team-pulse-setup

Guided configuration for the Team Pulse dashboard. Walks users through connecting Figma and GitHub for activity tracking.

## Trigger

User invokes `/team-pulse-setup` to configure or update their Team Pulse integration.

---

## Workflow

### Step 1: Check Existing Config

1. **Read** `~/.claude/team-pulse-config.yaml` if it exists
2. **Determine mode:**
   - No config exists → Full setup flow
   - Config exists → Offer to update specific sections

If updating, ask:
> "You have an existing Team Pulse config. What would you like to update?"
> - Figma settings
> - GitHub repos
> - Team members
> - Start fresh

---

### Step 2: Check GitHub MCP

1. **Verify** GitHub MCP is available by checking for `mcp__github__*` tools
2. **If not connected:**
   ```
   GitHub MCP is not connected. Team Pulse uses it for development activity.

   Run this command to add it:
   claude mcp add github

   Then run /team-pulse-setup again.
   ```
3. **If connected:** Proceed to GitHub repo selection

---

### Step 3: Configure GitHub Repos

Ask the user:
> "Which repositories should I track for development activity?"
>
> Enter as `owner/repo`, comma-separated:
> Example: `open-session/webapp, open-session/design-system`

Parse the input and validate format. Store as:
```yaml
github:
  tracked_repos:
    - owner: "open-session"
      repo: "webapp"
    - owner: "open-session"
      repo: "design-system"
```

---

### Step 4: Configure Figma

#### 4a: Get API Token

```
## Figma Setup

Team Pulse uses the Figma REST API to track design activity.

**Get your API token:**
1. Go to figma.com → Click your profile → Settings
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Name it "Team Pulse" and copy the token

Paste your Figma API token:
```

**Validate the token** by making a test request:
```bash
curl -s -H "Authorization: Bearer {token}" https://api.figma.com/v1/me
```

- If valid: Shows user info, proceed
- If invalid: "That token didn't work. Please check it and try again."

#### 4b: Choose What to Track

Ask:
> "How would you like to track Figma activity?"
> 1. **By project** — Track all files in specific projects
> 2. **By file** — Track specific files directly
> 3. **Both** — Mix of projects and individual files

**If tracking projects:**
> "Enter your Figma project IDs (comma-separated)."
>
> To find a project ID:
> 1. Open the project in Figma
> 2. Look at the URL: `figma.com/files/project/123456789/...`
> 3. The ID is `123456789`
>
> You can also provide a name after a colon:
> `123456789:Brand Work, 987654321:Product Design`

**If tracking files:**
> "Enter your Figma file keys (comma-separated)."
>
> To find a file key:
> 1. Open the file in Figma
> 2. Look at the URL: `figma.com/design/ABC123xyz/...`
> 3. The key is `ABC123xyz`
>
> You can also provide a name after a colon:
> `ABC123xyz:Homepage, DEF456abc:Mobile App`

---

### Step 5: Configure Team (Optional)

Ask:
> "Would you like to map team member names? This makes the output cleaner."
>
> (You can skip this and add it later)

**If yes:**
> "Enter team members, one per line:"
> `Name | Figma Handle | GitHub Username`
>
> Example:
> ```
> Sarah | Sarah Chen | sarahc
> Jake | | jakedev
> ```
> (Leave a field blank if not applicable)

---

### Step 6: Set Preferences

Ask:
> "How far back should I look for activity? (default: 24 hours)"

> "What should I include in the dashboard?"
> - [x] Recent commits
> - [x] Open pull requests
> - [x] Figma named versions

---

### Step 7: Write Config

1. **Construct** the full YAML config from gathered inputs
2. **Write** to `~/.claude/team-pulse-config.yaml`
3. **Confirm** with summary:

```
## Team Pulse configured!

**Tracking:**
- 2 GitHub repos (open-session/webapp, open-session/design-system)
- 1 Figma project (Brand Work)
- 2 Figma files (Homepage, Mobile App)

**Team:** 2 members mapped

**Config saved to:** ~/.claude/team-pulse-config.yaml

Run /team-pulse to see your dashboard.
```

---

## Validation Rules

| Field | Validation |
|-------|------------|
| Figma token | Must start with `figd_` and pass API test |
| Project ID | Numeric string |
| File key | Alphanumeric string (11-22 chars typical) |
| GitHub repo | Must match `owner/repo` format |

---

## Error Handling

| Error | Response |
|-------|----------|
| Invalid Figma token | "That token didn't work. Make sure you copied the full token starting with `figd_`" |
| Invalid project ID | "Project ID should be numeric. Check the URL again." |
| GitHub MCP missing | Provide setup instructions, pause flow |
| Write permission denied | "Couldn't write to ~/.claude/. Check directory permissions." |

---

## Output Style

- Conversational but efficient
- Use code blocks for URLs and IDs
- Validate inputs before proceeding
- Allow going back to fix mistakes
- End with clear next steps

---

*Version: 1.0*
