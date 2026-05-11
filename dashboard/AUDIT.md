# DESIGN-OPS Dashboard Audit & Remediation

**Status:** Remediation Complete
**Last Updated:** 2026-05-11
**Version:** 2.0 (Snapshot View)

---

## Executive Summary

The dashboard was audited and remediated to fix critical issues:

1. **6 of 7 services showed "not configured"** - Fixed by adding missing env vars to `~/.zshrc`
2. **Timeframe toggle was broken** - Removed entirely (snapshot view)
3. **Repo filter was misplaced** - Removed entirely (snapshot view)
4. **UI didn't match brand guidelines** - Applied Open Session brand colors

---

## Changes Made

### 1. Environment Variables (`~/.zshrc`)

Added missing exports to `load-design-ops-secrets()`:

```bash
# Previously missing - now added:
export GOOGLE_CLIENT_ID="$(op read 'op://DESIGN-OPS/Google OAuth/client_id' 2>/dev/null)"
export GOOGLE_REFRESH_TOKEN="$(op read 'op://DESIGN-OPS/Google OAuth/refresh_token' 2>/dev/null)"
export VERCEL_TOKEN="$(op read 'op://DESIGN-OPS/Vercel API Token/credential' 2>/dev/null)"
export FIGMA_ACCESS_TOKEN="$(op read 'op://DESIGN-OPS/Figma API Token/credential' 2>/dev/null)"
```

**Action Required:** Add these secrets to your 1Password DESIGN-OPS vault:
- `Vercel API Token` (credential field)
- `Figma API Token` (credential field)
- `Google OAuth` (add `client_id` and `refresh_token` fields)

### 2. UI Simplification

**Removed:**
- Timeframe toggle (Daily/Weekly/Quarterly)
- Global repo filter dropdown

**Rationale:** The dashboard is now a **snapshot view** showing current state:
- Today's calendar events
- Tasks due today
- Recent commits (last 24h)
- Open PRs
- Latest deployments
- Current metrics

This simplifies the UX and removes broken/misleading controls.

### 3. Brand Alignment

**Added:**
- ASCII logo header (DESIGN-OPS branding)
- Theme toggle (light/dark mode)
- Collapsible pillar sections

**Updated brand colors:**
- Aperol (`#FE5102`) - Primary brand accent
- Charcoal (`#191919`) - Dark backgrounds
- Vanilla (`#FFFAEE`) - Light text/surfaces
- Warm gray scale for neutral colors

### 4. Files Modified

| File | Changes |
|------|---------|
| `~/.zshrc` | Added 4 missing env var exports |
| `public/index.html` | Removed timeframe/filter, added ASCII logo, collapsible sections |
| `public/app.js` | Removed filter logic, simplified to snapshot view |
| `public/styles.css` | Applied Open Session brand colors |

---

## 1Password Secrets Required

For all services to work, ensure these secrets exist in your `DESIGN-OPS` vault:

| Secret Name | Fields Required | Service |
|-------------|-----------------|---------|
| `GitHub Token` | `credential` | GitHub commits, PRs |
| `Notion_API_Key` | `credential` | Tasks |
| `Google OAuth` | `client_id`, `client_secret`, `refresh_token` | Calendar, Email |
| `Vercel API Token` | `credential` | Deployments |
| `Dub.co API` | `credential` | Link analytics |
| `Meta Graph API` | `app ID`, `access token` | Instagram |
| `Figma API Token` | `credential` | Figma activity |

---

## Verification Checklist

After making changes, verify each service:

```bash
# 1. Load secrets
load-design-ops-secrets

# 2. Check all env vars are set
env | grep -E "GITHUB|NOTION|VERCEL|FIGMA|DUB|META|GOOGLE"

# Expected output should show all variables with values (not empty)

# 3. Start dashboard
cd ~/Documents/GitHub.nosync/DESIGN-OPS/dashboard
npm run dev

# 4. Test health endpoint
curl http://localhost:3847/api/health

# Expected: All services should show "configured": true

# 5. Visual check at http://localhost:3847
# - ASCII logo visible on desktop
# - Theme toggle works
# - Collapsible sections work
# - All 9 cards show data (not "not configured")
```

