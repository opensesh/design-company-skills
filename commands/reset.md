# /design-ops:reset

Reset DESIGN-OPS configuration to start fresh.

## Trigger

User runs `/design-ops:reset` to clear configuration and start over.

---

## Purpose

Use this command when:
- Configuration is corrupted or causing issues
- Want to reconfigure from scratch
- Testing setup flow changes
- Discovery cache is stale and needs refresh

---

## Flow

### Step 1: Confirm Intent

```markdown
## Reset DESIGN-OPS Configuration

This will:
• Back up your current config to ~/.claude/design-ops-config.yaml.backup.{timestamp}
• Remove the current configuration file
• Clear any cached discovery data

Your MCP servers will NOT be affected — only the DESIGN-OPS config.

Are you sure you want to reset?

[Yes, reset configuration] [Cancel]
```

### Step 2: Backup Existing Config

If config exists, create timestamped backup:

```bash
if [ -f ~/.claude/design-ops-config.yaml ]; then
  cp ~/.claude/design-ops-config.yaml \
     ~/.claude/design-ops-config.yaml.backup.$(date +%Y%m%d%H%M%S)
fi
```

### Step 3: Remove Config

```bash
rm -f ~/.claude/design-ops-config.yaml
```

### Step 4: Confirm Success

```markdown
## ✓ Configuration Reset

Your DESIGN-OPS configuration has been cleared.

**Backup created:** ~/.claude/design-ops-config.yaml.backup.{timestamp}

**Next steps:**
• Run `/design-ops:setup` to reconfigure
• Or restore your backup if this was a mistake

To restore backup:
```bash
cp ~/.claude/design-ops-config.yaml.backup.{timestamp} \
   ~/.claude/design-ops-config.yaml
```
```

---

## Options

### --no-backup

Skip backup creation (not recommended):

```bash
/design-ops:reset --no-backup
```

### --force

Skip confirmation prompt:

```bash
/design-ops:reset --force
```

---

## Error Handling

### No Config Found

```markdown
No configuration found at ~/.claude/design-ops-config.yaml

Nothing to reset. Run `/design-ops:setup` to create a new configuration.
```

### Backup Failed

```markdown
Could not create backup. Check permissions for ~/.claude/

To reset anyway (without backup):
/design-ops:reset --no-backup

Or fix permissions and try again.
```

---

## Manual Reset Script

For immediate use in terminal:

```bash
# Backup and remove DESIGN-OPS config
if [ -f ~/.claude/design-ops-config.yaml ]; then
  cp ~/.claude/design-ops-config.yaml \
     ~/.claude/design-ops-config.yaml.backup.$(date +%Y%m%d%H%M%S)
  rm ~/.claude/design-ops-config.yaml
  echo "Config reset. Backup created. Run /design-ops:setup to reconfigure."
else
  echo "No config found at ~/.claude/design-ops-config.yaml"
fi
```

---

## Related Commands

- `/design-ops:setup` — Reconfigure after reset
- `/design-ops:status` — Check current configuration
- `/design-ops:configure` — Modify specific settings without full reset

---

*Version: 1.0*
