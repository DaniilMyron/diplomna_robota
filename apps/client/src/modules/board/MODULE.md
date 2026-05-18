# board

## Purpose

Owns the primary Team Board page, task placement by status, and its empty-state rendering.

## Public surface

- `TeamBoardPage`

## Owns

- Calls to `/api/teams/{teamId}`
- Team Board route composition
- Task-focused Board integration

## Depends on

- Auth module for the bearer token
- Shared HTTP transport
- Tasks module for task creation
