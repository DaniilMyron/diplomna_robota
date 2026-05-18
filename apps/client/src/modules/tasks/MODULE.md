# tasks

## Purpose

Owns client-side Task mutation contracts for the Team Board.

## Public surface

- `createTask`
- `updateTask`
- `updateTaskStatus`
- `deleteTask`
- `CreateTaskInput`
- `UpdateTaskInput`
- `UpdateTaskStatusInput`
- `Task`
- `TaskStatus`

## Owns

- Calls to `/api/teams/{teamId}/tasks`
- Calls to `/api/teams/{teamId}/tasks/{taskId}`
- Calls to `/api/teams/{teamId}/tasks/{taskId}/status`

## Depends on

- Shared HTTP transport
