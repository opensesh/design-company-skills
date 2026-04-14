---
name: design-system-quality
description: Use when reviewing UI/frontend code, conducting PR reviews for components, checking design system compliance, or after any UI component work.
version: 1.0.0
triggers:
  - code review
  - PR review
  - design system
  - token compliance
  - accessibility
  - component review
  - UI review
  - frontend review
  - quality check
---

# Design System Quality

Ensure code meets design system standards for consistency, accessibility, and brand compliance.

## Purpose

This skill provides quality gates for UI code reviews, ensuring all frontend work adheres to established design system patterns, accessibility standards, and component conventions.

## When to Activate

Use this skill when:
- Reviewing UI/frontend code
- Conducting PR reviews for components
- Checking design system compliance
- After any UI component work

---

## Quality Dimensions

### 1. Design Token Compliance

#### Color Usage

```
CORRECT                           WRONG
var(--bg-primary)                    bg-white
var(--fg-secondary)                  text-gray-500
var(--border-primary)                border-slate-200
bg-bg-primary (Tailwind mapped)      #191919 (hardcoded)
```

**Verification Command:**
```bash
# Find hardcoded colors (should return empty)
grep -rE "#[0-9A-Fa-f]{3,6}|rgb\(|rgba\(" --include="*.tsx" --include="*.css" | grep -v "var(--"

# Find forbidden Tailwind classes
grep -rE "bg-white|bg-black|text-white|text-black" --include="*.tsx"
```

#### Token Categories

| Category | Usage | Example |
|----------|-------|---------|
| Background | Surface colors | `var(--bg-primary)`, `var(--bg-secondary)` |
| Foreground | Text colors | `var(--fg-primary)`, `var(--fg-secondary)` |
| Border | Line/divider colors | `var(--border-primary)`, `var(--border-secondary)` |
| Brand | Accent/CTA colors | `var(--brand-primary)` |

### 2. Component Patterns

#### Accessible Component Libraries

All interactive elements should use accessible component libraries:

```tsx
// CORRECT - Using accessible components
import { Button, Input, Select } from 'react-aria-components';
// Or: Radix UI, Headless UI, etc.

// WRONG - Missing accessibility
<button onClick={...}>  // May miss keyboard/screen reader support
<input type="text" />   // May miss ARIA support
```

#### Card Pattern
```tsx
// Standard Card
<div className={cn(
  "bg-bg-secondary",
  "border border-border-secondary",
  "rounded-xl",
  "hover:bg-bg-secondary-hover",
  "hover:border-border-primary",
  "transition-colors duration-150"
)}>

// Wrong patterns
<div className="bg-white rounded-lg shadow">  // Hardcoded colors
<div className="bg-gray-100 border-2">        // Wrong tokens
```

#### Button Variants
```tsx
// Primary (brand color)
className="bg-brand-primary text-white hover:bg-brand-primary-hover"

// Secondary (transparent)
className="bg-transparent border border-border-primary hover:bg-bg-secondary"

// Tertiary (text only)
className="text-fg-secondary hover:text-fg-primary hover:underline"
```

### 3. Accessibility Standards

#### Focus Management
```tsx
// Focus visible and styled
className="focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"

// Skip link for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to content
</a>
```

#### Color Contrast
```
Minimum Requirements:
- Normal text: 4.5:1 ratio (AA)
- Large text: 3:1 ratio (AA)
- UI components: 3:1 ratio

Best Practice:
- Aim for AAA (7:1 for normal text)
- Test with contrast checkers
```

#### Screen Reader Support
```tsx
// Descriptive labels
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Live regions for dynamic content
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

### 4. Typography

#### Font Hierarchy
```css
/* Display/Headlines */
font-family: var(--font-display);

/* Body text */
font-family: var(--font-body);

/* Code/Monospace */
font-family: var(--font-mono);
```

#### Size Scale
- Use the established type scale
- Don't create arbitrary sizes
- Maintain visual hierarchy

### 5. Animation Standards

#### Timing Guidelines
```css
/* Micro-interactions: 150ms */
transition-duration: 150ms;

/* UI transitions: 200-300ms */
transition-duration: 200ms;

/* Page transitions: 300-500ms */
transition-duration: 300ms;
```

#### Performance Rules
```css
/* GPU-accelerated (prefer these) */
transform: translate(), scale(), rotate();
opacity;
filter;

/* Layout-triggering (avoid animating) */
width, height, padding, margin;
top, left, right, bottom;

/* Never do this */
transition: all 0.3s; /* Animates everything */
```

---

## Quality Checklist

Use this checklist for every code review:

```markdown
## Design System Quality Review

### Token Compliance
- [ ] All colors use CSS variables or mapped classes
- [ ] No hardcoded hex/rgb values
- [ ] Borders use semantic tokens
- [ ] Brand colors used appropriately (CTAs only)

### Components
- [ ] Interactive elements use accessible components
- [ ] Card patterns match standard
- [ ] Button variants are correct
- [ ] Focus states visible and styled

### Accessibility
- [ ] Color contrast meets AA minimum
- [ ] Focus management implemented
- [ ] ARIA labels present where needed
- [ ] Keyboard navigation works

### Typography
- [ ] Correct font families used
- [ ] Font sizes from scale
- [ ] Line heights appropriate

### Animation
- [ ] GPU-friendly properties only
- [ ] Timing follows guidelines
- [ ] No jarring transitions
```

---

## Issue Severity Levels

### Critical (Must Fix Before Merge)
- Hardcoded colors bypassing design system
- Missing accessibility on interactive elements
- Broken keyboard navigation
- Insufficient color contrast

### Important (Should Fix Before Merge)
- Missing focus states
- Incorrect component variant
- Wrong font family
- Animation timing off

### Minor (Track for Future)
- Suboptimal class ordering
- Could use more semantic token
- Animation could be smoother

---

## Automated Checks

### Pre-commit Hook Example
```bash
# Block hardcoded colors
if grep -rE "#[0-9A-Fa-f]{6}" --include="*.tsx" | grep -v "var(--"; then
  echo "ERROR: Hardcoded colors found. Use design tokens."
  exit 1
fi
```

### CI Quality Gate Example
```yaml
design-system-check:
  runs-on: ubuntu-latest
  steps:
    - name: Check Token Compliance
      run: |
        ! grep -rE "#[0-9A-Fa-f]{3,6}" --include="*.tsx" | grep -v "var(--"

    - name: Check Accessibility
      run: npx axe-core --include "src/**/*.tsx"
```

---

## Quick Reference Card

```
DESIGN SYSTEM QUALITY QUICK CHECK
────────────────────────────────────────────────────────────
Colors:     Use CSS variables or mapped classes
Borders:    border-border-secondary (containers)
Brand:      Brand color for CTAs/active ONLY
Components: Use accessible component libraries
Focus:      Visible ring on all interactive elements
Contrast:   Minimum 4.5:1 for text (AA)
────────────────────────────────────────────────────────────
NEVER: Hardcoded colors, missing focus states
ALWAYS: Design tokens, accessible components
```

---

## Related Skills

- frontend-design
- verification-before-completion
- brand-guidelines

---

*Version: 1.0.0*
