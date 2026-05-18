# tasks

## Purpose

Owns task creation and status movement for a team's Board.

## Public surface

- `POST /api/teams/{teamId}/tasks`
- `PATCH /api/teams/{teamId}/tasks/{taskId}/status`

## Owns

- `tasks` table

## Depends on

- `teams` membership checks
- `users` lookup for optional assignees
