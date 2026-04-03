# Analysis Prompts & Heuristics

This reference contains analysis workflows, heuristics, and LLM prompts for website intelligence gathering.

---

## URL Clustering Heuristics

### Deterministic Classification Algorithm

```python
def classify_urls(urls: list[str]) -> dict:
    clusters = {
        "navigation": [],
        "utility": [],
        "blog": [],
        "docs": [],
        "resources": [],
        "products": [],
        "portfolio": [],
        "other": []
    }

    for url in urls:
        path = urlparse(url).path.lower()

        # Check patterns in order of specificity
        if re.match(UTILITY_PATTERN, path):
            clusters["utility"].append(url)
        elif re.match(ABOUT_PATTERN, path):
            clusters["navigation"].append(url)
        elif re.match(BLOG_PATTERN, path):
            clusters["blog"].append(url)
        elif re.match(DOCS_PATTERN, path):
            clusters["docs"].append(url)
        elif re.match(RESOURCES_PATTERN, path):
            clusters["resources"].append(url)
        elif re.match(PRODUCTS_PATTERN, path):
            clusters["products"].append(url)
        elif re.match(PORTFOLIO_PATTERN, path):
            clusters["portfolio"].append(url)
        elif path in ['/', '']:
            clusters["navigation"].insert(0, url)  # Homepage first
        elif path.count('/') == 1:
            clusters["navigation"].append(url)  # Top-level pages
        else:
            clusters["other"].append(url)

    return clusters
```

### Representative Selection

```python
def select_representatives(clusters: dict, max_total: int = 20) -> list[str]:
    selected = []

    # Always include homepage
    if clusters["navigation"]:
        homepage = clusters["navigation"][0]
        if homepage.endswith('/') or urlparse(homepage).path in ['/', '']:
            selected.append(homepage)

    # Budget allocation per cluster
    non_empty_clusters = [k for k, v in clusters.items() if v and k != "navigation"]
    per_cluster = max(2, (max_total - 1) // max(len(non_empty_clusters), 1))

    for cluster_name, urls in clusters.items():
        if cluster_name == "navigation":
            # Add top-level nav pages (skip homepage if already added)
            for url in sorted(urls)[:3]:
                if url not in selected:
                    selected.append(url)
        else:
            # Add first N URLs alphabetically from each cluster
            for url in sorted(urls)[:per_cluster]:
                selected.append(url)

        if len(selected) >= max_total:
            break

    return selected[:max_total]
```

---

## SEO Analysis Checklist

### Metadata Extraction

For each page, extract and evaluate:

| Element                     | What to Check                  | Quality Indicators                   |
| --------------------------- | ------------------------------ | ------------------------------------ |
| `<title>`                   | Present, unique, 50-60 chars   | Contains keywords, brand at end      |
| `<meta name="description">` | Present, unique, 150-160 chars | Compelling, includes CTA             |
| `<h1>`                      | Exactly one per page           | Descriptive, contains keywords       |
| `<h2>`-`<h6>`               | Proper hierarchy               | No skipped levels                    |
| `<meta property="og:*">`    | Image, title, description      | Properly sized image                 |
| `<link rel="canonical">`    | Present, correct URL           | Self-referencing or proper canonical |
| `<meta name="robots">`      | Present if needed              | Appropriate directives               |
| Structured data             | JSON-LD or microdata           | Valid schema.org types               |

### SEO Quality Scoring

