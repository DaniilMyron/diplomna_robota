# Folder Structure

> Scope: `apps/server/src/main/java/` only.

## 1. One package per bounded context

Modules live as bounded-context packages under the application's base package, for example:

```text
com.example.app.orders/
com.example.app.billing/
```

Avoid global technical buckets such as top-level `controllers/`, `services/`, or `repositories/`.

## 2. Standard files per module

Each module should contain what it needs from this vocabulary:

- `*Controller.java`
- `*Service.java`
- `*Repository.java`
- `*Entity.java`
- `*Dto.java`
- `*Mapper.java`
- `*Port.java`
- `*Adapter.java`
- `MODULE.md`

Do not invent grab-bag classes such as `Helpers` or `Utils` when the behavior belongs to a domain type or service.

## 3. Public surface stays explicit

Cross-module use goes through public services or port interfaces. Internal implementation classes remain package-local where practical.

## 4. Tests mirror production packages

Tests live under `src/test/java/` in the same package structure as production code.
