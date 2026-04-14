---
name: frontend-design
description: Use when building UI components, making design decisions for frontend work, reviewing UI implementation quality, or planning interaction patterns.
version: 1.0.0
triggers:
  - UI component
  - frontend
  - interface
  - design system
  - interaction pattern
  - animation
  - form design
  - accessibility
  - responsive design
  - component
  - layout
---

# Frontend Design

Create distinctive, production-grade frontend interfaces with intentional aesthetics.

## Purpose

This skill guides creation of frontend interfaces that feel genuinely designed—not auto-generated. It covers design thinking, interaction patterns, motion, forms, layout, accessibility, and performance.

## When to Activate

Use this skill when:
- Building UI components or pages
- Making design decisions for frontend work
- Reviewing UI implementation quality
- Planning interaction patterns

---

## 1. Design Thinking

Before writing any code, establish your **design intent**:

### Purpose & Context

_What problem are we solving? Who uses this?_
Think about the user's emotional state, their goals, and what success looks like.

### Aesthetic Direction

Choose a clear visual direction:

| Direction | Feel | When to Use |
|-----------|------|-------------|
| **Warm Minimal** | Clean, inviting, focused | Dashboard UIs, tools, productivity |
| **Editorial** | Magazine-like, typographic | Content-heavy pages, portfolios |
| **Soft/Organic** | Rounded, gentle, approachable | Consumer apps, onboarding |
| **Industrial/Raw** | Utilitarian, honest, functional | Developer tools, technical docs |
| **Luxury/Refined** | Spacious, elegant, deliberate | Brand sites, premium products |

**Key insight**: Bold maximalism and refined minimalism both work—the magic is in **commitment**, not intensity.

### The Memorable Detail

Ask yourself: _What's the one thing someone will remember about this interface?_
Maybe it's a delightful hover state, an unexpected color choice, or how perfectly the typography flows.

---

## 2. Design System Integration

### Color Philosophy

```css
/* Use semantic tokens, not arbitrary colors */
--bg-primary      /* Main background */
--bg-secondary    /* Elevated surfaces */
--fg-primary      /* Primary text */
--fg-secondary    /* Secondary text */
--border-primary  /* Interactive borders */
--border-secondary /* Container borders */
--brand-primary   /* Accent/CTA color */
```

### Typography Hierarchy

| Category | Usage |
|----------|-------|
| **Display** | Headlines, titles, hero text |
| **Body** | Paragraphs, inputs, tabs |
| **Small** | Labels, captions, hints, metadata |
| **Accent** | Special callouts, tech feel (use sparingly) |

### Border Philosophy

Borders should **support, not dominate**:

```jsx
// Default: nearly invisible
className="border border-border-secondary"

// Hover: slightly more visible
className="hover:border-border-primary"

// Focus: full visibility
className="focus:border-border-primary"
```

---

## 3. Interaction Patterns

### Hit Targets & Touch

| Context | Minimum Size | Notes |
|---------|--------------|-------|
| **Desktop** | 24×24px | Visual can be smaller if hit area is expanded |
| **Mobile** | 44×44px | Apple HIG standard |
| **Input font** | ≥16px | Prevents iOS Safari auto-zoom |

```jsx
// Expand hit target beyond visual bounds
<button className="p-2 -m-2">
  <Icon className="w-6 h-6" /> {/* Visual is 24px, hit area is 40px */}
</button>
```

### Focus Management

- Use `:focus-visible` over `:focus` to avoid focus rings on click
- Use `:focus-within` for grouped controls (e.g., input with icon)
- Every focusable element requires a visible focus state
- Implement focus traps in modals/drawers per WAI-ARIA patterns

### Loading States

| Timing | Value | Purpose |
|--------|-------|---------|
| **Show delay** | 150–300ms | Prevent flash on fast responses |
| **Minimum visible** | 300–500ms | Avoid jarring disappearance |

```jsx
// Don't: Show spinner immediately
{isLoading && <Spinner />}

// Do: Delay spinner appearance
const showSpinner = isLoading && loadingDuration > 200;
```

### Optimistic Updates

Update the UI immediately when success is likely:

1. Show change instantly
2. Send request to server
3. On success: confirm (subtle)
4. On failure: rollback + show error + offer retry

### Destructive Actions

| Pattern | When to Use |
|---------|-------------|
| **Confirmation dialog** | Permanent deletion, irreversible changes |
| **Undo with timeout** | Soft deletes, sends, publishes |
| **Type-to-confirm** | Account deletion, production deployments |

---

## 4. Motion & Animation

### When to Animate

Animate only when it serves a purpose:
- **Clarify cause/effect**: Show where something came from or went
- **Maintain context**: Help users track changes during transitions
- **Deliberate delight**: Reward interactions meaningfully

