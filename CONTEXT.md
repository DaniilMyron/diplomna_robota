<!-- Domain glossary. Read first for unfamiliar terms. Keep definitions tight (one sentence). Be opinionated about canonical terms. -->

# Team Task Manager

A web application for small teams to create, assign, and track shared work.

## Language

**User**:
A person who can authenticate into the application and participate in one or more teams.
_Avoid_: account

**Username**:
The unique short handle used to reference a user in typed commands such as `@dmyrosh`.
_Avoid_: handle

**Display Name**:
The human-readable name shown for a user in the interface.
_Avoid_: full name

**Avatar**:
The visual identity image shown for a user in the interface.
_Avoid_: profile picture

**Team**:
A named group of users who manage a shared collection of tasks together.
_Avoid_: workspace, organization

**Team Member**:
A user who belongs to a team and can access that team's tasks.
_Avoid_: collaborator

**Team Owner**:
The team member who created the team and can manage its membership.
_Avoid_: admin

**Task**:
A unit of work tracked by a team from creation to completion, with a title, optional description, task status, and optional assignee.
_Avoid_: ticket, issue

**Assignee**:
The team member currently responsible for a task, when one has been chosen.
_Avoid_: owner

**Task Status**:
The lifecycle position of a task: todo, in progress, or done.
_Avoid_: state

**Board**:
The task view that groups a team's tasks by task status.
_Avoid_: dashboard

## Relationships

- A **User** may belong to many **Teams** and may own many **Teams**.
- A **Team** has many **Tasks**.
- A **Task** may have zero or one **Assignee**.
- A **Team** has one **Team Owner** and one or more **Team Members**.
- A **Board** shows the tasks of one **Team** grouped by **Task Status**.

## Example dialogue

> **Dev:** "Can a task exist without a team?"
> **Domain expert:** "No. Every **Task** belongs to exactly one **Team**."
>
> **Dev:** "Can a task be created before anyone owns it?"
> **Domain expert:** "Yes. A **Task** may be unassigned until an **Assignee** is chosen."
>
> **Dev:** "What happens after someone starts a task?"
> **Domain expert:** "Its **Task Status** moves from todo to in progress, and later to done."

## Flagged ambiguities

- `@username` is only a lookup form for finding a **User** in the MVP; it does not yet imply mentions or notifications.
- Task comments are out of scope for the MVP, but `@username` is expected to support future mention-style features such as comments later.
- Task due dates are out of scope for the MVP and may be added as a future enhancement.
- The MVP has one primary **Board** per **Team**; multiple boards, profiles, dashboards, and broader Jira-like product surfaces are future enhancements.
- In the MVP, editable **Task** fields are title, description, assignee, and task status.
- In the MVP, every **Team Member** may create, edit, move, and delete tasks in that team.
- Every **User** has a basic **Avatar** in the MVP; changing it is a future enhancement.
