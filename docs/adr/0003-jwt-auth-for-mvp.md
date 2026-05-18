# JWT bearer tokens for MVP authentication

The application uses email/password registration and login with JWT bearer tokens for API access.

## Why

The MVP needs authenticated end-to-end flows in both apps while staying simple to run locally and easy to demonstrate.

JWT bearer tokens were chosen because they:

1. Keep the frontend/backend contract straightforward.
2. Fit the stateless API shape of the MVP.
3. Avoid adding third-party identity-provider setup before the product model is proven.

## Rejected alternatives

- Server-side sessions: also viable, but they add session persistence concerns without improving the MVP.
- OAuth or external identity providers: more production-like for some deployments, but unnecessary setup for the first local application.

## Consequences

- `register` and `login` are the only public backend endpoints.
- Every other request carries `Authorization: Bearer <token>`.
- Passwords are stored only as hashes.
- Replacing JWT later is possible, but it will touch both apps and the shared auth contract.
