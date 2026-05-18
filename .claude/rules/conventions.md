# General Conventions

Apply across the whole repo (client and server).

1. **File naming:** kebab-case for non-component files (`use-app-state.ts`, `app-shell.styles.ts`, `auth.guard.ts`). For React component files (client only), use `PascalCase.tsx` matching the exported component name — see `apps/client/.claude/rules/folder-structure.md` for the full client folder/component-file rules.
2. **Dates:** ISO 8601 throughout (`2026-04-30`, not `04/30/2026` or `Apr 30`).
3. **Strict TypeScript:** strict mode is on for the whole project. Never disable it per file (`// @ts-nocheck`, `// @ts-ignore` without an explanation, project-wide opt-outs in `tsconfig.json`). If a single line genuinely needs an escape, use `// @ts-expect-error <one-line reason>`.
