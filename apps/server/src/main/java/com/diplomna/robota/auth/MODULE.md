# auth

## Purpose

Owns public registration and login plus JWT issuance and request authentication.

## Public surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- Shared security configuration that authenticates bearer tokens

## Owns

- JWT generation and parsing
- Registration and login orchestration

## Depends on

- `users` public repository contract for user lookup and persistence
