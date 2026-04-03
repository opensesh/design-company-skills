# Section Detection Patterns

This reference contains deterministic patterns for classifying page sections and URL clusters.

---

## URL Clustering Patterns

Use these regex patterns to categorize discovered URLs into clusters.

### Navigation & Utility Pages

```regex
# Utility pages (privacy, legal, account)
UTILITY_PATTERN = ^/(privacy|terms|legal|cookies?|gdpr|tos|contact|support|help|login|signin|signup|register|account|cart|checkout|subscribe|unsubscribe)/?$

# About/Company pages
ABOUT_PATTERN = ^/(about|team|careers|jobs|press|newsroom|investors|company|mission|values|story)/?$
```

### Content Clusters

```regex
# Blog content
BLOG_PATTERN = ^/(blog|posts?|articles?|news|updates|journal|insights|stories)/

# Documentation
DOCS_PATTERN = ^/(docs?|documentation|help|guide|guides|api|reference|manual|kb|knowledge-base|faq|how-to)/

# Resources
RESOURCES_PATTERN = ^/(resources?|downloads?|assets|case-stud(y|ies)|whitepaper|ebooks?|webinars?|templates?|tools)/

# Products/Features
PRODUCTS_PATTERN = ^/(products?|features?|solutions?|services?|pricing|plans?|offerings?|capabilities)/

# Portfolio/Work
PORTFOLIO_PATTERN = ^/(portfolio|work|projects?|clients?|showcase|gallery)/
```

### Date-Based Patterns

```regex
# Year/month in URL (common for blogs)
DATE_PATTERN = /\d{4}/\d{2}/
YEAR_PATTERN = /\d{4}/
```

### Dynamic Content Indicators

```regex
# Pagination
PAGINATION_PATTERN = [?&](page|p|offset)=\d+

# Filters/Search
FILTER_PATTERN = [?&](filter|category|tag|sort|q|search)=

# User-specific (skip these)
USER_CONTENT_PATTERN = /(user|profile|dashboard|settings|my-)/
```

---

## Semantic HTML Tag Mapping

**Tier 1: Direct semantic tag detection (highest confidence)**

| HTML Tag    | Section Type | Description             |
| ----------- | ------------ | ----------------------- |
| `<header>`  | header       | Site/page header        |
| `<nav>`     | navigation   | Navigation menus        |
| `<main>`    | content      | Primary content area    |
| `<article>` | article      | Self-contained content  |
| `<section>` | section      | Generic content section |
| `<aside>`   | sidebar      | Tangential content      |
| `<footer>`  | footer       | Site/page footer        |
| `<form>`    | form         | Form sections           |

### Nested Structure Rules

- `<header>` at document root → Site header
- `<header>` inside `<article>` → Article header (title, meta)
- `<nav>` inside `<header>` → Primary navigation
- `<nav>` inside `<aside>` → Sidebar navigation
- `<footer>` at document root → Site footer
- `<footer>` inside `<article>` → Article footer (author, share)

---

## Class Name Pattern Matching

**Tier 2: Regex patterns for class/id attributes (medium confidence)**

### Section Type Patterns

