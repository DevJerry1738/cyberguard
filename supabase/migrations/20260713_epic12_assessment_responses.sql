-- ============================================================
-- CyberGuard – Epic 12: Assessment Responses Runtime
-- ============================================================

create table if not exists public.assessment_responses (
  id                  uuid            primary key default gen_random_uuid(),
  organization_id     uuid            not null references public.organizations(id) on delete cascade,
  session_id          uuid            not null references public.assessment_sessions(id) on delete cascade,
  profile_id          uuid            not null references public.profiles(id) on delete cascade,
  question_id         uuid            not null references public.assessment_questions(id) on delete cascade,
  response_value      jsonb           not null default '{}',
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now(),
  unique (session_id, question_id)
);

create index if not exists idx_assessment_responses_session_id
  on public.assessment_responses(session_id);

create index if not exists idx_assessment_responses_profile_id
  on public.assessment_responses(profile_id);

create index if not exists idx_assessment_responses_organization_id
  on public.assessment_responses(organization_id);

create or replace trigger assessment_responses_updated_at
  before update on public.assessment_responses
  for each row execute function public.set_updated_at();

alter table public.assessment_responses enable row level security;

drop policy if exists "Assigned users can view session responses" on public.assessment_responses;
drop policy if exists "Assigned users can upsert session responses" on public.assessment_responses;
drop policy if exists "Authorized roles can manage session responses" on public.assessment_responses;

create policy "Assigned users can view session responses"
  on public.assessment_responses for select
  using (
    organization_id in (select public.current_user_organizations())
    and exists (
      select 1
      from public.assessment_session_assignments a
      where a.session_id = assessment_responses.session_id
        and a.profile_id = auth.uid()
        and a.organization_id = assessment_responses.organization_id
    )
  );

create policy "Assigned users can upsert session responses"
  on public.assessment_responses for insert
  with check (
    organization_id in (select public.current_user_organizations())
    and profile_id = auth.uid()
    and exists (
      select 1
      from public.assessment_session_assignments a
      where a.session_id = assessment_responses.session_id
        and a.profile_id = auth.uid()
        and a.organization_id = assessment_responses.organization_id
    )
  );

create policy "Assigned users can update session responses"
  on public.assessment_responses for update
  using (
    organization_id in (select public.current_user_organizations())
    and profile_id = auth.uid()
    and exists (
      select 1
      from public.assessment_session_assignments a
      where a.session_id = assessment_responses.session_id
        and a.profile_id = auth.uid()
        and a.organization_id = assessment_responses.organization_id
    )
  )
  with check (
    organization_id in (select public.current_user_organizations())
    and profile_id = auth.uid()
    and exists (
      select 1
      from public.assessment_session_assignments a
      where a.session_id = assessment_responses.session_id
        and a.profile_id = auth.uid()
        and a.organization_id = assessment_responses.organization_id
    )
  );
