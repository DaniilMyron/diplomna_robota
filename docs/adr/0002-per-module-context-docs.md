# Per-module `MODULE.md` context docs

Every module under `apps/client/src/modules/` and `apps/server/src/main/java/` carries a colocated `MODULE.md` capturing non-obvious context: purpose, public surface, what the module owns, what it depends on, the cross-app contract if any, gotchas, and out of scope. The file is updated in the same PR that changes the module's public surface, owned tables/routes, or cross-module dependencies.

## Why

Sessions in this repo start cold. `CONTEXT.md` is a domain glossary, ADRs are decision history, and `CODEX.md` files are repo-wide rules; none of them inventory what each module is and owns.

## Update rule

The same PR that changes any of the following must update that module's `MODULE.md`:

1. **Public surface** - for client modules, `index.ts` exports; for server modules, controller routes and public service/port methods.
2. **What the module owns** - DB tables, API route prefixes, ports/adapters, mounted providers.
3. **What the module depends on** - cross-module public APIs.

A stale `MODULE.md` is worse than no `MODULE.md` - Codex and humans read it confidently. Keep it accurate or delete the section that drifted.

The rule is restated in `/CODEX.md` so it is loaded into every session.
