# Information Architecture & Sitemap

This document maps the navigation hierarchy, screen routing structures, and accessibility layout of CyberGuard.

---

## 1. Directory Sitemap & Routings

```text
/                                   (Public Landing Page)
├── /auth                           (Authentication Routing Group)
│   ├── /login                      (Login View)
│   ├── /signup                     (Registration View)
│   ├── /forgot-password            (Password Recovery Initiation)
│   └── /reset-password             (Credential reset callback)
├── /dashboard                      (Main User Dashboard - Dynamic layout by role)
├── /assessments                    (Assessments Root Directory)
│   ├── /sessions                   (List of all assessments)
│   └── /session/[id]               (Active Assessment Wizard / evidence input form)
├── /risks                          (Risk Registry List)
│   └── /risk/[id]                  (Detailed mitigation recommendations view)
├── /reports                        (Compliance exports library)
│   └── /report/[id]                (PDF document inspector)
├── /settings                       (User settings & configurations)
│   ├── /profile                    (Personal information settings)
│   └── /organization               (Workspace config / invite members - Admin only)
└── /admin                          (System control dashboard - Owner only)
```

---

## 2. Page Navigation Access Matrices

To ensure security alignment, routes are guarded at client-navigation and server-middleware scopes using authentication contexts:

| View Pattern | Access Role Required | Dynamic Component Behaviors |
|---|---|---|
| `/dashboard` | All authenticated members | Renders high-level compliance charts, task lists, and recent audit indicators customized by user's organization scope. |
| `/assessments/session/[id]` | All organization members | - Owners/Admins: Can edit, delete, and submit.<br>- Security Officers: Can fill answers and upload evidence.<br>- Managers/Employees: Read-only access or delegated sections. |
| `/settings/organization` | Admin, Owner | Allows changing workspace name, generating invitations, and updating member roles. Hidden for Managers and Employees. |
| `/admin` | Owner | Access to system-wide billing settings, organization audit log exports, and raw table inspection. |
