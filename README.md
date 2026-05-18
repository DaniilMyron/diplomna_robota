# diplomna_robota

This repo was scaffolded from a reusable rules + architecture system: a set of
Claude Code rule files, per-app `CLAUDE.md` manifests, and two meta ADRs that
encode how the codebase is organized (Ports & Adapters, errors-as-values,
module barrels, per-module `MODULE.md`).

## Expected stack

A pnpm + Turbo monorepo:

- `apps/client/` — Vite + React 19 frontend (TypeScript strict, neverthrow, Zod).
- `apps/server/` — NestJS + Drizzle + PostgreSQL backend (neverthrow, Zod, Pino).
- `packages/` — shared packages (currently empty).

## Fill these in

- `CONTEXT.md` — blank domain glossary template. Fill it before writing
  domain code; rules reference it for canonical terms.
- `DESIGN.md` — blank design-system template. Define the visual language and
  color tokens for the project.

## Not included yet (next step)

Build scaffolding is intentionally **not** included: no `package.json`,
`tsconfig`, ESLint config, `turbo.json`, or `pnpm-workspace.yaml`. Generating
that scaffolding to match the stack above is the next step.

## Start here

- `CLAUDE.md` — repo-wide rules and the auth structural contract.
- `docs/adr/` — the two meta ADRs (rules layout, per-module context docs).
- `docs/adr/MODULE-TEMPLATE.md` — copy into every new module as `MODULE.md`.
