# teams

## Purpose

Owns the My Teams home and client-side team creation/listing flow.

## Public surface

- `MyTeamsPage`

## Owns

- Calls to `/api/teams`
- Team list rendering and creation UI

## Depends on

- Auth module for the bearer token
- Shared HTTP transport
