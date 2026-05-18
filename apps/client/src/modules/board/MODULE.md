# board

## Purpose

Owns the primary Team Board page, its empty-state rendering, and inline membership management.

## Public surface

- `TeamBoardPage`

## Owns

- Calls to `/api/teams/{teamId}` and `/api/teams/{teamId}/members`
- Team Board route composition

## Depends on

- Auth module for the bearer token
- Shared HTTP transport
