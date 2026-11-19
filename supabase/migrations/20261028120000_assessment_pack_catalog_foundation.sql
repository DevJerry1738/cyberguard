-- CyberGuard assessment pack catalogue foundation.
-- Published catalogue content is immutable. Tenant imports are copies and
-- are written only by a later authenticated transactional import operation.

create table public.assessment_packs (
  id uuid primary key default gen_random_uuid(),
  pack_key text not null unique check (pack_key ~ '^[a-z0-9][a-z0-9-]{2,99}$'),
  display_name text not null check (char_length(display_name) between 3 and 160),
  description text,
  created_at timestamptz not null default now()
);

create table public.assessment_pack_versions (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.assessment_packs(id) on delete restrict,
  version_label text not null check (char_length(version_label) between 1 and 64),
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'retired')),
  source_name text not null,
  source_reference text,
  usage_terms text not null,
  attribution text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'in_review', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  retired_at timestamptz,
  content_digest text,
  created_at timestamptz not null default now(),
  unique (pack_id, version_label),
  unique (pack_id, id),
  unique (id, pack_id),
  check (
    (status <> 'approved') or
    (review_status = 'approved' and reviewed_at is not null and published_at is not null)
  ),
  check ((status <> 'retired') or retired_at is not null)
);

create index assessment_pack_versions_status_idx
  on public.assessment_pack_versions(status, pack_id);

create table public.assessment_pack_domains (
  id uuid primary key default gen_random_uuid(),
  pack_version_id uuid not null references public.assessment_pack_versions(id) on delete restrict,
  domain_key text not null check (domain_key ~ '^[a-z0-9][a-z0-9-]{2,99}$'),
  name text not null check (char_length(name) between 3 and 100),
  description text check (description is null or char_length(description) <= 500),
  sort_order integer not null default 0 check (sort_order >= 0),
  unique (pack_version_id, domain_key),
  unique (pack_version_id, id)
);

create table public.frameworks (
  id uuid primary key default gen_random_uuid(),
  framework_key text not null unique check (framework_key ~ '^[a-z0-9][a-z0-9-]{2,99}$'),
  name text not null check (char_length(name) between 2 and 200),
  created_at timestamptz not null default now()
);

create table public.framework_versions (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.frameworks(id) on delete restrict,
  version_label text not null check (char_length(version_label) between 1 and 64),
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'retired')),
  source_name text not null,
  source_reference text,
  usage_terms text not null,
  attribution text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'in_review', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  unique (framework_id, version_label),
  unique (id, framework_id),
  check (
    (status <> 'approved') or
    (review_status = 'approved' and reviewed_at is not null and published_at is not null)
  ),
  check ((status <> 'retired') or retired_at is not null)
);

create table public.framework_controls (
  id uuid primary key default gen_random_uuid(),
  framework_version_id uuid not null references public.framework_versions(id) on delete restrict,
  control_identifier text not null check (char_length(control_identifier) between 1 and 160),
  title text,
  source_reference text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'verified', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (framework_version_id, control_identifier),
  unique (id, framework_version_id)
);

create index framework_controls_version_idx
  on public.framework_controls(framework_version_id);

create or replace function public.prevent_published_catalog_identity_rewrite()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'assessment_packs' and exists (
    select 1 from public.assessment_pack_versions v
    where v.pack_id = old.id and v.status in ('approved', 'retired')
  ) then
    raise exception 'Pack identity cannot change after publication';
  end if;

  if tg_table_name = 'frameworks' and exists (
    select 1 from public.framework_versions v
    where v.framework_id = old.id and v.status in ('approved', 'retired')
  ) then
    raise exception 'Framework identity cannot change after publication';
  end if;

  return new;
end;
$$;

create trigger assessment_packs_identity_immutable
  before update on public.assessment_packs
  for each row execute function public.prevent_published_catalog_identity_rewrite();

create trigger frameworks_identity_immutable
  before update on public.frameworks
  for each row execute function public.prevent_published_catalog_identity_rewrite();

