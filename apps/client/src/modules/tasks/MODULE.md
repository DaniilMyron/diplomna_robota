# tasks

## Purpose

Owns client-side Task creation contracts for the Team Board.

## Public surface

- `createTask`
- `CreateTaskInput`
- `Task`

## Owns

- Calls to `/api/teams/{teamId}/tasks`

## Depends on

- Shared HTTP transport
