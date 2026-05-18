# teams

## Purpose

Owns team creation, owner membership bootstrap, and accessible team listing.

## Public surface

- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/{teamId}`

## Owns

- `teams` table
- `team_members` table bootstrap records for created teams

## Depends on

- `users` lookup by authenticated email
