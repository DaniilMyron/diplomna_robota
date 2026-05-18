# Frontend rules

> **Scope of this file:** rules here apply to **`apps/client/` only**. If a rule also applies to the server, promote it to `/CODEX.md` instead. Repo-wide rules in `/CODEX.md` are loaded automatically alongside this file.

## Tech stack

This is the canonical stack for `apps/client/`.

- **Runtime / framework:** React 19 with `react-dom` 19.
- **Build / dev server:** Vite with `@vitejs/plugin-react` and `vite-tsconfig-paths`.
- **Language:** TypeScript in strict mode.
- **Routing:** `react-router-dom`.
- **Auth:** TBD. Pick an auth provider/session scheme and document it here and in `docs/adr/`.
- **Validation / schemas:** Zod.
- **Errors as values:** `neverthrow` for expected recoverable failures.
- **Styling:** CSS Modules by default; runtime-dependent styles in `*.styles.ts`.
- **Testing:** Vitest, jsdom, Testing Library, MSW.
- **Linting:** ESLint with TypeScript, import, React Hooks, and React Refresh rules.
- **Package manager:** pnpm.

If a change pulls in something not on this list, stop and propose an ADR in `docs/adr/` first. The stack above is load-bearing for the rules in `.codex/rules/`.

## Verification: `pnpm verify`

After any change in `apps/client/`, run `pnpm verify`. It runs linting, typechecking, tests, and the production build in that order. For visible UI changes, also verify the feature manually in `pnpm dev`.

## Frontend rule set

@.codex/rules/frontend-architecture.md
@.codex/rules/folder-structure.md
@.codex/rules/error-handling.md
@.codex/rules/testing.md
@.codex/rules/http.md
@.codex/rules/logging.md
