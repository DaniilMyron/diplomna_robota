# Security

> Scope: `apps/server/` only. The authentication contract lives in `/CLAUDE.md` and `apps/server/CLAUDE.md`; this file covers everything else.

## 1. Config & secrets only via the typed `AppConfig`

Environment variables are read once at boot by `src/config/`, parsed through a Zod schema into an `AppConfig` object, and exposed via the `APP_CONFIG` token. Other modules read config with `@Inject(APP_CONFIG)`. Direct `process.env` access outside `src/config/` is forbidden (ESLint `no-process-env`). Boot fails fast on missing or invalid env vars with a clear error.

**Why:** centralised, schema-validated config catches missing-secret bugs at startup instead of at the first request that needs them. It also gives every module a typed view of what's available, so misspellings or stale keys break the build.

```ts
// Forbidden (anywhere outside src/config/)
const port = Number(process.env.PORT ?? 3000);

// Allowed (src/config/config.ts)
export const appConfigSchema = z.object({
  port: z.coerce.number().int().positive().default(3000),
  databaseUrl: z.string().url(),
  apiKey: z.string().min(1),
  corsAllowedOrigins: z.string().transform((s) => s.split(',')),
});
export type AppConfig = z.infer<typeof appConfigSchema>;
export const APP_CONFIG = Symbol('APP_CONFIG');

// Allowed (anywhere)
constructor(@Inject(APP_CONFIG) private readonly cfg: AppConfig) {}
```

## 2. Structured logging via Pino with a redaction allowlist

The single logger is Pino, configured in `src/shared/logger/`. Pino's `redact` is set to a non-negotiable allowlist:

- `req.headers.authorization` (full redaction)
- any field path matching `*.token`, `*.secret`, `*.key`, `*.privateKey`
- token-shaped strings (`eyJ...` and similar)
- opaque user/PII identifiers logged in a stable redacted form (e.g. last 4 chars only)

Logging full request bodies, full headers, or full sensitive identifiers is forbidden. `console.log` and `console.error` are forbidden in `src/` (ESLint `no-console`); they remain allowed in tests.

**Why:** structured logs are the foundation of useful production observability. Redaction enforced at the logger means no individual call site can leak a token by accident, even by mistake.

```ts
// Forbidden
console.log('user', user);
this.logger.info({ headers: req.headers }, 'incoming');

// Allowed
this.logger.info({ userId: user.id, idTail: user.id.slice(-4) }, 'created');
```

## 3. HTTP hardening at boot

`src/main.ts` must, in order: apply `helmet()` with default headers, configure CORS from `AppConfig.corsAllowedOrigins` (explicit allowlist; **wildcard in production is forbidden**), register `@nestjs/throttler` globally with conservative defaults (e.g. 100 req/min/IP, overridable per route via `@Throttle`), and set an explicit body-size limit on the underlying adapter.

**Why:** safe defaults at boot mean every new route inherits them. Trusting individual route authors to remember helmet, CORS, or throttling is how those things end up missing.

## 4. Drizzle only, schema-typed queries

All database queries go through Drizzle using table objects imported from `src/db/schema.ts`. Tagged-template raw SQL (`` sql`...` ``) is forbidden outside `drizzle/` migrations. Repositories receive the Drizzle client via DI (`@Inject(DRIZZLE)` or constructor parameter) — no module-level `db` imports — so tests can swap in a test-DB instance.

**Why:** schema-typed queries keep the type system aware of column changes; banning module-level `db` imports keeps repositories swappable for tests; banning raw SQL keeps the parameterisation guarantee universal.

```ts
// Forbidden
import { db } from '../db';
async findRecord(id: string) {
  return db.execute(sql`SELECT * FROM records WHERE id = ${id}`);
}

// Allowed
constructor(@Inject(DRIZZLE) private readonly db: Database) {}
findRecord(id: string): ResultAsync<Record | null, DbError> {
  return ResultAsync.fromPromise(
    this.db.select().from(records).where(eq(records.id, id)).limit(1),
    (cause) => dbError(cause),
  ).map((rows) => rows[0] ?? null);
}
```

## 5. Authorization belongs to the service

See `backend-architecture.md` rule 7. Controllers must not perform identity-vs-resource checks; the service receives `@CurrentUser()` as its first argument and returns `Forbidden` when the actor may not perform the operation. This rule is restated here so that any security review starts from the same place.

## 6. Errors leaving the server reveal nothing internal

The global `DomainExceptionFilter` (`src/shared/http/domain-exception.filter.ts`) returns `{ error: { code, message, issues? } }` only. `issues?` is a sanctioned, structured field carrying field-keyed validation messages (`Record<string, string>` with dotted paths) — populated by the `ZodBody` pipe for `ParseError` and by no other tag. Stack traces, internal cause objects, raw DB errors, and unknown-error details must never appear in HTTP responses. Unknown throws map to `{ error: { code: 'INTERNAL', message: 'Internal server error' } }` with status 500; the original error is logged server-side with full context.

**Why:** error responses are an information channel to attackers. Limiting them to a stable, code-only shape keeps the client contract clean and prevents accidental disclosure of stack traces or DB internals.
