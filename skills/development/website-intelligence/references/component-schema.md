# Component Spec Schema

This document defines the YAML schema for machine-readable component specifications. These specs are generated per template family and designed for AI implementation.

---

## Output Location

```
/output-directory/
  component-specs/
    homepage.yaml
    case-study.yaml
    blog-post.yaml
    documentation.yaml
    ...
```

---

## Full Schema Definition

```yaml
# =============================================================================
# COMPONENT SPEC SCHEMA v2
# Machine-readable specification for AI implementation
# =============================================================================

meta:
  template: string # Template name (kebab-case)
  representative_urls: # Sample pages using this template
    - string
  confidence: high | medium | low
  tech_stack:
    framework: string # next.js, nuxt, gatsby, remix, etc.
    styling: string # tailwind, css-modules, styled-components, etc.
    animation: string # gsap, framer-motion, anime.js, css, etc.
    scroll: string # lenis, locomotive, native, etc.
    cms: string | null # sanity, contentful, prismic, etc.

# =============================================================================
# LAYOUT CONFIGURATION
# =============================================================================

layout:
  grid: string # "12-column", "16-column", "flex", etc.
  container_max: string # Max container width (e.g., "1280px", "~1440px")
  breakpoints: # Responsive breakpoints observed
    sm: string # e.g., "640px"
    md: string # e.g., "768px"
    lg: string # e.g., "1024px"
    xl: string # e.g., "1280px"
  section_padding: string # Default section padding (e.g., "py-64 lg:py-128")
  grid_gap: string # Grid gap value (e.g., "16px", "gap-4")

# =============================================================================
# SECTIONS
# =============================================================================

sections:
  - id: string # Unique section identifier
    type: string # Section type (hero, features, cta, etc.)

    # Dimensions
    height: string # e.g., "100vh", "150vh", "auto"
    min_height: string # Optional minimum height
    position: string # e.g., "relative", "sticky top-0"
    overflow: string # e.g., "hidden", "visible"

    # Theming
    background: string # Background class or value
    theme: light | dark # Theme context for nested elements

    # Layout (for multi-column sections)
    columns:
      left:
        span: number # Grid column span
        start: number # Grid column start (1-indexed)
        content:
          - type: string # Element type
            level: string # For headings: h1, h2, h3, etc.
            style: string # Style classes
            motion: object # Motion configuration (see Motion Schema)
      right:
        span: number
        start: number
        content:
          - type: string
            # ... same structure as left column

    # Layers (for stacked/layered sections like heroes)
    layers:
      - id: string # Layer identifier
        type: string # image, video, gradient, content, etc.
        position: string # CSS position classes
        z_index: number # Stacking order

        # Type-specific properties
        object_fit: string # For images: cover, contain, etc.
        direction: string # For gradients: to-bottom, to-right, etc.
        stops: array # Gradient color stops

        motion: # Motion configuration
          type: string # Motion pattern name
          library: string # Animation library used
          trigger: string # scroll, in-view, on-load, hover
          # ... additional motion properties

# =============================================================================
# MOTION PATTERNS
# =============================================================================

motion_patterns:
  pattern-name: # Kebab-case pattern identifier
    description: string # Human-readable description
    trigger: string # When animation triggers
    typical_duration: string # e.g., "400-600ms"
    easing: string # e.g., "power3.out", "ease-out"

    # Transform properties
    transform: string # e.g., "translateY(100%) -> translateY(0)"
    opacity: string # e.g., "0 -> 1"
    scale: string # e.g., "0.8 -> 1"

    # Sequencing
    stagger: string # e.g., "0.02s", "0.05s per line"
    delay: string # Initial delay

    # Additional properties as needed
    sequence: array # For multi-step animations

# =============================================================================
# DESIGN TOKENS
# =============================================================================

design_tokens:
  colors:
    brand: string # Primary brand color (hex)
    brand-secondary: string # Secondary brand color
    background: string # Page background
    background-secondary: string
    foreground: string # Primary text color
    foreground-muted: string # Secondary text color
    border: string # Border color

  typography:
    font_family:
      heading: string # e.g., "Inter, sans-serif"
      body: string # e.g., "Inter, sans-serif"
      mono: string # e.g., "JetBrains Mono, monospace"

    sizes:
      h1: string # e.g., "clamp(2.5rem, 5vw, 4rem)"
      h2: string
      h3: string
      h4: string
      body: string # e.g., "1rem"
      body-lg: string # e.g., "1.125rem"
      small: string # e.g., "0.875rem"

    line_height:
      heading: string # e.g., "1.1"
      body: string # e.g., "1.6"

    letter_spacing:
      heading: string # e.g., "-0.02em"
      body: string # e.g., "0"

  spacing:
    section_gap: string # e.g., "64px -> 128px (responsive)"
    grid_gap: string # e.g., "16px"
    container_padding: string # e.g., "16px lg:32px"

  borders:
    radius:
      sm: string # e.g., "4px"
      md: string # e.g., "8px"
      lg: string # e.g., "16px"
      full: string # e.g., "9999px"
    width:
      default: string # e.g., "1px"

  shadows:
    sm: string
    md: string
    lg: string

# =============================================================================
# INTERACTIONS
# =============================================================================

interactions:
  buttons:
    primary:
      default: object # Default state styles
      hover: object # Hover state styles
      active: object # Active/pressed state
      motion: object # Transition configuration

    secondary:
      # ... same structure

    ghost:
      # ... same structure

  links:
    default:
      decoration: string # underline, none, etc.
      hover: object # Hover state
      motion: object

  cards:
    hover_effect: string # e.g., "translateY(-4px)", "scale(1.02)"
    shadow_on_hover: boolean
    border_on_hover: boolean
```

