# CyberGuard — Project Status & Completion Plan

**Assessment date:** 2026-10-23  
**Assessment type:** Static review of repository documentation, application source, migrations, configuration, and visible test assets. No live Supabase/Vercel environment or production deployment was inspected.

## 1. Product goal

CyberGuard is intended to be a multi-tenant SaaS platform for organizations to manage cybersecurity compliance and operational risk. The product should let teams configure frameworks and assessments, assign work, collect evidence, calculate compliance and risk posture, track remediation, and provide auditable, exportable reports. Database-level tenant isolation and role-scoped access are foundational requirements.

The near-term release scope is the PRD and Sprints 0–7. PRD Sprints 8–9 (cloud posture monitoring and AI recommendations) are explicitly future roadmap items and are not included in the completion estimate below.

## 2. Current project shape

The repository currently implements a **single Next.js 15 App Router application backed by Supabase**. The README and route map have been updated to describe this architecture; the older monorepo/NestJS/Prisma design remains only as historical context in migration documentation. The repo includes authentication and onboarding flows, organization/team administration, a substantial assessment builder and runtime, Supabase migrations/RLS policies, a marketing site, and a basic application dashboard.

The assessment work has progressed beyond the original sprint backlog: the architecture sprint document defines Epics 8–17, and the code/migrations show substantial work through the assessment lifecycle. However, the original PRD’s risk registry, real compliance analytics, evidence storage, reporting, notifications, MFA enforcement, and production validation are not yet evidenced as complete.

## 3. Progress estimate

### Overall: approximately **33% of the original Sprints 0–7 backlog by verified-status weighting**

This is a rough **status-weighted backlog coverage** estimate, not a measure of engineering effort or release readiness. The canonical issue register contains 30 issue/story items: 3 are Done, 14 Partial, 10 Not started, and 3 Blocked/unknown. Weighting Done as 1, Partial as 0.5, and Blocked/Not started as 0 gives $(3 + 14 \times 0.5) / 30 \approx 33.3\%$, rounded to 33%. The estimate is intentionally conservative because code presence without verified acceptance is only partial credit.

The newer Epics 8–17 assessment roadmap is not added to the denominator because it overlaps original assessment stories. Within that expanded assessment scope, Epics 8–13 have strong implementation evidence, progress tracking and review/submission are present, and assessment dashboard/audit integration are partial. This explains why assessment functionality is substantially further along than the overall product.

**Launch readiness is materially lower than the 33% backlog estimate.** Risk management and reporting are core PRD value propositions and remain absent or placeholder-level; security acceptance tests and a verified production release are also outstanding. No live-service, manual QA, accessibility, performance, availability, or tenant-isolation results were available for this review.

### Status by sprint

| Sprint | Overall status | Evidence-based assessment |
|---|---|---|
| 0 — Foundation | **Partial** | App, docs, migrations, and CI configuration exist; build/lint are unverified and CI targets nonexistent workspaces/scripts. |
| 1 — Identity & organization | **Partial** | Main flows exist; email, recovery, role boundaries, and full journey need verification. |
| 2 — Assessment engine | **Partial** | Builder and lifecycle exist; evidence upload is absent, while baseline framework data and server-side submission rules need verification. |
| 3 — Risk scoring | **Not started** | No risk registry, scoring model, or recommendations implementation was found. |
| 4 — Dashboard & reports | **Partial** | Dashboard shell exists; metrics are placeholders and reports are not implemented. |
| 5 — Notifications & audit | **Partial** | Some actions log events; notifications, viewer/export, and append-only enforcement are unverified or absent. |
| 6 — Security hardening | **Not started** | MFA enforcement and tenant-boundary tests are absent; headers and RLS assurance remain outstanding. |
| 7 — Deployment | **Blocked / unknown** | Repository configuration exists, but live environment, deployment, domain, and ownership require operator confirmation. |

### Sprint 0–7 issue status and evidence

The master issue identifiers and titles live in [docs/requirements/sprint-backlog.md](requirements/sprint-backlog.md). **Done** means repository evidence satisfies the described documentation/configuration task; **Partial** means implementation is present but acceptance or validation is incomplete; **Blocked** means required external state or a prerequisite is unavailable; **Not started** means no implementation evidence was found. A source link is not proof of runtime acceptance. No conventional automated test suite was found; where marked, test verification remains pending.