**Don't animate** for decoration or to fill silence.

### Easing Selection

| Property Changing | Recommended Easing |
|-------------------|-------------------|
| **Opacity only** | `linear` or gentle ease |
| **Size/Scale** | `easeOut` (fast start, slow end) |
| **Position** | `easeOut` or spring |
| **Enter** | `easeOut` |
| **Exit** | `easeIn` (slow start, fast end) |

### Performance Rules

**GPU-accelerated (prefer these):**
```css
transform: translate(), scale(), rotate();
opacity;
filter;
```

**Layout-triggering (avoid animating):**
```css
width, height, padding, margin;
top, left, right, bottom;
font-size, line-height;
```

**Anti-patterns:**
```css
/* Never: Animates everything including layout */
transition: all 0.3s;

/* Do: Explicit properties only */
transition: transform 0.3s, opacity 0.3s;
```

### Accessibility (prefers-reduced-motion)

Always honor the user's motion preference:

```jsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
```

---

## 5. Form Design

### Submission Behavior

| Input Type | Enter Key Behavior |
|------------|-------------------|
| Single text input | Submits form |
| Multiple inputs | Submits on last field |
| `<textarea>` | Creates new line |
| `<textarea>` + Cmd/Ctrl+Enter | Submits form |

### Validation Patterns

| Timing | What to Validate |
|--------|-----------------|
| **On blur** | Format, required fields |
| **On submit** | All validation, server errors |
| **Real-time** | Only for character limits or live search |

**Rules:**
- Show errors **adjacent to the field**, not in a summary
- On submit error, focus the first invalid field
- Don't pre-disable submit—let users discover issues

### Mobile Considerations

- Input font ≥16px prevents iOS auto-zoom
- Use correct `type` and `inputmode` for better keyboards:

| Data | type | inputmode |
|------|------|-----------|
| Email | `email` | — |
| Phone | `tel` | — |
| Number | `text` | `numeric` |
| Credit card | `text` | `numeric` |

---

## 6. Layout Principles

### Optical Alignment

Geometry lies. Adjust ±1–2px when perception beats math:
- Circles and triangles appear smaller than squares at same dimensions
- Text with descenders needs more bottom padding
- Icons may need nudging to appear centered

### Nested Border Radius

Child radius must be ≤ parent radius, and curves should be concentric:

```
Outer radius: 16px
Gap (padding): 8px
Inner radius: 16px - 8px = 8px
```

### Layered Shadows

Use ≥2 shadow layers to mimic real light (ambient + direct):

```css
box-shadow:
  0 1px 2px rgba(0,0,0,0.06),    /* Tight, direct light */
  0 4px 12px rgba(0,0,0,0.08);   /* Soft, ambient light */
```

---

## 7. Accessibility

### Contrast Standards

- Prefer **APCA** over WCAG 2 for more accurate perceptual contrast
- Interactive states must have **more** contrast than rest state

### Color Independence

Never rely on color alone for meaning:
- Error states: color + icon + text
- Status indicators: color + label
- Charts: color + pattern or label

### Screen Reader Support

- Icon-only buttons require `aria-label`
- Decorative elements get `aria-hidden="true"`
- Use native elements (`button`, `a`, `label`) before ARIA
- Maintain logical heading hierarchy (`h1` → `h2` → `h3`)

---

## 8. Performance

### Response Time Targets

| Operation | Target |
|-----------|--------|
| UI response to input | <100ms |
| API mutations | <500ms |
| Page load (LCP) | <2.5s |

### Rendering Optimization

- Virtualize lists >100 items
- Use `content-visibility: auto` for off-screen content
- Minimize React re-renders

### Asset Loading

| Asset | Strategy |
|-------|----------|
| Above-fold images | Preload |
| Below-fold images | Lazy load |
| Fonts | Preload critical, subset via `unicode-range` |
| Third-party scripts | `defer` or `async` |

---

## 9. What to Avoid

**Generic AI aesthetics:**
- Overused fonts (Inter, Roboto, Arial as primary)
- Purple gradients on white backgrounds
- Predictable layouts without character
- Cookie-cutter component patterns

**Interaction anti-patterns:**
- `transition: all` (performance killer)
- Autoplay animations
- Disabled submit buttons before user tries
- Blocking paste on any input
- Color-only status indicators

**Instead:**
- Make unexpected choices that feel genuinely designed
- Match implementation complexity to aesthetic vision
- Commit fully to your visual direction

---

## Related Skills

- design-system-quality
- brand-guidelines
- brand-voice

---

*Version: 1.0.0 | Interaction patterns adapted from Vercel Web Interface Guidelines*
