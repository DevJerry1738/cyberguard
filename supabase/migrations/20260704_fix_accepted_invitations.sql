-- ============================================================
-- CyberGuard – Repair: Accepted invitations missing from org_members
-- Run in Supabase SQL Editor to fix members who accepted but
-- were not linked to the organization due to the RLS bug.
-- ============================================================

-- Step 1: View accepted invitations that don't have a matching org member row
SELECT
  i.id          AS invitation_id,
  i.email,
  i.organization_id,
  i.role_id,
  i.department_id,
  i.accepted_at,
  p.id          AS profile_id,
  p.organization_id AS profile_org_id,
  p.onboarding_complete
FROM public.invitations i
LEFT JOIN public.profiles p ON p.email = i.email
LEFT JOIN public.organization_members om
  ON om.profile_id = p.id
  AND om.organization_id = i.organization_id
WHERE i.status = 'accepted'
  AND om.id IS NULL;  -- These are the ones that need fixing

-- ============================================================
-- Step 2: Fix missing organization_members rows
-- (Only run after reviewing Step 1 output above)
-- ============================================================

INSERT INTO public.organization_members (organization_id, profile_id, role_id)
SELECT
  i.organization_id,
  p.id           AS profile_id,
  i.role_id
FROM public.invitations i
JOIN public.profiles p ON p.email = i.email
LEFT JOIN public.organization_members om
  ON om.profile_id = p.id
  AND om.organization_id = i.organization_id
WHERE i.status = 'accepted'
  AND om.id IS NULL
ON CONFLICT (organization_id, profile_id) DO NOTHING;

-- ============================================================
-- Step 3: Fix profiles that weren't linked to the organization
-- ============================================================

UPDATE public.profiles p
SET
  organization_id     = i.organization_id,
  onboarding_complete = true
FROM public.invitations i
WHERE i.email = p.email
  AND i.status = 'accepted'
  AND (p.organization_id IS NULL OR p.organization_id != i.organization_id);

-- ============================================================
-- Verify fix applied correctly
-- ============================================================

SELECT
  p.email,
  p.organization_id,
  p.onboarding_complete,
  om.organization_id  AS member_org_id,
  r.name              AS role_name
FROM public.profiles p
JOIN public.organization_members om ON om.profile_id = p.id
JOIN public.roles r ON r.id = om.role_id
ORDER BY p.email;