```javascript
function scoreSEO(page) {
  let score = 0;
  const issues = [];

  // Title
  if (page.title) {
    score += 15;
    if (page.title.length < 30) issues.push('Title too short');
    if (page.title.length > 60) issues.push('Title may truncate in SERPs');
  } else {
    issues.push('Missing title tag');
  }

  // Meta description
  if (page.metaDescription) {
    score += 15;
    if (page.metaDescription.length < 120) issues.push('Meta description too short');
    if (page.metaDescription.length > 160) issues.push('Meta description may truncate');
  } else {
    issues.push('Missing meta description');
  }

  // H1
  if (page.h1Count === 1) {
    score += 20;
  } else if (page.h1Count === 0) {
    issues.push('Missing H1');
  } else {
    issues.push('Multiple H1 tags');
    score += 10;
  }

  // Heading hierarchy
  if (page.headingHierarchyValid) {
    score += 10;
  } else {
    issues.push('Heading hierarchy skips levels');
  }

  // Open Graph
  if (page.hasOgTags) score += 10;
  else issues.push('Missing Open Graph tags');

  // Canonical
  if (page.hasCanonical) score += 10;
  else issues.push('Missing canonical tag');

  // Images
  if (page.imagesWithAlt / page.totalImages > 0.9) {
    score += 10;
  } else {
    issues.push('Images missing alt text');
  }

  // Internal links
  if (page.internalLinkCount > 0) score += 10;
  else issues.push('No internal links');

  return { score, issues, maxScore: 100 };
}
```

---

## Performance Indicator Checklist

### Observables from HTML

| Indicator        | What to Look For                     | Concern Level            |
| ---------------- | ------------------------------------ | ------------------------ |
| Image count      | `<img>` tags                         | >20 images = investigate |
| Large images     | width/height attributes              | >2000px dimensions       |
| Embedded video   | `<video>`, `<iframe>` youtube/vimeo  | Note presence            |
| External scripts | `<script src="...">`                 | >10 scripts = concern    |
| Inline styles    | `style=""` attributes                | Excessive = bloat        |
| Web fonts        | `fonts.googleapis.com`, `@font-face` | >3 font families         |
| Third-party tags | analytics, tracking pixels           | Note for disclosure      |

### Performance Scoring Heuristics

```javascript
function assessPerformance(page) {
  const observations = [];

  if (page.imageCount > 20) {
    observations.push({
      type: 'warning',
      message: `Image-heavy page (${page.imageCount} images)`,
    });
  }

  if (page.hasVideo) {
    observations.push({
      type: 'info',
      message: 'Contains embedded video',
    });
  }

  if (page.externalScriptCount > 10) {
    observations.push({
      type: 'warning',
      message: `Many external scripts (${page.externalScriptCount})`,
    });
  }

  if (page.thirdPartyDomains.length > 5) {
    observations.push({
      type: 'info',
      message: `Loads from ${page.thirdPartyDomains.length} third-party domains`,
    });
  }

  return observations;
}
```

---

## LLM Fallback Prompts

Use these prompts only when deterministic methods (Tier 1 + 2) cannot classify a section.

### Section Classification (Tier 3 Fallback)

````
You are analyzing a section of HTML that could not be classified by semantic tags or class name patterns.

HTML snippet:
```html
{html_snippet}
````

Based on the content and structure, classify this section as ONE of:

- hero: Large banner with headline, subheadline, and CTA
- navigation: Menu links, breadcrumbs
- features: Grid or list of product/service features
- testimonials: Customer quotes, reviews, star ratings
- pricing: Pricing tables, plan comparisons
- cta: Call-to-action block with signup/contact form
- content: Article body, text content
- faq: Questions and answers, accordion
- grid: Card layout, image gallery
- form: Input forms
- media: Video embed, image gallery
- footer: Site footer with links
- stats: Numbers, metrics, achievements
- team: People profiles
- other: Cannot determine

Respond with JSON:
{
"type": "<section_type>",
"confidence": "high" | "medium" | "low",
"reason": "<brief explanation>"
}

```

### Template Classification (When Fingerprint Unclear)

```

Given the following page structure analysis:

URL: {url}
Sections detected: {section_list}
Has form: {boolean}
Has sidebar: {boolean}
Path pattern: {path}

What type of page template is this most likely?

Options:

- Homepage
- Landing Page
- Blog Post
- Blog Listing
- Documentation
- Product Page
- Pricing Page
- Contact Page
- About Page
- Generic Content

Respond with:
{
"template": "<template_name>",
"confidence": "high" | "medium" | "low",
"userGoal": "<what the user is trying to accomplish on this page>"
}

```

