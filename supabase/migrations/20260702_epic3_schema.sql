-- ============================================================
-- CyberGuard – Epic 3 Database Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. TABLES
-- ──────────────────────────────────────────────────────────

-- 1.1 organizations (tenant root)
create table if not exists public.organizations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) > 0),
  slug         text unique,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 1.2 profiles (extends auth.users)
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text unique not null,
  first_name          text,
  last_name           text,
  job_title           text,
  phone               text,
  avatar_url          text,
  organization_id     uuid references public.organizations(id) on delete set null,
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 1.3 roles (RBAC)
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  created_at  timestamptz not null default now()
);

-- 1.4 organization_members
create table if not exists public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  role_id         uuid references public.roles(id) on delete set null,
  joined_at       timestamptz not null default now(),
  constraint uq_org_profile unique (organization_id, profile_id)
);

-- 1.5 organization_settings
create table if not exists public.organization_settings (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid unique not null references public.organizations(id) on delete cascade,
  industry        text,
  company_size    text,
  country         text,
  timezone        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 1.6 audit_logs (append-only)
create table if not exists public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  profile_id      uuid references public.profiles(id) on delete set null,
  action          text not null,
  details         jsonb,
  created_at      timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- 2. INDEXES
-- ──────────────────────────────────────────────────────────

create index if not exists idx_profiles_organization_id on public.profiles(organization_id);
create index if not exists idx_org_members_org_id      on public.organization_members(organization_id);
create index if not exists idx_org_members_profile_id  on public.organization_members(profile_id);
create index if not exists idx_audit_logs_org_id       on public.audit_logs(organization_id);
create index if not exists idx_audit_logs_profile_id   on public.audit_logs(profile_id);

-- ──────────────────────────────────────────────────────────
-- 3. SEED DEFAULT ROLES (idempotent)
-- ──────────────────────────────────────────────────────────

insert into public.roles (name, description) values
  ('Owner',            'Full administrative access to the organization')
 ,('Admin',            'Administrative access with limited billing controls')
 ,('Security Officer', 'Manages compliance assessments and risk reviews')
 ,('Manager',          'Oversees team members and department workflows')
 ,('Employee',         'Standard read and response access')
on conflict (name) do nothing;

-- ──────────────────────────────────────────────────────────
-- 4. HELPER FUNCTIONS (for RLS policies)
-- ──────────────────────────────────────────────────────────

create or replace function public.current_profile_id()
returns uuid
language sql stable security definer
as $$
  select auth.uid();
$$;

create or replace function public.current_user_organizations()
returns setof uuid
language sql stable security definer
as $$
  select organization_id
  from public.organization_members
  where profile_id = public.current_profile_id();
$$;

create or replace function public.has_org_role(org_id uuid, target_role text)
returns boolean
language plpgsql stable security definer
as $$
begin
  return exists (
    select 1
    from public.organization_members om
    join public.roles r on om.role_id = r.id
    where om.profile_id = public.current_profile_id()
      and om.organization_id = org_id
      and r.name = target_role
  );
end;
$$;

-- ──────────────────────────────────────────────────────────
-- 5. PROFILE AUTO-CREATION TRIGGER
-- ──────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────────────────
-- 6. updated_at TRIGGERS
-- ──────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_org_settings_updated_at on public.organization_settings;
create trigger set_org_settings_updated_at
  before update on public.organization_settings
  for each row execute procedure public.set_updated_at();

-- ──────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────

alter table public.organizations enable row level security;

create policy "Members can view their organization"
  on public.organizations for select
  using (id in (select public.current_user_organizations()));

create policy "Owners and Admins can update organization"
  on public.organizations for update
  using (public.has_org_role(id, 'Owner') or public.has_org_role(id, 'Admin'));

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (id = public.current_profile_id());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = public.current_profile_id());

create policy "Members can view org member profiles"
  on public.profiles for select
  using (organization_id in (select public.current_user_organizations()));

alter table public.roles enable row level security;

create policy "All authenticated users can read roles"
  on public.roles for select
  using (auth.role() = 'authenticated');

alter table public.organization_members enable row level security;

create policy "Members can view org membership"
  on public.organization_members for select
  using (organization_id in (select public.current_user_organizations()));

create policy "Owners can manage membership"
  on public.organization_members for all
  using (public.has_org_role(organization_id, 'Owner'));

alter table public.organization_settings enable row level security;

create policy "Members can view org settings"
  on public.organization_settings for select
  using (organization_id in (select public.current_user_organizations()));

create policy "Owners and Admins can update org settings"
  on public.organization_settings for all
  using (public.has_org_role(organization_id, 'Owner') or public.has_org_role(organization_id, 'Admin'));

alter table public.audit_logs enable row level security;

create policy "Auditors can read audit logs"
  on public.audit_logs for select
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

create policy "System can write audit logs"
  on public.audit_logs for insert
  with check (true);