---

## Architecture Overview

```
dashboard/
├── src/
│   ├── index.ts           # Entry point (port 3847)
│   ├── server.ts          # Fastify server
│   ├── config.ts          # Reads ~/.claude/design-ops-config.yaml
│   ├── cache.ts           # 5-min TTL cache
│   ├── routes/
│   │   ├── api.ts         # API endpoints
│   │   └── static.ts      # Serves public/
│   └── services/
│       ├── github.ts      # GITHUB_PERSONAL_ACCESS_TOKEN
│       ├── notion.ts      # NOTION_API_KEY
│       ├── google.ts      # GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
│       ├── vercel.ts      # VERCEL_TOKEN
│       ├── dub.ts         # DUB_API_KEY
│       ├── instagram.ts   # META_ACCESS_TOKEN
│       └── figma.ts       # FIGMA_ACCESS_TOKEN
└── public/
    ├── index.html         # Dashboard UI
    ├── app.js             # Frontend logic
    └── styles.css         # Brand-aligned CSS
```

---

## Service Status Reference

| Service | Env Var | Loaded By |
|---------|---------|-----------|
| GitHub | `GITHUB_PERSONAL_ACCESS_TOKEN` | `load-design-ops-secrets` |
| Notion | `NOTION_API_KEY` | `load-design-ops-secrets` |
| Google Calendar | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | `load-design-ops-secrets` |
| Gmail | Same as Calendar | `load-design-ops-secrets` |
| Vercel | `VERCEL_TOKEN` | `load-design-ops-secrets` |
| Dub.co | `DUB_API_KEY` | `load-design-ops-secrets` |
| Instagram | `META_ACCESS_TOKEN` | `load-design-ops-secrets` |
| Figma | `FIGMA_ACCESS_TOKEN` | `load-design-ops-secrets` |

---

## Troubleshooting

### "Not configured" for a service

1. Run `load-design-ops-secrets` in terminal
2. Verify env var is set: `echo $VARIABLE_NAME`
3. If empty, check 1Password vault has the secret
4. Restart the dashboard server

### Services still not working after env vars are set

1. The server reads env vars at startup
2. After running `load-design-ops-secrets`, restart the server:
   ```bash
   # Kill existing server (Ctrl+C) then:
   npm run dev
   ```

### Google Calendar/Email not working

Google OAuth requires a valid refresh token. If expired:
1. Re-authenticate with Google
2. Get new refresh token
3. Update `Google OAuth` secret in 1Password
4. Run `load-design-ops-secrets` again

---

## Design Decisions

### Why Snapshot View?

The original timeframe toggle (Daily/Weekly/Quarterly) had issues:
- Only affected GitHub commits, not other services
- Created confusion about what data was being filtered
- Required backend support that wasn't implemented

A snapshot view is simpler and more useful for a status dashboard.

### Why Remove Repo Filter?

The repo filter only affected GitHub data:
- Confusing when placed in global header
- Notion, Calendar, Email, Vercel, Dub, Instagram, Figma all ignored it
- Snapshot view shows all repos' recent activity

### Why Collapsible Sections?

- Matches existing DESIGN-OPS templates
- Allows users to focus on specific pillars
- Better mobile experience
- Reduces visual clutter

---

## Future Improvements

1. **Add per-pillar filters** - If filtering is needed, scope it to each pillar
2. **Add OAuth flow** - Built-in Google OAuth instead of manual refresh token
3. **Add notification badges** - Show counts in pillar headers
4. **Add keyboard shortcuts** - Quick navigation between pillars

---

*This document is maintained in the DESIGN-OPS repository for future reference.*
