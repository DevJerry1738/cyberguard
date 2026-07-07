-- ============================================================
-- CyberGuard – RBAC: role_permissions table + has_permission fn
-- Run this migration after previous schema migrations
-- ============================================================

-- 1. Create role_permissions table
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_name text not null,
  permission text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_role_permissions_role_perm on public.role_permissions(role_name, permission);

-- 2. Seed role -> permission mappings
-- Owner: wildcard entry (has all permissions)
insert into public.role_permissions (role_name, permission)
values ('Owner', '*')
on conflict (role_name, permission) do nothing;

-- Admin permissions
insert into public.role_permissions (role_name, permission) values
  ('Admin', 'organization.view'),
  ('Admin', 'organization.update'),
  ('Admin', 'members.view'),
  ('Admin', 'members.invite'),
  ('Admin', 'members.update'),
  ('Admin', 'members.remove'),
  ('Admin', 'departments.view'),
  ('Admin', 'departments.create'),
  ('Admin', 'departments.update'),
  ('Admin', 'reports.view'),
  ('Admin', 'settings.view')
on conflict (role_name, permission) do nothing;

-- Security Officer permissions
insert into public.role_permissions (role_name, permission) values
  ('Security Officer', 'assessments.view'),
  ('Security Officer', 'assessments.create'),
  ('Security Officer', 'reports.view'),
  ('Security Officer', 'audit.view')
on conflict (role_name, permission) do nothing;

-- Manager permissions
insert into public.role_permissions (role_name, permission) values
  ('Manager', 'departments.view'),
  ('Manager', 'departments.create'),
  ('Manager', 'departments.update'),
  ('Manager', 'reports.view')
on conflict (role_name, permission) do nothing;

-- Employee permissions
insert into public.role_permissions (role_name, permission) values
  ('Employee', 'assessments.view')
on conflict (role_name, permission) do nothing;

-- 3. has_permission function
create or replace function public.has_permission(org_id uuid, profile_id uuid, permission text)
returns boolean
language plpgsql stable security definer
as $$
begin
  return exists (
    select 1
    from public.organization_members om
    join public.roles r on r.id = om.role_id
    join public.role_permissions rp on rp.role_name = r.name
    where om.organization_id = org_id
      and om.profile_id = profile_id
      and (rp.permission = permission or rp.permission = '*')
  );
end;
$$;