| Issue | Status | Implementation / acceptance evidence | Test or verification evidence |
|---|---|---|---|
| CG-001 — Next.js 15 app structure | **Done** | [package.json](../package.json), [App Router](../src/app) | `npm run build` completed, including Next.js compilation, linting, and type validation. |
| CG-002 — lint/format/hooks configuration | **Partial** | [Package scripts](../package.json), [Prettier config](../.prettierrc.json), [lint-staged config](../.lintstagedrc.json), [Commitlint config](../.commitlintrc.json); no ESLint config was identified. | Lint not run; configuration completeness and hook execution are unverified. |
| CG-003 — RLS isolation and helper functions | **Partial** | [RLS strategy](architecture/rls-strategy.md), [Supabase migrations](../supabase/migrations) | No automated cross-tenant RLS suite found. |
| CG-004 — architecture and ADR documentation | **Done** | [Architecture documents](architecture), [ADRs](architecture) | Documentation presence reviewed; no separate test applies. |
| CG-005 — PRD and data design | **Done** | [PRD](requirements/prd.md), [database design](architecture/database-design.md) | Documentation presence reviewed; schema correspondence still requires migration review. |
| CG-006 — GitHub Actions CI | **Partial** | [CI workflow](../.github/workflows/ci.yml) | Workflow references missing workspace packages and `pnpm test`; CI is not currently valid evidence. |
| CG-101 — Supabase SSR clients | **Partial** | [Supabase clients](../src/lib/supabase) | No automated auth-client tests found. |
| CG-102 — auth profile synchronization | **Partial** | [Auth/onboarding migrations](../supabase/migrations), [onboarding API](../src/app/api/onboarding/complete/route.ts) | Trigger and profile-sync behavior require database integration verification. |
| CG-103 — signup, verification, login | **Partial** | [Auth pages and routes](../src/app/login), [registration](../src/app/register), [auth API](../src/app/api/auth) | [Signup smoke script](../scripts/test-signup.js) is a one-off, not CI coverage; email delivery/redirect tests pending. |
| CG-104 — create organization and Owner | **Partial** | [Onboarding API](../src/app/api/onboarding/complete/route.ts), [onboarding UI](../src/features/onboarding) | No repeatable onboarding integration test found. |
| CG-105 — invitations and email | **Partial** | [Invitation actions](../src/features/invitations/actions/invitations.ts), [accept invite route](../src/app/accept-invite) | Token/acceptance tests and actual email delivery verification not found. |
| CG-201 — assessment template schema | **Partial** | [Template migration](../supabase/migrations/20260707_epic9_assessment_templates.sql), [template routes](../src/app/(app)/assessments/templates) | [Template DB script](../scratch/test-templates.js) is manual and destructive to test data; baseline seed verification pending. |
| CG-202 — assessment wizard | **Partial** | [Assessment routes](../src/app/(app)/assessments), [assessment components](../src/features/assessments/components) | No automated wizard/browser test found. |
| CG-203 — response autosave | **Partial** | [Draft actions](../src/features/assessments/actions/drafts.ts), [draft migration](../supabase/migrations/20260722143000_create_assessment_drafts.sql) | Offline, concurrency, and persistence behavior need repeatable integration tests. |
| CG-204 — evidence bucket/uploads | **Not started** | No upload implementation or evidence bucket/policy was found in the reviewed source/migrations. | No upload test found. |
| CG-301 — risk registry UI | **Not started** | No risk registry route or feature module found. | No test found. |
| CG-302 — likelihood/impact entry | **Not started** | No risk-entry UI or data model found. | No test found. |
| CG-303 — risk calculation/severity | **Not started** | No risk calculation or severity implementation found. | No test found. |
| CG-401 — executive dashboard metrics | **Partial** | [Dashboard](../src/app/(app)/dashboard/page.tsx) has team/dept/activity data; compliance score and risk counts remain placeholders. | No dashboard calculation tests found. |
| CG-402 — PDF assessment reports | **Not started** | [Reports page](../src/app/(app)/reports/page.tsx) is a placeholder; no PDF generator found. | No test found. |
| CG-403 — report storage/download | **Not started** | No report storage/download workflow or configured reports bucket was found. | No test found. |
| CG-501 — notifications | **Not started** | [Notifications feature](../src/features/notifications) has no implementation. | No test found. |
| CG-502 — immutable audit logging | **Partial** | Actions insert audit events; see [audit writes](../src/features/assessments/actions) and [database migrations](../supabase/migrations). | Append-only database enforcement and tamper tests not verified. |
| CG-503 — audit viewer | **Partial** | [Dashboard activity feed](../src/app/(app)/dashboard/page.tsx) shows recent events; dedicated search/export viewer not found. | No viewer/filter/export tests found. |
| CG-601 — administrative MFA | **Not started** | No MFA enrollment or assurance-level guard was found. | No MFA tests found. |
| CG-602 — tenant isolation tests | **Not started** | RLS policies exist in [migrations](../supabase/migrations), but no systematic test suite was found. | Cross-tenant allow/deny test suite absent. |
| CG-603 — secure HTTP headers | **Not started** | [Next config](../next.config.js) does not configure the documented headers. | Header verification test absent. |
| CG-701 — Vercel deployment | **Blocked** | [Vercel config](../vercel.json) describes build settings only. | Live deployment and smoke test require operator confirmation. |
| CG-702 — production migrations/seeds | **Blocked** | [Migration files](../supabase/migrations) are present; applied production state is unknown. | Requires Supabase operator verification. |
| CG-703 — custom domain and SSL | **Blocked** | No repository evidence establishes active DNS/domain/SSL state. | Requires domain/Vercel operator confirmation. |