create table public.assessment_pack_questions (
  id uuid primary key default gen_random_uuid(),
  pack_version_id uuid not null references public.assessment_pack_versions(id) on delete restrict,
  pack_domain_id uuid not null,
  question_key text not null check (question_key ~ '^[a-z0-9][a-z0-9-]{2,119}$'),
  question_text text not null check (char_length(question_text) between 5 and 2000),
  help_text text check (help_text is null or char_length(help_text) <= 1000),
  question_type text not null check (question_type in (
    'yes_no', 'multiple_choice', 'checkbox', 'text', 'textarea', 'number', 'date', 'file_upload'
  )),
  is_required boolean not null default true,
  weight integer not null default 1 check (weight between 1 and 10),
  sort_order integer not null default 0 check (sort_order >= 0),
  evidence_guidance text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'in_review', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  foreign key (pack_domain_id, pack_version_id)
    references public.assessment_pack_domains(id, pack_version_id) on delete restrict,
  unique (pack_version_id, question_key),
  unique (pack_version_id, id)
);

create index assessment_pack_questions_domain_order_idx
  on public.assessment_pack_questions(pack_version_id, pack_domain_id, sort_order);

create table public.assessment_pack_question_options (
  id uuid primary key default gen_random_uuid(),
  pack_version_id uuid not null,
  pack_question_id uuid not null,
  label text not null check (char_length(label) between 1 and 500),
  value text not null check (char_length(value) between 1 and 255),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  foreign key (pack_question_id, pack_version_id)
    references public.assessment_pack_questions(id, pack_version_id) on delete restrict,
  unique (pack_version_id, pack_question_id, sort_order),
  unique (pack_version_id, id)
);

create table public.assessment_pack_question_controls (
  id uuid primary key default gen_random_uuid(),
  pack_version_id uuid not null,
  pack_question_id uuid not null,
  framework_control_id uuid not null references public.framework_controls(id) on delete restrict,
  mapping_source text,
  source_reference text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'verified', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (pack_question_id, pack_version_id)
    references public.assessment_pack_questions(id, pack_version_id) on delete restrict,
  unique (pack_question_id, framework_control_id),
  unique (pack_version_id, id),
  unique (id, framework_control_id)
);

create index assessment_pack_question_controls_question_idx
  on public.assessment_pack_question_controls(pack_question_id);

-- Tenant template composite keys allow the import receipt to prove that the
-- template and organization belong together.
alter table public.assessment_templates
  add constraint assessment_templates_id_organization_key unique (id, organization_id);

alter table public.security_domains
  add constraint security_domains_id_organization_key unique (id, organization_id);

create table public.assessment_pack_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid not null,
  pack_version_id uuid not null references public.assessment_pack_versions(id) on delete restrict,
  pack_key_at_import text not null,
  pack_name_at_import text not null,
  version_label_at_import text not null,
  imported_by uuid not null references public.profiles(id) on delete restrict,
  idempotency_key uuid not null,
  imported_at timestamptz not null default now(),
  foreign key (template_id, organization_id)
    references public.assessment_templates(id, organization_id) on delete restrict,
  unique (template_id, pack_version_id),
  unique (organization_id, idempotency_key),
  unique (id, organization_id, pack_version_id)
);

create index assessment_pack_imports_org_idx
  on public.assessment_pack_imports(organization_id, imported_at desc);

create table public.assessment_pack_import_domains (
  organization_id uuid not null,
  import_id uuid not null,
  pack_version_id uuid not null,
  pack_domain_id uuid not null,
  security_domain_id uuid not null,
  primary key (import_id, pack_domain_id),
  foreign key (import_id, organization_id, pack_version_id)
    references public.assessment_pack_imports(id, organization_id, pack_version_id) on delete restrict,
  foreign key (pack_domain_id, pack_version_id)
    references public.assessment_pack_domains(id, pack_version_id) on delete restrict,
  foreign key (security_domain_id, organization_id)
    references public.security_domains(id, organization_id) on delete restrict
);

alter table public.assessment_questions
  add constraint assessment_questions_id_organization_key unique (id, organization_id);

create table public.assessment_question_controls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  question_id uuid not null,
  framework_control_id uuid not null references public.framework_controls(id) on delete restrict,
  source_pack_question_control_id uuid,
  framework_key_at_mapping text not null,
  framework_name_at_mapping text not null,
  framework_version_at_mapping text not null,
  control_identifier_at_mapping text not null,
  mapping_source text,
  source_reference text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'verified', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (question_id, organization_id)
    references public.assessment_questions(id, organization_id) on delete cascade,
  foreign key (source_pack_question_control_id, framework_control_id)
    references public.assessment_pack_question_controls(id, framework_control_id) on delete restrict,
  unique (question_id, framework_control_id)
);

