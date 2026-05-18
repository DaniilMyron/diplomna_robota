# Codex rules layout - shared at root, app-specific per app

The repo has two apps (`apps/client/`, `apps/server/`). Codex rules and configuration are organized in a hybrid layout: cross-cutting rules at the repo root, app-specific rules under each app.

## Layout

```text
/CODEX.md
/.codex/rules/

/apps/client/CODEX.md
/apps/client/.codex/rules/

/apps/server/CODEX.md
/apps/server/.codex/rules/
```

`CONTEXT.md` and `docs/adr/` continue to hold the domain glossary and decision history. They are referenced from `CODEX.md` files but not duplicated.

## Why this shape

Codex loads repo guidance from `CODEX.md` files. Shared rules belong at the root, while app-specific rules stay beside the app they govern.

1. Frontend-only rules should not pollute backend work.
2. Shared rules should not be duplicated.
3. Each `CODEX.md` opens with a scope guardrail so misplaced rules are easy to spot.

## Rule placement test

- **Both apps need it** -> `/CODEX.md` or `/.codex/rules/`.
- **Only one app needs it** -> that app's `CODEX.md` or sibling `.codex/rules/`.
- **Mixed** -> keep the shared rule at the root and document the carve-out inline.

## Conventions

- Each `CODEX.md` is a thin manifest that `@`-imports sibling rule files.
- `.codex/settings.local.json` is per-user and gitignored.
- Cross-app refactors should run from the repo root so both rule sets are visible.

## Rejected alternatives

- Everything at the root: too noisy for focused app work.
- Everything per-app: duplicated shared rules drift.
- Standalone rule files without a manifest: discovery becomes implicit and fragile.

## Consequences

- Adding a rule means choosing root vs. app and adding one manifest import.
- Shared decisions stay shared; app-specific guidance stays local.
