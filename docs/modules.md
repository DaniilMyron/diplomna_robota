# Module index

One-line summary of every module in the repo. Each entry links to the module's `MODULE.md`. Update rule and rationale: see `/CODEX.md` and `docs/adr/0002-per-module-context-docs.md`.

## Client (`apps/client/src/modules/`)

- [auth](../apps/client/src/modules/auth/MODULE.md) - registration, login, and authenticated client state.
- [board](../apps/client/src/modules/board/MODULE.md) - primary Team Board page and empty-state rendering.
- [teams](../apps/client/src/modules/teams/MODULE.md) - My Teams home, listing, and creation flow.

## Server (`apps/server/src/main/java/`)

- [auth](../apps/server/src/main/java/com/diplomna/robota/auth/MODULE.md) - registration, login, and JWT request authentication.
- [teams](../apps/server/src/main/java/com/diplomna/robota/teams/MODULE.md) - team creation, listing, and owner membership bootstrap.
- [users](../apps/server/src/main/java/com/diplomna/robota/users/MODULE.md) - persisted user identity and current-user reads.
