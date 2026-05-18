# Testing

> Scope: `apps/server/` only. Real Postgres for repos, hand-written port fakes for services, supertest for controllers.

## 1. Tests live in `<module>/__tests__/`

Every module's tests live in a `__tests__/` folder inside the module. Colocated `*.test.ts` siblings to source files are forbidden. Test files are named `<thing-under-test>.test.ts`.

**Why:** keeps the source listing clean and makes "what's tested in this module" a single `ls`. Mirrors `folder-structure.md` rule 5.

## 2. Repository tests run against real ephemeral Postgres

Repositories are tested against an ephemeral Postgres instance via `src/test-utils/postgres-test-db.ts`. Mocking the Drizzle client or the underlying `pg` driver is forbidden in repository tests.

**Why:** SQL bugs only show up against a real database. Mocked queries pass on broken SQL, broken types, and broken migrations. We already pay the test-DB cost; use it.

```ts
// Forbidden (example/__tests__/example.repository.test.ts)
const db = { select: vi.fn().mockResolvedValue([...]) };

// Allowed
const db = await createPostgresTestDb();
const repo = new ExampleRepository(db);
await repo.create({...});
expect(await repo.findOne(id)).toEqual(...);
```

## 3. Service tests use hand-written port fakes — no `vi.mock` / `jest.mock`

Services are tested by constructing them directly with hand-written test impls of their port-interface dependencies. `vi.mock` / `jest.mock` of internal classes (services, repositories, adapters) is forbidden. `vi.mock` of third-party modules is allowed only in adapter tests, where it is the only way to simulate the external system.

**Why:** hand-written fakes implement the same interface the production code does, so a signature change breaks the test (good). `vi.mock` auto-mocks drift silently from the real shape and let stale tests pass against deleted methods.

```ts
// Forbidden
vi.mock('../example.repository');

// Allowed (example/__tests__/example.service.test.ts)
class FakeExampleRepository implements ExampleRepositoryPort {
  findOne = async (_: string) => null;
  create = async (input: CreateInput) => ({...});
}
class FakeExampleClient implements ExampleClient {
  checkAccess = () => okAsync(true);
}
const svc = new ExampleService(new FakeExampleRepository(), new FakeExampleClient());
```

## 4. Controller tests are HTTP tests via `supertest`

Controllers are tested with Nest's `TestingModule` + `supertest`, asserting on HTTP status code and JSON body shape. Asserting on the controller's return value directly is forbidden — the contract is the HTTP response, not the function output.

**Why:** controller behaviour includes the global pipe, the `toHttp` mapping, and the exception filter. Only an HTTP test exercises that whole chain.

```ts
// Forbidden
expect(await ctrl.create(actor, input)).toEqual(...);

// Allowed
await request(app.getHttpServer())
  .post('/api/example')
  .set('Authorization', `Bearer ${token}`)
  .send({ name, resourceId, source: 'internal' })
  .expect(200)
  .expect((res) => {
    expect(res.body).toEqual({ record: { id } });
  });
```

## 5. Coverage rule: success path + every error tag

Every public service or repository method must have at least one test covering the `Ok` path and one test per error tag the method's signature can return. If a method's signature lists `NotFound | DbError | Forbidden`, three error-path tests are required.

**Why:** the Result type advertises the failure modes; tests prove they're reachable and behave correctly. A new error variant added to a signature without a corresponding test is a missing handler in disguise.

## 6. Assert on `Result`, never on thrown exceptions

Service tests must assert on `result.isErr() && result.error.tag === '<Tag>'` (and any payload). Asserting on thrown exceptions (`expect(...).rejects.toThrow`) in service or repository tests is forbidden — services and repositories don't throw for expected failures (`error-handling.md` rule 1).

**Why:** asserting on throws hides Result-typed failure paths and silently passes if the code starts returning a different error variant. Asserting on `tag` ties the test to the contract.

```ts
// Forbidden
await expect(svc.create(actor, input)).rejects.toThrow(ForbiddenException);

// Allowed
const res = await svc.create(actor, input);
expect(res.isErr()).toBe(true);
if (res.isErr()) expect(res.error.tag).toBe('Forbidden');
```

## 7. `_unsafeUnwrap` is allowed in tests, forbidden elsewhere

Inside `__tests__/` it is acceptable to call `result._unsafeUnwrap()` or `result._unsafeUnwrapErr()` to extract the inner value for further assertions. Outside `__tests__/` they are forbidden (`error-handling.md` rule 7).

**Why:** in tests the wrapping is noise; the alternative would be a `.match` ladder around every assertion. In production code the unwrap is a hidden throw and bypasses the type system.