---

## Quick Mode Synthesis Prompts

### Site Structure Inference

```

Based on web search results for {domain}, synthesize the site structure:

Search results summary:
{search_results_text}

Homepage content summary:
{homepage_content}

Infer:

1. Main navigation sections (top-level pages)
2. Content clusters (blog, docs, resources, etc.)
3. Likely page templates used
4. Primary purpose of the site
5. Target audience

Be explicit about what is observed vs. inferred. Mark confidence levels.

```

### Quick Mode Content Analysis

```

Analyze this page content fetched from {url}:

{page_content}

Identify:

1. Page purpose and user goal
2. Main sections (infer from headings and content blocks)
3. Key CTAs present
4. SEO signals (title, headings, keywords)

Note: This is content-only analysis without DOM structure access.

````

---

## Risk & Opportunity Identification

### Risk Patterns

```javascript
const RISK_PATTERNS = {
  // Technical risks
  "orphan_pages": (site) => site.pages.filter(p => p.inboundLinks === 0).length > 0,
  "deep_pages": (site) => site.pages.some(p => p.depth > 4),
  "missing_meta": (site) => site.pages.filter(p => !p.metaDescription).length > site.pages.length * 0.2,
  "duplicate_titles": (site) => new Set(site.pages.map(p => p.title)).size < site.pages.length,
  "no_canonical": (site) => site.pages.filter(p => !p.canonical).length > 0,

  // Content risks
  "thin_content": (page) => page.wordCount < 300,
  "broken_links": (site) => site.brokenLinks.length > 0,

  // UX risks
  "no_mobile_meta": (page) => !page.hasViewportMeta,
  "slow_indicators": (page) => page.imageCount > 30 || page.scriptCount > 15
};
````

### Risk Severity Classification

| Severity | Criteria                                   |
| -------- | ------------------------------------------ |
| Critical | Blocks indexing, major UX issue            |
| High     | Significant SEO impact, conversion blocker |
| Medium   | Suboptimal but functional                  |
| Low      | Best practice recommendation               |

### Opportunity Identification

```javascript
const OPPORTUNITIES = [
  {
    check: (site) => !site.pages.some((p) => p.hasStructuredData),
    suggestion: 'Add structured data (JSON-LD) for rich snippets',
    impact: 'high',
  },
  {
    check: (site) => site.blogCluster.length > 5 && !site.pages.some((p) => p.hasCategoryNav),
    suggestion: 'Add category/tag navigation for blog content',
    impact: 'medium',
  },
  {
    check: (site) => site.pages.filter((p) => !p.hasOgImage).length > site.pages.length * 0.5,
    suggestion: 'Add Open Graph images for better social sharing',
    impact: 'medium',
  },
  {
    check: (site) => site.avgInternalLinks < 3,
    suggestion: 'Increase internal linking for better crawlability',
    impact: 'high',
  },
  {
    check: (page) => page.hasPricing && !page.hasComparison,
    suggestion: 'Add pricing comparison table',
    impact: 'medium',
  },
];
```

---

## Report Generation Prompts

### Executive Summary Generation

```
Generate a 2-3 paragraph executive summary for this site analysis:

Domain: {domain}
Site purpose: {inferred_purpose}
Pages analyzed: {count}
Template families: {template_count}
Key findings:
- {finding_1}
- {finding_2}
- {finding_3}

Top risks: {risks}
Top opportunities: {opportunities}

Write in professional, objective tone. Lead with the most important insight.
Do not use marketing language or superlatives. Be specific with numbers.
```

### Findings Prioritization

```
Given these analysis findings, prioritize by impact:

Findings:
{findings_list}

Categorize each as:
- Critical: Must address immediately
- High: Should address soon
- Medium: Worth addressing
- Low: Nice to have

Explain the business impact for the top 3 items.
```