---

## Section Types Reference

| Type                    | Description               | Typical Layers/Columns        |
| ----------------------- | ------------------------- | ----------------------------- |
| `hero-fullscreen`       | Full viewport height hero | background, overlay, content  |
| `hero-split`            | Two-column hero           | left (media), right (content) |
| `features-grid`         | Feature cards in grid     | 2-4 column grid               |
| `features-alternating`  | Alternating image/text    | left/right columns            |
| `cta-centered`          | Centered call-to-action   | single column                 |
| `cta-split`             | Two-column CTA            | content, form                 |
| `testimonials-carousel` | Sliding testimonials      | carousel items                |
| `testimonials-grid`     | Testimonial cards         | grid layout                   |
| `pricing-table`         | Pricing comparison        | 2-4 tier columns              |
| `faq-accordion`         | Collapsible FAQ           | accordion items               |
| `content-sidebar`       | Content with sidebar      | main, sidebar                 |
| `content-full`          | Full-width content        | single column                 |
| `gallery-grid`          | Image/media gallery       | grid of items                 |
| `stats-row`             | Statistics display        | horizontal row                |
| `team-grid`             | Team member cards         | grid layout                   |
| `footer-standard`       | Multi-column footer       | 3-5 columns + bottom          |

---

## Motion Type Reference

### Reveal Animations

```yaml
# Text reveals
split-line-reveal:
  description: Each line of text slides up from below mask
  trigger: in-view
  transform: translateY(100%) -> translateY(0)
  stagger: 0.05-0.1s per line

letter-reveal:
  description: Letters animate in sequentially
  trigger: scroll | in-view
  transform: translateY(110%) -> translateY(0)
  stagger: 0.02s per character

word-reveal:
  description: Words appear one at a time
  trigger: in-view
  opacity: 0 -> 1
  transform: translateY(20px) -> translateY(0)
  stagger: 0.05s per word

# Element reveals
fade-up:
  description: Element fades in while moving up
  trigger: in-view
  opacity: 0 -> 1
  transform: translateY(30px) -> translateY(0)
  duration: 0.6s
  easing: ease-out

scale-in:
  description: Element scales from smaller size
  trigger: in-view
  opacity: 0 -> 1
  scale: 0.9 -> 1
  duration: 0.4s
```

### Scroll Animations

```yaml
parallax-scroll:
  description: Element moves at different rate than scroll
  trigger: scroll
  library: gsap-scroll-trigger
  factor: 0.3-0.7 # Speed relative to scroll

sticky-reveal:
  description: Element sticks then reveals content
  trigger: scroll
  position: sticky
  reveal_on: scroll-past

progress-bar:
  description: Bar fills based on scroll position
  trigger: scroll
  property: scaleX
  range: 0 -> 1
```

### Decorative Animations

```yaml
text-scramble:
  description: Characters randomize then resolve to final text
  trigger: on-load
  duration: 400-600ms
  characters: "!<>-_\\/[]{}—=+*^?#________"

brand-rect-wipe:
  description: Colored rectangle wipes across text
  trigger: in-view
  sequence:
    - brand-rect scaleX 0 -> 1
    - text reveal
    - brand-rect exit
  duration: 0.6s total

cursor-follow:
  description: Element follows cursor with lag
  trigger: mousemove
  easing: lerp
  factor: 0.1

magnetic-hover:
  description: Element pulls toward cursor on hover
  trigger: hover
  range: 50px
  strength: 0.3
```

### Hover Animations

```yaml
button-slide:
  description: Background slides across on hover
  trigger: hover
  property: background-position
  duration: 0.3s

icon-rotate:
  description: Icon rotates on parent hover
  trigger: hover
  transform: rotate(-90deg) -> rotate(0deg)
  duration: 0.3s

link-underline:
  description: Underline expands from left
  trigger: hover
  property: scaleX
  transform-origin: left
  duration: 0.2s
```

---

## Example: Complete Case Study Spec