```javascript
const SECTION_PATTERNS = {
  // Hero/Banner sections
  hero: /hero|banner|jumbotron|splash|above-fold|masthead|intro-section|landing-hero/i,

  // Navigation
  navigation: /nav|menu|navbar|sidebar|breadcrumb|topbar|header-nav|main-nav|site-nav/i,

  // Feature sections
  features: /feature|benefit|capability|highlight|advantage|value-prop|usp|why-us/i,

  // Social proof
  testimonials:
    /testimonial|review|quote|social-proof|customer-story|case-study|trust|logo-bar|client/i,

  // Pricing
  pricing: /pricing|plan|tier|package|cost|subscription|compare-plans/i,

  // Call to action
  cta: /cta|call-to-action|signup|subscribe|contact-form|get-started|try-free|demo/i,

  // Footer
  footer: /footer|bottom|legal|copyright|site-footer|page-footer/i,

  // Content areas
  content: /content|body|main|article|post|entry|text-block|prose|copy/i,

  // FAQ sections
  faq: /faq|question|accordion|help-section|support-section|q-and-a/i,

  // Grid/Card layouts
  grid: /grid|cards?|tiles?|gallery|mosaic|collection|list-view|card-container/i,

  // Forms
  form: /form|input|contact|newsletter|subscribe|signup-form|lead-gen/i,

  // Media sections
  media: /video|media|player|embed|youtube|vimeo|gallery|slideshow|carousel/i,

  // Announcement/Alert
  announcement: /announcement|alert|banner-top|promo|notice|notification|cookie/i,

  // Stats/Numbers
  stats: /stats?|metrics?|numbers?|counter|achievements?|by-the-numbers/i,

  // Team/People
  team: /team|people|staff|leadership|founders?|about-us/i,

  // Partners/Integrations
  partners: /partner|integration|connect|ecosystem|marketplace/i,

  // Timeline/Process
  process: /process|steps?|timeline|how-it-works|workflow|journey/i,

  // Comparison
  comparison: /compar|versus|vs|alternative|difference/i,
};
```

### Layout Pattern Detection

```javascript
const LAYOUT_PATTERNS = {
  // Two-column layouts
  'two-column': /col-2|two-col|sidebar-layout|with-sidebar|split/i,

  // Three-column grid
  'three-column': /col-3|three-col|triple/i,

  // Full-width sections
  'full-width': /full-width|container-fluid|edge-to-edge|bleed/i,

  // Centered content
  centered: /center|mx-auto|text-center|align-center/i,

  // Sticky elements
  sticky: /sticky|fixed|affix|pinned/i,
};
```

---

## Content-Based Inference (Quick Mode)

When DOM structure isn't available, infer sections from content patterns.

### Heading Analysis

| Pattern                                     | Likely Section |
| ------------------------------------------- | -------------- |
| "Features", "What we offer", "Capabilities" | features       |
| "Pricing", "Plans", "Get started"           | pricing        |
| "Testimonials", "What customers say"        | testimonials   |
| "FAQ", "Questions", "Help"                  | faq            |
| "Contact", "Get in touch"                   | contact/cta    |
| "About", "Our story", "Who we are"          | about          |
| "Blog", "Latest posts", "News"              | blog-listing   |

### Content Markers

```javascript
const CONTENT_MARKERS = {
  pricing: ['$/mo', 'per month', 'per year', 'free tier', 'enterprise'],
  testimonials: ['said', 'says', 'according to', '★', 'stars'],
  cta: ['sign up', 'get started', 'try free', 'book a demo', 'contact us'],
  stats: [/\d+[+%]/, /\d+k\+?/i, 'customers', 'users', 'downloads'],
  faq: ['?', 'how do', 'what is', 'can I', 'why'],
};
```

---

## Template Fingerprint Components

Build deterministic fingerprints for template classification.

### Fingerprint Schema

```typescript
interface PageFingerprint {
  // Sorted set of semantic tags present
  semanticTags: string[]; // e.g., ["article", "aside", "footer", "header", "main", "nav"]

  // Heading hierarchy
  headingStructure: string[]; // e.g., ["h1", "h2", "h2", "h3", "h2"]

  // Detected section types (from Tier 1 + 2)
  sectionTypes: string[]; // e.g., ["header", "hero", "features", "cta", "footer"]

  // Section count
  sectionCount: number;

  // Boolean flags
  hasForm: boolean;
  hasVideo: boolean;
  hasImages: boolean;
  hasSidebar: boolean;
  hasComments: boolean;

  // URL pattern
  pathDepth: number; // e.g., /blog/post → 2
  pathPattern: string; // e.g., "/blog/{slug}"
}
```

### Fingerprint Hash

```javascript
function computeFingerprint(page) {
  const components = [
    page.sectionTypes.sort().join(','),
    page.hasForm ? 'F' : '',
    page.hasSidebar ? 'S' : '',
    page.hasVideo ? 'V' : '',
    page.pathPattern,
  ];
  return hash(components.join('|'));
}
```

### Template Matching Rules

