import { request } from '@/modules/shared/http/http-client';
import type { CreateTaskInput, Task } from '../tasks.types';

export function createTask(token: string, teamId: string, input: CreateTaskInput) {
  return request<Task>(`/teams/${teamId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}
