# tasks

## Purpose

Owns task creation, task detail lifecycle, and status movement for a team's Board.

## Public surface

- `POST /api/teams/{teamId}/tasks`
- `PATCH /api/teams/{teamId}/tasks/{taskId}`
- `PATCH /api/teams/{teamId}/tasks/{taskId}/status`
- `DELETE /api/teams/{teamId}/tasks/{taskId}`

## Owns

- `tasks` table

## Depends on

- `teams` membership checks
- `users` lookup for optional assignees
