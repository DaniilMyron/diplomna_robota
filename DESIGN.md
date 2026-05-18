<!-- Design system contract. Components reference tokens, never hex literals. -->

# Design System

## Visual Language

{Describe the project's aesthetic commitment here.}

## Color Tokens

### Dark theme

| Token | Value | Purpose |
|---|---|---|
| `--background` | {hex} | App background |

### Light theme

| Token | Value | Purpose |
|---|---|---|
| `--background` | {hex} | App background |

## Usage rules

- Always reference tokens via `var(--token-name)`; never hard-code hex in component CSS.
- New tokens are added to every theme block at once — a token defined in only one theme is a bug.
