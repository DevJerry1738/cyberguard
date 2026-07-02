# Sprint Planning & Project Backlog

This document organizes our release cycles into logical sprint plans mapping out Sprints 0 through 7.

---

## Sprint 0: Foundation Initialization (Current)
- **Goal**: Establish the Next.js 15 project base, configure Supabase helper SDK scripts, define security policies, and build documentation guides.
- **Stories**: CG-001 (Init Project), CG-002 (Init Documentation & RLS Design).
- **Definition of Done**: 
  - Code compiles without typescript errors.
  - Core directory schemas, environment settings, and helper client SDK scripts are placed.
- **Risks**: None (Setup phase).
- **Deliverables**: Root project, Supabase configurations, and all Sprint 0 documentation.

---

## Sprint 1: Authentication & Organization Setup
- **Goal**: Implement complete signup, email verification, login, profile replication triggers, and multi-tenant organization creation/invite flows.
- **Stories**: CG-101 (Supabase Auth Client Integration), CG-102 (Profile DB Sync Triggers), CG-103 (Workspace Creation & Member Invite Form).
- **Acceptance Criteria**:
  - Users can sign up, receive confirmation emails, and log in.
  - Multi-tenancy isolation restricts workspace access to verified organization members.
- **Dependencies**: Sprint 0.
- **Deliverables**: UI login/registration screens, middleware session validation, and database onboarding triggers.

---

## Sprint 2: Assessment Engine
- **Goal**: Implement the compliance assessment session wizard allowing users to select frameworks, submit answers, and upload documentation evidence.
- **Stories**: CG-201 (Template Loading), CG-202 (Response Auto-save API), CG-203 (Evidence Upload to Storage Buckets).
- **Acceptance Criteria**:
  - Users can load SOC 2 template questions.
  - Files upload securely to the `evidence` bucket and attach URL paths to responses.
- **Dependencies**: Sprint 1.
- **Deliverables**: Assessment Wizard UI component, Supabase Storage bucket configurations, and responses API routes.

---

## Sprint 3: Risk Scoring
- **Goal**: Implement the Risk Registry dashboard where users can document threats and view calculated severity heatmaps.
- **Stories**: CG-301 (Risk Input CRUD), CG-302 (Dynamic Matrix Severity calculation), CG-303 (Recommendations mapping).
- **Acceptance Criteria**:
  - Automatically computes `Likelihood * Impact` scores.
  - Renders threat severity status labels dynamically.
- **Dependencies**: Sprint 2.
- **Deliverables**: Risk Registry view, threat severity heatmap component, and risk mitigation models.

---

## Sprint 4: Dashboard & Reporting
- **Goal**: Build high-fidelity dashboard views summarizing compliance statistics and allow generating PDF/JSON reports.
- **Stories**: CG-401 (Executive compliance gauge chart), CG-402 (Export assessment results as PDF), CG-403 (Auditor document download).
- **Acceptance Criteria**:
  - Dashboard scores update in real-time.
  - Exports a clean PDF containing organization, score, status, and recommendations checklist.
- **Dependencies**: Sprint 3.
- **Deliverables**: Landing Dashboard views, PDF Generation engine, and Report download links.

---

## Sprint 5: Notifications & Audit Logging
- **Goal**: Build in-app user notifications and record immutable transaction logs to track user compliance actions.
- **Stories**: CG-501 (Action notifications), CG-502 (Immutable Database Audit Logging), CG-503 (Security Log Viewer page).
- **Acceptance Criteria**:
  - Log records are stored automatically on any profile or assessment modification.
  - System blocks update or delete executions on the audit log table.
- **Dependencies**: Sprint 4.
- **Deliverables**: In-app notifications box and administrative audit log viewer page.

---

## Sprint 6: Security Hardening
- **Goal**: Configure multi-factor authentication (MFA) and harden database RLS policies.
- **Stories**: CG-601 (Configure MFA redirects), CG-602 (Execute comprehensive RLS security tests), CG-603 (Integrate secure HTTP headers).
- **Acceptance Criteria**:
  - Block access to core dashboards unless MFA is configured for Administrator users.
  - Execute automated tests to confirm tenant data isolation remains intact.
- **Dependencies**: Sprint 5.
- **Deliverables**: MFA security configurations, SQL security test script outputs.

---

## Sprint 7: Deployment
- **Goal**: Deploy the Next.js frontend to Vercel and configure production environments on Supabase.
- **Stories**: CG-701 (Deploy to Vercel staging/production), CG-702 (Run production database seedings), CG-703 (Setup custom domains & SSL).
- **Acceptance Criteria**:
  - Live deployment url is accessible with a secure SSL connection.
  - Live instance queries production database correctly.
- **Dependencies**: Sprint 6.
- **Deliverables**: Vercel configuration files, production deployments, and environment release checklists.