**Owner confirmation required:** staging/production projects and account owners, release approver, deployed commit, applied migrations/seeds, secrets storage/rotation, email and redirect configuration, domain/SSL, backups/restore, monitoring/alerts, and approval of commercial/security/customer claims. Do not mark deployment stories Done until these facts and smoke-test evidence are recorded.

### Expanded assessment epics (8–17)

- **Strong implementation evidence:** Epic 8 Security Domains; Epic 9 Assessment Templates; Epic 10 Question Builder; Epic 11 Sessions/Assignments; Epic 12 runtime/wizard; Epic 13 draft persistence/offline-related management.
- **Implemented or partial:** Epic 14 progress tracking (progress UI and calculation are present); Epic 15 review/submission (routes and actions exist, but server-side validation and atomic finalization require hardening); Epic 16 assessment dashboard/list functionality (session list/cards exist; not the executive compliance dashboard); Epic 17 audit integration (many actions log, but complete immutable coverage and a dedicated inspector are unverified).

## 4. Findings that affect the plan

1. **Documentation and marketing drift:** README, the route map, and the Sprint 0–7 roadmap now describe the current single-app stack and distinguish status from planning references. Historical ADR/case-study material still discusses the former architecture by design. Core marketing pages now identify roadmap features and illustrative sample data; commercial terms, deployment-specific security statements, and owner approvals still require confirmation.
2. **CI does not match this repository:** `.github/workflows/ci.yml` references `@cyberguard/*` workspace packages and `pnpm test`, while the root package is a single Next.js app with no test script and no matching apps/packages structure. Therefore CI is not credible evidence of build/test health until corrected.
3. **Security/consistency review required before release:** Server actions and migrations need a focused check of authorization consistency, RLS coverage, service-role use, submission validation, and audit-log immutability. The assessment submission implementation explicitly relies on client-side required-field validation; the server must enforce the business rule as the trust boundary.
4. **No test inventory:** No conventional `*.test.*` / `*.spec.*` suite was found. Scratch integration scripts exist, but they are not a substitute for repeatable automated CI tests.
5. **Non-functional requirements are unverified:** There is no performance, scalability, uptime, or WCAG 2.1 AA audit evidence in the repository.

## 5. Completion roadmap

### Phase 0 — Re-baseline scope and documentation

- [x] Establish this document as the Sprint 0–7 status/evidence reference and the issue register as the canonical source of story IDs. Source-present but untested work remains **Partial**; missing test evidence is stated explicitly.
- [x] Refresh the README, route map, backlog, and sprint roadmap for the current Next.js 15 + Supabase single-app architecture. Sprint 1/2 architecture docs are labeled as design references.
- [x] Qualify public capability claims and label roadmap features and illustrative sample data. Pricing, security, and customer claims still require owner confirmation.
- [ ] Obtain project-owner confirmation of hosted environment state, deployment ownership, and commercial/security claims. These cannot be verified from this repository.

**Exit criteria:** one agreed MVP scope and canonical backlog; no contradictory current-status tracker, obsolete setup instructions, or unsupported availability claims. Repository documentation is aligned; external deployment/environment and claim approvals remain open until confirmed by owners.

### Phase 1 — Stabilize the assessment foundation

- Fix correctness/security issues in assessment session creation, assignment, draft synchronization, and submission. Enforce required-answer validation server-side, verify session status/ownership at every mutation, and make final submission atomic and auditable.
- Review and test each assessment RLS policy for same-tenant and cross-tenant behavior, including unassigned members, role changes, archived/deleted records, and response ownership.
- Implement evidence upload to a private Supabase Storage bucket with tenant/session-scoped paths, MIME/size validation, authorization policies, and secure download behavior—or explicitly remove it from MVP scope and marketing claims.
- Confirm expected baseline framework templates are seeded or provide an approved import process; test custom-template creation and versioning.
- Add repeatable automated tests for core lifecycle and failure paths; promote scratch DB scripts into safe, deterministic test tooling.

**Exit criteria:** an authorized team member can create, assign, complete, save/resume, attach permitted evidence, review, and submit an assessment; unauthorized/cross-tenant operations fail in automated tests.

### Phase 2 — Deliver risk registry and recommendations (Sprint 3)

