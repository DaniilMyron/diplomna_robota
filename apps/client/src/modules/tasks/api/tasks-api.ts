import { request } from '@/modules/shared/http/http-client';
import type { CreateTaskInput, Task, UpdateTaskStatusInput } from '../tasks.types';

export function createTask(token: string, teamId: string, input: CreateTaskInput) {
  return request<Task>(`/teams/${teamId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export function updateTaskStatus(token: string, teamId: string, taskId: string, input: UpdateTaskStatusInput) {
  return request<Task>(`/teams/${teamId}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}
