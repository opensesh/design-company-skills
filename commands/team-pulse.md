# /team-pulse

Unified dashboard showing recent activity from your design and development teams across Figma and GitHub.

## Trigger

User invokes `/team-pulse` to see who's working on what.

---

## Prerequisites

- Config file at `~/.claude/team-pulse-config.yaml`
- GitHub MCP connected (for dev activity)
- Valid Figma API token in config (for design activity)

---

## Workflow

### Step 1: Load Configuration

1. **Read** `~/.claude/team-pulse-config.yaml`
2. **If not found:**
   ```
   Team Pulse isn't configured yet.

   Run /team-pulse-setup to connect your Figma and GitHub accounts.
   ```
3. **Parse** config and validate required fields

---

### Step 2: Gather Figma Activity

For each tracked file (from `tracked_files` or fetched from `tracked_projects`):

#### 2a: Get Project Files (if tracking projects)

For each project in `tracked_projects`:

```bash
curl -s -H "Authorization: Bearer {token}" \
  "https://api.figma.com/v1/projects/{project_id}/files"
```

Returns list of files with `key`, `name`, `last_modified`.

#### 2b: Get File Metadata

For each file (from projects or direct `tracked_files`):

```bash
curl -s -H "Authorization: Bearer {token}" \
  "https://api.figma.com/v1/files/{file_key}/meta"
```

Extract:
- `last_touched_at` — When file was last edited
- `last_touched_by` — User object (id, handle)
- `name` — File name

#### 2c: Get Version History (if `show_versions` enabled)

```bash
curl -s -H "Authorization: Bearer {token}" \
  "https://api.figma.com/v1/files/{file_key}/versions"
```

Extract recent named versions:
- `created_at` — When version was created
- `user` — Who created it (id, handle)
- `label` — Version name

**Filter** to versions within `activity_window_hours`.

---

### Step 3: Gather GitHub Activity

Using the GitHub MCP tools:

#### 3a: Get Recent Commits (if `show_commits` enabled)

For each repo in `tracked_repos`:

```
mcp__github__list_commits(owner, repo, per_page: 10)
```

Extract:
- `commit.message` — Commit message (first line)
- `commit.author.name` — Author name
- `commit.author.date` — When committed
- `sha` — Short SHA (first 7 chars)

**Filter** to commits within `activity_window_hours`.

#### 3b: Get Open PRs (if `show_prs` enabled)

For each repo in `tracked_repos`:

```
mcp__github__list_pull_requests(owner, repo, state: "open")
```

Extract:
- `title` — PR title
- `user.login` — Author
- `created_at` — When opened
- `html_url` — Link to PR

---

### Step 4: Map Team Members

If `team.members` is configured:

1. **Match** Figma handles to friendly names
2. **Match** GitHub usernames to friendly names
3. **Use** friendly names in output

If not configured, use raw handles/usernames.

---

### Step 5: Compute Summary Stats

Count activity by person:
- Files touched in Figma
- Commits pushed to GitHub
- PRs opened

Identify:
- Most active files
- Who's working on what

---

### Step 6: Render Output

```markdown
## Team Pulse — {Day}, {Month} {Date}

### Design (Figma)

**Active files** (last {N} hours)
- **{File Name}** — {Person}, {time ago}
- **{File Name}** — {Person}, {time ago}
- **{File Name}** — No recent activity

**Recent versions**
- {Person}: "{Version Label}" on {File Name} ({time ago})

---

### Development (GitHub)

**Recent commits**
- **{repo}** — {Person}: "{commit message}" ({time ago})
- **{repo}** — {Person}: "{commit message}" ({time ago})

**Open PRs**
- {Person}: "{PR title}" → {repo} ({status})

---

### Team Snapshot

| Person | Design | Code |
|--------|--------|------|
| {Name} | {N} files | {N} commits |
| {Name} | — | {N} commits |
| {Name} | {N} files | — |
```

---

## Adaptive Behavior

### If Figma only configured:
Show design activity, skip GitHub section.

### If GitHub only configured:
Show dev activity, skip Figma section.

### If no activity found:
```
No activity in the last {N} hours.

Your team might be in deep work mode, or check that the right projects/repos are tracked.
```

### If API errors:
```
Couldn't reach Figma API — check your token in ~/.claude/team-pulse-config.yaml
```

Continue with other sources if possible.

---

## Time Formatting

| Time Delta | Display |
|------------|---------|
| < 1 hour | "X minutes ago" |
| 1-24 hours | "X hours ago" |
| 1-7 days | "X days ago" |
| > 7 days | "Mon, Apr 7" |

---

## Output Style

- Scannable, not verbose
- Bold file/repo names and people
- Use relative times ("2h ago" not timestamps)
- Group by platform, then by recency
- No fluff — data only

---

## Example Output

```markdown
## Team Pulse — Monday, April 14

### Design (Figma)

**Active files**
- **Homepage Redesign** — Sarah, 2h ago
- **Mobile Onboarding** — Sarah, 5h ago
- **Brand Guidelines** — No recent activity

**Recent versions**
- Sarah: "Final hero layout" on Homepage Redesign (3h ago)

---

### Development (GitHub)

**Recent commits**
- **webapp** — Jake: "fix: auth redirect loop" (1h ago)
- **webapp** — Jake: "feat: add logout button" (3h ago)
- **design-system** — Sarah: "update brand tokens" (yesterday)

**Open PRs**
- Jake: "Auth improvements" → webapp (ready for review)

---

### Team Snapshot

| Person | Design | Code |
|--------|--------|------|
| Sarah  | 2 files | 1 commit |
| Jake   | —      | 2 commits, 1 PR |
```

---

## Follow-up Actions

After displaying the dashboard, offer:

- "Want me to dig into any of these files or PRs?"
- "Should I update the tracking config?"

---

*Version: 1.0*
