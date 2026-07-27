-- ============================================================
-- CyberGuard – Fix assessment_sessions update RLS policy
-- ============================================================
-- The SELECT policy previously checked `and deleted_at is null`.
-- When performing a soft-delete (setting `deleted_at = now()`),
-- Supabase evaluates the row against the SELECT policy after the update.
-- Since `deleted_at` is no longer NULL, it violated the SELECT policy.

drop policy if exists "Members can view assessment sessions" on public.assessment_sessions;

create policy "Members can view assessment sessions"
  on public.assessment_sessions for select
  using (
    organization_id in (select public.current_user_organizations())
  );
