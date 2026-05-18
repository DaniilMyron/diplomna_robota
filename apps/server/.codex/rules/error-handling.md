# Error Handling

> Scope: `apps/server/` only.

## 1. Use domain exceptions for expected business failures

Expected business failures use explicit domain exceptions or result types local to the use case. Controllers do not manufacture ad hoc HTTP responses for business rules.

## 2. Centralize HTTP mapping

Map domain failures to HTTP responses in a shared `@ControllerAdvice`. Response bodies expose stable error codes and safe messages, not stack traces or persistence details.

## 3. Validate at the boundary

Use Jakarta Bean Validation for request DTOs. Validation failures are handled centrally and returned in a consistent shape.

## 4. Keep infrastructure failures observable

Unexpected infrastructure failures are logged with context, converted to a safe 5xx response at the boundary, and never leaked raw to clients.