```yaml
meta:
  template: case-study
  representative_urls:
    - /work/fitgreenmind
    - /work/bodyarmor
  confidence: high
  tech_stack:
    framework: next.js
    styling: tailwind
    animation: gsap
    scroll: lenis
    cms: sanity

layout:
  grid: 12-column
  container_max: ~1280px
  section_padding: py-64 lg:py-128
  grid_gap: 16px

sections:
  - id: hero
    type: hero-fullscreen
    height: 150vh
    position: relative
    overflow: hidden

    layers:
      - id: background
        type: image
        position: absolute inset-0
        object_fit: cover
        z_index: 0
        motion:
          type: parallax-scroll
          library: gsap-scroll-trigger
          factor: 0.5

      - id: overlay
        type: gradient
        position: absolute inset-0
        direction: to-bottom
        stops:
          - rgba(0,0,0,0.5) 0%
          - transparent 50%
        z_index: 1

      - id: project-name
        type: typography
        position: absolute bottom-0 left-0 right-0
        z_index: 2
        content:
          - type: heading
            text: '{project_name}'
            level: display
            style: text-[clamp(200px,25vw,400px)] font-bold text-foreground/40
            overflow: hidden
        motion:
          type: letter-reveal
          trigger: scroll
          transform: translateY(110%) -> translateY(0)
          stagger: 0.02s
          easing: power3.out

  - id: overview
    type: two-column
    padding: pt-128 pb-128
    background: bg-primary

    columns:
      left:
        span: 3
        start: 2
        content:
          - type: heading
            level: h1
            text: '{project_name}'
            motion:
              type: brand-rect-wipe
              duration: 0.6s

          - type: link
            text: 'View Live Site'
            style: flex items-center gap-8
            href: '{project_url}'
            motion:
              type: icon-rotate
              hover: translate-x-24

          - type: meta-list
            divider: border-t border-foreground/10
            items:
              - label: Timeline
                value: '{timeline}'
              - label: Category
                value: '{category}'
              - label: Techstack
                value: '{techstack}'
              - label: Location
                value: '{location}'
              - label: Year
                value: '{year}'

      right:
        span: 5
        start: 7
        content:
          - type: heading
            level: h3
            text: '{tagline}'

          - type: divider
            style: border-t border-foreground/10 my-64

          - type: prose
            text: '{description}'
            motion:
              type: split-line-reveal
              trigger: in-view
              stagger: 0.1s

motion_patterns:
  letter-reveal:
    description: Letters animate in sequentially with vertical reveal
    trigger: scroll
    transform: translateY(110%) -> translateY(0)
    stagger: 0.02s
    easing: power3.out
    mask: overflow-hidden on parent

  brand-rect-wipe:
    description: Brand-colored rectangle wipes across, reveals text
    trigger: in-view
    sequence:
      - brand-rect scaleX(0) -> scaleX(1), origin-left
      - text opacity 0 -> 1
      - brand-rect scaleX(1) -> scaleX(0), origin-right
    duration: 0.6s total
    easing: power2.inOut

  split-line-reveal:
    description: Text split by lines, each line reveals upward
    trigger: in-view
    setup: split-type library or CSS clip-path
    transform: translateY(100%) -> translateY(0)
    stagger: 0.05-0.1s per line
    easing: power3.out

design_tokens:
  colors:
    brand: '#CDFE00'
    background: '#141314'
    background-secondary: '#1a1a1b'
    foreground: '#F5F5F5'
    foreground-muted: rgba(245,245,245,0.6)
    border: rgba(245,245,245,0.1)

  typography:
    font_family:
      heading: 'Monument Extended, sans-serif'
      body: 'Inter, sans-serif'
    sizes:
      display: clamp(200px, 25vw, 400px)
      h1: clamp(2.5rem, 5vw, 4rem)
      h2: clamp(2rem, 4vw, 3rem)
      h3: clamp(1.5rem, 3vw, 2rem)
      body: 1rem
      body-lg: 1.125rem
    line_height:
      heading: '1.1'
      body: '1.6'

  spacing:
    section_gap: 64px lg:128px
    grid_gap: 16px
    container_padding: 16px lg:32px
```

---

## Parsing Notes for AI Agents

1. **Start with `meta.tech_stack`** to understand which libraries to use
2. **Use `layout.grid`** to set up the base grid system
3. **Process sections in order** - they represent page flow
4. **For each section:**
   - Check `type` to determine component pattern
   - Apply `columns` or `layers` structure
   - Reference `motion_patterns` by name for animations
5. **Apply `design_tokens`** to CSS variables or Tailwind config
6. **Motion `trigger`** determines when to initialize:
   - `on-load`: Initialize immediately
   - `in-view`: Use IntersectionObserver
   - `scroll`: Use ScrollTrigger or scroll listener
   - `hover`: Use CSS or JS hover events

---

_Schema version: 2.0 | Website Intelligence Skill_
