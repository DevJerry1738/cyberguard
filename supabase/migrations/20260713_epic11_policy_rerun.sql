-- ============================================================
-- CyberGuard – Epic 11: Assessment Sessions policy recovery
-- ============================================================

-- Make this migration safe to apply after an older deployed version
-- of the Epic 11 migration already created the policy objects.

drop policy if exists "Members can view assessment sessions" on public.assessment_sessions;
drop policy if exists "Authorized roles can create assessment sessions" on public.assessment_sessions;
drop policy if exists "Authorized roles can update assessment sessions" on public.assessment_sessions;

drop policy if exists "Members can view assessment assignments" on public.assessment_session_assignments;
drop policy if exists "Authorized roles can create assessment assignments" on public.assessment_session_assignments;
drop policy if exists "Authorized roles can update assessment assignments" on public.assessment_session_assignments;
drop policy if exists "Authorized roles can delete assessment assignments" on public.assessment_session_assignments;

-- assessment_sessions: SELECT for all organization members
create policy "Members can view assessment sessions"
  on public.assessment_sessions for select
  using (
    organization_id in (select public.current_user_organizations())
    and deleted_at is null
  );

-- assessment_sessions: CREATE for authorized assessment operators
create policy "Authorized roles can create assessment sessions"
  on public.assessment_sessions for insert
  with check (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- assessment_sessions: UPDATE for authorized assessment operators
create policy "Authorized roles can update assessment sessions"
  on public.assessment_sessions for update
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  )
  with check (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- assessment_session_assignments: SELECT for all organization members
create policy "Members can view assessment assignments"
  on public.assessment_session_assignments for select
  using (
    organization_id in (select public.current_user_organizations())
  );

-- assessment_session_assignments: CREATE for authorized assessment operators
create policy "Authorized roles can create assessment assignments"
  on public.assessment_session_assignments for insert
  with check (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- assessment_session_assignments: UPDATE for authorized assessment operators
create policy "Authorized roles can update assessment assignments"
  on public.assessment_session_assignments for update
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  )
  with check (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- assessment_session_assignments: DELETE for authorized assessment operators
create policy "Authorized roles can delete assessment assignments"
  on public.assessment_session_assignments for delete
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- Backfill launched sessions that were previously persisted with the legacy Draft state.
update public.assessment_sessions
set status = 'In Progress',
    updated_at = now()
where status = 'Draft'
  and started_at is not null
  and deleted_at is null;
