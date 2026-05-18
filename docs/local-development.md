# Local development

## Prerequisites

- Java 21
- Maven
- Node.js 24 with Corepack enabled
- PostgreSQL running locally

## Backend

1. Create a local PostgreSQL database named `team_task_manager`.
2. Ensure the credentials in `apps/server/src/main/resources/application.yml` match your local database.
3. From `apps/server/`, run:

```powershell
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

## Frontend

From `apps/client/`, install dependencies and start the dev server:

```powershell
corepack pnpm install
corepack pnpm dev
```

Vite serves the client on `http://localhost:5173`.

## Verification

Run the full app verifiers after changes:

```powershell
cd apps/client
corepack pnpm verify
```

```powershell
cd apps/server
mvn verify
```

## Current end-to-end flow

1. Register or log in.
2. Create a Team from `My Teams`.
3. Open its Board.
4. Add Team Members if you are the Team Owner.
5. Create, edit, move, and delete Tasks on the Board.
6. Use the grouped `Boards` menu to move between accessible Teams.
