# Team Task Manager MVP PRD

## Problem Statement

Small teams need a simple shared place to create tasks, assign responsibility, and understand the current state of work without the overhead of a full project-management suite.

## Solution

Build a web application where authenticated users can create teams, add team members, and manage team tasks through a Kanban-style board with clear statuses, optional assignment, and lightweight team navigation.

## User Stories

1. As a visitor, I want to register with my email, username, display name, and password, so that I can start using the application.
2. As a returning user, I want to log in securely, so that I can access my teams and tasks.
3. As a logged-in user, I want to see my avatar in the header, so that I can tell I am authenticated without extra header clutter.
4. As a user, I want the app name in the header to return me to `My Teams`, so that I always have a clear way home.
5. As a user, I want to see all teams I belong to on `My Teams`, so that I can choose where to work.
6. As a new user, I want a practical empty state when I have no teams, so that I know how to get started.
7. As a user, I want to create a team with a name, so that I can start organizing shared work.
8. As a Team Owner, I want to add members by email or `@username`, so that I can bring existing users into my team quickly.
9. As a Team Owner, I want member management available directly on the Team Board, so that I do not need to leave the work context to manage the team.
10. As a team member, I want to access a board from the `My Teams` list, so that I can enter the correct team's work area.
11. As a user with access to multiple boards, I want a `Boards` menu grouped by team name, so that I can navigate across workspaces without confusion.
12. As a team member, I want one primary board for my team in the MVP, so that team work has a single obvious place to live.
13. As a team member, I want to see tasks grouped into `Todo`, `In Progress`, and `Done`, so that I can understand team progress at a glance.
14. As a team member, I want to create a task with a title, optional description, and optional assignee, so that work can be captured before or after ownership is decided.
15. As a team member, I want tasks to be allowed to remain unassigned, so that backlog items can exist before responsibility is chosen.
16. As a team member, I want each task to have at most one assignee, so that ownership stays clear in the MVP.
17. As a team member, I want to see a task title and assignee on the task card, so that I can scan the board quickly.
18. As a team member, I want to update a task title, description, assignee, and status, so that task information can stay accurate.
19. As a team member, I want to move tasks by drag-and-drop, so that the board feels natural to use.
20. As a keyboard or touch user, I want an explicit status control in addition to drag-and-drop, so that task movement is still accessible and reliable.
21. As a team member, I want empty board columns to show lightweight empty states, so that I can distinguish an empty workflow stage from a broken page.
22. As a team member, I want to delete any task in my team, so that obsolete work can be removed.
23. As a non-member, I should not be able to access a team's tasks, so that team work remains private.
24. As a Team Owner, I want only owners to manage membership, so that the MVP has a simple and understandable permission model.
25. As a future product maintainer, I want usernames already present in the model, so that future mention-style features can build on the MVP without reworking user identity.
26. As a future product maintainer, I want avatars already present in the model, so that future profile editing can extend the system naturally.

## Implementation Decisions

- Build the MVP around these domain concepts: `User`, `Username`, `Display Name`, `Avatar`, `Team`, `Team Member`, `Team Owner`, `Task`, `Assignee`, `Task Status`, and `Board`.
- The MVP modules are:
  - authentication
  - users
  - teams
  - team membership
  - tasks
  - frontend app shell
  - `My Teams`
  - grouped `Boards` menu
  - `Team Board`
- Use email/password registration and login with JWT bearer tokens for authenticated API access.
- Every user has `email`, `username`, `displayName`, and a basic `avatar`.
- `username` is used only as a lookup form in the MVP; mention behavior is deferred.
- A user may belong to many teams and may own many teams.
- A team has one owner and one or more members.
- A team contains many tasks.
- A task belongs to exactly one team, may have zero or one assignee, and uses exactly three statuses: `TODO`, `IN_PROGRESS`, and `DONE`.
- New tasks start in `TODO`.
- Team fields in the MVP are limited to `name` plus system fields.
- Team membership stores `teamId`, `userId`, and `role`.
- All persisted entities should inherit shared system fields such as `id`, `createdAt`, and `updatedAt` from an abstract base entity.
- Any team member may create, edit, move, and delete tasks in that team.
- Only the Team Owner may manage membership.
- Member addition uses a single `memberIdentifier` input that resolves either email or `@username`.
- The MVP API should include:
  - auth registration and login
  - current-user lookup
  - team creation, listing, detail retrieval
  - member listing and member addition
  - task listing, creation, general patch update, and deletion
- Task updates use one general `PATCH` endpoint for the editable MVP fields.
- The frontend home after login is `My Teams`, not a global dashboard.
- Team boards are accessed from `My Teams`; there is no single fixed top-level board route in the header.
- The header contains:
  - app name linking to `My Teams`
  - grouped `Boards` menu
  - authentication actions while logged out
  - avatar only while logged in
- The `Boards` menu groups accessible boards under team names and visually separates teams.
- The MVP board uses three Kanban columns and supports both drag-and-drop and explicit status controls.
- Task cards show only title, assignee avatar/name when assigned, and a compact status control before editing.
- The visual language is a clean white operational UI with black text, rounded rectangles, and selective colorful action/status accents.

## Testing Decisions

- Good tests should verify observable behavior and contracts rather than implementation details.
- Backend coverage should focus on:
  - registration and login behavior
  - authenticated access rules
  - team authorization
  - owner-only member management
  - member lookup by email and `@username`
  - task CRUD behavior
  - assignee validation against team membership
- Frontend coverage should focus on:
  - auth flow
  - `My Teams` rendering and creation flow
  - grouped `Boards` menu behavior
  - task creation and editing flows
  - task status changes through both direct controls and drag-and-drop
- Repository tests should validate persistence mappings against PostgreSQL integration behavior.
- Controller/API tests should validate HTTP contracts and safe error responses.
- Component tests should cover user-visible states and interactions, including practical empty states.
- Existing repository rules establish the intended prior art:
  - backend: JUnit 5, Mockito, MockMvc, and Testcontainers
  - frontend: Vitest, Testing Library, jsdom, and MSW

## Out of Scope

- Comments
- Mentions and notifications
- Due dates
- Attachments
- Subtasks
- Activity history
- Multiple boards per team
- Dashboards
- Profile editing
- Avatar changing
- Invitation emails or invitation-token flows
- Rich permission matrices beyond owner/member
- Jira-like advanced project-management features

## Further Notes

- The MVP should remain intentionally small while preserving a clear future path toward richer task-manager capabilities such as multiple boards, comments with mentions, dashboards, and user profiles.
- `@username` and avatars are included early because they are low-cost identity foundations for later collaboration features.
- The agreed domain glossary lives in `CONTEXT.md`, the visual direction lives in `DESIGN.md`, and the frontend discovery artifacts live under `.design/team-task-manager/`.
