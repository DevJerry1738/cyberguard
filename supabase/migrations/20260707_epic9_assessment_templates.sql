-- ============================================================
-- CyberGuard – Epic 9: Assessment Templates
-- ============================================================

-- ── 1. Create Tables ────────────────────────────────────────

create table if not exists public.assessment_templates (
  id                  uuid            primary key default gen_random_uuid(),
  organization_id     uuid            not null references public.organizations(id) on delete cascade,
  name                text            not null check (char_length(name) >= 3 and char_length(name) <= 255),
  description         text            check (char_length(description) <= 1000),
  framework           text            not null check (char_length(framework) >= 2 and char_length(framework) <= 255),
  version             text            not null check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'),
  status              text            not null default 'Draft' check (status in ('Draft', 'Active', 'Archived')),
  parent_template_id  uuid            references public.assessment_templates(id) on delete set null,
  root_template_id    uuid            references public.assessment_templates(id) on delete set null,
  created_by          uuid            references public.profiles(id) on delete set null,
  updated_by          uuid            references public.profiles(id) on delete set null,
  archived_at         timestamptz,
  archived_by         uuid            references public.profiles(id) on delete set null,
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now(),
  deleted_at          timestamptz,
  deleted_by          uuid            references public.profiles(id) on delete set null
);

create table if not exists public.assessment_template_domains (
  template_id         uuid            not null references public.assessment_templates(id) on delete cascade,
  domain_id           uuid            not null references public.security_domains(id) on delete cascade,
  sort_order          integer         not null default 0,
  primary key (template_id, domain_id)
);

-- ── 2. Indexes and Unique Constraints ───────────────────────

create index if not exists idx_assessment_templates_organization_id 
  on public.assessment_templates(organization_id);

create index if not exists idx_assessment_templates_root_id 
  on public.assessment_templates(root_template_id);

create index if not exists idx_assessment_template_domains_template_id 
  on public.assessment_template_domains(template_id);

-- Ensure version + name is unique per organization (excluding soft deleted ones)
create unique index if not exists idx_assessment_templates_unique_name_version
  on public.assessment_templates (organization_id, lower(name), version)
  where deleted_at is null;

-- Ensure only one Active template exists per template family (family is tracked via root_template_id or id itself)
create unique index if not exists idx_assessment_templates_unique_active_family
  on public.assessment_templates (organization_id, coalesce(root_template_id, id))
  where status = 'Active' and deleted_at is null;

-- Trigger: auto-update the updated_at column
create or replace trigger assessment_templates_updated_at
  before update on public.assessment_templates
  for each row execute function public.set_updated_at();

-- ── 3. Row Level Security ───────────────────────────────────

alter table public.assessment_templates enable row level security;
alter table public.assessment_template_domains enable row level security;

-- Policies for assessment_templates

create policy "Members can view templates"
  on public.assessment_templates for select
  using (
    organization_id in (select public.current_user_organizations())
    and deleted_at is null
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer') or
      public.has_org_role(organization_id, 'Manager')
    )
  );

create policy "Authorized roles can create templates"
  on public.assessment_templates for insert
  with check (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

create policy "Authorized roles can update templates"
  on public.assessment_templates for update
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- Policies for assessment_template_domains

create policy "Members can view template domains"
  on public.assessment_template_domains for select
  using (
    template_id in (
      select id from public.assessment_templates 
      where organization_id in (select public.current_user_organizations())
    )
  );

create policy "Authorized roles can manage template domains"
  on public.assessment_template_domains for all
  using (
    template_id in (
      select id from public.assessment_templates 
      where organization_id in (select public.current_user_organizations())
      and (
        public.has_org_role(organization_id, 'Owner') or
        public.has_org_role(organization_id, 'Admin') or
        public.has_org_role(organization_id, 'Security Officer')
      )
    )
  );