```javascript
const TEMPLATE_RULES = {
  Homepage: {
    required: ['header', 'footer'],
    typical: ['hero', 'features', 'cta', 'testimonials'],
    pathPattern: /^\/$/,
  },

  'Landing Page': {
    required: ['hero', 'cta'],
    typical: ['features', 'testimonials', 'pricing', 'faq'],
    pathPattern: /^\/(lp|landing|campaign)\//,
  },

  'Blog Post': {
    required: ['article'],
    typical: ['header', 'content', 'sidebar', 'footer'],
    pathPattern: /^\/(blog|posts?|articles?)\/.+/,
  },

  'Blog Listing': {
    required: ['grid'],
    typical: ['header', 'navigation', 'footer'],
    pathPattern: /^\/(blog|posts?|articles?)\/?$/,
  },

  Documentation: {
    required: ['sidebar', 'content'],
    typical: ['header', 'navigation', 'toc'],
    pathPattern: /^\/(docs?|help|guide)\//,
  },

  'Product Page': {
    required: ['hero'],
    typical: ['features', 'pricing', 'cta', 'testimonials'],
    pathPattern: /^\/(products?|features?)\/.+/,
  },

  'Pricing Page': {
    required: ['pricing'],
    typical: ['header', 'faq', 'cta', 'footer'],
    pathPattern: /^\/pricing\/?$/,
  },

  'Contact Page': {
    required: ['form'],
    typical: ['header', 'content', 'footer'],
    pathPattern: /^\/(contact|get-in-touch)\/?$/,
  },

  'About Page': {
    required: ['content'],
    typical: ['header', 'team', 'stats', 'footer'],
    pathPattern: /^\/(about|company|team)\/?$/,
  },
};
```

---

## Confidence Levels

### Section Detection Confidence

| Method                 | Confidence | Reliability |
| ---------------------- | ---------- | ----------- |
| Semantic HTML tag      | High       | 95%+        |
| Class name regex match | Medium     | 80-90%      |
| Content inference      | Low        | 60-75%      |
| LLM classification     | Variable   | 70-85%      |

### Template Classification Confidence

| Criteria                     | Confidence |
| ---------------------------- | ---------- |
| 3+ required sections match   | High       |
| 2 required + 2 typical match | Medium     |
| Pattern only or 1 required   | Low        |

---

## Layout Detection Patterns (V2)

### CSS Framework Detection

```javascript
const FRAMEWORK_PATTERNS = {
  // Tailwind CSS
  tailwind: {
    indicators: [
      /class="[^"]*(?:flex|grid|block|inline|hidden)/,
      /class="[^"]*(?:p[xytrbl]?-\d|m[xytrbl]?-\d)/,
      /class="[^"]*(?:text-(?:xs|sm|base|lg|xl|\d*xl))/,
      /class="[^"]*(?:bg-|border-|rounded-)/,
      /class="[^"]*(?:w-|h-|min-|max-)/,
    ],
    confidence: 'high',
  },

  // Bootstrap
  bootstrap: {
    indicators: [
      /class="[^"]*(?:container|row|col-)/,
      /class="[^"]*(?:btn|card|navbar)/,
      /class="[^"]*(?:d-(?:flex|grid|block|none))/,
      /class="[^"]*(?:p-\d|m-\d|g-\d)/,
    ],
    confidence: 'high',
  },

  // CSS Modules
  'css-modules': {
    indicators: [/class="[^"]*_[a-zA-Z0-9]{5,}/, /className={styles\./],
    confidence: 'medium',
  },

  // Styled Components / Emotion
  'css-in-js': {
    indicators: [/class="[^"]*css-[a-z0-9]+/, /class="[^"]*sc-[a-zA-Z0-9]+/],
    confidence: 'medium',
  },
};
```

### Grid System Detection

```javascript
const GRID_PATTERNS = {
  // 12-column grid
  '12-column': {
    indicators: [/col-span-(?:1[0-2]|[1-9])/, /grid-cols-12/, /col-(?:1[0-2]|[1-9])\b/],
  },

  // 16-column grid
  '16-column': {
    indicators: [/col-span-(?:1[0-6]|[1-9])/, /grid-cols-16/],
  },

  // Flexbox layout
  flex: {
    indicators: [/class="[^"]*flex(?:\s|")/, /display:\s*flex/],
  },

  // CSS Grid (custom)
  'css-grid': {
    indicators: [/display:\s*grid/, /grid-template-columns/],
  },
};
```

