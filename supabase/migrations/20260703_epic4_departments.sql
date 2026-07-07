-- ============================================================
-- CyberGuard – Epic 4: Departments Table
-- Run this in the Supabase SQL Editor after Epic 3 migration
-- ============================================================

-- ── Departments ──────────────────────────────────────────
create table if not exists public.departments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null check (char_length(name) > 0 and char_length(name) <= 100),
  description     text,
  manager_id      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for org lookups
create index if not exists idx_departments_organization_id on public.departments(organization_id);
create index if not exists idx_departments_manager_id on public.departments(manager_id);

create or replace trigger departments_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────
alter table public.departments enable row level security;

-- Members can view departments in their org
create policy "Members can view departments"
  on public.departments for select
  using (
    organization_id in (select public.current_user_organizations())
  );

-- Owners and Admins can insert departments
create policy "Owners and Admins can insert departments"
  on public.departments for insert
  with check (
    public.has_org_role(organization_id, 'Owner') or
    public.has_org_role(organization_id, 'Admin')
  );

-- Owners and Admins can update departments
create policy "Owners and Admins can update departments"
  on public.departments for update
  using (
    public.has_org_role(organization_id, 'Owner') or
    public.has_org_role(organization_id, 'Admin')
  );

-- Owners can delete departments
create policy "Owners can delete departments"
  on public.departments for delete
  using (
    public.has_org_role(organization_id, 'Owner')
  );
