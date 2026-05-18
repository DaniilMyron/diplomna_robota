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
