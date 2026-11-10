# apps/web

Vue 3 front end of Expense Tracker.

## Layers

- `src/modules/<domain>/<feature>`: `views`, `components`, `composables`, `queries`, `api` and `rules`. Components never call `api` directly.
- `src/shared`: `api`, `auth`, `composables`, `format` and `ui` (shadcn-vue components).
- `src/layouts`: application shell.

## Commands

- `pnpm dev`: starts Vite.
- `pnpm typecheck`: checks types with `vue-tsc`.
- `pnpm test`: runs the tests of the pure rules (`rules/`).
- `pnpm build`: checks types and builds for production.
