-- ============================================================
-- CyberGuard – Epic 11: Assessment Sessions
-- ============================================================

-- ── 1. Create Tables ────────────────────────────────────────

create table if not exists public.assessment_sessions (
  id                  uuid            primary key default gen_random_uuid(),
  organization_id     uuid            not null references public.organizations(id) on delete cascade,
  template_id         uuid            not null references public.assessment_templates(id) on delete restrict,
  template_name       text            not null check (char_length(template_name) >= 1 and char_length(template_name) <= 255),
  template_version    text            not null check (char_length(template_version) >= 1 and char_length(template_version) <= 64),
  template_framework  text            not null check (char_length(template_framework) >= 1 and char_length(template_framework) <= 255),
  template_snapshot   jsonb           not null default '{}',
  status              text            not null default 'Draft' check (status in ('Draft', 'In Progress', 'Completed', 'Cancelled', 'Archived')),
  progress_percent    integer         not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  started_by          uuid            references public.profiles(id) on delete set null,
  started_at          timestamptz,
  completed_at        timestamptz,
  due_at              timestamptz,
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now(),
  deleted_at          timestamptz,
  deleted_by          uuid            references public.profiles(id) on delete set null
);

create table if not exists public.assessment_session_assignments (
  id                  uuid            primary key default gen_random_uuid(),
  organization_id     uuid            not null references public.organizations(id) on delete cascade,
  session_id          uuid            not null references public.assessment_sessions(id) on delete cascade,
  profile_id          uuid            not null references public.profiles(id) on delete cascade,
  assigned_by         uuid            references public.profiles(id) on delete set null,
  status              text            not null default 'Assigned' check (status in ('Assigned', 'In Progress', 'Completed', 'Skipped')),
  assigned_at         timestamptz     not null default now(),
  completed_at        timestamptz,
  metadata            jsonb           not null default '{}',
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now(),
  unique (session_id, profile_id)
);

-- ── 2. Indexes ───────────────────────────────────────────────

create index if not exists idx_assessment_sessions_organization_id
  on public.assessment_sessions(organization_id);

create index if not exists idx_assessment_sessions_template_id
  on public.assessment_sessions(template_id);

create index if not exists idx_assessment_sessions_status
  on public.assessment_sessions(status);

create index if not exists idx_assessment_session_assignments_session_id
  on public.assessment_session_assignments(session_id);

create index if not exists idx_assessment_session_assignments_profile_id
  on public.assessment_session_assignments(profile_id);

create index if not exists idx_assessment_session_assignments_organization_id
  on public.assessment_session_assignments(organization_id);

-- ── 3. Trigger for updated_at ───────────────────────────────

create or replace trigger assessment_sessions_updated_at
  before update on public.assessment_sessions
  for each row execute function public.set_updated_at();

create or replace trigger assessment_session_assignments_updated_at
  before update on public.assessment_session_assignments
  for each row execute function public.set_updated_at();

-- ── 4. Row Level Security ───────────────────────────────────

alter table public.assessment_sessions enable row level security;
alter table public.assessment_session_assignments enable row level security;

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

-- assessment_sessions: CREATE/UPDATE for authorized assessment operators
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
