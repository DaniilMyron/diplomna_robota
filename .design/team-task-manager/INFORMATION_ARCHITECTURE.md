# Information Architecture

## App shell

- Header
  - App name linking to `My Teams`
  - `Boards` menu for accessible boards, grouped by team name and separated between teams
  - Auth area: login/register when logged out, avatar when logged in

## Screens

### Auth

- Login form
- Registration form

### My Teams

- Team list
- Create team action
- Entry point into each team's board
- Practical empty state with a create-team action when no teams exist

### Team Board

- Team identity
- Inline member management
- Create task action
- Three Kanban columns: Todo, In Progress, Done
- Task cards show title, assignee avatar/name when assigned, and a compact status control
- Task card actions: edit, status change, delete
- Drag-and-drop task movement plus explicit status controls
- Practical empty-state text inside empty columns

## Primary flows

1. Register or log in
2. Land on `My Teams`
3. Create a team or open an existing team
4. Add members inline if needed
5. Create tasks
6. Assign and move tasks through the board

## Boards menu

- Shows all boards the user can access.
- Groups boards under their team names.
- Separates different team groups visually.
- In the MVP, each team group contains one primary board.
- Selecting a board navigates directly to that board.
