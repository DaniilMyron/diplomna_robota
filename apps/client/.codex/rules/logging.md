# Logging Rules

The client logs through a single port: `Logger` from `modules/shared/logger/`. The configured singleton lives at `app/logger.ts`. **Direct `console.*` is forbidden in `apps/client/src/`** — ESLint enforces this; the only legal `console.*` callsite is inside `modules/shared/logger/adapters/console-logger-adapter.ts`.

## Hard rules

1. **Never log sensitive data.** Forbidden in any log field, message, or error object:
   - **Auth tokens** of any shape (access tokens, refresh tokens, identity tokens). If you must reference a token's existence, log `{ hasToken: true }`, not the token itself.
   - **Secrets** — API keys, signing keys, private keys, mnemonics, seed phrases. Never logged under any circumstance.
   - **PII** the user typed into a form (email addresses, names, labels, etc.).
   - **Opaque user identifiers** in production logs. Acceptable in `debug` only. Never in `info`/`warn`/`error`.
   - **Full request/response bodies from authenticated endpoints.** Log shape (`{ status, durationMs, method }`), not contents.

2. **Use the port, not the singleton.** Services and factories receive `logger: Logger` via their options object. Components that cannot easily thread a logger import the singleton from `@/app/logger`. **Never** import from `@/modules/shared/logger` directly outside of `app/logger.ts` — types only (`import type { Logger }`).

3. **Tag every record with a `module` field.** Bind it once per file via `logger.child({ module: 'example-integration' })`. Do not put the module name in the message string (no `[example-integration] ...` prefixes).

4. **Call shape is `(fields, message)`.** Mirrors the server. The first argument is a structured object; the second is a short, lowercase, present-tense verb phrase: `'subscribe'`, `'pull failed'`, `'connection status'`. Not a sentence.

5. **Levels.**
   - `debug` — high-volume, diagnostic-only. Per-tick events, projection traces, SDK call entry/exit. Gated off in production.
   - `info` — lifecycle: subscribe/unsubscribe, identity change, integration create/dispose, connection-status transitions.
   - `warn` — recoverable failure where we keep going (e.g. a single source errored; cached value retained). Maps to "the user might notice degraded data."
   - `error` — uncaught render errors (via `<ErrorBoundary>`), and failures that put a feature into an unrecoverable state for this session.
   - **Do not log expected `Result` errors twice.** If a function returns `err(...)` to its caller, the caller decides whether to log. The producer logs only if it's swallowing the error.

6. **Errors as fields, not as messages.** When logging a failure, put the error kind/message in fields: `logger.warn({ source, kind: err.kind, errorMessage: err.message }, 'pull failed')`. Never `logger.error(err)` or string-concatenated error messages.

7. **No PII or secrets in `error.message`.** When mapping SDK / network errors, strip URLs containing query strings, auth headers, and request bodies before they reach the logger. The integration error mapping (`sdk-error-mapping.ts`) is the boundary that owns this scrub.

## Conventions

- **Field names:** `module`, `durationMs`, `kind` (for typed-error tags), `errorMessage`, `from` / `to` (for transitions), `source` (for fan-out poll labels), `method` (for SDK calls).
- **Identifier formatting:** never interpolate a raw sensitive identifier. Pass it through the logger's scrubber so it renders a stable redacted form consistently with the server.
- **Per-tick `debug` lines** in hot paths are acceptable because `debug` is gated off in production. Do not promote them to `info`.
- **Production minimum level is `info`.** Dev is `debug`. Driven by `import.meta.env.DEV`. No env-var override unless a real need appears.

## Adding a new adapter

Adapters implement the same `Logger` interface. To add one (e.g. `SentryLoggerAdapter`):

1. Add it under `modules/shared/logger/adapters/`.
2. Export from `modules/shared/logger/index.ts`.
3. Compose with the existing console adapter via `MultiLoggerAdapter` in `app/logger.ts`. Both fire on every record; the multi-adapter swallows per-adapter failures so one broken sink does not silence the rest.

A new adapter must enforce the same redaction rules as the console adapter; the rules above apply at the **call site**, but the adapter is the last line of defence.

## Testing

- Service factory tests pass `buildFakeLogger()` (per-module fixtures) and assert on captured records.
- Logger module tests: level filtering, `child()` field merge (call-site wins on key collision), multi-adapter fan-out, console adapter level → method mapping.
- New `warn`/`error` callsites must have at least one assertion that they fire on the relevant error path. `debug` lines need no per-line assertion — one "fires at least once on tick" check per service is enough.
