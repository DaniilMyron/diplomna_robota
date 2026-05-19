import { request } from '@/modules/shared/http/http-client';
import type { CreateTaskCommentInput, CreateTaskInput, Task, TaskComment, UpdateTaskInput, UpdateTaskStatusInput } from '../tasks.types';

export function listTasks(token: string, teamId: string) {
  return request<Task[]>(`/teams/${teamId}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getTask(token: string, teamId: string, taskId: string) {
  return request<Task>(`/teams/${teamId}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

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

export function updateTaskStatus(token: string, teamId: string, taskId: string, input: UpdateTaskStatusInput) {
  return request<Task>(`/teams/${teamId}/tasks/${taskId}/status`, {
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

export function listTaskComments(token: string, teamId: string, taskId: string) {
  return request<TaskComment[]>(`/teams/${teamId}/tasks/${taskId}/comments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createTaskComment(token: string, teamId: string, taskId: string, input: CreateTaskCommentInput) {
  return request<TaskComment>(`/teams/${teamId}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}
