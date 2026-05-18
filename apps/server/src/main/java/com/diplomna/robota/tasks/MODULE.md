# tasks

## Purpose

Owns task creation and task detail lifecycle for a team's Board.

## Public surface

- `POST /api/teams/{teamId}/tasks`
- `PATCH /api/teams/{teamId}/tasks/{taskId}`
- `DELETE /api/teams/{teamId}/tasks/{taskId}`

## Owns

- `tasks` table

## Depends on

- `teams` membership checks
- `users` lookup for optional assignees
