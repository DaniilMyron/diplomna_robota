create table task_comments (
  id uuid primary key,
  body text not null,
  task_id uuid not null references tasks(id) on delete cascade,
  author_id uuid not null references users(id),
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null
);

create index idx_task_comments_task_created_at on task_comments(task_id, created_at);
