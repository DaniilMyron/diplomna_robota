# Agent Workflow

> Scope: every Claude Code session in this repo, regardless of working directory. Defines the predictable loop an agent runs through for one task. A *task* is a coherent user request with an outcome ("add X", "fix Y"); the workflow's Start/End markers attach to the task, not to each turn.

## Start of task

### 1. Clarify ambiguity before editing

A task is ambiguous if it admits two reasonable interpretations whose implementations differ. Resolve with `AskUserQuestion` (or a plain question if no tool is available) before opening files for edit.

**Why:** undoing a wrong implementation is more expensive than one clarifying question. Ambiguity left until "End" produces a verified, type-checked, but wrong artifact.

- Forbidden: receiving "add a summary view" and editing `example-feature/` based on a guess about which fields to summarise.
- Allowed: ask which fields, scope, and surface (page vs. component) before starting.

### 2. Read every `MODULE.md` you will touch

Before the first edit inside `apps/<app>/src/modules/<m>/` (client) or `apps/server/src/<m>/` (server), Read that module's `MODULE.md`. Multiple modules → read all of them up front; do not interleave reads with edits.

**Why:** `MODULE.md` is the only place that lists non-obvious context (owned tables, public surface, gotchas). Skipping it produces edits that violate ownership rules or duplicate the public API.

- Forbidden: edit `example/example.service.ts` without first reading `example/MODULE.md`.
- Allowed: list the modules the task touches → Read each `MODULE.md` → then edit.

### 3. Search for existing helpers before authoring new ones

Before writing a utility, hook, service, or component, search `shared/` (client: `apps/client/src/modules/shared/`; server: `apps/server/src/shared/`) and the relevant module(s) for an existing implementation. A `*.utils.ts` cousin is the most common miss.

**Why:** reinventing helpers fragments the codebase, drifts from existing semantics, and bypasses tested code.

- Forbidden: writing a new `formatId` when `shared/utils/format-id.ts` already exists.
- Allowed: grep / Explore for `formatId`, `truncate`, etc., in `shared/` and the touched modules first.

## During execution

### 4. Stop and propose an ADR before stack swaps, new patterns, or cross-module coupling

The per-app `CLAUDE.md` "Tech stack" sections are load-bearing for the rules in `.claude/rules/`. If a task pushes you to introduce a new ORM, validator, test runner, state library, event bus, use-case layer, or to couple two modules in a way the architecture rules forbid: **stop**, draft a short ADR in `docs/adr/NNNN-<slug>.md`, and ask the user to approve it before continuing.

**Why:** a stack swap or pattern change made silently inside a feature PR is the single hardest decision to undo later — the new dep spreads, callers grow, and the architectural rule it violated quietly stops being true. ADRs front-load that conversation.

- Forbidden: adding `@nestjs/event-emitter` to make two services talk because circular DI is in the way.
- Allowed: notice the cycle → draft `docs/adr/NNNN-event-bus-for-X.md` → ask the user → wait for approval before adding the dep.

## End of task — before claiming done

### 5. `pnpm verify` exits 0 in every app you touched

Run `pnpm verify` in each touched app (`pnpm --filter @diplomna-robota/client verify`, `pnpm --filter @diplomna-robota/server verify`, or both from the repo root). Do not claim the task is done — in chat, in a commit message, or in a PR description — until each `verify` exits 0. If a step is intentionally skipped (docs-only PR, no app code touched), say so explicitly.

**Why:** `pnpm verify` is the single source of truth that the change is good (per each app's `CLAUDE.md`). "Looks right" without `verify` is a bug waiting to be reported.

- Forbidden: "I've added the endpoint and it should work" without running `verify`.
- Allowed: run `pnpm --filter @diplomna-robota/server verify` → report the exit-0 line → then claim done.

### 6. Update `MODULE.md` when public surface, ownership, or dependencies changed

If the task changed the module's `index.ts` exports (client) / controller routes or public service methods (server), the tables / routes / ports / providers it owns, or the cross-module imports it depends on, update that module's `MODULE.md` in the same change. Trivial implementation tweaks that touch none of the three do **not** require an update.

**Why:** the per-module `MODULE.md` is the agent's primary orientation surface (rule 2). A stale `MODULE.md` is worse than none — it actively misleads the next session.

- Forbidden: add a new `list()` method to `example/`'s public service and leave `example/MODULE.md` describing the old surface.
- Allowed: add the method → update `MODULE.md`'s "Public surface" + "Depends on" sections in the same edit batch.
