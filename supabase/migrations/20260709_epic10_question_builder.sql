-- ============================================================
-- CyberGuard – Epic 10: Enterprise Question Builder
-- ============================================================

-- ── 1. Create Tables ────────────────────────────────────────

create table if not exists public.assessment_questions (
  id                  uuid            primary key default gen_random_uuid(),
  organization_id     uuid            not null references public.organizations(id) on delete cascade,
  template_id         uuid            not null references public.assessment_templates(id) on delete cascade,
  domain_id           uuid            not null references public.security_domains(id) on delete restrict,
  question_text       text            not null check (char_length(question_text) >= 5 and char_length(question_text) <= 2000),
  help_text           text            check (char_length(help_text) <= 1000),
  question_type       text            not null check (question_type in (
                                        'yes_no',
                                        'multiple_choice',
                                        'checkbox',
                                        'text',
                                        'textarea',
                                        'number',
                                        'date',
                                        'file_upload'
                                      )),
  is_required         boolean         not null default true,
  weight              integer         not null default 1 check (weight >= 1 and weight <= 10),
  sort_order          integer         not null default 0,
  metadata            jsonb           not null default '{}',
  created_by          uuid            references public.profiles(id) on delete set null,
  updated_by          uuid            references public.profiles(id) on delete set null,
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now(),
  deleted_at          timestamptz,
  deleted_by          uuid            references public.profiles(id) on delete set null
);

create table if not exists public.assessment_question_options (
  id                  uuid            primary key default gen_random_uuid(),
  question_id         uuid            not null references public.assessment_questions(id) on delete cascade,
  label               text            not null check (char_length(label) >= 1 and char_length(label) <= 500),
  value               text            not null check (char_length(value) >= 1 and char_length(value) <= 255),
  sort_order          integer         not null default 0,
  created_at          timestamptz     not null default now()
);

-- Future: conditional logic stub (no enforcement yet, just schema)
create table if not exists public.question_conditions (
  id                  uuid            primary key default gen_random_uuid(),
  question_id         uuid            not null references public.assessment_questions(id) on delete cascade,
  depends_on_id       uuid            references public.assessment_questions(id) on delete cascade,
  condition_operator  text            not null default 'equals' check (condition_operator in ('equals', 'not_equals', 'contains', 'greater_than', 'less_than')),
  condition_value     text,
  created_at          timestamptz     not null default now()
);

-- ── 2. Indexes ───────────────────────────────────────────────

create index if not exists idx_assessment_questions_template_id
  on public.assessment_questions(template_id);

create index if not exists idx_assessment_questions_domain_id
  on public.assessment_questions(domain_id);

create index if not exists idx_assessment_questions_sort
  on public.assessment_questions(template_id, domain_id, sort_order);

create index if not exists idx_assessment_question_options_question_id
  on public.assessment_question_options(question_id);

-- ── 3. Triggers ──────────────────────────────────────────────

create or replace trigger assessment_questions_updated_at
  before update on public.assessment_questions
  for each row execute function public.set_updated_at();

-- ── 4. Row Level Security ────────────────────────────────────

alter table public.assessment_questions enable row level security;
alter table public.assessment_question_options enable row level security;
alter table public.question_conditions enable row level security;

-- assessment_questions: VIEW (Owner, Admin, Security Officer, Manager)
create policy "Authorized members can view questions"
  on public.assessment_questions for select
  using (
    organization_id in (select public.current_user_organizations())
    and (
      deleted_at is null or
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer') or
      public.has_org_role(organization_id, 'Manager')
    )
  );

-- assessment_questions: CREATE (Owner, Admin, Security Officer)
create policy "Authorized roles can create questions"
  on public.assessment_questions for insert
  with check (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- assessment_questions: UPDATE (Owner, Admin, Security Officer)
create policy "Authorized roles can update questions"
  on public.assessment_questions for update
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- assessment_question_options: SELECT
create policy "Members can view question options"
  on public.assessment_question_options for select
  using (
    question_id in (
      select id from public.assessment_questions
      where organization_id in (select public.current_user_organizations())
    )
  );

-- assessment_question_options: ALL for authorized roles
create policy "Authorized roles can manage question options"
  on public.assessment_question_options for all
  using (
    question_id in (
      select id from public.assessment_questions
      where organization_id in (select public.current_user_organizations())
      and (
        public.has_org_role(organization_id, 'Owner') or
        public.has_org_role(organization_id, 'Admin') or
        public.has_org_role(organization_id, 'Security Officer')
      )
    )
  );

-- question_conditions: SELECT (future use)
create policy "Members can view question conditions"
  on public.question_conditions for select
  using (
    question_id in (
      select id from public.assessment_questions
      where organization_id in (select public.current_user_organizations())
    )
  );
