# auth

## Purpose

Owns the public registration and login flow plus authenticated user state for the client.

## Public surface

- `AuthPage`
- `AuthProvider`
- `RequireAuth`
- `useAuth`

## Owns

- Auth routes under `/auth`
- Client-side auth context state
- Calls to `/api/auth/register`, `/api/auth/login`, and `/api/users/me`

## Depends on

- Shared HTTP transport
- React Router navigation
