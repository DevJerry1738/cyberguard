'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { SecurityDomain } from '@/features/security-domains/schemas/security-domain';
import { SecurityDomainSchema } from '@/features/security-domains/schemas/security-domain';

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

async function getUserRole(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  userId: string,
  orgId: string
): Promise<string> {
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
  revalidatePath('/settings/security-domains');
  revalidatePath('/dashboard');
}

// ─── Queries ──────────────────────────────────────────────

export async function getSecurityDomains(includeArchived = false): Promise<SecurityDomain[]> {
  const { supabase, organizationId } = await getOrgContext();
  if (!organizationId) return [];

  let query = supabase
    .from('security_domains')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data } = await query;
  return (data ?? []) as SecurityDomain[];
}

// ─── Create ───────────────────────────────────────────────

export async function createSecurityDomainAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Only Owners and Admins can create domains' };
  }

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;

  // Validate input
  const validation = SecurityDomainSchema.safeParse({ name, description });
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { success: false, error: firstError?.message || 'Validation failed' };
  }

  // Get the next sort_order value
  const { data: maxSort } = await supabase
    .from('security_domains')
    .select('sort_order', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = ((maxSort?.[0]?.sort_order) ?? -1) + 1;

  const { error } = await supabase.from('security_domains').insert({
    organization_id: organizationId,
    name: validation.data.name,
    description: validation.data.description,
    sort_order: nextSortOrder,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A domain with this name already exists in your organization' };
    }
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'domain.create',
    details: { name: validation.data.name },
  });

  invalidate();
  return { success: true };
}

// ─── Update ───────────────────────────────────────────────

export async function updateSecurityDomainAction(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Only Owners and Admins can update domains' };
  }

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;

  // Validate input
  const validation = SecurityDomainSchema.safeParse({ name, description });
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { success: false, error: firstError?.message || 'Validation failed' };
  }

  const { error } = await supabase
    .from('security_domains')
    .update({
      name: validation.data.name,
      description: validation.data.description,
      updated_by: user.id,
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .is('deleted_at', null);

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A domain with this name already exists in your organization' };
    }
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'domain.update',
    details: { id, name: validation.data.name },
  });

  invalidate();
  return { success: true };
}

// ─── Archive / Restore ────────────────────────────────────

export async function archiveSecurityDomainAction(id: string, archive: boolean): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Only Owners and Admins can archive domains' };
  }

  const { error } = await supabase
    .from('security_domains')
    .update({ is_archived: archive, updated_by: user.id })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .is('deleted_at', null);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: archive ? 'domain.archive' : 'domain.restore',
    details: { id },
  });

  invalidate();
  return { success: true };
}

// ─── Soft Delete ──────────────────────────────────────────

export async function deleteSecurityDomainAction(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (role !== 'Owner') {
    return { success: false, error: 'Only Owners can delete domains' };
  }

  const { error } = await supabase
    .from('security_domains')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'domain.delete',
    details: { id },
  });

  invalidate();
  return { success: true };
}

// ─── Reorder ──────────────────────────────────────────────

export async function reorderSecurityDomainsAction(
  items: Array<{ id: string; sort_order: number }>
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Only Owners, Admins, and Security Officers can reorder domains' };
  }

  // Validate that all items belong to this organization
  const { data: domains } = await supabase
    .from('security_domains')
    .select('id')
    .eq('organization_id', organizationId)
    .in(
      'id',
      items.map(item => item.id)
    );

  if (!domains || domains.length !== items.length) {
    return { success: false, error: 'One or more domains do not belong to your organization' };
  }

  // Update sort_order for each domain
  const updates = items.map(item =>
    supabase
      .from('security_domains')
      .update({ sort_order: item.sort_order, updated_by: user.id })
      .eq('id', item.id)
      .eq('organization_id', organizationId)
  );

  const results = await Promise.all(updates);
  const hasError = results.some(r => r.error);

  if (hasError) {
    const firstError = results.find(r => r.error)?.error;
    return { success: false, error: firstError?.message || 'Failed to reorder domains' };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'domain.reorder',
    details: { count: items.length },
  });

  invalidate();
  return { success: true };
}
