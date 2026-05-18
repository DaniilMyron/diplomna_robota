# tasks

## Purpose

Owns client-side Task lifecycle contracts for the Team Board.

## Public surface

- `createTask`
- `updateTask`
- `deleteTask`
- `CreateTaskInput`
- `UpdateTaskInput`
- `Task`

## Owns

- Calls to `/api/teams/{teamId}/tasks`
- Calls to `/api/teams/{teamId}/tasks/{taskId}`

## Depends on

- Shared HTTP transport
