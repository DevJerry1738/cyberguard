import type { Permission } from './permissions';
import { roleHasPermission } from './roles';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Server-side helpers for permission checks. Expect a Supabase server client
 * (from `createClient()` in `src/lib/supabase/server`).
 */

export async function getUserOrganizationId(supabase: any, userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();
  return profile?.organization_id ?? null;
}

export async function getUserRole(supabase: any, userId: string, orgId: string): Promise<string | null> {
  const { data } = await supabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', userId)
    .eq('organization_id', orgId)
    .single();
  if (data?.roles && typeof data.roles === 'object' && 'name' in data.roles) {
    return data.roles.name as string;
  }
  return null;
}

export async function getPermissionsForUser(supabase: any, userId: string, orgId: string): Promise<Permission[]> {
  const role = await getUserRole(supabase, userId, orgId);
  if (!role) return [];
  // roleHasPermission is a helper for single permission checks; to avoid iterating here
  // we re-use the ROLE_PERMISSIONS map by importing it where necessary. Simpler approach:
  // build permissions by checking known permission list against roleHasPermission.
  // Importing PERMISSIONS here would create an import cycle in some setups, so keep it minimal.
  // For now, callers should use `hasPermission` for single-checks.
  return [];
}

export async function hasPermission(supabase: any, userId: string, orgId: string, permission: Permission): Promise<boolean> {
  try {
    const admin = await createAdminClient();
    // call DB function public.has_permission(org_id, profile_id, permission)
    const { data, error } = await admin.rpc('has_permission', {
      org_id: orgId,
      profile_id: userId,
      permission,
    });
    if (error) {
      // Fallback to code-based check on error
      const role = await getUserRole(supabase, userId, orgId);
      return roleHasPermission(role, permission as Permission);
    }
    // `data` may be boolean or array-like; normalize
    if (typeof data === 'boolean') return data;
    if (Array.isArray(data) && data.length > 0) return !!data[0];
    return Boolean(data);
  } catch (e) {
    const role = await getUserRole(supabase, userId, orgId);
    return roleHasPermission(role, permission as Permission);
  }
}

export async function requirePermissionOrRedirect(supabase: any, userId: string, orgId: string | null, permission: Permission) {
  if (!orgId) redirect('/403');
  const ok = await hasPermission(supabase, userId, orgId, permission);
  if (!ok) redirect('/403');
}

export async function requirePermissionBoolean(supabase: any, userId: string, orgId: string | null, permission: Permission): Promise<boolean> {
  if (!orgId) return false;
  return hasPermission(supabase, userId, orgId, permission);
}
