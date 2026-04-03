# Website Intelligence Skill

---

name: website-intel
description: Analyze any website and generate structured intelligence reports with site architecture, SEO insights, and visual page diagrams
arguments:

- name: url
  description: The root URL to analyze (required)
- name: output-path
  description: Directory for output files (default: current directory)
  invocation: slash-command

---

## Overview

This skill performs comprehensive website analysis and generates structured deliverables for both human review and AI implementation:

**Core Reports:**
1. **`site-map-report.md`** - Holistic site overview with architecture, SEO, and performance insights
2. **`page-structure.md`** - Tree-style component hierarchies with layout/motion annotations (V2)

**Machine-Readable Specs:**
3. **`component-specs/*.yaml`** - Implementation-ready specs per template family (V2)

**Agent Handoff:**
4. **`agent-handoff.md`** - Prompt templates for AI agents to build from the analysis (V2)

Legacy `page-diagrams.md` (ASCII wireframes) is still supported but V2 tree-style is preferred.

## When to Use

- Analyzing competitor websites
- Understanding site architecture before redesign
- SEO audits and content inventory
- Design system documentation
- Information architecture review
- Pre-migration site mapping

## Input Parsing

Extract from user invocation:

- **URL** (required): The root domain to analyze (e.g., `https://example.com`)
- **Output Path** (optional): Directory for generated files (default: `./`)

```
/website-intel https://example.com ./output
```

If URL is missing, prompt user: "Please provide a URL to analyze."

---

## Mode Selection

After receiving the URL, ask the user to choose an analysis mode:

**Prompt the user:**

> How would you like to analyze this site?
>
> **Quick Analysis (Web Search)**
>
> - Uses WebSearch + WebFetch tools
> - Faster, good for initial reconnaissance
> - Limited structural detail
>
> **Deep Analysis (Firecrawl)**
>
> - Uses Firecrawl MCP for comprehensive crawling
> - Full HTML structure analysis
> - Detailed section detection and template classification

Use AskUserQuestion with options:

- "Quick (Web Search)" - faster, lighter analysis
- "Deep (Firecrawl)" - comprehensive crawl and analysis

---

## Quick Mode Workflow

When user selects Quick mode, follow this workflow:

### Phase 1: Discovery via Web Search

```
1. WebSearch("{domain} site structure main pages navigation")
   → Gather info about site sections and navigation

2. WebSearch("site:{domain}")
   → Discover indexed pages

3. WebSearch("{domain} sitemap")
   → Find sitemap references
```

### Phase 2: Fetch Key Pages

```
1. WebFetch(homepage)
   → Analyze homepage content

2. WebFetch(3-5 key pages identified from search)
   → Sample main page types (blog, docs, products, about)
```

### Phase 3: Synthesize Findings

From the gathered content:

- Infer site hierarchy from navigation mentions and URL patterns
- Identify content clusters from search results
- Estimate page templates from content patterns
- Note SEO signals from titles and descriptions

### Phase 4: Generate Reports

Generate both reports with **confidence caveats** noting:

- "Analysis based on Web Search - structural details may be incomplete"
- "Section detection inferred from content, not DOM structure"
- "URL list is partial based on search indexing"

Refer to `references/output-templates.md` for report structure.

---

## Deep Mode Workflow

When user selects Deep mode, follow this comprehensive workflow:

### Phase 1: URL Discovery

```javascript
// Use Firecrawl MCP to map the site
result = mcp__firecrawl__firecrawl_map({
  url: rootUrl,
  limit: 500, // Cap at 500 URLs
  includeSubdomains: false,
});

// Extract URL list
allUrls = result.urls || result.links;
```

If map returns empty:

- Retry with `sitemap: true` option
- Fall back to homepage-only analysis if still empty

### Phase 2: URL Clustering (Deterministic)

Group URLs by regex path patterns. Reference `references/section-patterns.md` for patterns.

```
Clusters:
- navigation: Top-level pages linked from main nav
- utility: /privacy, /terms, /login, /contact, /support, /account
- blog: /blog/*, /posts/*, /news/*, /articles/*
- docs: /docs/*, /help/*, /guide/*, /api/*
- resources: /resources/*, /case-studies/*, /whitepapers/*
- products: /products/*, /features/*, /solutions/*
- other: Remaining content pages
```