### Container Width Extraction

```javascript
function extractContainerWidth(html) {
  const patterns = [
    // Tailwind max-width
    /max-w-(?:\[(\d+px)\]|(\d+xl))/,
    // CSS max-width
    /max-width:\s*(\d+(?:px|rem))/,
    // Container classes
    /container(?:\s+|").*max-width:\s*(\d+(?:px|rem))/,
  ];

  // Common container widths
  const widthMap = {
    'max-w-7xl': '~1280px',
    'max-w-6xl': '~1152px',
    'max-w-5xl': '~1024px',
    'max-w-4xl': '~896px',
    'max-w-screen-xl': '~1280px',
    'max-w-screen-2xl': '~1536px',
  };

  // Extract and return
}
```

---

## Motion/Animation Detection (V2)

### Animation Library Detection

```javascript
const ANIMATION_LIBRARY_PATTERNS = {
  // GSAP
  gsap: {
    script_patterns: [/gsap\.min\.js/, /gsap.*\.js/, /@gsap/],
    code_patterns: [/gsap\.to\(/, /gsap\.from\(/, /gsap\.timeline\(/, /ScrollTrigger/, /SplitText/],
    confidence: 'high',
  },

  // Framer Motion
  'framer-motion': {
    script_patterns: [/framer-motion/],
    code_patterns: [/motion\./, /useAnimation/, /AnimatePresence/, /variants=/],
    confidence: 'high',
  },

  // Anime.js
  anime: {
    script_patterns: [/anime\.min\.js/, /animejs/],
    code_patterns: [/anime\(\{/, /anime\.timeline/],
    confidence: 'high',
  },

  // Lenis (smooth scroll)
  lenis: {
    script_patterns: [/@studio-freight\/lenis/, /lenis\.min\.js/],
    code_patterns: [/new Lenis\(/, /lenis\.raf/],
    confidence: 'high',
  },

  // Locomotive Scroll
  locomotive: {
    script_patterns: [/locomotive-scroll/],
    code_patterns: [/data-scroll/, /LocomotiveScroll/],
    confidence: 'high',
  },

  // CSS Animations (native)
  css: {
    code_patterns: [/animation:/, /@keyframes/, /transition:/],
    confidence: 'medium',
  },
};
```

### Motion Pattern Detection

```javascript
const MOTION_PATTERNS = {
  // Parallax scrolling
  parallax: {
    indicators: [
      /data-speed/,
      /parallax/i,
      /ScrollTrigger.*scrub/,
      /transform.*translateY.*scroll/,
    ],
    typical_elements: ['background-image', 'hero', 'section-bg'],
  },

  // Reveal on scroll
  'scroll-reveal': {
    indicators: [
      /data-aos/,
      /data-scroll-reveal/,
      /IntersectionObserver/,
      /\.is-visible/,
      /\.revealed/,
    ],
    typical_elements: ['headings', 'paragraphs', 'cards'],
  },

  // Text splitting/animation
  'text-split': {
    indicators: [/SplitText/, /split-type/, /splitting\.js/, /char-wrap/, /line-wrap/, /word-wrap/],
    typical_elements: ['h1', 'h2', 'hero-text', 'tagline'],
  },

  // Stagger animations
  stagger: {
    indicators: [/stagger:/, /staggerChildren/, /\.each.*delay/],
    typical_elements: ['grid-items', 'list-items', 'nav-items'],
  },

  // Magnetic/cursor effects
  magnetic: {
    indicators: [/magnetic/i, /cursor.*follow/, /lerp.*mouse/],
    typical_elements: ['buttons', 'links', 'interactive-elements'],
  },

  // Page transitions
  'page-transition': {
    indicators: [/barba/i, /swup/i, /page-transition/, /transition-.*leave/, /transition-.*enter/],
    typical_elements: ['page-wrapper', 'main-content'],
  },

  // Horizontal scroll
  'horizontal-scroll': {
    indicators: [/horizontal.*scroll/i, /scroll.*horizontal/i, /pin.*horizontal/, /x:.*scroll/],
    typical_elements: ['gallery', 'portfolio', 'showcase'],
  },
};
```

