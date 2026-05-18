export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskAssignee = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee: TaskAssignee | null;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  assigneeId?: string;
};

export type UpdateTaskInput = {
  title: string;
  description?: string;
  assigneeId?: string;
  status: TaskStatus;
};

export type UpdateTaskStatusInput = {
  status: TaskStatus;
};
