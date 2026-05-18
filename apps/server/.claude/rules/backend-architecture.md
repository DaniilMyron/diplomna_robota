# Backend Architecture

> Scope: `apps/server/` only. Strict ports & adapters with a fixed layer contract.

## 1. Layer responsibilities are fixed

| Layer | May do | Must not do |
|---|---|---|
| Controller | Parse request via Zod pipe; call exactly one service method; return `toHttp(result)`. | Touch the DB, call adapters, branch on business rules, mutate `req`. |
| Service | Business logic. Compose ports + own repository. Return `ResultAsync`. Decide authorization. | Throw for expected failures. Import another module's repository or concrete service. Read `req`/headers. |
| Repository | Drizzle queries on tables this module owns. Accept the Drizzle client via DI. | Query another module's tables. Read another repository. Throw — wrap I/O via `ResultAsync.fromPromise`. |
| Adapter | Wrap one external system. Expose a port interface + `Symbol` token. | Contain business logic. Be imported by name (always behind the token). |

**Why:** a fixed contract makes layer violations grep-able. Every "service that imports a controller" or "repository that calls an external client directly" stands out as a known anti-pattern.

## 2. Service depends on ports, never on concrete classes

When a service needs another module's behaviour, it depends on the **port interface** exported from that module's `index.ts`, injected via the module's `Symbol` token. It must never `import` the concrete service or adapter class.

**Why:** depending on the interface means the consumer is testable with a hand-written fake (per `testing.md`) and the producer can refactor its internals without breaking consumers.

```ts
// Forbidden
import { ExampleClientImpl } from '../example-client/example-client';
constructor(private example: ExampleClientImpl) {}

// Allowed
import { EXAMPLE_CLIENT, type ExampleClient } from '../example-client';
constructor(@Inject(EXAMPLE_CLIENT) private example: ExampleClient) {}
```

## 3. Each external integration is its own adapter module

Every external system (an external API, an indexer, an email provider, an auth provider) is a dedicated module exposing:

1. A port interface `<X>Client` describing what consumers can call.
2. A `Symbol` token `<X>_CLIENT` (uppercase, snake-cased).
3. A concrete adapter class (`<X>ClientImpl`, internal to the module — not re-exported) registered as the token's provider in the module's `providers`.

The interface is what the rest of the code depends on. The implementation is replaceable.

**Why:** uniformity. Every adapter looks the same; every consumer wires it the same way. Mocking, stubbing, and swapping providers is a one-line change in `<m>.module.ts`.

```ts
// example-client/index.ts
export const EXAMPLE_CLIENT = Symbol('EXAMPLE_CLIENT');
export interface ExampleClient {
  checkAccess(actorId: string, resourceId: string):
    ResultAsync<boolean, ExampleUnreachable>;
}
export { ExampleClientModule } from './example-client.module';

// example-client/example-client.module.ts
@Module({
  providers: [{ provide: EXAMPLE_CLIENT, useClass: ExampleClientImpl }],
  exports: [EXAMPLE_CLIENT],
})
export class ExampleClientModule {}
```

## 4. Cross-module data goes through the owning module's service

A repository may only query tables its own module owns (declared in `MODULE.md`). Reading another module's tables — even from the same Postgres instance — is forbidden. Cross-module reads go through the owning module's port interface; cross-module writes go through its writer port.

**Why:** the database schema is not the API. Sharing tables couples modules at the storage layer and silently breaks ownership when one module's schema changes.

```ts
// Forbidden (example-context/example-context.repository.ts)
db.select().from(recordsTable);   // belongs to example/

// Allowed (example-context/example-context.service.ts)
this.example.getOne(id);          // via EXAMPLE_READER port
```

## 5. Each module exports reader and/or writer ports — not the service class

Modules expose role-shaped interfaces, not their implementation. A module that is read by others exports a `<X>Reader` interface; one that accepts writes exports a `<X>Writer`. Bundling read and write into one giant interface is a smell.

**Why:** narrow ports document intent. A module that only reads can't accidentally call `delete`. Refactors are easier when the surface area each consumer uses is explicit.

```ts
// example/index.ts
export interface ExampleReader {
  getOne(id: string): ResultAsync<Record, NotFound | DbError>;
}
export interface ExampleWriter {
  create(actor: AuthenticatedUser, input: CreateInput):
    ResultAsync<Record, Forbidden | Conflict | DbError | ExampleUnreachable>;
}
export const EXAMPLE_READER = Symbol('EXAMPLE_READER');
export const EXAMPLE_WRITER = Symbol('EXAMPLE_WRITER');
```

## 6. No event bus, no use-case layer, no circular DI

Cross-module communication is synchronous via injected ports. Adding `@nestjs/event-emitter`, a "mediator", or a `src/use-cases/` folder requires explicit deviation from this rule. Two modules that need to call each other indicate a missing third module — split, don't cycle.

**Why:** synchronous DI keeps `Result` types honest and the dependency graph a DAG. Event buses hide errors and ordering; use-case layers degenerate into a god-folder. Both can be added later when there's a concrete need; until then they are forbidden.

## 7. Authorization belongs in the service

The controller passes `@CurrentUser()` to the service as the **first** argument: `service.create(actor, input)`. The service decides whether `actor` may perform the operation; it returns a `Forbidden` error variant if not. Identity-vs-resource checks (e.g. "does this body's owner id match the authenticated subject?") in controllers are forbidden.

**Why:** authorization is a business rule. Putting it in the service makes it testable without HTTP, makes it apply uniformly to non-HTTP entry points (jobs, CLI), and means a controller-level check can never be silently dropped during a refactor.

```ts
// Forbidden (example/example.controller.ts)
if (parsed.ownerId !== user.id) throw new ForbiddenException(...);
return this.svc.create(parsed);

// Allowed
return toHttp(await input.asyncAndThen((i) => this.svc.create(actor, i)));

// example/example.service.ts
create(actor: AuthenticatedUser, input: CreateInput) {
  if (input.ownerId !== actor.id)
    return errAsync(forbidden('cross-user create'));
  ...
}
```