### CSS Variable Extraction

```javascript
const CSS_VAR_PATTERNS = {
  // Color tokens
  colors: {
    pattern: /--(?:color|bg|fg|text|border|brand)[\w-]*:\s*([^;]+)/g,
    normalize: (value) => value.trim(),
  },

  // Spacing tokens
  spacing: {
    pattern: /--(?:spacing|gap|padding|margin)[\w-]*:\s*([^;]+)/g,
    normalize: (value) => value.trim(),
  },

  // Typography tokens
  typography: {
    pattern: /--(?:font|text|line-height|letter-spacing)[\w-]*:\s*([^;]+)/g,
    normalize: (value) => value.trim(),
  },

  // Animation tokens
  animation: {
    pattern: /--(?:duration|easing|delay|transition)[\w-]*:\s*([^;]+)/g,
    normalize: (value) => value.trim(),
  },
};

function extractDesignTokens(cssContent) {
  const tokens = {
    colors: {},
    spacing: {},
    typography: {},
    animation: {},
  };

  // Extract :root variables
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
  if (rootMatch) {
    const rootContent = rootMatch[1];

    for (const [category, config] of Object.entries(CSS_VAR_PATTERNS)) {
      const matches = [...rootContent.matchAll(config.pattern)];
      for (const match of matches) {
        const varName = match[0].split(':')[0].trim();
        const varValue = config.normalize(match[1]);
        tokens[category][varName] = varValue;
      }
    }
  }

  return tokens;
}
```

---

## Framework Detection

### JavaScript Framework Detection

```javascript
const JS_FRAMEWORK_PATTERNS = {
  // Next.js
  'next.js': {
    indicators: [/__next/, /_next\/static/, /next\/script/, /__NEXT_DATA__/],
    confidence: 'high',
  },

  // Nuxt
  nuxt: {
    indicators: [/__nuxt/, /_nuxt\//, /nuxt-link/],
    confidence: 'high',
  },

  // Gatsby
  gatsby: {
    indicators: [/gatsby/, /___gatsby/, /gatsby-image/],
    confidence: 'high',
  },

  // React (generic)
  react: {
    indicators: [/react.*\.js/, /data-reactroot/, /_reactRootContainer/],
    confidence: 'medium',
  },

  // Vue (generic)
  vue: {
    indicators: [/vue.*\.js/, /data-v-/, /__vue/],
    confidence: 'medium',
  },

  // Webflow
  webflow: {
    indicators: [/webflow/i, /\.w-/, /wf-/],
    confidence: 'high',
  },

  // Framer
  framer: {
    indicators: [/framer\./, /framerusercontent/],
    confidence: 'high',
  },
};
```

### CMS Detection

```javascript
const CMS_PATTERNS = {
  sanity: {
    indicators: [/sanity\.io/, /cdn\.sanity/, /@sanity/],
  },

  contentful: {
    indicators: [/contentful/, /ctfassets/, /images\.ctfassets/],
  },

  prismic: {
    indicators: [/prismic\.io/, /cdn\.prismic/],
  },

  wordpress: {
    indicators: [/wp-content/, /wp-includes/, /wp-json/],
  },

  strapi: {
    indicators: [/strapi/, /api\/.*\?populate/],
  },
};
```

---

## Extraction Priority

When analyzing a page, follow this extraction order:

1. **Framework Detection** (high priority)
   - JS framework (Next.js, Nuxt, etc.)
   - CSS framework (Tailwind, Bootstrap, etc.)
   - CMS if applicable

2. **Layout Analysis** (high priority)
   - Grid system
   - Container width
   - Breakpoints

3. **Animation Library Detection** (medium priority)
   - Primary animation library
   - Scroll library

4. **Motion Pattern Identification** (medium priority)
   - Per-section motion behaviors
   - Common patterns across site

5. **Design Token Extraction** (lower priority)
   - CSS custom properties
   - Color palette
   - Typography scale
