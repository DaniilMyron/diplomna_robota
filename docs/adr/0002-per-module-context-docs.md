# Per-module `MODULE.md` context docs

Every module under `apps/client/src/modules/` and `apps/server/src/` carries a colocated `MODULE.md` capturing non-obvious context: purpose, public surface, what the module owns (DB tables, API routes, ports, providers), what it depends on, the cross-app contract if any, gotchas, and out-of-scope. The file is updated in the **same PR** that changes the module's public surface, owned tables/routes, or cross-module dependencies.

## Why

Sessions in this repo start cold. To work on a module you have to open the controller, service, repository, schema, and the matching client module to figure out what the module owns, who depends on it, what the wire contract is, and what the gotchas are. CONTEXT.md is a domain glossary, ADRs are decision history, CLAUDE.md files are repo-wide rules — none of them inventory what each module *is and owns*.

The cost of the missing inventory is paid every session. The cost of writing it is paid once per module. Per-module context docs flip that cost shape.

## What `MODULE.md` is for — and what it isn't

It **is**:

- A pointer doc you read first when you start a session in or about the module.
- A capture of *non-obvious context* — the kind of thing you'd otherwise reverse-engineer from code: which tables this module owns, which other modules import its `index.ts`, what the cross-app wire contract is, which gotchas trip up first-time contributors.
- A small fixed-shape file. Same seven sections every time, even if some are "n/a."

It **is not**:

- A tutorial. (The code, with a session running, is a better tutorial.)
- API reference with signatures. (Signatures drift; intent doesn't. List exports by name + intent only.)
- An architecture overview. (That's `frontend-architecture.md`/`backend-architecture.md` and ADRs.)
- A change log or status update. (That's git log and the issue tracker.)

If something is obvious from `index.ts` or a quick code read, it does **not** belong in `MODULE.md`. Empty sections are honest.

## The fixed template

```markdown
# <Module name> (<client|server>)

> **Scope of this file:** non-obvious context only. ...

## Purpose
## Public surface
## Owns
## Depends on
## Cross-app contract
## Gotchas
## Out of scope
```

The canonical copy of this template lives at `docs/adr/MODULE-TEMPLATE.md`. Copy it into every new module as `MODULE.md`.

## Update rule

The same PR that changes any of the following must update that module's `MODULE.md`:

1. **Public surface** — for client modules, `index.ts` exports; for server modules, controller routes and public service methods.
2. **What the module owns** — DB tables, API route prefixes, ports/adapters, mounted providers.
3. **What the module depends on** — cross-module imports of public APIs.

Trivial implementation changes inside a module that don't touch any of the three do **not** require a `MODULE.md` change.

A stale `MODULE.md` is worse than no `MODULE.md` — Claude (and humans) read it confidently. Keep it accurate or delete the section that's drifted.

The rule is restated in `/CLAUDE.md` so it is loaded into every session.

## Rejected alternatives

- **Centralized `docs/modules/` tree.** All docs in one place is easy to skim, but a `git mv` of a module orphans its doc. Colocation is strictly better for survival under refactors. Rejected.
- **Heavy handbook-style docs** (signatures, full file inventory, architecture diagrams per module). Initial value is high, but they drift on every PR and become wallpaper Claude reads but doesn't trust. Rejected — the template is deliberately context-only.
- **Lazy / on-touch bootstrap.** Writing a module's doc the first time you touch it spreads the cost, but long-tail modules never get written and the system feels half-finished. Rejected — bootstrap a module's doc with the module.
- **CI / pre-commit check** that `MODULE.md` is touched whenever `index.ts` is. Sounds nice; gets disabled on the first hotfix that needs to ship without doc churn. The teeth aren't worth the maintenance. Rejected — convention enforced by review.

## Consequences

- Every module created in this repo gets a `MODULE.md` from its first commit. The template is part of the new-module checklist.
- Any new module created after this ADR must include `MODULE.md` from its first commit.
- Reviewers should reject PRs that change a module's public surface / owned tables/routes / cross-module imports without touching its `MODULE.md`.
- The single-page index `docs/modules.md` lists every module with a one-line purpose, linking to its `MODULE.md`. The index is manually maintained — change rate is months, not days.
- Modules without genuinely interesting context get short docs with several "n/a" sections. That is the intended outcome, not a sign of laziness.
