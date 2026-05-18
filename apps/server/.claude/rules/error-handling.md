# Error Handling

> Scope: `apps/server/` only. Errors as values via `neverthrow`, not exceptions.

## 1. `Result` / `ResultAsync` for everything fallible

Every service or repository method whose failure is not a programmer bug must return `ResultAsync<T, E>` where `E` is a tagged-object union (rule 3). This includes domain failures (`NotFound`, `Forbidden`, `Conflict`) **and** infrastructure failures (DB error, external-service outage, Zod parse failure).

**Why:** the type system is the only honest record of what can go wrong. Hidden throws lead to uncaught bubbles, missed edge cases, and silent 500s. With Result, every failure mode appears in the signature and must be handled to compile.

```ts
// Forbidden
async create(input: CreateInput): Promise<Record> {
  const allowed = await this.example.checkAccess(...);
  if (!allowed) throw new ForbiddenException('not allowed');
  return this.repo.create(input);
}

// Allowed
create(actor: AuthenticatedUser, input: CreateInput):
  ResultAsync<Record, Forbidden | DbError | ExampleUnreachable> {
  return this.example.checkAccess(actor.id, input.resourceId)
    .andThen((allowed) => allowed
      ? this.repo.create(input)
      : errAsync(forbidden('actor not allowed on resource')));
}
```

## 2. Throw only for programmer bugs

`throw` is reserved for invariant violations: `assertNever`, exhaustiveness failures, conditions that can only happen if code is wrong. Every other failure is a `Result`. A global `DomainExceptionFilter` catches uncaught throws → 500 + structured log.

**Why:** keeping `throw` rare makes it meaningful. Anything thrown in production is a bug to fix, not a flow to handle.

```ts
// Forbidden
if (!record) throw new NotFoundException('record');

// Allowed
if (!record) return err(notFound('record', id));

// Allowed (programmer bug)
function assertNever(x: never): never {
  throw new Error(`unhandled variant: ${JSON.stringify(x)}`);
}
```

## 3. Errors are tagged plain objects

Every error value has the shape `{ tag: '<UniqueString>', ...payload }`. The `tag` is the sole discriminator. Per-module errors live in `<m>.errors.ts`, exported as a type **and** a small constructor function. Cross-cutting errors live in `src/shared/errors.ts`.

**Why:** discriminated unions narrow exhaustively, serialize cleanly, are framework-agnostic, and avoid `instanceof` foot-guns under HMR or split bundles. Constructors keep call-sites short and centralize payload shape.

```ts
// Forbidden
class NotFound extends Error { constructor(public id: string) { super(); } }

// Allowed (example/example.errors.ts)
export type AlreadyExists = { tag: 'AlreadyExists'; id: string };
export const alreadyExists = (id: string): AlreadyExists =>
  ({ tag: 'AlreadyExists', id });
```

## 4. No global `AppError` union — service signatures enumerate

Service and repository signatures must spell out the union of error variants they can return. Do not collapse them into a catch-all union. The honesty cost is the point.

**Why:** signatures are documentation. A wide-but-explicit union forces callers to decide on each variant; a collapsed union turns Result into a glorified `try/catch`.

```ts
// Forbidden
function getOne(id: string): ResultAsync<Record, AppError>

// Allowed
function getOne(id: string): ResultAsync<Record, NotFound | DbError>
```

## 5. Every `switch (err.tag)` ends with `assertNever`

Any consumer that branches on `err.tag` must end with a `default` arm calling `assertNever(err)`. Adding a new variant without updating the consumer must break the build.

**Why:** without `assertNever`, a new error tag silently falls through to whatever the last `else` does — often the worst possible mapping (500 for a 404).

```ts
// Forbidden
switch (err.tag) {
  case 'NotFound': return 404;
  default: return 500;
}

// Allowed
switch (err.tag) {
  case 'NotFound': return 404;
  case 'Forbidden': return 403;
  case 'DbError': return 500;
  default: return assertNever(err);
}
```

## 6. Adapters wrap I/O at the source

Any function performing real I/O (HTTP call, DB query, file read, key/JWKS fetch) must wrap its underlying promise with `ResultAsync.fromPromise` and provide an explicit error mapper. Do not let raw promises with potential rejections leak into service code.

**Why:** the service layer should never write `try/catch`. Wrapping at the adapter keeps the throw/Result boundary at the system edge, where the mapping context is clearest.

```ts
// Forbidden (in service)
try { await this.example.fetchRecord(id); } catch (e) { ... }

// Allowed (in adapter)
fetchRecord(id: string): ResultAsync<ExampleRecord, ExampleUnreachable> {
  return ResultAsync.fromPromise(
    this.http.get(`/records/${id}`),
    (cause) => exampleUnreachable(cause),
  );
}
```

## 7. `try`/`catch` is forbidden in services and controllers

Use `ResultAsync.fromPromise` (in adapters) or let the throw bubble to the global filter. `_unsafeUnwrap` and `.unwrap()` are forbidden outside test code.

**Why:** `try/catch` and unsafe unwraps re-introduce all the problems Result is here to solve.

## 8. HTTP boundary: `toHttp(result)` only

Controllers must end every method with `return toHttp(await this.svc.x(...))`. Returning a raw `Result` from a controller is forbidden. Throwing `HttpException` (or any `@nestjs/common` `*Exception`) from controllers, services, or repositories is forbidden.

**Why:** one chokepoint converts domain errors to HTTP. The exhaustive tag→status table in `src/shared/http/error-status.ts` is the single source of truth — `assertNever` (rule 5) guarantees every variant has a status.

```ts
// Forbidden
async create(@Body() body: unknown) {
  const parsed = parseCreateBody(body);
  if (parsed.ownerId !== user.id) throw new ForbiddenException(...);
  return this.svc.create(parsed);
}

// Allowed
async create(
  @CurrentUser() actor: AuthenticatedUser,
  @ZodBody(createSchema) input: Result<CreateInput, ParseError>,
) {
  return toHttp(await input.asyncAndThen((i) => this.svc.create(actor, i)));
}
```

## 9. Validation: Zod schemas + Result-returning pipe

DTOs are `z.object(...)` schemas in `<m>.dto.ts` with the inferred type exported alongside. Controllers receive them via the `@ZodBody(schema)` pipe (`src/shared/http/zod-body.pipe.ts`), which returns `Result<T, ParseError>` — never a thrown `BadRequestException`. `class-validator` and `class-transformer` are forbidden.

**Why:** validation is just another error variant. Treating it as a Result keeps the no-throw rule whole and lets parse failures share the same `toHttp` mapping as domain errors.

```ts
// Forbidden
class CreateDto {
  @IsString() name!: string;
  @IsUUID() resourceId!: string;
}

// Allowed (example/example.dto.ts)
export const createSchema = z.object({
  name: z.string().min(1),
  resourceId: z.string().uuid(),
  source: z.enum(['internal', 'external']),
});
export type CreateInput = z.infer<typeof createSchema>;
```
