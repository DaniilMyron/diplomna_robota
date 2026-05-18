# Backend rules

> **Scope of this file:** rules here apply to **`apps/server/` only**. If a rule also applies to the client, promote it to `/CODEX.md` instead. Repo-wide rules in `/CODEX.md` are loaded automatically alongside this file.

## Auth: every endpoint is authenticated

> **Auth mechanism: TBD.** Define the auth provider/token scheme here and in `docs/adr/` when chosen.

Every endpoint is authenticated by default through Spring Security. When adding a new endpoint:

1. Keep authentication in the shared security configuration instead of duplicating it in each controller.
2. Read the authenticated actor once at the HTTP boundary and pass it into the service method.
3. Public endpoints must be explicitly allowlisted and documented.
4. Resource authorization belongs in services, not controllers.

The cross-cutting auth contract lives in `/CODEX.md`.

## Tech stack

This is the canonical stack for `apps/server/`.

- **Runtime / framework:** Java 21, Spring Boot 3.
- **Build tool:** Maven.
- **Web:** Spring Web MVC.
- **Security:** Spring Security.
- **Persistence:** PostgreSQL with Spring Data JPA / Hibernate.
- **Validation:** Jakarta Bean Validation at the HTTP boundary.
- **Database migrations:** Flyway.
- **Observability:** SLF4J + Logback structured logging.
- **Testing:** JUnit 5, Mockito, MockMvc, Testcontainers for PostgreSQL integration tests.

If a change pulls in something not on this list, stop and propose an ADR in `docs/adr/` first. The stack above is load-bearing for the rules in `.codex/rules/`.

## Verification: `mvn verify`

After any change in `apps/server/`, run `mvn verify`. It must compile the app and run the test suite successfully before the task is considered done.

## Backend rules

@.codex/rules/error-handling.md
@.codex/rules/folder-structure.md
@.codex/rules/backend-architecture.md
@.codex/rules/security.md
@.codex/rules/testing.md
