# Repo rules

> **Scope of this file:** rules here apply to the **whole repo** - client and server. App-specific rules live in `apps/client/CODEX.md` and `apps/server/CODEX.md`. If a rule applies to only one app, put it there, not here. See `docs/adr/0001-codex-rules-layout.md`.

## Layout

- `apps/client/` - Vite + React frontend
- `apps/server/` - Java Spring backend
- `docs/adr/` - architecture decision records
- `CONTEXT.md` - domain glossary (read first for unfamiliar terms)

When working inside an app, launch Codex from that app's directory so its `CODEX.md` is loaded alongside this one. Cross-cutting work is fine from the repo root.

## Per-module context docs (`MODULE.md`)

Every module under `apps/client/src/modules/` and `apps/server/src/main/java/` has a colocated `MODULE.md` that captures non-obvious context: purpose, public surface, what the module owns (DB tables, API routes, ports, providers), what it depends on, the cross-app contract if any, gotchas, and out of scope. **Read it before exploring a module's code.**

**Update rule (mandatory):** the same PR that changes any of the following must also update that module's `MODULE.md`:

- the module's **public surface** - for client modules, `index.ts` exports; for server modules, controller routes and public service/port methods,
- what the module **owns** - DB tables, API route prefixes, ports/adapters, mounted providers,
- what the module **depends on** - cross-module imports of public APIs.

Trivial implementation changes inside a module that do not touch any of the three do **not** require a `MODULE.md` change. A stale `MODULE.md` is worse than no `MODULE.md` - keep it accurate or delete the section that drifted.

Index of all modules: `docs/modules.md`. Rationale: `docs/adr/0002-per-module-context-docs.md`.

## Shared rules

@.codex/rules/code-style.md
@.codex/rules/conventions.md
@.codex/rules/workflow.md

## Domain language

Domain terms are defined in `CONTEXT.md`. Use them as written. If you find yourself wanting a synonym, update `CONTEXT.md` first.

## Auth contract (cross-cutting)

> **Auth mechanism: TBD.** Define the auth provider/token scheme here and in `docs/adr/` when chosen. The structural rules below hold regardless of mechanism.

The client and server share a single auth contract:

- There is a single canonical user identifier across the system. The server stores it as the primary key on its users table. New tables that reference users use that identifier as a foreign key.
- The client obtains a credential and attaches it to every request to the server.
- The server authenticates requests by default via Spring Security. Public endpoints must be explicitly allowlisted. Authorization belongs in the service layer, with the authenticated actor passed into application methods instead of re-reading HTTP state deep in the domain.
