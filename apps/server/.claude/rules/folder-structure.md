# Folder Structure

> Scope: `apps/server/src/` only. Flat, bounded-context modules with strict file inventories.

## 1. One folder per bounded context, flat under `src/`

Modules live at `src/<context>/`. A *context* is a bounded business area (`example`, `example-context`), not a technical role (no `controllers/`, `services/`) and not a sub-concept (no top-level `items/` if it belongs to `example`).

**Why:** flat per-context layout makes ownership obvious, prevents the `controllers/`-vs-`services/` god-folder pattern, and matches the `MODULE.md` discipline already in use.

```
// Forbidden
src/controllers/example.controller.ts
src/services/example.service.ts

// Forbidden — fine-grained top-level split
src/items/, src/sub-items/, src/events/

// Allowed
src/example/
  example.module.ts
  items/
    items.service.ts
    items.repository.ts
  example.service.ts
```

## 2. One `NestModule` per context — never nested

Sub-folders inside a context (`example/items/`) are organisational only. The providers, controllers, and exports of every file under `src/<context>/` are wired through the single `<context>.module.ts`. Nested `@Module()` declarations are forbidden.

**Why:** nested NestModules invite circular DI and obscure the dependency graph. One module per context keeps the wiring local to one file.

## 3. Mandatory and conditional files per module

Every module **must** contain:

- `<m>.module.ts` — the `@Module` declaration.
- `MODULE.md` — purpose, public surface, owned tables/routes, dependencies, gotchas (per repo `CLAUDE.md`).
- `index.ts` — the public surface (rule 4).

Conditionally, by responsibility:

- `<m>.controller.ts` — exposes HTTP routes.
- `<m>.service.ts` — owns business logic.
- `<m>.repository.ts` — owns persistence.
- `<m>.dto.ts` — accepts external input (Zod schemas).
- `<m>.errors.ts` — emits domain error tags.
- `<m>.types.ts` — types too large to inline on a service signature.

Other names are forbidden. A `*.helper.ts` or `*.utils.ts` is a smell — the function belongs on a service or in `src/shared/`.

**Why:** predictable inventories make Claude (and humans) navigate without `find`. The file-name suffix names the layer, removing one whole class of code-review questions.

## 4. `index.ts` is the only cross-module entry

Other modules may only `import` from `'../<module>'` — never `'../<module>/<m>.service'`. The barrel re-exports the public surface: port interfaces, `Symbol` tokens, the `NestModule` itself. Implementation classes (concrete services, repositories, adapter classes) must not be re-exported.

Within a module, files import each other by relative path (`./example.repository`). Self-importing the barrel is forbidden.

**Why:** the barrel is the contract. If it doesn't export it, no other module can depend on it — refactors stay local.

```ts
// Forbidden (in example-context/example-context.service.ts)
import { ExampleService } from '../example/example.service';

// Forbidden (in example/example.controller.ts)
import { ExampleService } from '.';  // self-barrel

// Allowed (in example-context/example-context.service.ts)
import { EXAMPLE_READER, type ExampleReader } from '../example';

// Allowed (in example/example.controller.ts)
import { ExampleService } from './example.service';
```

ESLint enforces this via `no-restricted-imports` / `import/no-internal-modules`.

## 5. Tests live in `<module>/__tests__/`

All test files for a module live in `<module>/__tests__/` and are named `<thing-under-test>.test.ts`. Colocated `*.test.ts` siblings to source files are forbidden.

**Why:** keeps the source listing clean for navigation, and makes "show me what's tested" a single `ls` instead of grepping through siblings.

```
// Forbidden
example/example.service.ts
example/example.service.test.ts

// Allowed
example/
  example.service.ts
  __tests__/
    example.service.test.ts
    example.controller.test.ts
    example.repository.test.ts
```

## 6. Cross-cutting code lives in `src/shared/`

Code used by more than one module that has no business identity (HTTP plumbing, error helpers, logger, generic Zod helpers) lives in `src/shared/<topic>/`. `src/shared/` is the only folder allowed to be imported by any other module without going through a barrel.

**Why:** `src/shared/` is infrastructure, not domain. Keeping it small and topic-segmented prevents it from becoming a `utils/` graveyard. Anything that has a business identity belongs in a context module instead.
