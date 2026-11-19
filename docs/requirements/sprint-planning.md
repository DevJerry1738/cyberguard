# Sprint Roadmap (Sprints 0–7)

This is the sequence and dependency view for the near-term MVP. It is not a second status tracker: **the canonical issue IDs/titles are in the [project backlog](sprint-backlog.md), and the single current status/evidence matrix is in the [project completion plan](../project-completion-plan.md#sprint-0-7-issue-status-and-evidence).** Statuses are based on repository evidence and require verification where noted.

The project is currently a single Next.js 15 App Router application backed by Supabase. Historical planning language about NestJS, Prisma, separate web/API workspaces, or a “current Sprint 0” is superseded. Refer to the [README](../../README.md) for current local setup.

| Sprint | Goal | Current evidence-based state | Dependency / exit focus |
|---|---|---|---|
| 0 — Foundation | Maintain the app, Supabase integration, architecture, security design, and usable CI. | **Partial** — app and docs exist; CI does not match the repo and build/lint are unverified. | Establish repeatable build, lint, type-check, and test validation for this app. |
| 1 — Identity & organization | Signup, verification, login, organization onboarding, members, roles, departments, and invitations. | **Partial** — core pages/actions exist; full email and authorization flows need tests. | Verify end-to-end onboarding and role/tenant boundaries. |
| 2 — Assessment engine | Templates, domains, questions, sessions, assignments, drafts, progress, review, and submission. | **Partial** — most lifecycle code exists; evidence upload is not evidenced and submission needs server-side validation. | Validate assessment lifecycle and RLS; resolve baseline template data and evidence scope. |
| 3 — Risk scoring | Risk registry, likelihood/impact scoring, severity, and mitigation workflows. | **Not started** — no registry/scoring implementation found. | Define model and tenant policies before building UI. |
| 4 — Dashboard & reporting | Data-driven compliance/risk dashboard and exportable reports. | **Partial** — dashboard shell exists; metrics are placeholders and reports are not implemented. | Document formulas, generate and authorize reproducible reports. |
| 5 — Notifications & audit | In-app notifications and complete append-only audit history/viewer. | **Partial** — some server actions log events; notifications and a dedicated viewer are absent/unverified. | Define event coverage, enforce immutability, provide authorized review. |
| 6 — Security hardening | MFA enforcement, secure headers, RLS tests, and quality gates. | **Not started** — key enforcement and automated tests were not found. | Pass negative cross-tenant tests; enforce MFA for designated roles. |
| 7 — Release | Staging/production configuration, migrations, domain, and operational readiness. | **Blocked / unknown** — config exists, hosted state and owners are unconfirmed. | Confirm project owners and verify deployment with staged smoke/recovery checks. |

## Planning rules

1. Keep issue IDs stable in the backlog; do not create alternate Sprint 1/2 identifiers in planning summaries.
2. Mark a story **Done** only after acceptance criteria have verification evidence. Source presence without tests or runtime checks remains **Partial**.
3. Record externally managed facts—hosted projects, migration state, secrets, domains, backups, monitoring, and release owners—as **owner confirmation required** until confirmed.
4. PRD Sprints 8–9 (cloud posture monitoring and AI-powered recommendations) are future roadmap items, outside this Sprint 0–7 MVP.
