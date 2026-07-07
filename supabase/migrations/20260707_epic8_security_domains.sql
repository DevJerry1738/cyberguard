-- ============================================================
-- CyberGuard – Epic 8: Security Domains
-- Run this in the Supabase SQL Editor after Epic 7 migration
-- ============================================================

-- ── Security Domains table ───────────────────────────────
create table if not exists public.security_domains (
  id              uuid            primary key default gen_random_uuid(),
  organization_id uuid            not null references public.organizations(id) on delete cascade,
  name            text            not null check (char_length(name) >= 3 and char_length(name) <= 100),
  description     text            check (char_length(description) <= 500),
  sort_order      integer         not null default 0,
  is_archived     boolean         not null default false,
  created_by      uuid            references public.profiles(id) on delete set null,
  updated_by      uuid            references public.profiles(id) on delete set null,
  deleted_by      uuid            references public.profiles(id) on delete set null,
  created_at      timestamptz     not null default now(),
  updated_at      timestamptz     not null default now(),
  deleted_at      timestamptz
);

-- Indexes for common queries
create index if not exists idx_security_domains_organization_id 
  on public.security_domains(organization_id);

create index if not exists idx_security_domains_sort_order 
  on public.security_domains(organization_id, sort_order);

create index if not exists idx_security_domains_created_at 
  on public.security_domains(organization_id, created_at desc);

-- Unique constraint: domain names must be unique per org (case-insensitive)
-- Only applies to non-deleted, non-archived domains
create unique index if not exists idx_security_domains_unique_name_per_org
  on public.security_domains (organization_id, lower(name))
  where deleted_at is null and is_archived = false;

-- Trigger: auto-update the updated_at column
create or replace trigger security_domains_updated_at
  before update on public.security_domains
  for each row execute function public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────
alter table public.security_domains enable row level security;

-- Members can view non-deleted domains in their org (both active and archived)
create policy "Members can view security domains"
  on public.security_domains for select
  using (
    organization_id in (select public.current_user_organizations())
    and deleted_at is null
  );

-- Owners and Admins can insert security domains
create policy "Owners and Admins can create security domains"
  on public.security_domains for insert
  with check (
    public.has_org_role(organization_id, 'Owner') or
    public.has_org_role(organization_id, 'Admin')
  );

-- Owners and Admins can update security domains (including archive and reorder)
create policy "Owners and Admins can update security domains"
  on public.security_domains for update
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin')
    )
  );

-- Security Officers can reorder domains (update sort_order only)
create policy "Security Officers can reorder security domains"
  on public.security_domains for update
  using (
    organization_id in (select public.current_user_organizations())
    and public.has_org_role(organization_id, 'Security Officer')
  )
  with check (
    organization_id in (select public.current_user_organizations())
    and public.has_org_role(organization_id, 'Security Officer')
  );

-- Owners can soft-delete security domains
create policy "Owners can delete security domains"
  on public.security_domains for delete
  using (
    organization_id in (select public.current_user_organizations())
    and public.has_org_role(organization_id, 'Owner')
  );
