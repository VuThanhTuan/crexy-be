# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the NestJS application. Feature code lives in `src/modules/<feature>` with controllers, services, repositories, and DTOs grouped per domain such as `auth`, `products`, `media`, and `collections`. Shared decorators, guards, types, and utilities live in `src/common/`. Database configuration, entities, repositories, and migrations are in `src/database/`. End-to-end tests live in `test/`, and build output is generated into `dist/`.

## Build, Test, and Development Commands
- `npm run start:dev` runs the API in watch mode for local development.
- `npm run build` compiles the Nest app to `dist/`.
- `npm test` runs Jest tests configured under `src/`.
- `npm run test:e2e` runs the end-to-end suite from `test/jest-e2e.json`.
- `npm run lint` applies ESLint fixes across `src/` and `test/`.
- `npm run format` formats TypeScript files with Prettier.
- `npm run typeorm:run-migrations` builds the app and applies migrations using the compiled data source.

## Coding Style & Naming Conventions
Use TypeScript with 4-space indentation and trailing commas where Prettier applies them. Keep Nest patterns consistent: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`, and DTOs under `dto/` named `create-*.dto.ts` or `update-*.dto.ts`. Prefer PascalCase for classes, camelCase for methods and properties, and kebab-case for feature folders. Run `npm run lint` and `npm run format` before opening a PR.

## Testing Guidelines
Jest is the active test framework. Place unit tests next to source files as `*.spec.ts`; keep end-to-end coverage in `test/*.e2e-spec.ts`. Add tests for controller validation, service behavior, and repository edge cases when changing feature logic. Run `npm test` for module-level checks and `npm run test:e2e` for API-facing changes.

## Commit & Pull Request Guidelines
Recent commits use short, lowercase, imperative subjects such as `add docker file` and `setup cicd`. Keep commit titles brief and specific to one change. Pull requests should include a clear summary, impacted modules, setup or migration notes, and sample requests or screenshots when an API contract or admin-facing flow changes.

## Security & Configuration Tips
Configuration is loaded from `.env` through `@nestjs/config`. Do not commit secrets; use `.env.example` as the template for new variables. Review migration files under `src/database/migrations/` carefully before merging, and verify any S3, JWT, or OAuth-related configuration in environments where those integrations are enabled.
