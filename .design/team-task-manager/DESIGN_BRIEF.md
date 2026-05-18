# Design Brief

## Product

A web application for small teams to create, assign, and track shared tasks.

## MVP goals

- Let users register, log in, create teams, add members, and manage team tasks.
- Make team work immediately understandable through a Kanban-style board.
- Keep the product visually simple, current, and work-focused.

## Visual direction

- Clean white theme with black text.
- Rounded rectangles and squares rather than rigid sharp geometry.
- Selective colorful buttons and status accents.
- Calm, operational layout with just enough polish to feel modern.

## Core screens

1. Auth
2. My Teams
3. Team Board

## Navigation decisions

- The application name in the header links to the main page, which is `My Teams` in the MVP.
- Logged-out users see authentication actions.
- Logged-in users see only their avatar in place of register/login actions.
- A `Boards` header entry lets users choose from boards they can access, grouped under team names so the menu can grow into multiple boards per team later.
- Team boards are entered from the `My Teams` list and are not represented as a single fixed top-level board.

## MVP boundaries

- One primary board per team.
- Inline member management on the team board screen.
- Deferred: comments, mentions, due dates, notifications, profile editing, dashboards, and multiple boards per team.