create index assessment_question_controls_org_idx
  on public.assessment_question_controls(organization_id, question_id);

alter table public.assessment_questions
  add column source_pack_id uuid,
  add column source_pack_version_id uuid,
  add column source_pack_question_id uuid,
  add constraint assessment_questions_source_pair_check check (
    (source_pack_id is null and source_pack_version_id is null and source_pack_question_id is null) or
    (source_pack_id is not null and source_pack_version_id is not null and source_pack_question_id is not null)
  ),
  add constraint assessment_questions_source_pack_version_fkey
    foreign key (source_pack_version_id, source_pack_id)
    references public.assessment_pack_versions(id, pack_id) on delete restrict,
  add constraint assessment_questions_source_pack_question_fkey
    foreign key (source_pack_version_id, source_pack_question_id)
    references public.assessment_pack_questions(pack_version_id, id) on delete restrict;

create or replace function public.prevent_assessment_pack_source_rewrite()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.source_pack_id is distinct from new.source_pack_id
     or old.source_pack_version_id is distinct from new.source_pack_version_id
     or old.source_pack_question_id is distinct from new.source_pack_question_id then
    raise exception 'Imported question source provenance is immutable';
  end if;
  return new;
end;
$$;

create trigger assessment_questions_source_provenance_immutable
  before update on public.assessment_questions
  for each row execute function public.prevent_assessment_pack_source_rewrite();

create or replace function public.require_assessment_pack_version_draft()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_version_id uuid;
  source_version_id uuid;
  version_status text;
begin
  if tg_op = 'DELETE' then
    target_version_id := old.pack_version_id;
  else
    target_version_id := new.pack_version_id;
  end if;

  if tg_op = 'UPDATE' then
    source_version_id := old.pack_version_id;
    select v.status into version_status
    from public.assessment_pack_versions as v
    where v.id = source_version_id;
    if version_status is distinct from 'draft' then
      raise exception 'Pack content cannot be moved from a non-Draft version';
    end if;
  end if;

  select v.status into version_status
  from public.assessment_pack_versions as v
  where v.id = target_version_id;

  if version_status is distinct from 'draft' then
    raise exception 'Pack content can only change while its version is Draft';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger assessment_pack_domains_draft_only
  before insert or update or delete on public.assessment_pack_domains
  for each row execute function public.require_assessment_pack_version_draft();
create trigger assessment_pack_questions_draft_only
  before insert or update or delete on public.assessment_pack_questions
  for each row execute function public.require_assessment_pack_version_draft();
create trigger assessment_pack_question_options_draft_only
  before insert or update or delete on public.assessment_pack_question_options
  for each row execute function public.require_assessment_pack_version_draft();
create trigger assessment_pack_question_controls_draft_only
  before insert or update or delete on public.assessment_pack_question_controls
  for each row execute function public.require_assessment_pack_version_draft();

create or replace function public.protect_assessment_pack_version()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  missing_content boolean;
  invalid_questions boolean;