### Phase 3: Representative Selection

Select pages to scrape (15-20 max for efficiency):

1. **Always include:** Homepage
2. **From each cluster:** First 2-3 URLs (alphabetically sorted for determinism)
3. **Prioritize:** Unique path patterns over similar pages

### Phase 4: Scraping

**Homepage (special handling):**

```javascript
mcp__firecrawl__firecrawl_scrape({
  url: homepage,
  formats: ['html', 'links', 'markdown'],
});
```

**Other pages (can be parallelized):**

```javascript
mcp__firecrawl__firecrawl_scrape({
  url: pageUrl,
  formats: ['html', 'links'],
});
```

**On failure - retry with wait:**

```javascript
mcp__firecrawl__firecrawl_scrape({
  url: pageUrl,
  formats: ['html', 'links'],
  waitFor: 5000, // Wait for JS rendering
});
```

**If still failing:**

- Try `waitFor: 10000`
- Mark page as unavailable
- Note in report limitations

### Phase 5: Structure Analysis

For each scraped page:

1. **Semantic HTML Analysis (Tier 1)**
   - Detect: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
   - Map to section types

2. **Class Name Pattern Matching (Tier 2)**
   - Apply regex patterns from `references/section-patterns.md`
   - Match against known section types

3. **LLM Classification (Tier 3 - Fallback only)**
   - Only for sections not classified by Tier 1 or 2
   - Use prompts from `references/analysis-prompts.md`

4. **Compute Structural Fingerprint**
   - Semantic tags present
   - Heading hierarchy (h1, h2, h3 sequence)
   - Section types detected
   - Media presence (images, videos)
   - Form presence
   - URL path pattern

### Phase 5.5: Layout/Motion Extraction (V2)

For enhanced output, extract implementation details:

1. **Framework Detection**
   - Identify JS framework (Next.js, Nuxt, React, Vue, etc.)
   - Detect CSS framework (Tailwind, Bootstrap, CSS Modules, etc.)
   - Identify CMS if applicable (Sanity, Contentful, WordPress, etc.)

2. **Layout Analysis**
   - Detect grid system (12-column, 16-column, flex, etc.)
   - Extract container max-width
   - Identify responsive breakpoints

3. **Animation Library Detection**
   - Primary animation library (GSAP, Framer Motion, Anime.js, CSS)
   - Scroll library (Lenis, Locomotive, native)

4. **Motion Pattern Identification**
   - Per-section motion behaviors (parallax, reveal, split-text)
   - Stagger patterns
   - Hover effects
   - Page transitions

5. **Design Token Extraction**
   - CSS custom properties from :root
   - Color palette
   - Typography scale
   - Spacing values

Reference `references/section-patterns.md` for detection patterns.

### Phase 6: Template Classification

1. **Group pages by fingerprint hash**
2. **Merge similar groups** (>80% Jaccard similarity on section types)
3. **Name templates** using the mapping:
   - `{hero, features, cta, testimonials}` → "Landing Page"
   - `{article, author, date}` → "Blog Post"
   - `{product-image, price, add-to-cart}` → "Product Detail"
   - `{grid, filters, pagination}` → "Listing Page"
   - `{form, input-fields}` → "Form Page"
   - `{sidebar, content, toc}` → "Documentation"

### Phase 7: Aggregate Analysis

Compile across all analyzed pages:

- **Internal link graph**: Which pages link to which
- **SEO observations**: Title/meta patterns, heading usage
- **Performance indicators**: Image-heavy pages, embedded media
- **Risks**: Orphan pages, duplicate content, missing metadata
- **Opportunities**: Quick wins for SEO, IA improvements

### Phase 8: Generate Reports

Generate both reports using templates from `references/output-templates.md`.

---

## Output Files

### 1. site-map-report.md

Comprehensive site intelligence report including:

- Executive summary
- Site hierarchy (Mermaid diagram with accessible colors)
- URL structure analysis
- Content clusters
- Template families
- Internal linking analysis
- SEO overview
- Performance observations
- Statistics
- Risks and opportunities
- Methodology and confidence levels

