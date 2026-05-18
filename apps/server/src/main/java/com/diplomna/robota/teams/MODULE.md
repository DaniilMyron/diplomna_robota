# teams

## Purpose

Owns team creation, owner membership bootstrap, team listing, board detail membership data, and inline membership management.

## Public surface

- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/{teamId}`
- `POST /api/teams/{teamId}/members`

## Owns

- `teams` table
- `team_members` table records and owner/member membership roles

## Depends on

- `users` lookup by authenticated email and member lookup by email or username
