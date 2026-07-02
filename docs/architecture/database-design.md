# Database Design & ER Diagram

This document details the normalized relational database schema designed for Supabase PostgreSQL.

---

## 1. Entity Relationship (ER) Diagram
The diagram below illustrates the tables, keys, and relational cardinalities:

```mermaid
erDiagram
    organizations ||--o{ profiles : "has"
    organizations ||--o{ organization_members : "manages"
    organizations ||--o{ departments : "contains"
    organizations ||--o{ assessment_sessions : "performs"
    organizations ||--o{ risk_scores : "evaluates"
    organizations ||--o{ recommendations : "resolves"
    organizations ||--o{ reports : "generates"
    organizations ||--o{ audit_logs : "records"
    organizations ||--o{ invitations : "sends"

    profiles ||--o{ organization_members : "belongs_to"
    profiles ||--o{ department_members : "assigned_to"
    profiles ||--o{ responses : "answers"
    profiles ||--o{ notifications : "receives"

    roles ||--o{ organization_members : "assigns"
    roles ||--o{ permissions : "grants"

    departments ||--o{ department_members : "groups"

    assessment_templates ||--o{ questions : "defines"
    assessment_templates ||--o{ assessment_sessions : "instantiates"

    questions ||--o{ responses : "evaluates"
    assessment_sessions ||--o{ responses : "collects"
    assessment_sessions ||--o{ recommendations : "produces"

    risk_scores ||--o{ recommendations : "mitigates"
```

---

## 2. Table Specifications

### 2.1. `organizations`
- **Purpose**: Represents corporate customer tenants.
- **Columns**:
  - `id` (uuid, PK): Auto-generated unique identifier.
  - `name` (text, Not Null): Organization name.
  - `created_at` (timestamptz, Not Null): Timestamp of tenant registration.
  - `updated_at` (timestamptz, Not Null).
- **Constraints**: Name cannot be empty.

### 2.2. `profiles`
- **Purpose**: Extends user profiles from Supabase Auth (`auth.users`).
- **Columns**:
  - `id` (uuid, PK, FK -> `auth.users.id`): Maps to authentication context.
  - `first_name` (text).
  - `last_name` (text).
  - `email` (text, Unique, Not Null).
  - `created_at` (timestamptz).
- **Lifecycle**: Created via PostgreSQL database trigger after a user signs up.

### 2.3. `roles`
- **Purpose**: Defines RBAC levels.
- **Columns**:
  - `id` (uuid, PK)
  - `name` (text, Unique, Not Null) - e.g., 'Owner', 'Admin', 'Security Officer', 'Manager', 'Employee'.
  - `description` (text)

### 2.4. `permissions`
- **Purpose**: Defines granular action items.
- **Columns**:
  - `id` (uuid, PK)
  - `role_id` (uuid, FK -> `roles.id`, Cascade)
  - `action` (text, Not Null) - e.g., 'assessments:write', 'users:invite', 'reports:read'.

### 2.5. `organization_members`
- **Purpose**: Maps users (profiles) to organizations with specific roles.
- **Columns**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK -> `organizations.id`, Cascade)
  - `profile_id` (uuid, FK -> `profiles.id`, Cascade)
  - `role_id` (uuid, FK -> `roles.id`)
- **Indexes**: Unique index on `(organization_id, profile_id)`.

### 2.6. `departments`
- **Purpose**: Groups members inside an organization.
- **Columns**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK -> `organizations.id`, Cascade)
  - `name` (text, Not Null)

### 2.7. `department_members`
- **Purpose**: Maps user profiles to departments.
- **Columns**:
  - `id` (uuid, PK)
  - `department_id` (uuid, FK -> `departments.id`, Cascade)
  - `profile_id` (uuid, FK -> `profiles.id`, Cascade)

### 2.8. `security_domains`
- **Purpose**: Categorization of controls (e.g. Identity Management, Networking).
- **Columns**:
  - `id` (uuid, PK)
  - `name` (text, Not Null)
  - `code` (text, Unique, Not Null) - e.g., 'IAM', 'NET', 'OPS'.

### 2.9. `assessment_templates`
- **Purpose**: Compliance framework schemas (e.g. SOC 2).
- **Columns**:
  - `id` (uuid, PK)
  - `title` (text, Not Null)
  - `version` (text, Not Null)

### 2.10. `questions`
- **Purpose**: Audit questions linked to security domains.
- **Columns**:
  - `id` (uuid, PK)
  - `template_id` (uuid, FK -> `assessment_templates.id`, Cascade)
  - `security_domain_id` (uuid, FK -> `security_domains.id`)
  - `text` (text, Not Null)
  - `weight` (numeric, Default 1.0)

### 2.11. `assessment_sessions`
- **Purpose**: An instantiated assessment for an organization.
- **Columns**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK -> `organizations.id`, Cascade)
  - `template_id` (uuid, FK -> `assessment_templates.id`)
  - `status` (text, Default 'DRAFT') - 'DRAFT', 'IN_PROGRESS', 'COMPLETED'
  - `completed_at` (timestamptz)

### 2.12. `responses`
- **Purpose**: Answers to questions in a session.
- **Columns**:
  - `id` (uuid, PK)
  - `session_id` (uuid, FK -> `assessment_sessions.id`, Cascade)
  - `question_id` (uuid, FK -> `questions.id`, Cascade)
  - `profile_id` (uuid, FK -> `profiles.id` - responder)
  - `value` (text, Not Null)
  - `evidence_url` (text) - Path to Supabase Storage file
  - `updated_at` (timestamptz)

### 2.13. `risk_scores`
- **Purpose**: Dynamic calculations of threats.
- **Columns**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK -> `organizations.id`, Cascade)
  - `title` (text, Not Null)
  - `likelihood` (int, 1-5)
  - `impact` (int, 1-5)
  - `score` (int, Generated: likelihood * impact)

### 2.14. `recommendations`
- **Purpose**: Auto-generated fixes mapped to assessments and risks.
- **Columns**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK -> `organizations.id`, Cascade)
  - `session_id` (uuid, FK -> `assessment_sessions.id`)
  - `risk_id` (uuid, FK -> `risk_scores.id`, Nullable)
  - `title` (text, Not Null)
  - `description` (text)
  - `priority` (text) - 'HIGH', 'MEDIUM', 'LOW'
  - `status` (text, Default 'OPEN')

### 2.15. `reports`
- **Purpose**: Extracted PDF/JSON compliance summary file.
- **Columns**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK -> `organizations.id`, Cascade)
  - `title` (text, Not Null)
  - `file_path` (text, Not Null)

### 2.16. `notifications`
- **Purpose**: In-app actions for users.
- **Columns**:
  - `id` (uuid, PK)
  - `profile_id` (uuid, FK -> `profiles.id`, Cascade)
  - `title` (text, Not Null)
  - `message` (text, Not Null)
  - `read` (boolean, Default false)

### 2.17. `audit_logs`
- **Purpose**: Immutable logging.
- **Columns**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK -> `organizations.id`, Cascade)
  - `profile_id` (uuid, FK -> `profiles.id`)
  - `action` (text, Not Null)
  - `details` (jsonb)
  - `created_at` (timestamptz, Default now())

### 2.18. `invitations`
- **Purpose**: Inviting new members.
- **Columns**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK -> `organizations.id`, Cascade)
  - `email` (text, Not Null)
  - `role_id` (uuid, FK -> `roles.id`)
  - `token` (text, Unique, Not Null)
  - `expires_at` (timestamptz, Not Null)
