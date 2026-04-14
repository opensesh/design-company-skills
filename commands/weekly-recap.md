# /dcs:weekly-recap

**Legacy alias** for `/dcs:dashboard weekly`

## Trigger

User invokes `/dcs:weekly-recap` at the end of a week to review accomplishments and plan ahead.

---

## Behavior

This command is a backwards-compatible alias. It delegates to the unified dashboard command:

```
/dcs:weekly-recap  →  /dcs:dashboard weekly
```

### Execution

1. **Invoke** `/dcs:dashboard weekly`
2. **Return** the weekly dashboard output (all enabled pillars)

---

## Migration Notice

`/dcs:weekly-recap` continues to work for backwards compatibility, but the recommended command is now:

```bash
/dcs:dashboard weekly           # All pillars, weekly
/dcs:dashboard ops weekly       # Operations only, weekly
/dcs:dashboard design weekly    # Design only, weekly
```

See `/dcs:dashboard` for full documentation on pillar and timeframe options.

---

## Why This Alias Exists

- **Muscle memory** — Existing users know `/dcs:weekly-recap`
- **Documentation links** — Prevents broken references
- **Gradual migration** — Users can adopt new syntax at their own pace

---

*Version: 2.0 (alias wrapper)*
*Delegates to: /dcs:dashboard weekly*
