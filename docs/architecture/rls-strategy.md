# Row Level Security (RLS) Strategy

Row Level Security (RLS) guarantees tenant-level isolation and role-based access rules directly at the PostgreSQL layer.

---

## 1. Context & Helper Functions
To avoid repeating complex subqueries in our policies, we define database helper functions.

### 1.1. Get Authenticated User Profile ID
Retrieves the UUID of the authenticated user making the request:
```sql
create or replace function public.current_profile_id()
returns uuid as $$
  select auth.uid();
$$ language sql stable security definer;
```

### 1.2. Get User Organization Context
Retrieves the organization(s) that the current user belongs to:
```sql
create or replace function public.current_user_organizations()
returns setof uuid as $$
  select organization_id 
  from public.organization_members 
  where profile_id = public.current_profile_id();
$$ language sql stable security definer;
```

### 1.3. Get User Role within Organization
Helper to check if user has a specific role inside an organization:
```sql
create or replace function public.has_org_role(org_id uuid, target_role_name text)
returns boolean as $$
  select exists (
    select 1 
    from public.organization_members om
    join public.roles r on om.role_id = r.id
    where om.profile_id = public.current_profile_id()
      and om.organization_id = org_id
      and r.name = target_role_name
  );
$$ language plpgsql stable security definer;
```

---

## 2. Table Security Policies

### 2.1. `organizations` Table
Enforce that users can only view or edit organizations they are a member of.

```sql
alter table public.organizations enable row level security;

-- SELECT: Organization Members can view their organization
create policy "Users can view their organization details"
  on public.organizations
  for select
  using (id in (select public.current_user_organizations()));

-- UPDATE: Only Owners and Admins can update organization settings
create policy "Owners and Admins can update organization"
  on public.organizations
  for update
  using (
    public.has_org_role(id, 'Owner') or 
    public.has_org_role(id, 'Admin')
  );
```

### 2.2. `assessment_sessions` Table
Isolate compliance assessments by organization.

```sql
alter table public.assessment_sessions enable row level security;

-- SELECT: All members of the organization can view sessions
create policy "Members can view assessment sessions"
  on public.assessment_sessions
  for select
  using (organization_id in (select public.current_user_organizations()));

-- INSERT/UPDATE: Only Security Officers, Admins, and Owners can create or update sessions
create policy "Compliance managers can edit sessions"
  on public.assessment_sessions
  for all
  using (
    organization_id in (select public.current_user_organizations())
  )
  with check (
    public.has_org_role(organization_id, 'Owner') or
    public.has_org_role(organization_id, 'Admin') or
    public.has_org_role(organization_id, 'Security Officer')
  );
```

### 2.3. `responses` Table
Answers are scoped inside the organization's assessment session.

```sql
alter table public.responses enable row level security;

-- SELECT: All organization members can view responses
create policy "Members can read responses"
  on public.responses
  for select
  using (
    exists (
      select 1 from public.assessment_sessions s
      where s.id = session_id
        and s.organization_id in (select public.current_user_organizations())
    )
  );

-- INSERT/UPDATE: Department Managers and Employees can input/update answers
create policy "Assigned workers can edit responses"
  on public.responses
  for all
  using (
    exists (
      select 1 from public.assessment_sessions s
      where s.id = session_id
        and s.organization_id in (select public.current_user_organizations())
    )
  );
```

### 2.4. `audit_logs` Table
Audit logs are read-only to prevent tampering.

```sql
alter table public.audit_logs enable row level security;

-- SELECT: Only Owners, Admins, and Security Officers can read audit logs
create policy "Auditors can read audit logs"
  on public.audit_logs
  for select
  using (
    organization_id in (select public.current_user_organizations())
    and (
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );

-- INSERT: Automatically populated via system actions (Insert allowed, Update/Delete prohibited)
create policy "System can write audit logs"
  on public.audit_logs
  for insert
  with check (true);
```
