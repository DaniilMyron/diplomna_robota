# Testing Rules

Where tests live and what counts as a test. Universal — applies to every folder under `src/`, including `app/`. No exceptions.

## 1. Tests live in `__tests__/` siblings — never colocated

Every test file lives in a `__tests__/` folder placed as a **sibling** of the file it covers. Tests are never colocated next to production code.

```
✓ example-feature/components/example-panel/ExamplePanel.tsx
  example-feature/components/example-panel/__tests__/ExamplePanel.test.tsx

✗ example-feature/components/example-panel/ExamplePanel.test.tsx     (colocated — forbidden)
✗ example-feature/__tests__/ExamplePanel.test.tsx                    (wrong scope — must be sibling of file under test)
```

This rule is universal. `app/`, `modules/<name>/`, `modules/shared/` — same rule everywhere.

## 2. Naming and path mirror

- Test files: `*.test.ts` / `*.test.tsx`. No `*.spec.ts`, no `*.tests.ts`.
- The test file name mirrors the file under test: `foo/Bar.tsx` ↔ `foo/__tests__/Bar.test.tsx`; `foo/use-bar.ts` ↔ `foo/__tests__/use-bar.test.ts`.
- One test file per file under test. If a single file under test grows multiple test files, the file under test should be split first.

## 3. Test helpers live in `__fixtures__/` siblings

Non-test helpers used by tests — fixture types, fake builders, MSW handlers, render wrappers — live in a sibling `__fixtures__/` folder, never in `__tests__/` and never in production code.

```
✓ example-feature/api/__fixtures__/users.ts                  (fake `User` builders)
✓ example-feature/api/__fixtures__/handlers.ts               (MSW request handlers)
✓ example-feature/api/__tests__/get-me.test.ts               (imports from ../__fixtures__/users)

✗ example-feature/api/users.fixtures.ts                      (test helper colocated with prod — forbidden)
✗ example-feature/api/__tests__/users.ts                     (helper inside __tests__/ — forbidden)
```

Test-only production exports (anything named `*ForTest`, `__test_*`, or otherwise gated for tests) move to the nearest `__fixtures__/`. Production `index.ts` does not export them. If a test needs to reach into production internals, the answer is a fixture or a refactor — not a back door.

## 4. Lint enforcement

A lint rule bans `*.test.*` files outside `__tests__/`. Treat lint warnings as work-to-do, not noise: every new test file lands in a `__tests__/` folder from day one.
