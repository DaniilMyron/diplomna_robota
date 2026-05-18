# tasks

## Purpose

Owns task creation for a team's Board.

## Public surface

- `POST /api/teams/{teamId}/tasks`

## Owns

- `tasks` table

## Depends on

- `teams` membership checks
- `users` lookup for optional assignees