begin
  if tg_op = 'DELETE' then
    if old.status in ('approved', 'retired') then
      raise exception 'Approved or retired pack versions cannot be deleted';
    end if;
    return old;
  end if;

  if old.status in ('approved', 'retired') then
    if old.status = 'approved'
       and new.status = 'retired'
       and (to_jsonb(new) - 'status' - 'retired_at') = (to_jsonb(old) - 'status' - 'retired_at') then
      return new;
    end if;
    raise exception 'Approved or retired pack versions are immutable';
  end if;

  if old.status = 'review' and new.status not in ('review', 'approved', 'retired') then
    raise exception 'Pack review versions cannot return to Draft';
  end if;

  if new.status = 'approved' and old.status <> 'review' then
    raise exception 'Pack versions must complete review before approval';
  end if;

  if new.status = 'approved' then
    select
      not exists (
        select 1 from public.assessment_pack_domains d where d.pack_version_id = new.id
      ) or not exists (
        select 1 from public.assessment_pack_questions q where q.pack_version_id = new.id
      )
    into missing_content;

    if missing_content then
      raise exception 'A pack version needs at least one domain and one question before approval';
    end if;

    select exists (
      select 1
      from public.assessment_pack_questions q
      where q.pack_version_id = new.id
        and (
          q.review_status <> 'approved'
          or (q.question_type in ('multiple_choice', 'checkbox') and
            (select count(*) from public.assessment_pack_question_options o where o.pack_question_id = q.id) < 2)
        )
    ) or exists (
      select 1
      from public.assessment_pack_question_controls m
      join public.framework_controls c on c.id = m.framework_control_id
      join public.framework_versions fv on fv.id = c.framework_version_id
      where m.pack_version_id = new.id
        and (m.review_status <> 'verified' or c.review_status <> 'verified' or fv.status <> 'approved')
    )
    into invalid_questions;

    if invalid_questions then
      raise exception 'All pack questions and included control mappings must pass review before approval';
    end if;
  end if;
  return new;
end;
$$;

create trigger assessment_pack_versions_immutable
  before update or delete on public.assessment_pack_versions
  for each row execute function public.protect_assessment_pack_version();

create or replace function public.require_framework_version_draft()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_version_id uuid;
  source_version_id uuid;
  version_status text;
begin
  if tg_op = 'DELETE' then
    target_version_id := old.framework_version_id;
  else
    target_version_id := new.framework_version_id;
  end if;

  if tg_op = 'UPDATE' then
    source_version_id := old.framework_version_id;
    select v.status into version_status
    from public.framework_versions as v
    where v.id = source_version_id;
    if version_status is distinct from 'draft' then
      raise exception 'Framework controls cannot be moved from a non-Draft version';
    end if;
  end if;

  select v.status into version_status
  from public.framework_versions as v
  where v.id = target_version_id;

  if version_status is distinct from 'draft' then
    raise exception 'Framework controls can only change while their version is Draft';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger framework_controls_draft_only
  before insert or update or delete on public.framework_controls
  for each row execute function public.require_framework_version_draft();

create or replace function public.protect_framework_version()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  missing_controls boolean;
begin
  if tg_op = 'DELETE' then
    if old.status in ('approved', 'retired') then
      raise exception 'Approved or retired framework versions cannot be deleted';
    end if;
    return old;
  end if;

  if old.status in ('approved', 'retired') then
    if old.status = 'approved'
       and new.status = 'retired'
       and (to_jsonb(new) - 'status' - 'retired_at') = (to_jsonb(old) - 'status' - 'retired_at') then
      return new;
    end if;
    raise exception 'Approved or retired framework versions are immutable';
  end if;

  if old.status = 'review' and new.status not in ('review', 'approved', 'retired') then
    raise exception 'Framework review versions cannot return to Draft';
  end if;

  if new.status = 'approved' and old.status <> 'review' then
    raise exception 'Framework versions must complete review before approval';
  end if;

  if new.status = 'approved' then
    select not exists (
      select 1 from public.framework_controls c where c.framework_version_id = new.id
    ) or exists (
      select 1 from public.framework_controls c
      where c.framework_version_id = new.id and c.review_status <> 'verified'
    ) into missing_controls;

    if missing_controls then
      raise exception 'Framework versions require reviewed controls before approval';
    end if;
  end if;
  return new;
end;
$$;

create trigger framework_versions_immutable
  before update or delete on public.framework_versions
  for each row execute function public.protect_framework_version();

-- Published catalogue reads only. No authenticated write policies are added;
-- content publication is reserved for a controlled trusted workflow.
alter table public.assessment_packs enable row level security;
alter table public.assessment_pack_versions enable row level security;
alter table public.assessment_pack_domains enable row level security;
alter table public.assessment_pack_questions enable row level security;
alter table public.assessment_pack_question_options enable row level security;
alter table public.assessment_pack_question_controls enable row level security;
alter table public.frameworks enable row level security;
alter table public.framework_versions enable row level security;
alter table public.framework_controls enable row level security;

