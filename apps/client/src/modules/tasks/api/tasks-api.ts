import { request } from '@/modules/shared/http/http-client';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../tasks.types';

export function createTask(token: string, teamId: string, input: CreateTaskInput) {
  return request<Task>(`/teams/${teamId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export function updateTask(token: string, teamId: string, taskId: string, input: UpdateTaskInput) {
  return request<Task>(`/teams/${teamId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export function deleteTask(token: string, teamId: string, taskId: string) {
  return request<void>(`/teams/${teamId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
