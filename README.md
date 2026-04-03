# Design Company Skills

A curated collection of Claude skills and commands for design agency workflows. Extend Claude's capabilities for brand strategy, design systems, content creation, and creative operations.

## Skills vs Commands

| Type | Purpose | Activation |
|------|---------|------------|
| **Skills** | Domain knowledge, auto-activating expertise | Context-based, automatic |
| **Commands** | User-invoked workflows, repeatable actions | `/command-name`, manual |

## Repository Structure

```
design-company-skills/
├── commands/                 # User-invoked workflows
│   ├── daily/                # Daily productivity & planning
│   ├── thinking/             # Critical thinking tools
│   ├── meetings/             # Meeting workflows
│   ├── content/              # Content creation
│   └── creative/             # Creative research & analysis
├── skills/                   # Auto-activating expertise
│   ├── brand/                # Brand strategy & identity
│   ├── design/               # Design systems & UI/UX
│   ├── code/                 # Component libraries & frameworks
│   ├── operations/           # Business operations
│   └── development/          # Development workflows
└── templates/                # Skill templates
```

---

## Commands

### Daily Productivity (`commands/daily/`)

| Command | Description |
|---------|-------------|
| [/daily-brief](commands/daily/daily-brief.md) | Morning briefing aggregating email, calendar, tasks, and social analytics |
| [/weekly-recap](commands/daily/weekly-recap.md) | End-of-week summary for personal reflection and planning |
| [/kickoff-prep](commands/daily/kickoff-prep.md) | Generate project kickoff materials from brief or proposal |

### Critical Thinking (`commands/thinking/`)

| Command | Description |
|---------|-------------|
| [/devils-advocate](commands/thinking/devils-advocate.md) | Challenge assumptions, identify weaknesses, red-team current thinking |
| [/pre-mortem](commands/thinking/pre-mortem.md) | "Imagine this failed—why?" Future-failure analysis before execution |

### Meetings (`commands/meetings/`)

| Command | Description |
|---------|-------------|
| [/meeting-brief](commands/meetings/meeting-brief.md) | Interactive agenda creation workflow through guided questions |
| [/meeting-recap](commands/meetings/meeting-recap.md) | Post-meeting documentation with action items, owners, and deadlines |

### Content Creation (`commands/content/`)

| Command | Description |
|---------|-------------|
| [/social-post](commands/content/social-post.md) | Guided content creation for LinkedIn, Instagram, or Substack |
| [/case-study](commands/content/case-study.md) | Generate case study draft from project data and outcomes |

### Creative Research (`commands/creative/`)

| Command | Description |
|---------|-------------|
| [/site-analysis](commands/creative/site-analysis/) | Analyze websites for architecture, SEO, templates, and design tokens |

---

## Skills

### Brand (`skills/brand/`)

| Skill | Description |
|-------|-------------|
| [brand-voice](skills/brand/brand-voice.md) | Write content matching defined brand voice and tone |
| [open-session-brand](skills/brand/open-session-brand.md) | Open Session official brand colors, typography, and style |
| [tone-of-voice-audit](skills/brand/tone-of-voice-audit.md) | Audit content against brand voice guidelines, score adherence |
| [brand-guidelines-template](skills/brand/brand-guidelines-template.md) | Customizable brand identity skill template |

### Design (`skills/design/`)

| Skill | Description |
|-------|-------------|
| [design-feedback](skills/design/design-feedback.md) | Structured, actionable feedback on visual designs |
| [frontend-design](skills/design/frontend-design.md) | Production-grade frontend interfaces with intentional aesthetics |
| [accessibility-audit](skills/design/accessibility-audit.md) | WCAG compliance checking and accessibility issue identification |
| [design-critique-facilitator](skills/design/design-critique-facilitator.md) | Run structured design critiques with roles and frameworks |
| [design-system-scaffolder](skills/design/design-system-scaffolder.md) | Establish and document design systems from scratch |

### Code (`skills/code/`)

| Skill | Description |
|-------|-------------|
| [component-system](skills/code/component-system.md) | Configurable component library integration (Untitled UI, ShadCN, Radix, Chakra) |

### Operations (`skills/operations/`)

| Skill | Description |
|-------|-------------|
| [skill-creator](skills/operations/skill-creator.md) | Guide for creating effective Claude skills |
| [decision-framework](skills/operations/decision-framework.md) | Apply structured decision-making (RAPID, DACI, etc.) |

### Development (`skills/development/`)

| Skill | Description |
|-------|-------------|
| [systematic-debugging](skills/development/systematic-debugging.md) | Four-phase methodology for diagnosing and resolving issues |
| [verification-before-completion](skills/development/verification-before-completion.md) | Evidence-based completion claims with fresh verification |
| [design-system-quality](skills/development/design-system-quality.md) | Quality gates for design system compliance and accessibility |
| [performance-review](skills/development/performance-review.md) | Analyze code/sites for performance issues and optimizations |

---

## Using in Claude Desktop

### Adding Commands

1. Open Claude Desktop
2. Go to **Settings** > **Commands** (or **Skills**)
3. Click **Add Command**
4. Copy the contents of the command `.md` file
5. Paste and save

### Adding Skills

1. Open Claude Desktop
2. Go to **Settings** > **Skills**
3. Click **Add Skill** or **Import from File**
4. Select or paste the skill `.md` file

---

## MCP Dependencies

Some commands integrate with external services via MCP servers:

| Command | Required MCPs |
|---------|---------------|
| `/daily-brief` | Gmail, Google Calendar, Notion |
| `/meeting-brief` | Google Calendar (for agenda update) |
| `/meeting-recap` | Notion (optional, for storage) |
| `/site-analysis` | Firecrawl (for deep analysis mode) |

---

## Creating New Skills

Use the template at `templates/skill-template.md` or see [skill-creator](skills/operations/skill-creator.md) for guidance.

### Skill Anatomy

```markdown
# Skill Name

Brief description of what this skill does.

## Purpose

Why this skill exists.

## When to Activate

- Trigger condition 1
- Trigger condition 2

## Instructions

Detailed instructions for Claude to follow...

## Examples

Show input/output examples...
```

### Best Practices

1. **Be specific** - Vague instructions produce vague results
2. **Include examples** - Show Claude what good output looks like
3. **Define boundaries** - What should the skill NOT do?
4. **Test iteratively** - Refine based on actual usage

---

## Contributing

1. Create a new branch for your skill/command
2. Add your file to the appropriate category folder
3. Test in Claude Desktop
4. Submit a PR with usage examples

---

## License

MIT License - See [LICENSE](LICENSE) for details.
