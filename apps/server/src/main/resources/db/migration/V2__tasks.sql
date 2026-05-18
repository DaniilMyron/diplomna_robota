create table tasks (
  id uuid primary key,
  title varchar(255) not null,
  description text,
  status varchar(32) not null,
  team_id uuid not null references teams(id),
  assignee_id uuid references users(id),
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null
);
