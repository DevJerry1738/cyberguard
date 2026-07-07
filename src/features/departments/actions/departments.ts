'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Department } from '@/types/departments';

// ─── Helpers ──────────────────────────────────────────────

async function getOrgContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  return { supabase, user, organizationId: profile?.organization_id ?? null };
}

async function getUserRole(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>, userId: string, orgId: string): Promise<string> {
  const { data } = await supabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', userId)
    .eq('organization_id', orgId)
    .single();
  if (data?.roles && typeof data.roles === 'object' && 'name' in data.roles) {
    return data.roles.name as string;
  }
  return 'Employee';
}

function invalidate() {
  revalidatePath('/departments');
  revalidatePath('/dashboard');
}

// ─── Queries ──────────────────────────────────────────────

export async function getDepartments(includeArchived = false): Promise<Department[]> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return [];

  let query = supabase
    .from('departments')
    .select(`
      id,
      organization_id,
      name,
      description,
      manager_id,
      is_archived,
      deleted_at,
      deleted_by,
      created_by,
      updated_by,
      created_at,
      updated_at,
      manager:profiles!departments_manager_id_fkey(first_name, last_name, email)
    `)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('name');

  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data } = await query;

  return (data ?? []).map(d => {
    const rawManager = d.manager;
    const managerObj = Array.isArray(rawManager) ? rawManager[0] : rawManager;
    return {
      ...d,
      manager: managerObj ?? null,
    };
  }) as Department[];
}

// ─── Create ───────────────────────────────────────────────

export async function createDepartmentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const manager_id = (formData.get('manager_id') as string) || null;

  if (!name) return { success: false, error: 'Department name is required' };
  if (name.length > 100) return { success: false, error: 'Name must be 100 characters or fewer' };

  const { error } = await supabase.from('departments').insert({
    organization_id: organizationId,
    name,
    description,
    manager_id: manager_id || null,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A department with this name already exists' };
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'department.create',
    details: { name },
  });

  invalidate();
  return { success: true };
}

// ─── Update ───────────────────────────────────────────────

export async function updateDepartmentAction(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const manager_id = (formData.get('manager_id') as string) || null;

  if (!name) return { success: false, error: 'Department name is required' };
  if (name.length > 100) return { success: false, error: 'Name must be 100 characters or fewer' };

  const { error } = await supabase
    .from('departments')
    .update({ name, description, manager_id: manager_id || null, updated_by: user.id })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .is('deleted_at', null);

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A department with this name already exists' };
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'department.update',
    details: { id, name },
  });

  invalidate();
  return { success: true };
}

// ─── Archive / Restore ────────────────────────────────────

export async function archiveDepartmentAction(id: string, archive: boolean): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Only Owners and Admins can archive departments' };
  }

  const { error } = await supabase
    .from('departments')
    .update({ is_archived: archive, updated_by: user.id })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .is('deleted_at', null);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: archive ? 'department.archive' : 'department.restore',
    details: { id },
  });

  invalidate();
  return { success: true };
}

// ─── Soft Delete ──────────────────────────────────────────

export async function softDeleteDepartmentAction(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (role !== 'Owner') {
    return { success: false, error: 'Only Owners can delete departments' };
  }

  const { error } = await supabase
    .from('departments')
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'department.delete',
    details: { id },
  });

  invalidate();
  return { success: true };
}

// ─── Delete (legacy hard delete — kept for compatibility) ──

export async function deleteDepartmentAction(id: string): Promise<{ success: boolean; error?: string }> {
  return softDeleteDepartmentAction(id);
}
