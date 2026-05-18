# diplomna_robota

This repo was scaffolded from a reusable rules + architecture system: a set of
Codex rule files, per-app `CODEX.md` manifests, and two meta ADRs that encode
how the codebase is organized (modular boundaries, ports & adapters,
per-module `MODULE.md` docs).

## Expected stack

A two-app repository:

- `apps/client/` - Vite + React 19 frontend with strict TypeScript.
- `apps/server/` - Java 21 + Spring Boot 3 backend built with Maven and backed by PostgreSQL.

## Current scope

The MVP now includes:

- registration, login, JWT authentication, and the authenticated app shell
- `My Teams` with first-team creation
- Team Boards with inline member management
- Task creation, editing, deletion, explicit status controls, and drag-and-drop movement
- grouped `Boards` navigation across accessible Teams

## Start here

- `CODEX.md` - repo-wide rules and the auth structural contract.
- `docs/local-development.md` - local run instructions for both apps.
- `docs/adr/` - the two meta ADRs (rules layout, per-module context docs).
- `docs/adr/MODULE-TEMPLATE.md` - copy into every new module as `MODULE.md`.

## Planning workflow

- GitHub Issues is the default project issue tracker.
- Publish PRDs and implementation tickets there.
- Use the `ready-for-agent` label for work that is prepared for autonomous implementation.
