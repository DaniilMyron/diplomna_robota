# Security

> Scope: `apps/server/` only.

## 1. Typed configuration

Application configuration is bound through Spring `@ConfigurationProperties` classes and validated at startup. Direct scattered environment reads are forbidden.

## 2. Authentication by default

Use Spring Security with default-deny request rules. Public endpoints are explicit exceptions, not the default.

## 3. Service-level authorization

Identity-vs-resource checks belong in services, not controllers.

## 4. Safe logging

Use SLF4J through the configured logging stack. Never log tokens, secrets, full auth headers, or raw sensitive payloads.

## 5. Database safety

Use JPA repositories or approved query abstractions. Keep persistence access parameterized and module-owned.

## 6. Safe error responses

HTTP responses must not leak stack traces, SQL details, or internal exception messages.
