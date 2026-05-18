# tasks

## Purpose

Owns client-side Task mutation contracts for the Team Board.

## Public surface

- `createTask`
- `updateTaskStatus`
- `CreateTaskInput`
- `Task`
- `TaskStatus`

## Owns

- Calls to `/api/teams/{teamId}/tasks`
- Calls to `/api/teams/{teamId}/tasks/{taskId}/status`

## Depends on

- Shared HTTP transport
