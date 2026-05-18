# diplomna_robota

This repo was scaffolded from a reusable rules + architecture system: a set of
Codex rule files, per-app `CODEX.md` manifests, and two meta ADRs that encode
how the codebase is organized (modular boundaries, ports & adapters,
per-module `MODULE.md` docs).

## Expected stack

A two-app repository:

- `apps/client/` - Vite + React 19 frontend with strict TypeScript.
- `apps/server/` - Java 21 + Spring Boot 3 backend built with Maven and backed by PostgreSQL.

## Fill these in

- `CONTEXT.md` - blank domain glossary template. Fill it before writing
  domain code; rules reference it for canonical terms.
- `DESIGN.md` - blank design-system template. Define the visual language and
  color tokens for the project.

## Not included yet (next step)

Build scaffolding is intentionally **not** included yet. Add the client
`package.json` / Vite / TypeScript setup and the server `pom.xml` / Spring Boot
project files to match the stack above.

## Start here

- `CODEX.md` - repo-wide rules and the auth structural contract.
- `docs/adr/` - the two meta ADRs (rules layout, per-module context docs).
- `docs/adr/MODULE-TEMPLATE.md` - copy into every new module as `MODULE.md`.

## Planning workflow

- GitHub Issues is the default project issue tracker.
- Publish PRDs and implementation tickets there.
- Use the `ready-for-agent` label for work that is prepared for autonomous implementation.