- Define risk data model, tenant RLS, validation, lifecycle/status, ownership, and recommendation relationship.
- Build risk CRUD, likelihood/impact scoring, severity bands, filtering, and remediation status/owner/due date workflows.
- Define and test how assessment gaps create or link risks; avoid implying automatic scoring until the mapping rules are explicit.

**Exit criteria:** risk score is reproducible from validated inputs, tenant-isolated, auditable, and displayed consistently in the registry and details view.

### Phase 3 — Make dashboard and reporting data-driven (Sprint 4)

- Replace hard-coded compliance/risk metrics with server-derived values and documented formulas; show empty/loading/error states where data is absent.
- Implement report generation (PDF and any promised JSON/CSV formats), tenant-scoped report storage, access/download authorization, and retention rules.
- Add report history and auditor-access workflow only if it remains in MVP scope.

**Exit criteria:** dashboard values match underlying assessment/risk records; an authorized user can generate and retrieve a reproducible report for a completed assessment.

### Phase 4 — Complete notifications and audit governance (Sprint 5)

- Decide which events produce notifications, recipients, delivery channels, read state, and retention; implement the in-app notification experience.
- Complete an audit-event catalogue for identity, organization, invitation, assessment, evidence, risk, and report actions. Ensure actor/tenant/resource details are sufficient while avoiding secrets and sensitive payloads.
- Enforce append-only audit behavior with database privileges/policies/triggers as appropriate; build a role-protected audit viewer with search, date filters, and export if required.

**Exit criteria:** critical lifecycle events are captured and cannot be modified/deleted through application roles; authorized reviewers can find and export relevant events.

### Phase 5 — Security and quality gate (Sprint 6)

- Implement Supabase MFA enrollment and assurance-level enforcement for Owner/Admin routes, including recovery and unenrollment edge cases.
- Add and validate documented HTTP security headers and review cookie/session, redirect, input validation, upload, and secret-handling controls.
- Build automated RLS/authorization tests for every tenant-owned table and route/action, including negative cross-tenant cases. Keep service-role operations isolated to narrowly scoped server code.
- Repair CI for the actual single-app repository: install, lint, type-check, build, and run automated tests. Do not retain commands for nonexistent workspaces.
- Run accessibility checks (keyboard and screen reader basics, labels/focus/errors/contrast) and performance checks against the PRD targets; document results and follow-up work.

**Exit criteria:** CI is green on pull requests; critical authorization and lifecycle tests pass; MFA policy is enforced; security/accessibility/performance findings are triaged.

### Phase 6 — Release and operational readiness (Sprint 7)

- Establish staging and production Supabase projects, secrets, redirect URLs, email settings, storage policies, and migration/seed procedure.
- Apply migrations to staging and rehearse rollback/recovery; verify schema state and representative data without exposing production secrets.
- Deploy to Vercel staging, run end-to-end smoke tests, then approve production release and domain/SSL configuration.
- Add release checklist covering backups/restore, monitoring/alerts, incident ownership, data retention, support contacts, and post-deploy verification.

**Exit criteria:** a documented, repeatable release is live; authentication, tenant isolation, assessment, risk, reports, and operational monitoring pass production smoke checks. Production deployment completion must be confirmed externally.

## 6. Suggested priority order

1. Reconcile scope/docs and repair CI so changes can be validated.
2. Harden assessment submission, authorization/RLS, and evidence handling.
3. Implement risk registry and assessment-to-risk workflow.
4. Build real dashboard calculations and report exports.
5. Finish notifications and audit viewer/immutability.
6. Enforce MFA, security headers, automated security tests, accessibility and performance checks.
7. Stage, rehearse migrations, deploy, and verify operational readiness.

This order prioritizes trust and data integrity before adding analytics and release polish. Run the relevant authorization and regression tests after every phase rather than deferring security validation until the end.

## 7. Definition of project completion

The Sprints 0–7 MVP is complete only when all of the following are evidenced:

- PRD core workflows work end-to-end for Owner, Admin, Security Officer, Manager, and Employee roles where applicable.
- Assessment evidence, risk scoring/remediation, data-driven dashboard, reports, notifications, and audit history work as scoped—or are explicitly removed from MVP requirements and public claims.
- RLS and server-side permission tests demonstrate tenant isolation; audit records are append-only; administrative MFA is enforced.
- CI runs lint, type-check, production build, and automated tests successfully against the actual repository.
- Staging/production configuration, migrations, secrets, custom domain/SSL, backups, monitoring, and smoke tests are documented and verified by the responsible operators.
- Accessibility and performance targets have test evidence and any accepted exceptions are documented.

## 8. Limitations of this estimate

This status is based on repository evidence only. Source presence does not prove a feature works, satisfies every acceptance criterion, or is deployed. Database policies were not executed against a live/test Supabase instance, no end-to-end browser journey was run, and production configuration was not inspected. Recalculate the percentage after tests and live deployment state are confirmed.