### 2. page-diagrams.md (Legacy)

Visual page structure documentation using ASCII wireframes:

- Diagram legend
- Homepage wireframe
- Template wireframes for each identified template family
- ASCII art showing section layout
- Section type annotations

### 3. page-structure.md (V2 - Preferred)

Tree-style component diagrams with implementation details:

- Hierarchical component trees with nesting notation
- Inline Tailwind-style class annotations
- Motion/animation behavior markers (✦)
- Observed tech stack (framework, animation library, etc.)
- Design token extraction
- Section dividers for visual clarity

### 4. component-specs/ (V2)

Machine-readable YAML specs per template family:

```
component-specs/
  homepage.yaml
  case-study.yaml
  blog-post.yaml
  documentation.yaml
  ...
```

Each YAML file includes:

- Meta information (template name, tech stack, confidence)
- Layout configuration (grid, breakpoints, container width)
- Sections with layers and columns
- Motion pattern definitions
- Design tokens (colors, typography, spacing)

Reference `references/component-schema.md` for full schema documentation.

### 5. agent-handoff.md (V2)

Ready-to-use prompt templates for AI agents to build from the analysis:

- File path placeholders for easy setup
- Figma wireframe generation prompt
- React/Next.js component generation prompt
- HTML/CSS prototype generation prompt
- Design system extraction prompt
- Section-by-section build prompt

This file enables handoff to any AI agent (Claude, GPT, etc.) for implementation.

---

## Error Handling

| Situation          | Action                                              |
| ------------------ | --------------------------------------------------- |
| Invalid URL        | Prompt user to provide valid URL                    |
| Site unreachable   | Report error, suggest checking URL                  |
| Empty map result   | Try with sitemap option, fall back to homepage-only |
| Scrape timeout     | Retry with `waitFor`, reduce sample size            |
| Rate limited       | Add delays, reduce parallelism                      |
| JS-heavy SPA       | Use longer `waitFor`, note limitations              |
| Auth-gated content | Analyze public pages only, note in limitations      |

---

## Confidence Reporting

Always include methodology and confidence in reports:

| Analysis       | High Confidence        | Medium Confidence   | Low Confidence         |
| -------------- | ---------------------- | ------------------- | ---------------------- |
| Site hierarchy | Full crawl data        | Partial crawl       | Inferred from search   |
| Templates      | DOM fingerprinting     | Class patterns only | Content inference      |
| SEO signals    | Direct meta extraction | Partial extraction  | Search result snippets |
| Linking        | Full link graph        | Sampled pages       | Estimated              |

---

## Reference Files

- `references/section-patterns.md` - Regex patterns for section detection, layout/motion detection (V2)
- `references/analysis-prompts.md` - Analysis heuristics and LLM prompts
- `references/output-templates.md` - Complete Markdown scaffolds for outputs (including V2 tree-style)
- `references/component-schema.md` - YAML schema for machine-readable component specs (V2)
- `examples/sample-output-excerpt.md` - Quality bar reference with V2 formats

---

## Usage Examples

**Basic usage:**

```
/website-intel https://stripe.com
```

**With output path:**

```
/website-intel https://linear.app ./analysis
```

**Expected interaction:**

1. User invokes skill with URL
2. Claude asks: Quick or Deep analysis?
3. User selects mode
4. Claude executes workflow
5. Claude generates both report files
6. Claude summarizes findings and provides file locations

---

## Implementation Notes

### Determinism Strategy

To ensure repeatable outputs:

- URL clustering uses deterministic regex
- Page selection uses alphabetical ordering
- Section detection prioritizes deterministic methods (semantic tags, class patterns)
- Template grouping uses hash-based fingerprints
- LLM usage minimized to summaries and fallback classification

### Performance Considerations

- Cap URL discovery at 500 to avoid excessive crawling
- Scrape 15-20 representative pages, not entire site
- Parallelize independent scrape operations
- Cache Firecrawl responses when possible

### Output Quality

- All diagrams use formats that render without external tools
- Mermaid for hierarchy diagrams (renders in GitHub, VS Code, Obsidian)
- ASCII art for page wireframes (universally viewable)
- Collapsible sections for large URL lists
