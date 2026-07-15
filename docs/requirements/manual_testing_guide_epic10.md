# Manual Testing Guide — Epic 10: Enterprise Question Builder

This guide details the step-by-step manual testing procedure to verify the Question Builder module, its drag-and-drop mechanics, validation layers, dynamic renderers, and state security rules.

---

## Prerequisites
1. Ensure database migration `20260709_epic10_question_builder.sql` is applied.
2. Have test accounts matching:
   - **Owner** (full permissions + deletion)
   - **Security Officer** / **Admin** (can add, edit, duplicate, reorder)
   - **Manager** (read-only view access)
   - **Employee** (no access)

---

## Test Scenario 1: Navigation & Tabbed Layout
1. Log in as a **Security Officer** or **Admin**.
2. Navigate to `/assessments/templates` and select any template in **Draft** status.
3. Verify the tabs bar in the upper-right corner:
   - Select **Questions Builder**.
   - **Expected Result**: A grouped view of domains appears. Empty state prompts "No questions match the filters in this domain" if no questions exist.
4. Select **Overview** tab.
   - **Expected Result**: Swaps smoothly back to metadata and lineage view.

---

## Test Scenario 2: Add Question & Validation Constraints
1. Select **Questions Builder** tab.
2. Click **Add Question** inside one of your assigned domains.
3. **Validation Check**:
   - Leave the "Question Text" empty or type less than 5 characters.
   - Click **Save Question**.
   - **Expected Result**: Error banner shows "Question text must be at least 5 characters long."
4. **Yes/No Question Creation**:
   - Enter: `Are security audits conducted annually?`
   - Select Response Type: `Yes / No`
   - Click **Save Question**.
   - **Expected Result**: Question card is rendered instantly under the domain header.
5. **Choice-Based Question Validation**:
   - Click **Add Question**.
   - Select Response Type: `Multiple Choice`.
   - Clear all predefined option fields so only 1 option is present or fields are blank.
   - Click **Save Question**.
   - **Expected Result**: Error banner shows "At least 2 options are required for choice-based question types."
   - Fill out 2 valid options (e.g. Label: `Internal`, Value: `internal` and Label: `Third-Party`, Value: `third_party`).
   - Click **Save Question**.
   - **Expected Result**: Question card is saved and shows `2 Options`.

---

## Test Scenario 3: Question Cards & Reordering
1. Create at least 3 questions in a single domain.
2. Hover over a question card.
3. Click and drag the handle icon on a card, then drop it above/below another question in the same domain.
   - **Expected Result**: Questions change position immediately (optimistic UI update).
   - **Expected Result**: A background transaction triggers. Refresh the page to confirm the `sort_order` state persists.
4. **Fallback check**:
   - Expand the hover option panel or look for Up/Down arrows next to cards.
   - Use the up/down arrows to shift sort positions.
   - **Expected Result**: Cards swap order.

---

## Test Scenario 4: Duplication & Soft Deletion
1. Click the actions menu (three dots) on a question card.
2. Click **Duplicate**.
   - **Expected Result**: A new card is created in the same domain with `(Copy)` appended to the text, matching the original's type, weight, and choices.
3. Click the actions menu on a question card.
   - **If logged in as Security Officer**:
     - **Expected Result**: The "Delete" option is hidden or disabled.
   - **If logged in as Admin / Owner**:
     - Click **Delete** and confirm the prompt.
     - **Expected Result**: Card is immediately removed from the interface.
     - **Expected Result**: Inspecting `assessment_questions` in the DB shows `deleted_at` timestamp populated.

---

## Test Scenario 5: Preview Mode (Form Factory Simulation)
1. Click the **Preview Assessment** button in the builder bar.
2. **Expected Result**: Fullscreen wizard preview modal opens.
3. Verify rendering controls for each type:
   - **Yes/No**: Renders separate Yes and No highlight buttons. Clicking one toggles selection state.
   - **Multiple Choice**: Renders a list of radio buttons. Only one option can be selected.
   - **Checkbox**: Renders checkboxes. Multiple choices can be checked.
   - **Short/Long Text**: Renders styled inputs/textareas.
   - **Number / Date**: Renders browser-native number spinner and date calendar picker.
4. Verify the preview is read-only — clicking choices changes UI state but no answers are written to the database. Click **Close Preview** to return.

---

## Test Scenario 6: Active Template Mutability Lockdown
1. Go back to the template **Overview** tab.
2. Click **Activate Template**.
3. Once the status changes to **Active**, select the **Questions Builder** tab.
4. **Expected Result**:
   - The "Add Question" buttons are hidden.
   - The three-dot action menus and drag handles on all question cards are hidden/disabled.
   - A banner shows "Active templates cannot be edited."
