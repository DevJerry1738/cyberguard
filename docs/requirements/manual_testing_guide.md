# Manual Testing Guide — Epic 9: Assessment Templates

This guide details step-by-step verification procedures to manually test the versioned Assessment Template system within CyberGuard. Tests cover RBAC access matrix, creation, versioning, duplication, domain mapping, and lifecycle states.

---

## Prerequisites

1. Ensure the database migration has been applied to your database.
2. Ensure you have user accounts set up in your organization representing different RBAC roles:
   - **Owner** (Full access)
   - **Admin** / **Security Officer** (Management access)
   - **Manager** (View-only access)
   - **Employee** (No access)

---

## Test Scenario 1: RBAC Access Matrix & Visibility

Verify that page access and buttons are restricted based on user roles.

### Steps
1. Log in as an **Employee** and navigate to `/assessments/templates`.
   - **Expected Result**: You are redirected to `/403` or see a permission denied screen. Employee cannot view templates.
2. Log in as a **Manager** and navigate to `/assessments/templates`.
   - **Expected Result**: You can view the list of templates. Click on a template to view detail page.
   - **Expected Result**: "New Template", "Edit Draft", "Duplicate", "Activate", and "Delete" buttons are hidden or disabled.
3. Log in as a **Security Officer** and navigate to `/assessments/templates`.
   - **Expected Result**: You can view templates, click "New Template" to open the wizard, and view detail pages.
   - **Expected Result**: On the template detail page, you can see "Edit Draft", "Manage Domains", and "Duplicate" options, but "Activate" and "Archive" buttons are hidden or disabled.
4. Log in as an **Admin** and navigate to `/assessments/templates`.
   - **Expected Result**: You have access to all actions except "Delete Template" (which is Owner-only).
5. Log in as the **Owner**.
   - **Expected Result**: You have access to all actions including "Delete Template".

---

## Test Scenario 2: Create Template Wizard

Verify that templates can be created correctly through the multi-step form wizard.

### Steps
1. Log in as **Owner** or **Admin** and navigate to `/assessments/templates/new`.
2. **Step 1: Basic Information**
   - Leave the "Template Name" field empty and click **Next**.
     - **Expected Result**: Validation error shows "Template name is required".
   - Enter a name, select a framework (e.g. `ISO 27001`), set version to `1.0` (invalid format), and click **Next**.
     - **Expected Result**: Validation error shows "Version must be a valid semantic version (e.g. 1.0.0)".
   - Change the version to `1.0.0` and click **Next**.
     - **Expected Result**: Form proceeds to Step 2.
3. **Step 2: Security Domains**
   - Click **Next** without selecting any domains.
     - **Expected Result**: Validation error shows "At least one security domain must be assigned".
   - Select one or more security domains from the checkbox cards and click **Next**.
     - **Expected Result**: Form proceeds to Step 3.
4. **Step 3: Review & Publish**
   - Verify all metadata summary details match your inputs and the assigned domains counts are correct.
   - Click **Create Template**.
     - **Expected Result**: You are redirected to the details page `/assessments/templates/[id]` of the newly created template.
     - **Expected Result**: The template status badge shows **Draft** and version shows **v1.0.0**.

---

## Test Scenario 3: Edit Draft Metadata and Domains

Verify editing capabilities are allowed on draft templates but restricted once activated.

### Steps
1. Navigate to the detail page of your newly created **Draft** template.
2. Click **Edit Draft Info**.
   - Modify the name, description, and save.
     - **Expected Result**: Metadata updates immediately and a success state is shown.
3. Click **Manage** next to "Assigned Security Domains".
   - Add another domain or deselect one. Click **Save Assignments**.
     - **Expected Result**: The domain list updates on the details page.
4. Go to the Database `audit_logs` table (via Supabase Studio) or view the audit trail.
   - **Expected Result**: Audit entries `template.create` and `template.update` are recorded with corresponding JSON details.

---

## Test Scenario 4: Duplication & Semantic Versioning Lineage

Verify that duplication copies all configuration to a new draft and updates version lineage.

### Steps
1. Navigate to the details page of an existing template (e.g. `v1.0.0`).
2. Click **Duplicate & Version**.
   - **Expected Result**: A dialog opens suggesting the next version (e.g., `1.1.0`) and default name.
3. Enter an invalid version format (e.g. `2.0`) and submit.
   - **Expected Result**: Correctly displays validation error.
4. Enter `1.1.0` and submit.
   - **Expected Result**: A new template is created in the **Draft** state.
   - **Expected Result**: You are redirected to the new template's details page `/assessments/templates/[new-id]`.
   - **Expected Result**: Under the **Version History** sidebar, both `v1.0.0` and `v1.1.0` are shown in the lineage timeline.
   - **Expected Result**: The assigned domains from the source template are automatically copied over.

---

## Test Scenario 5: Activation & Single-Active Rule

Verify the lifecycle transition from Draft to Active, and that only one active version is allowed per family.

### Steps
1. Locate your template `v1.0.0` (Draft) and navigate to its detail page.
2. Click **Activate Template**.
   - **Expected Result**: The status badge updates to **Active**.
   - **Expected Result**: The "Edit Draft Info" and "Manage Domains" options are hidden (the template is now immutable).
3. Navigate to the duplicated draft template `v1.1.0` (belonging to the same family).
4. Click **Activate Template**.
   - **Expected Result**: The status badge for `v1.1.0` updates to **Active**.
5. Click on `v1.0.0` in the **Version History** lineage timeline to navigate back to its details page.
   - **Expected Result**: The status badge for `v1.0.0` has automatically updated to **Archived**. The previous active version was successfully deactivated.

---

## Test Scenario 6: Archiving & Read-Only Constraints

Verify that active templates can be archived and become read-only.

### Steps
1. Navigate to the details page of an **Active** template.
2. Click **Archive Template**.
   - **Expected Result**: Status badge changes to **Archived**.
   - **Expected Result**: Action buttons for editing, domain management, activation, and archiving are hidden.
   - **Expected Result**: The only remaining action is **Duplicate & Version** (to evolve it in a new draft).

---

## Test Scenario 7: Soft Deletion (Owner-Only)

Verify template soft deletion.

### Steps
1. Log in as the **Owner** and open any template details page.
2. Click **Delete Template**.
   - **Expected Result**: A warning modal appears indicating deletion will soft-delete the template.
3. Click **Delete** to confirm.
   - **Expected Result**: The template is soft-deleted. You are redirected to the templates list page.
   - **Expected Result**: The deleted template is no longer displayed in the templates list dashboard.
   - **Expected Result**: Checking the database confirms `deleted_at` and `deleted_by` fields are populated on the deleted record.
4. Log in as an **Admin** and try to delete a template.
   - **Expected Result**: You cannot see the "Delete Template" button.
