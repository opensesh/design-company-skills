# Component System

Use a component library as the foundation for building interfaces. Configure your preferred system below.

## Purpose

Ensure Claude leverages your chosen component library rather than building from scratch. This skill provides a consistent approach to component-based development regardless of which library you use.

## When to Activate

Use this skill when:
- Building new UI components or pages
- User mentions components, UI library, or design system
- Creating interfaces that should use existing patterns
- Need to maintain consistency with established components

---

## Configuration

**Customize this section for your project.**

### Active Component System

```yaml
library: untitled-ui  # Options: untitled-ui, shadcn, radix, chakra, custom
version: "8"
mcp_available: true   # Set false if no MCP server for this library
```

### Library Details

| Library | Type | MCP Server | Install Method |
|---------|------|------------|----------------|
| Untitled UI | Paid (free tier) | Yes | `npx @untitledui/cli add <component>` |
| ShadCN | Free/Open Source | No | `npx shadcn@latest add <component>` |
| Radix | Free/Open Source | No | `npm install @radix-ui/<component>` |
| Chakra | Free/Open Source | No | `npm install @chakra-ui/react` |

---

## Core Principle

**Always search before building.** Your component library likely has what you need. Never build from scratch without first checking the library.

---

## General Workflow

### Step 1: Identify the Need

Before searching or building:
- What type of UI? (dashboard, marketing, form, data display)
- What functionality? (auth, navigation, data entry, feedback)
- What existing patterns apply?

### Step 2: Search the Library

Check your component library first:
- Browse documentation or component list
- Use MCP tools if available
- Search by concept, not just name

### Step 3: Install Component

Use the library's CLI or package manager:
```bash
# Untitled UI
npx @untitledui/cli add button-01

# ShadCN
npx shadcn@latest add button

# Radix
npm install @radix-ui/react-dialog

# Chakra
# Components included in main package
```

### Step 4: Customize

Adapt the component to your needs:
- Apply project styling/tokens
- Add business logic
- Integrate with state management
- Maintain accessibility features

---

## Library-Specific Guides

### Untitled UI

**When MCP is available**, use these tools:

| Tool | Purpose |
|------|---------|
| `search_components` | Semantic search (understands visual concepts) |
| `list_components` | Browse by category |
| `get_component` | Get CLI install command |
| `get_component_bundle` | Install multiple at once |
| `get_page_templates` | Full page layouts |
| `search_icons` | Find icons by name/concept |

**Categories:** `base`, `application`, `marketing`, `foundations`

**Search examples:**
```
"login page with social auth buttons"
"pricing table with feature comparison"
"dashboard sidebar with navigation"
```

**Icons:** Always verify with `search_icons` before importing.
```tsx
import { Settings01, ArrowRight } from '@untitledui/icons'
```

**Note:** Some components require PRO license. Follow `agent_instructions` if returned.

---

### ShadCN

**CLI-based installation** - components are copied into your project:

```bash
# Initialize (first time)
npx shadcn@latest init

# Add components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

**Component reference:** https://ui.shadcn.com/docs/components

**Key concepts:**
- Components copied to `components/ui/`
- Full ownership - modify freely
- Built on Radix primitives
- Tailwind CSS styling
- No runtime dependency

**Common components:**
- `button`, `input`, `label`, `textarea`
- `dialog`, `sheet`, `popover`, `tooltip`
- `table`, `tabs`, `accordion`
- `form` (with react-hook-form)
- `toast`, `alert`, `badge`

**Blocks** (full sections):
```bash
npx shadcn@latest add login-01
npx shadcn@latest add dashboard-01
```

---

### Radix UI

**Primitive-focused** - unstyled, accessible components:

```bash
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs
```

**Usage pattern:**
```tsx
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Best for:** Custom design systems needing accessible primitives.

---

### Chakra UI

**Runtime styling** - props-based component API:

```tsx
import { Button, Stack, Input } from '@chakra-ui/react'

<Stack spacing={4}>
  <Input placeholder="Email" />
  <Button colorScheme="blue">Submit</Button>
</Stack>
```

**Key features:**
- Style props (`bg`, `p`, `m`, `color`)
- Built-in dark mode
- Responsive array syntax
- Theme customization

---

## Component Categories

Regardless of library, components typically fall into:

| Category | Examples |
|----------|----------|
| **Layout** | Container, Stack, Grid, Flex, Divider |
| **Navigation** | Navbar, Sidebar, Tabs, Breadcrumb, Pagination |
| **Forms** | Input, Select, Checkbox, Radio, Switch, Slider |
| **Feedback** | Alert, Toast, Progress, Skeleton, Spinner |
| **Overlay** | Modal, Dialog, Drawer, Popover, Tooltip |
| **Data Display** | Table, Card, List, Avatar, Badge |
| **Actions** | Button, IconButton, Menu, Dropdown |

---

## Best Practices

### Do:
- Search library before building custom
- Use semantic search when available
- Follow library's composition patterns
- Maintain accessibility features
- Document customizations

### Don't:
- Build what exists in your library
- Override accessibility attributes carelessly
- Mix multiple component libraries unnecessarily
- Ignore library conventions

---

## Decision Guide

**When to use library component:**
- Standard UI pattern exists
- Accessibility is handled
- Matches design intent (with customization)

**When to build custom:**
- Truly unique interaction
- Library lacks the pattern
- Significant deviation from library's approach

**When to extend:**
- Library component is close but needs additions
- Wrap library component with custom logic
- Add project-specific variants

---

## Integration with Other Skills

- **frontend-design**: Component library as implementation layer
- **design-system-scaffolder**: Document chosen library as foundation
- **accessibility-audit**: Leverage library's built-in a11y

---

*Configure the "Active Component System" section above for your project.*

*Version: 1.0*
