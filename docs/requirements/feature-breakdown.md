# Feature Breakdown (Epics & Stories)

> **Historical requirements reference, not the current issue tracker.** The story IDs and acceptance criteria below predate the canonical Sprint 0–7 backlog and conflict with its identifiers in places. Use [sprint-backlog.md](sprint-backlog.md) for canonical issue IDs and [project-completion-plan.md](../project-completion-plan.md#sprint-0-7-issue-status-and-evidence) for current implementation status and evidence. Acceptance criteria in this document are target requirements only; they are not evidence that a feature is implemented or tested.

This document preserves the original product-story intent for reference. Reconcile any requirements retained for the MVP into the canonical backlog before treating them as release commitments.

---

## Epic 1: Authentication & Workspace Setup

### Story CG-101: Secure Email/Password Signup
- **As a** new client executive,
- **I want to** register an account using my corporate email and password,
- **So that** I can create a secure workspace profile.
- **Acceptance Criteria**:
  - Validates email domain format.
  - Enforces password length of at least 8 characters.
  - Automatically triggers a confirmation email dispatch.
  - Synchronizes user parameters to the `profiles` table.

### Story CG-102: User Verification and Login
- **As a** registered user,
- **I want to** verify my email address and sign in,
- **So that** I can securely access the platform.
- **Acceptance Criteria**:
  - Link inside verification email successfully redirects to `/dashboard` with an active session.
  - Shows custom validation error if link is expired.
  - Standard login form supports session persistence (remember me check).

---

## Epic 2: Compliance Assessment Engine

### Story CG-201: Assessment Session Initialization
- **As a** Security Officer,
- **I want to** start a new compliance assessment session selecting from pre-defined templates (e.g. SOC 2),
- **So that** we can start tracking our criteria controls.
- **Acceptance Criteria**:
  - Prompts to select an assessment template.
  - Instantiates `assessment_sessions` and related `responses` rows with a default state of `DRAFT`.

### Story CG-202: Answering Questions & Attaching Evidence
- **As a** Compliance Auditor,
- **I want to** select answers to assessment questions and attach documentation files as evidence,
- **So that** we satisfy the framework audit criteria.
- **Acceptance Criteria**:
  - Standard response input choices (Yes / No / NA / Open text notes).
  - Integrates file upload interface writing directly to Supabase Storage bucket.
  - Auto-saves responses as draft inputs.

---

## Epic 3: Dynamic Risk Scoring & Mitigation

### Story CG-301: Risk Registry Entry Creation
- **As a** Security Officer,
- **I want to** register security threats in the Risk Registry with Likelihood and Impact numbers,
- **So that** we evaluate their severity.
- **Acceptance Criteria**:
  - Supports entering title, description, Likelihood (1-5), and Impact (1-5).
  - Dynamically calculates the Risk Score: `Likelihood * Impact` (1-25).
  - Groups risks by severity classifications (Critical, High, Medium, Low).
