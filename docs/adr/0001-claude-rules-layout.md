# Claude Code rules layout — shared at root, app-specific per app

The repo is a pnpm + Turborepo monorepo with two apps (`apps/client/`, `apps/server/`). Claude Code rules and configuration are organized in a hybrid layout: cross-cutting rules at the repo root, app-specific rules under each app.

## Layout

```
/CLAUDE.md                           ← cross-cutting rules; @-imports shared rule files
/.claude/
  rules/
    code-style.md                    ← TypeScript style (applies everywhere)
    conventions.md                   ← dates, strict TS, file naming
    workflow.md                      ← the per-task agent loop
  settings.local.json                ← per-user permissions (gitignored)

/apps/client/CLAUDE.md               ← frontend-only rules; @-imports client rule files
/apps/client/.claude/
  rules/
    frontend-architecture.md
    folder-structure.md
    error-handling.md
    testing.md
    http.md
    logging.md

/apps/server/CLAUDE.md               ← backend-only rules; @-imports server rule files
/apps/server/.claude/
  rules/
    error-handling.md
    folder-structure.md
    backend-architecture.md
    security.md
    testing.md
```

`CONTEXT.md` and `docs/adr/` continue to hold domain glossary and decision history. They are referenced from `CLAUDE.md` files but not duplicated.

## Why this shape

Claude Code's `CLAUDE.md` discovery walks **up** the directory tree from the current working directory and merges every `CLAUDE.md` it finds. This means launching from `apps/client/` automatically loads `/CLAUDE.md` + `apps/client/CLAUDE.md`, while launching from the repo root loads only `/CLAUDE.md`.

Three forces shape the layout:

1. **Frontend-only rules must not pollute backend sessions.** A NestJS contributor working in `apps/server/` should not have to read about React component decomposition to do their job correctly. Putting client-specific rules in `apps/client/CLAUDE.md` keeps them out of server sessions.
2. **Shared rules must not be duplicated.** Shared TypeScript style (guard clauses, explaining variables, no `any`), file naming, ISO dates, and the agent workflow apply equally to both apps. Putting them at the root means both sides inherit them automatically and they cannot drift.
3. **The split must remain honest.** In a hurry, a rule lands in the wrong place. Each `CLAUDE.md` opens with a one-line scope guardrail ("rules here apply to X only — promote to root if shared") so the test is read every session.

## Rule placement test

When writing a new rule, ask: *would a contributor working in only one app need this rule to do their job correctly?*

- **Both apps need it** → `/CLAUDE.md` (or `/.claude/rules/` if it deserves its own file).
- **Only one app needs it** → that app's `CLAUDE.md` (or its `.claude/rules/`).
- **Mixed** (most of the rule applies to both, with a small app-specific carve-out) → put the rule at the root and document the carve-out inline, with a pointer to the per-app file if the carve-out is large.

## Conventions

- Each `CLAUDE.md` is a thin index that `@`-imports rule files from its sibling `.claude/rules/` directory. Source of truth is the rule file; the `CLAUDE.md` is just the manifest. This keeps rule files small and editable in isolation while ensuring they are loaded automatically (`@`-imports are resolved by Claude Code at session start).
- `.claude/settings.local.json` is per-user permissions and is gitignored at every level. `.claude/settings.json` (if added later for shared permissions) is committed.
- Slash commands and sub-agents are not split per app today — Claude Code discovers them only at the project root. When a frontend- or backend-specific command becomes necessary, prefix the name (`/fe-…`, `/be-…`).

## Rejected alternatives

- **Everything at the root.** Simple, but every server session loads frontend rules and vice versa. The whole point of the split is to prevent this. Rejected.
- **Everything per-app, nothing at the root.** Forces duplication of TypeScript style, conventions, and the workflow across `apps/client/` and `apps/server/`. The duplicated copies will drift the first time one is updated and the other is not. Rejected.
- **A single `CLAUDE.md` at the root with section markers** (e.g. `## [client-only]`, `## [server-only]`) and instructions for Claude to ignore irrelevant sections. Workable in principle, but it relies on Claude consistently filtering by section, and it still loads every section into context regardless. The directory-walk merge is built into Claude Code; using it is strictly cheaper. Rejected.
- **Keep rule files only as standalone `.md` under `.claude/rules/` without a `CLAUDE.md` index.** Claude Code only auto-loads `CLAUDE.md`. Other markdown files in `.claude/` are not discovered unless something links to them. Rejected.

## Consequences

- Adding a new rule means a one-decision placement (root vs. app) plus a one-line `@`-import in the relevant `CLAUDE.md`.
- The `apps/server/.claude/rules/` directory carries a `.gitkeep` so the symmetry is visible even when its file set changes.
- `.claude/settings.local.json` is per-user. Permissions that the team wants every contributor to have should go in `.claude/settings.json` (committed), not `settings.local.json`.
- Cross-app refactors (e.g. changing the auth structural rules) should run from the repo root so both sides' rules are visible in one session.
