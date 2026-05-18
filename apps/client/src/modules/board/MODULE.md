# board

## Purpose

Owns the primary Team Board page, task placement and movement by status, empty-state rendering, inline membership management, and task edit/delete integration.

## Public surface

- `TeamBoardPage`

## Owns

- Calls to `/api/teams/{teamId}` and `/api/teams/{teamId}/members`
- Team Board route composition
- Task-focused Board integration

## Depends on

- Auth module for the bearer token
- Shared HTTP transport
- Tasks module for task lifecycle actions and status updates
