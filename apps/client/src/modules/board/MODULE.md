# board

## Purpose

Owns the primary Team Board page and its empty-state rendering.

## Public surface

- `TeamBoardPage`

## Owns

- Calls to `/api/teams/{teamId}`
- Team Board route composition

## Depends on

- Auth module for the bearer token
- Shared HTTP transport
