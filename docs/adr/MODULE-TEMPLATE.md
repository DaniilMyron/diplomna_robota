<!-- Copy this into every new module as `MODULE.md`. Empty sections are honest — write `n/a`. -->

# <Module name> (<client|server>)

> **Scope of this file:** non-obvious context only. If it's obvious from `index.ts` or a quick code read, leave it out.

## Purpose

<!-- One or two sentences: what business capability this module provides. Not how. -->

## Public surface

<!-- Client: index.ts exports by name + intent. Server: controller routes + public service/port methods. No signatures. -->

## Owns

<!-- DB tables, API route prefixes, ports/tokens, mounted providers — the things this module is the sole authority for. -->

## Depends on

<!-- Cross-module public APIs this module imports (by module + port name). Not internal imports. -->

## Cross-app contract

<!-- The client↔server wire contract this module participates in, if any. `n/a` if none. -->

## Gotchas

<!-- Non-obvious traps a first-time contributor would otherwise reverse-engineer from code. -->

## Out of scope

<!-- Things one might expect to live here but deliberately do not, and where they live instead. -->
