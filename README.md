# CyberGuard

CyberGuard is a cybersecurity compliance assessment and organization-management application. The current repository is a **single Next.js 15 App Router application backed by Supabase**. It is not the earlier NestJS/Prisma monorepo described in legacy setup notes.

## Current implementation scope

Repository evidence currently includes authentication and onboarding flows, organization/team/department administration, security-domain management, assessment templates and question building, assessment sessions, drafts, progress, review, and submission. Risk registry/scoring, evidence upload, generated reports, in-app notifications, and MFA enforcement are not yet evidenced as complete. See the [project status and completion plan](docs/project-completion-plan.md) for issue-level status, code evidence, verification gaps, and the release roadmap.

The public site may describe future capabilities. Until implemented and verified, treat those as roadmap claims rather than available product functionality.

## Technology

- Next.js 15 App Router, React 19, TypeScript
- Supabase Auth, Postgres, Storage integration libraries
- Tailwind CSS
- pnpm package manager (npm can run the package scripts if installed dependencies are compatible)

## Prerequisites

- Node.js 20 or newer
- pnpm 11.9.0 (the package manager declared in the repository)
- Supabase project credentials for authenticated/database-backed flows

## Local setup

1. Install dependencies from the repository root:

   ```sh
   pnpm install
   ```

2. Copy [`.env.example`](.env.example) to `.env.local` and fill in the Supabase URL and anon key. The service-role key is optional for specific server-only operations; never expose it to browser code or commit it. Set `NEXT_PUBLIC_SITE_URL` to the local app URL. Use a non-production Supabase project for local development.

3. Start the development server:

   ```sh
   pnpm dev
   ```

   The app defaults to `http://localhost:3000`.

4. Production build and server:

   ```sh
   pnpm build
   pnpm start
   ```

Available scripts are defined in [package.json](package.json). At present there is no `test` or `typecheck` package script. `pnpm lint` is declared, but it must be run and kept aligned with the installed Next.js version; the existing CI workflow also needs correction before it can be considered a verified build gate.

## Supabase and migrations

Supabase configuration and SQL migrations are in [supabase](supabase). Review the [Supabase integration guide](docs/architecture/supabase-integration-guide.md) and migration history before applying changes. Do not apply migrations to a production project from a local development workflow. The repository does not prove which migrations, seed data, storage buckets, or policies are active in any hosted environment; confirm those with the project operator.

## Route overview

The `(app)` directory is a Next.js route group and does not appear in public URLs. Current page routes include:

- Public: `/`, `/about`, `/features`, `/pricing`, `/contact`
- Authentication/onboarding: `/login`, `/register`, `/verify-email`, `/verify-success`, `/onboarding`, `/accept-invite/[token]`
- Authenticated app: `/dashboard`, `/assessments`, `/assessments/new`, `/assessments/templates`, `/assessments/templates/new`, `/assessments/templates/[id]`, `/assessments/sessions/[id]`, `/assessments/sessions/[id]/wizard`, `/assessments/sessions/[id]/review`, `/assessments/sessions/[id]/complete`, `/departments`, `/members`, `/organization`, `/profile`, `/settings`, `/settings/security-domains`, `/invitations`, `/reports`
- Access-denied page: `/403`

The route map and evidence notes are maintained in [Information Architecture](docs/architecture/information-architecture.md). API handlers under `src/app/api` are not user-facing pages.

## Project documentation

- [Project status and completion plan](docs/project-completion-plan.md) — canonical Sprint 0–7 status, evidence, and sequencing
- [Issue register](docs/requirements/sprint-backlog.md) — canonical issue IDs and titles
- [Sprint roadmap](docs/requirements/sprint-planning.md)
- [Product requirements](docs/requirements/prd.md)
- [Architecture documents and ADRs](docs/architecture)
- [Assessment draft-management design](docs/draft-management.md)

Architecture documents and sprint designs may contain proposed/future behavior. The status plan distinguishes those designs from verified implementation.
