# Website Intelligence Skill

Analyze any website and generate structured intelligence reports with site architecture, component hierarchies, and machine-readable specs for AI implementation.

## Purpose

This skill performs comprehensive website analysis and generates deliverables for both human review and AI implementation. It's designed for designers researching competitor sites, developers understanding existing architectures, or AI agents building from analyzed patterns.

## When to Activate

Use this skill when:
- Analyzing competitor or reference websites
- Understanding site architecture before a redesign
- Documenting design patterns and component structures
- Generating specs for AI-assisted development
- Performing SEO audits and content inventory

## Outputs

| File | Audience | Purpose |
|------|----------|---------|
| `site-map-report.md` | Humans | Bird's-eye view of site architecture, SEO, performance |
| `page-structure.md` | Humans + AI | Tree-style component hierarchies with motion annotations |
| `component-specs/*.yaml` | AI agents | Machine-readable implementation specs |
| `agent-handoff.md` | AI agents | Ready-to-use prompt templates for building |

## Installation

### For Claude Code CLI

Copy the entire `website-intelligence/` folder to your Claude skills directory:

```bash
cp -r website-intelligence ~/.claude/skills/
```

### For Claude Desktop

1. Open SKILL.md
2. Copy the contents
3. In Claude Desktop: **Settings** > **Skills** > **Add Skill**
4. Paste and save

Note: The references and examples are used by the skill internally. For Claude Desktop, you may need to consolidate into a single file.

## Usage

```
/website-intel https://example.com ./output
```

The skill will prompt you to choose:
- **Quick Mode** - Web search reconnaissance (faster, lighter)
- **Deep Mode** - Firecrawl comprehensive crawl (detailed, requires MCP)

## Requirements

### Quick Mode
- WebSearch tool
- WebFetch tool

### Deep Mode
- Firecrawl MCP server configured

## File Structure

```
website-intelligence/
├── SKILL.md                    # Main skill definition
├── README.md                   # This file
├── references/
│   ├── output-templates.md     # Markdown templates for outputs
│   ├── section-patterns.md     # Regex patterns for section detection
│   ├── component-schema.md     # YAML schema for component specs
│   └── analysis-prompts.md     # LLM prompts for analysis
└── examples/
    └── sample-output-excerpt.md # Quality reference examples
```

## Example Output

### Tree-Style Component Diagram (page-structure.md)

```
HERO [h-screen, relative, overflow-hidden]
├─ BG-VIDEO [absolute, inset-0, object-cover]
│  └─ autoplay, muted, loop
├─ OVERLAY [bg-gradient-to-b from-black/60]
└─ CONTENT [flex, flex-col, justify-center]
   ├─ HEADLINE [text-display, font-bold]
   │  └─ ✦ split-line-reveal on-load
   └─ CTA-GROUP [flex, gap-4]
      └─ ✦ stagger fade-up
```

### Agent Handoff Prompt

The `agent-handoff.md` file includes ready-to-use prompts for:
- Figma wireframe generation
- React/Next.js component generation
- HTML/CSS prototypes
- Design system extraction
- Section-by-section building

## Related Skills

- `design-system-quality` - For validating generated design systems
- `systematic-debugging` - For troubleshooting analysis issues

---

*Version: 2.0 | Last Updated: 2026-04-03*
