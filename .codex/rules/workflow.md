# Agent Workflow

> Scope: every Codex session in this repo, regardless of working directory.

## Start of task

### 1. Clarify real ambiguity before editing

If two reasonable interpretations would lead to materially different implementations, resolve that before editing.

### 2. Read every `MODULE.md` you will touch

Before the first edit inside `apps/client/src/modules/<module>/` or `apps/server/src/main/java/.../<module>/`, read that module's `MODULE.md`.

### 3. Search for existing helpers first

Before authoring a utility, hook, service, or component, search the relevant module and shared code for an existing implementation.

## During execution

### 4. Propose an ADR before stack swaps or new architectural patterns

The per-app `CODEX.md` tech-stack sections are load-bearing. If a task pushes you toward a different ORM, validator, test runner, state library, messaging style, or cross-module dependency pattern, draft an ADR and get approval before introducing it.

## End of task

### 5. Run the verifier for every touched app

- Client changes: `pnpm verify`
- Server changes: `mvn verify`

If a verifier is intentionally skipped, say so explicitly.

### 6. Update `MODULE.md` when public surface, ownership, or dependencies changed

Keep module docs accurate whenever the module contract changes.
