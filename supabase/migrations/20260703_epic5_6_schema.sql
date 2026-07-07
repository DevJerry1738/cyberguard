-- ============================================================
-- CyberGuard – Epic 5 & 6: Department Management + Invitations
-- Run this in the Supabase SQL Editor after Epic 4 migration
-- ============================================================

-- ── Phase 1: Extend departments table ─────────────────────

alter table public.departments
  add column if not exists is_archived  boolean     not null default false,
  add column if not exists created_by   uuid        references public.profiles(id) on delete set null,
  add column if not exists updated_by   uuid        references public.profiles(id) on delete set null,
  add column if not exists deleted_at   timestamptz,
  add column if not exists deleted_by   uuid        references public.profiles(id) on delete set null;

-- Unique department name per org (only for non-deleted rows)
-- Drop existing constraint if any, then add partial unique index
drop index if exists idx_departments_unique_name_per_org;
create unique index idx_departments_unique_name_per_org
  on public.departments (organization_id, lower(name))
  where deleted_at is null;

-- ── Phase 2: Invitations table ─────────────────────────────

create table if not exists public.invitations (
  id              uuid        primary key default gen_random_uuid(),
  organization_id uuid        not null references public.organizations(id) on delete cascade,
  email           text        not null,
  role_id         uuid        references public.roles(id) on delete set null,
  department_id   uuid        references public.departments(id) on delete set null,
  token           text        not null unique,
  status          text        not null default 'pending'
                              check (status in ('pending','accepted','expired','revoked')),
  expires_at      timestamptz not null default (now() + interval '7 days'),
  accepted_at     timestamptz,
  invited_by      uuid        references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_invitations_org_id    on public.invitations(organization_id);
create index if not exists idx_invitations_token     on public.invitations(token);
create index if not exists idx_invitations_email     on public.invitations(email);
create index if not exists idx_invitations_status    on public.invitations(status);

-- updated_at trigger
create or replace trigger invitations_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- ── Phase 3: RLS for invitations ───────────────────────────

alter table public.invitations enable row level security;

-- Owners and Admins can view invitations
create policy "Owners and Admins can view invitations"
  on public.invitations for select
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin')
    )
  );

-- Owners and Admins can create invitations
create policy "Owners and Admins can create invitations"
  on public.invitations for insert
  with check (
    public.has_org_role(organization_id, 'Owner') or
    public.has_org_role(organization_id, 'Admin')
  );

-- Owners and Admins can update invitations (revoke, etc.)
create policy "Owners and Admins can update invitations"
  on public.invitations for update
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin')
    )
  );

-- Owners and Admins can delete invitations
create policy "Owners and Admins can delete invitations"
  on public.invitations for delete
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin')
    )
  );

-- Public can read invitations by token (for the accept-invite page)
-- We allow any anon user to look up a token — the token itself is the secret
create policy "Public can verify invitation tokens"
  on public.invitations for select
  using (token is not null);

-- ── Phase 4: Auto-expire invitations via query filter ──────
-- (No cron needed — we filter on expires_at < now() in queries)
