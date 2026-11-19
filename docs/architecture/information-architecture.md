# Information Architecture & Current Route Map

This document records page routes found under `src/app` on 2026-10-23. It is a repository route inventory, not proof that every route is complete, accessible to every intended role, or deployed. The `(app)` folder is a Next.js route group; it does not form part of the URL.

The canonical issue status and implementation/test evidence are in the [Project Status & Completion Plan](../project-completion-plan.md#sprint-0-7-issue-status-and-evidence).

## Public pages

| URL | Implementation | Status note |
|---|---|---|
| `/` | [Landing page](../../src/app/page.tsx) | Marketing content; some capabilities shown are future/illustrative. |
| `/about` | [About page](../../src/app/about/page.tsx) | Public marketing page. |
| `/features` | [Features page](../../src/app/features/page.tsx) | Claims are being qualified against shipped scope. |
| `/pricing` | [Pricing page](../../src/app/pricing/page.tsx) | Commercial details require owner/legal confirmation. |
| `/contact` | [Contact page](../../src/app/contact/page.tsx) | Public contact page. |
| `/403` | [Forbidden page](../../src/app/403/page.tsx) | Access-denied UX. |

## Authentication and onboarding pages

| URL | Implementation | Status note |
|---|---|---|
| `/login` | [Login page](../../src/app/login/page.tsx) | Supabase authentication flow; MFA support/enforcement must not be inferred from marketing wording. |
| `/register` | [Registration page](../../src/app/register/page.tsx) | Public signup flow; trial/pricing claims require confirmation. |
| `/verify-email` | [Email verification page](../../src/app/verify-email/page.tsx) | Verify actual provider redirects in an integration environment. |
| `/verify-success` | [Verification success page](../../src/app/verify-success/page.tsx) | Route exists; runtime behavior requires testing. |
| `/onboarding` | [Onboarding page](../../src/app/onboarding/page.tsx) | Workspace setup flow. |
| `/accept-invite/[token]` | [Invitation acceptance page](../../src/app/accept-invite/[token]/page.tsx) | Token validation and acceptance must be tested against Supabase. |

Auth API handlers live under `src/app/api/auth`; they are not pages. The file-backed routes include sign-up, sign-in, sign-out, callback, and related handlers; inspect the route handlers before relying on exact provider behavior.

## Authenticated application pages

| URL | Implementation | Current scope note |
|---|---|---|
| `/dashboard` | [Dashboard](../../src/app/(app)/dashboard/page.tsx) | Team/department/activity data is present; compliance score and risk metric are placeholders. |
| `/assessments` | [Assessment list](../../src/app/(app)/assessments/page.tsx) | Assessment sessions view. |
| `/assessments/new` | [New assessment](../../src/app/(app)/assessments/new/page.tsx) | Assessment creation flow. |
| `/assessments/templates` | [Template list](../../src/app/(app)/assessments/templates/page.tsx) | Template management. |
| `/assessments/templates/new` | [New template](../../src/app/(app)/assessments/templates/new/page.tsx) | Template creation. |
| `/assessments/templates/[id]` | [Template detail](../../src/app/(app)/assessments/templates/[id]/page.tsx) | Template/question management. |
| `/assessments/sessions/[id]` | [Session detail](../../src/app/(app)/assessments/sessions/[id]/page.tsx) | Session overview. |
| `/assessments/sessions/[id]/wizard` | [Assessment wizard](../../src/app/(app)/assessments/sessions/[id]/wizard/page.tsx) | Draft/runtime flow; evidence upload is not evidenced as shipped. |
| `/assessments/sessions/[id]/review` | [Review page](../../src/app/(app)/assessments/sessions/[id]/review/page.tsx) | Review/submission flow; validate required fields server-side. |
| `/assessments/sessions/[id]/complete` | [Completion page](../../src/app/(app)/assessments/sessions/[id]/complete/page.tsx) | Completion route. |
| `/departments` | [Departments](../../src/app/(app)/departments/page.tsx) | Organization administration. |
| `/members` | [Members](../../src/app/(app)/members/page.tsx) | Team administration. |
| `/organization` | [Organization](../../src/app/(app)/organization/page.tsx) | Organization details/settings. |
| `/profile` | [Profile](../../src/app/(app)/profile/page.tsx) | User profile settings. |
| `/settings` | [Settings](../../src/app/(app)/settings/page.tsx) | Settings landing page. |
| `/settings/security-domains` | [Security domains](../../src/app/(app)/settings/security-domains/page.tsx) | Domain management. |
| `/invitations` | [Invitations](../../src/app/(app)/invitations/page.tsx) | Invitation administration. |
| `/reports` | [Reports](../../src/app/(app)/reports/page.tsx) | Placeholder; report generation/storage is not implemented. |

There is no current page route evidenced for `/risks`, `/admin`, `/reports/[id]`, `/auth/signup`, `/auth/forgot-password`, or `/auth/reset-password`. Treat those paths as planned only unless corresponding routes are added.

## Access control notes

- Authenticated app pages are grouped under `src/app/(app)` and share an application layout. Middleware and page/action guards exist, but UI navigation hiding is not an authorization boundary.
- Verify each server action and database operation with role-specific permission checks and Supabase RLS. Do not infer that all roles listed in the PRD can access a route solely from this page map.
- The intended roles are Owner, Admin, Security Officer, Manager, and Employee. Exact action permissions are maintained in the authorization feature and must remain consistent with database policies.
- Planned dashboard behaviors, risk registry, auditor report detail, and system administration views are not current routes.

## Future route candidates (not implemented)

These are ideas from earlier architecture documents, not part of the current route tree: a risk registry and risk detail route; report detail/export routes; an admin console; and dedicated password-recovery/reset pages. Add them to the application and backlog before describing them as available.
