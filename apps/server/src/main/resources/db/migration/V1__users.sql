create table users (
  id uuid primary key,
  email varchar(320) not null unique,
  username varchar(64) not null unique,
  display_name varchar(255) not null,
  avatar_url varchar(255) not null,
  password_hash varchar(255) not null,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null
);

create table teams (
  id uuid primary key,
  name varchar(255) not null,
  owner_id uuid not null references users(id),
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null
);

create table team_members (
  id uuid primary key,
  team_id uuid not null references teams(id),
  user_id uuid not null references users(id),
  role varchar(32) not null,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  unique (team_id, user_id)
);
