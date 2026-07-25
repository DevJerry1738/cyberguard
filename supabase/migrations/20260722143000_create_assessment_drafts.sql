-- ============================================================
-- CyberGuard – Epic 13: Assessment Drafts
-- Migration: 20260722143000_create_assessment_drafts.sql
-- ============================================================

create table if not exists public.assessment_drafts (
  id                  uuid            primary key default gen_random_uuid(),
  session_id          uuid            not null references public.assessment_sessions(id) on delete cascade,
  user_id             uuid            not null references public.profiles(id) on delete cascade,
  organization_id     uuid            not null references public.organizations(id) on delete cascade,
  responses           jsonb           not null default '{}'::jsonb,
  current_domain      uuid,
  current_question    uuid,
  progress            integer         not null default 0 check (progress >= 0 and progress <= 100),
  version             integer         not null default 1,
  checksum            text,
  last_saved_at       timestamptz     not null default now(),
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now(),
  unique (user_id, session_id)
);

-- Indexes for efficient lookups
create index if not exists idx_assessment_drafts_session_id
  on public.assessment_drafts(session_id);

create index if not exists idx_assessment_drafts_user_id
  on public.assessment_drafts(user_id);

create index if not exists idx_assessment_drafts_organization_id
  on public.assessment_drafts(organization_id);

-- Trigger for updated_at
create or replace trigger assessment_drafts_updated_at
  before update on public.assessment_drafts
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.assessment_drafts enable row level security;

drop policy if exists "Users can view own assessment drafts" on public.assessment_drafts;
drop policy if exists "Users can insert own assessment drafts" on public.assessment_drafts;
drop policy if exists "Users can update own assessment drafts" on public.assessment_drafts;
drop policy if exists "Users can delete own assessment drafts" on public.assessment_drafts;

-- RLS: Users can view their own drafts within their active organization
create policy "Users can view own assessment drafts"
  on public.assessment_drafts for select
  using (
    organization_id in (select public.current_user_organizations())
    and user_id = auth.uid()
  );

-- RLS: Users can insert their own drafts
create policy "Users can insert own assessment drafts"
  on public.assessment_drafts for insert
  with check (
    organization_id in (select public.current_user_organizations())
    and user_id = auth.uid()
  );

-- RLS: Users can update their own drafts
create policy "Users can update own assessment drafts"
  on public.assessment_drafts for update
  using (
    organization_id in (select public.current_user_organizations())
    and user_id = auth.uid()
  )
  with check (
    organization_id in (select public.current_user_organizations())
    and user_id = auth.uid()
  );

-- RLS: Users can delete their own drafts
create policy "Users can delete own assessment drafts"
  on public.assessment_drafts for delete
  using (
    organization_id in (select public.current_user_organizations())
    and user_id = auth.uid()
  );
