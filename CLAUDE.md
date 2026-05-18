# Repo rules

> **Scope of this file:** rules here apply to the **whole repo** — client and server. App-specific rules live in `apps/client/CLAUDE.md` and `apps/server/CLAUDE.md`. If a rule applies to only one app, put it there, not here. See `docs/adr/0001-claude-rules-layout.md`.

## Layout

- `apps/client/` — Vite + React frontend
- `apps/server/` — NestJS backend
- `packages/` — shared packages (currently empty)
- `docs/adr/` — architecture decision records
- `CONTEXT.md` — domain glossary (read first for unfamiliar terms)

When working inside an app, launch Claude Code from that app's directory so its `CLAUDE.md` is loaded alongside this one. Cross-cutting work (e.g. changing the auth structural rules between client and server) is fine from the repo root.

## Per-module context docs (`MODULE.md`)

Every module under `apps/client/src/modules/` and `apps/server/src/` has a colocated `MODULE.md` that captures non-obvious context: purpose, public surface, what the module owns (DB tables, API routes, ports, providers), what it depends on, the cross-app contract if any, gotchas, and out of scope. **Read it before exploring a module's code.**

**Update rule (mandatory):** the same PR that changes any of the following must also update that module's `MODULE.md`:

- the module's **public surface** — for client modules, `index.ts` exports; for server modules, controller routes and public service methods,
- what the module **owns** — DB tables, API route prefixes, ports/adapters, mounted providers,
- what the module **depends on** — cross-module imports of public APIs.

Trivial implementation changes inside a module that don't touch any of the three do **not** require a `MODULE.md` change. A stale `MODULE.md` is worse than no `MODULE.md` — keep it accurate or delete the section that's drifted.

Index of all modules: `docs/modules.md`. Rationale: `docs/adr/0002-per-module-context-docs.md`.

## Shared rules

@.claude/rules/code-style.md
@.claude/rules/conventions.md
@.claude/rules/workflow.md

## Domain language

Domain terms are defined in `CONTEXT.md`. Use them as written. If you find yourself wanting a synonym, update `CONTEXT.md` first.

## Auth contract (cross-cutting)

> **Auth mechanism: TBD.** Define your auth provider/token scheme here (and in `docs/adr/` when chosen). The structural rules below hold regardless of mechanism.

The client and server share a single auth contract. Implementation details for each side live in that side's `CLAUDE.md`; the structural rules are shared truth:

- There is a single canonical user identifier across the system. The server stores it as the primary key on its users table. We do not issue surrogate ids; new tables that reference users use that identifier as a foreign key.
- The client obtains a credential (token/session) and attaches it to every request to the server.
- The server authenticates every request by default via a global guard; identity is read via `@CurrentUser()`; public routes need an explicit `@Public()`. Authorization lives in the service, with the actor passed as the first argument.