create policy "Authenticated users can read packs with approved versions"
  on public.assessment_packs for select to authenticated
  using (exists (
    select 1 from public.assessment_pack_versions v
    where v.pack_id = assessment_packs.id and v.status = 'approved'
  ));

create policy "Authenticated users can read approved pack versions"
  on public.assessment_pack_versions for select to authenticated
  using (status = 'approved');

create policy "Authenticated users can read approved pack domains"
  on public.assessment_pack_domains for select to authenticated
  using (exists (
    select 1 from public.assessment_pack_versions v
    where v.id = assessment_pack_domains.pack_version_id and v.status = 'approved'
  ));

create policy "Authenticated users can read approved pack questions"
  on public.assessment_pack_questions for select to authenticated
  using (exists (
    select 1 from public.assessment_pack_versions v
    where v.id = assessment_pack_questions.pack_version_id and v.status = 'approved'
  ) and review_status = 'approved');

create policy "Authenticated users can read approved pack question options"
  on public.assessment_pack_question_options for select to authenticated
  using (exists (
    select 1 from public.assessment_pack_versions v
    join public.assessment_pack_questions q on q.pack_version_id = v.id
    where v.id = assessment_pack_question_options.pack_version_id
      and q.id = assessment_pack_question_options.pack_question_id
      and v.status = 'approved'
      and q.review_status = 'approved'
  ));

create policy "Authenticated users can read approved pack control mappings"
  on public.assessment_pack_question_controls for select to authenticated
  using (exists (
    select 1 from public.assessment_pack_versions v
    join public.assessment_pack_questions q on q.pack_version_id = v.id
    where v.id = assessment_pack_question_controls.pack_version_id
      and q.id = assessment_pack_question_controls.pack_question_id
      and v.status = 'approved'
      and q.review_status = 'approved'
  ));

create policy "Authenticated users can read frameworks with approved versions"
  on public.frameworks for select to authenticated
  using (exists (
    select 1 from public.framework_versions v
    where v.framework_id = frameworks.id and v.status = 'approved'
  ));

create policy "Authenticated users can read approved framework versions"
  on public.framework_versions for select to authenticated
  using (status = 'approved');

create policy "Authenticated users can read controls in approved framework versions"
  on public.framework_controls for select to authenticated
  using (exists (
    select 1 from public.framework_versions v
    where v.id = framework_controls.framework_version_id and v.status = 'approved'
  ) and review_status = 'verified');

alter table public.assessment_pack_imports enable row level security;
alter table public.assessment_pack_import_domains enable row level security;
alter table public.assessment_question_controls enable row level security;

create policy "Organization members can read pack import receipts"
  on public.assessment_pack_imports for select to authenticated
  using (organization_id in (select public.current_user_organizations()));

create policy "Organization members can read imported domain mappings"
  on public.assessment_pack_import_domains for select to authenticated
  using (organization_id in (select public.current_user_organizations()));

create policy "Organization members can read question control mappings"
  on public.assessment_question_controls for select to authenticated
  using (
    organization_id in (select public.current_user_organizations())
    and exists (
      select 1 from public.assessment_questions q
      where q.id = assessment_question_controls.question_id
        and q.organization_id = assessment_question_controls.organization_id
    )
  );

-- Pack imports and tenant mapping writes are intentionally read-only through
-- direct PostgREST access. A later migration adds the authenticated, atomic
-- import RPC and narrowly scoped draft-mapping operations.

revoke all on public.assessment_packs,
  public.assessment_pack_versions,
  public.assessment_pack_domains,
  public.assessment_pack_questions,
  public.assessment_pack_question_options,
  public.assessment_pack_question_controls,
  public.frameworks,
  public.framework_versions,
  public.framework_controls
from anon, authenticated;

grant select on public.assessment_packs,
  public.assessment_pack_versions,
  public.assessment_pack_domains,
  public.assessment_pack_questions,
  public.assessment_pack_question_options,
  public.assessment_pack_question_controls,
  public.frameworks,
  public.framework_versions,
  public.framework_controls
to authenticated;

revoke all on public.assessment_pack_imports,
  public.assessment_pack_import_domains,
  public.assessment_question_controls
from anon, authenticated;

grant select on public.assessment_pack_imports,
  public.assessment_pack_import_domains,
  public.assessment_question_controls
to authenticated;
