# Testing

> Scope: `apps/server/` only.

## 1. Unit tests target business behavior

Service tests use JUnit 5 and hand-written collaborators or Mockito where appropriate. Cover the success path and meaningful failure paths for every public service method.

## 2. Repository tests use a real database

Repository integration tests run against PostgreSQL with Testcontainers. Do not mock JPA behavior when verifying queries or mappings.

## 3. Controller tests use MockMvc

Controller tests assert the HTTP contract through MockMvc, including validation and error mapping.

## 4. Keep packages mirrored

Tests live under `src/test/java/` in the same package structure as the production code they cover.
