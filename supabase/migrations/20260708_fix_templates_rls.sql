-- ============================================================
-- CyberGuard – Epic 9: Fix Assessment Templates RLS Policies
-- ============================================================

-- Recreate SELECT policy to allow owners/admins/officers to select deleted templates
-- This prevents RETURNING clause failures during soft deletion updates.

drop policy if exists "Members can view templates" on public.assessment_templates;

create policy "Members can view templates"
  on public.assessment_templates for select
  using (
    organization_id in (select public.current_user_organizations())
    and (
      deleted_at is null or
      public.has_org_role(organization_id, 'Owner') or
      public.has_org_role(organization_id, 'Admin') or
      public.has_org_role(organization_id, 'Security Officer')
    )
  );
