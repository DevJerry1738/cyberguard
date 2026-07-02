# Project Backlog & Roadmap

This document outlines the master sprint backlog for the CyberGuard project.

---

## Sprint 0: Foundation Initialization (Current)

| Issue ID | Title | Status |
|---|---|---|
| **CG-001** | Initialize single-repo Next.js 15 project base structure | **Completed** |
| **CG-002** | Create root-level linting/formatting configs (ESLint, Prettier, Husky, Commitlint) | **Completed** |
| **CG-003** | Write RLS isolation rules and design DB helper functions | **Completed** |
| **CG-004** | Draft system architectural specifications and ADR guides | **Completed** |
| **CG-005** | Define Product Requirements Document (PRD) and ER Diagrams | **Completed** |
| **CG-006** | Setup GitHub Actions CI validation workflows | **Completed** |

---

## Sprint 1: Authentication & Organization Setup

- **CG-101**: Integrate `@supabase/ssr` server-side and browser client helpers.
- **CG-102**: Write database triggers to synchronize `auth.users` to `public.profiles`.
- **CG-103**: Implement user SignUp, Verification redirects, and Login screens.
- **CG-104**: Implement Create Organization flow and assign user as workspace Owner.
- **CG-105**: Build member invitation generation forms and email redirections.

---

## Sprint 2: Assessment Engine

- **CG-201**: Define templates schema (SOC 2, ISO 27001) and import migration script.
- **CG-202**: Build Assessment Wizard form flow displaying structured questions.
- **CG-203**: Add Next.js Server Actions to upsert and auto-save assessment responses.
- **CG-204**: Configure Supabase Storage bucket (`evidence`) and implement file upload logic.

---

## Sprint 3: Risk Scoring

- **CG-301**: Implement Risk Registry list dashboard interface.
- **CG-302**: Create input modal to log threat Likelihood and Impact metrics.
- **CG-303**: Add dynamic database triggers calculating Risk Severity (`Likelihood * Impact`).

---

## Sprint 4: Dashboard & Reporting

- **CG-401**: Create Executive dashboard dashboard widgets displaying active statistics.
- **CG-402**: Integrate PDF generation library exporting compliance audit summaries.
- **CG-403**: Setup Supabase Storage bucket (`reports`) storing generated PDF reports.

---

## Sprint 5: Notifications & Audit Logging

- **CG-501**: Build notification list widgets reporting assessment updates.
- **CG-502**: Create database rules capturing user updates as immutable `audit_logs`.
- **CG-503**: Create Admin panel audit trail inspector page.

---

## Sprint 6: Security Hardening

- **CG-601**: Configure Supabase MFA redirection flows on administrative routes.
- **CG-602**: Execute multi-tenant boundary automated security tests.

---

## Sprint 7: Production Deployment

- **CG-701**: Configure Next.js Vercel builds environment variables.
- **CG-702**: Release production database migrations to Live Supabase instance.
- **CG-703**: Setup Custom Domain name bindings and SSL certificates.

