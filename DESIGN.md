<!-- Design system contract. Components reference tokens, never hex literals. -->

# Design System

## Visual Language

The application is a quiet, focused operational tool: a clean white interface with black text, restrained surfaces, rounded rectangles, and selective colorful accents on primary actions and status cues.

## Color Tokens

### Light theme

| Token | Value | Purpose |
|---|---|---|
| `--background` | `#ffffff` | App background |
| `--surface` | `#f7f7f8` | Secondary panels and columns |
| `--surface-strong` | `#ececf0` | Elevated muted surfaces |
| `--text` | `#111111` | Primary text |
| `--text-muted` | `#60636b` | Secondary text |
| `--border` | `#d9dce3` | Dividers and outlines |
| `--accent` | `#2563eb` | Primary actions |
| `--accent-strong` | `#1d4ed8` | Primary action hover |
| `--success` | `#16a34a` | Done status |
| `--warning` | `#f59e0b` | In-progress status |
| `--danger` | `#dc2626` | Destructive actions |

## Usage rules

- Always reference tokens via `var(--token-name)`; never hard-code hex in component CSS.
- New tokens are added to every theme block at once - a token defined in only one theme is a bug.
- Prefer rounded rectangles and squares over pill-heavy styling.
- Use color mainly for actions, focus, and task status; keep the surrounding workspace visually calm.
