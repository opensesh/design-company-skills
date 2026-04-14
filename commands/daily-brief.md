# /dcs:daily-brief

**Legacy alias** for `/dcs:dashboard daily`

## Trigger

User invokes `/dcs:daily-brief` to start their day with a consolidated view.

---

## Behavior

This command is a backwards-compatible alias. It delegates to the unified dashboard command:

```
/dcs:daily-brief  →  /dcs:dashboard daily
```

### Execution

1. **Invoke** `/dcs:dashboard daily`
2. **Return** the daily dashboard output (all enabled pillars)

---

## Migration Notice

`/dcs:daily-brief` continues to work for backwards compatibility, but the recommended command is now:

```bash
/dcs:dashboard              # All pillars, daily (default)
/dcs:dashboard daily        # Explicit daily timeframe
/dcs:dashboard ops daily    # Operations only, daily
```

See `/dcs:dashboard` for full documentation on pillar and timeframe options.

---

## Why This Alias Exists

- **Muscle memory** — Existing users know `/dcs:daily-brief`
- **Documentation links** — Prevents broken references
- **Gradual migration** — Users can adopt new syntax at their own pace

---

*Version: 2.0 (alias wrapper)*
*Delegates to: /dcs:dashboard daily*
