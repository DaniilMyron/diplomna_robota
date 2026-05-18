# Frontend rules

> **Scope of this file:** rules here apply to **`apps/client/` only**. If a rule also applies to the server, promote it to `/CLAUDE.md` instead. Repo-wide rules in `/CLAUDE.md` (code style, conventions, domain language, auth structural rules) are loaded automatically alongside this file.

## Tech stack

This is the canonical stack for `apps/client/`. Names + major versions only — `package.json` is the source of truth for exact versions; this list exists so neither a model nor a human has to re-derive *what kind of project this is* from the lockfile.

- **Runtime / framework:** React 19 (with the React Compiler enabled via `babel-plugin-react-compiler`), `react-dom` 19.
- **Build / dev server:** Vite (`@vitejs/plugin-react`, `vite-tsconfig-paths` for the `@/*` alias).
- **Language:** TypeScript (strict). Project references via `tsc -b`.
- **Routing:** `react-router-dom`.
- **Auth:** TBD. Pick an auth provider/session scheme and document it here and in `docs/adr/`. The structural auth rules in `/CLAUDE.md` hold regardless of mechanism.
- **Errors as values:** `neverthrow` (`Result` / `ResultAsync`) — see `.claude/rules/error-handling.md`.
- **Validation / schemas:** Zod.
- **Charts:** choose per project — if charting is needed, propose an ADR in `docs/adr/` for the library before adding it.
- **Styling:** CSS Modules (`*.module.css`) by default; runtime-dependent styles in `*.styles.ts` (see `frontend-architecture.md`).
- **Testing:** Vitest + `jsdom`, Testing Library (`@testing-library/react` + `user-event` + `jest-dom`), MSW for HTTP mocks, `@vitest/coverage-v8`.
- **Linting:** ESLint with `typescript-eslint`, `eslint-plugin-import` (+ `eslint-import-resolver-typescript`), `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`. Hard import rules from `frontend-architecture.md` are enforced here (`import/no-restricted-paths`).
- **Package manager:** pnpm (workspace root pins `packageManager`); Turbo orchestrates workspace scripts from the repo root.

If a change pulls in something not on this list (a UI framework, a different state library, a different test runner, a CSS-in-JS lib, a charting lib), stop and propose an ADR in `docs/adr/` first. The stack above is load-bearing for the rules in `.claude/rules/`.

## Verification: `pnpm verify`

After any change in `apps/client/`, run `pnpm verify` (from `apps/client/`, or `pnpm --filter @diplomna-robota/client verify` from the repo root). It is the single source of truth that the change is good — a change is **not** done until it exits 0. If a step is intentionally skipped (e.g. docs-only PR), say so explicitly.

`pnpm verify` runs, in order (fastest feedback first):

1. **`pnpm lint`** → `eslint .`. Catches the hard import rules from `frontend-architecture.md` (no cross-module deep imports, domain module ↮ integration adapter modules) plus React Hooks and refresh rules.
2. **`pnpm typecheck`** → `tsc -b --noEmit`. Walks all project references; catches every type error including `Result` narrowing.
3. **`pnpm test`** → `vitest run`. Component tests via Testing Library + jsdom; HTTP mocked with MSW.
4. **`pnpm build`** → `tsc -b && vite build`. Confirms the production bundle builds (Vite + React Compiler).

Out of scope of `pnpm verify`:

- **Manual UI verification** — for visible UI changes, also exercise the feature in `pnpm dev` (golden path + edge cases). `verify` proves the code compiles, types, lints, and tests pass; it does not prove the screen looks right.
- **Preview / e2e** — `pnpm preview` is for inspecting the production bundle locally. No e2e suite exists yet; if one lands, fold it in.

## Frontend rule set

@.claude/rules/frontend-architecture.md
@.claude/rules/folder-structure.md
@.claude/rules/error-handling.md
@.claude/rules/testing.md
@.claude/rules/http.md
@.claude/rules/logging.md
