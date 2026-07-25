# Assessment Engine Architecture & Draft Management (Epic 13)

## Architecture Overview

Epic 13 introduces a dedicated **Draft Manager** system for assessment progress persistence, optimistic concurrency control, and offline resilience.

```
Assessment Wizard (UI)
        │
        ▼
   DraftManager (React Context / Hooks)
        │
        ├── IndexedDB Local Store (Offline & Instant Local Persistence)
        │
        ├── Sync Queue (Exponential Backoff & Reconnect Flushes)
        │
        └── Supabase Backend (assessment_drafts table + Server Actions)
```

## Database Schema (`assessment_drafts`)

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary Key |
| `session_id` | UUID | FK to `assessment_sessions.id` |
| `user_id` | UUID | FK to `profiles.id` (Draft owner) |
| `organization_id` | UUID | FK to `organizations.id` (Tenant isolation) |
| `responses` | JSONB | Map of question ID to response value |
| `current_domain` | UUID | Last visited security domain ID |
| `current_question` | UUID | Last visited question ID |
| `progress` | INTEGER | Completion percentage (0 - 100%) |
| `version` | INTEGER | Revision counter for optimistic concurrency |
| `checksum` | TEXT | Optional payload integrity checksum |
| `last_saved_at` | TIMESTAMPTZ | Server save timestamp |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Updated timestamp |

Unique constraint: `(user_id, session_id)` — Only one active draft per user per assessment session.

## Save Lifecycle & Triggers

1. **Answer Change (Debounced)**: 2.5s debounce after typing/selection.
2. **Periodic Safety Net**: Saves every 5 seconds if changes are pending.
3. **Navigation Events**: Previous / Next / Domain selection triggers navigation state updates.
4. **Browser Refresh / Unload**: Best-effort synchronous write to IndexedDB before unload.
5. **Network Reconnect**: Flushes pending offline sync queue to Supabase.
6. **Manual Save**: Triggered via `Ctrl+S` or "Save Draft" button.

## Optimistic Concurrency & Conflict Detection

- Each server-side save increments the `version` column.
- When saving, client sends its expected `version`.
- If server version > client version:
  1. Server returns `409 Conflict` and current server draft.
  2. UI displays `ConflictDialog` with options:
     - **Reload Latest**: Overwrites local state with server draft.
     - **Confirm & Overwrite**: (Restricted to `Owner` and `Admin` roles with explicit confirmation) Force saves local version to server.

## Offline Capabilities

- Local cache managed via `IndexedDB` (`CyberGuardAssessmentDB`).
- All edits are immediately saved to `IndexedDB` before network requests.
- When offline:
  - Edits queue in `syncQueue` store.
  - UI shows `OfflineBanner` and status `Offline (Saved Locally)`.
- When online restored:
  - Queue flushes automatically via `syncOfflineDraft` server action.

## Audit Logging

The following lifecycle events are recorded in `audit_logs`:
- `assessment.draft.created`
- `assessment.draft.auto_saved`
- `assessment.draft.manual_saved`
- `assessment.draft.conflict_detected`
- `assessment.draft.conflict_resolved`
- `assessment.draft.resumed`
- `assessment.draft.discarded`
- `assessment.draft.offline_sync_started`
- `assessment.draft.offline_sync_completed`
- `assessment.draft.offline_sync_failed`
