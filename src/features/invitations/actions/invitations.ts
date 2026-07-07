'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import type { InvitationWithMeta } from '@/types/invitations';

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

async function getUserRole(supabase: any, userId: string, orgId: string): Promise<string> {
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
  revalidatePath('/invitations');
  revalidatePath('/members');
}

// ─── Queries ──────────────────────────────────────────────

export async function getInvitations(): Promise<InvitationWithMeta[]> {
  const { supabase, organizationId } = await getOrgContext();
  if (!organizationId) return [];

  // Automatically update statuses to expired if the date is past expires_at
  const now = new Date().toISOString();
  await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .lt('expires_at', now);

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      id,
      organization_id,
      email,
      role_id,
      department_id,
      token,
      status,
      expires_at,
      accepted_at,
      invited_by,
      created_at,
      updated_at,
      role:roles(id, name),
      department:departments(id, name),
      inviter:profiles!invitations_invited_by_fkey(first_name, last_name, email)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []).map(inv => {
    const rawRole = inv.role;
    const roleObj = Array.isArray(rawRole) ? rawRole[0] : rawRole;
    const rawDept = inv.department;
    const deptObj = Array.isArray(rawDept) ? rawDept[0] : rawDept;
    const rawInviter = inv.inviter;
    const inviterObj = Array.isArray(rawInviter) ? rawInviter[0] : rawInviter;

    return {
      ...inv,
      role: roleObj ?? null,
      department: deptObj ?? null,
      inviter: inviterObj ?? null,
    };
  }) as InvitationWithMeta[];
}

// Validate token publicly
export async function validateInvitationToken(token: string): Promise<{ success: boolean; invitation?: any; error?: string }> {
  const supabase = await createClient();

  // Update if expired first
  const now = new Date().toISOString();
  await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('token', token)
    .eq('status', 'pending')
    .lt('expires_at', now);

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      id,
      organization_id,
      email,
      role_id,
      department_id,
      status,
      expires_at,
      organizations(name)
    `)
    .eq('token', token)
    .single();

  if (error || !data) {
    return { success: false, error: 'Invitation not found' };
  }

  if (data.status !== 'pending') {
    return { success: false, error: `This invitation is already ${data.status}` };
  }

  const rawOrg = data.organizations;
  const orgObj = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;

  return {
    success: true,
    invitation: {
      ...data,
      organization_name: orgObj?.name ?? 'Organization',
    },
  };
}

// ─── Actions ──────────────────────────────────────────────

export async function createInvitationAction(formData: FormData): Promise<{ success: boolean; inviteLink?: string; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  // Role permission check
  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Only Owners and Admins can invite team members' };
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const role_id = formData.get('role_id') as string;
  const department_id = (formData.get('department_id') as string) || null;

  if (!email) return { success: false, error: 'Email address is required' };
  if (!role_id) return { success: false, error: 'Role is required' };

  // Check if member already exists in the organization
  const { data: existingMember } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .eq('organization_id', organizationId)
    .single();

  if (existingMember) {
    return { success: false, error: 'A user with this email is already in the organization' };
  }

  // Check if pending invitation already exists for this email and organization
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (existingInvite) {
    return { success: false, error: 'A pending invitation already exists for this email' };
  }

  // Generate cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const { error } = await supabase.from('invitations').insert({
    organization_id: organizationId,
    email,
    role_id,
    department_id: department_id || null,
    token,
    status: 'pending',
    expires_at: expiresAt,
    invited_by: user.id,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'invitation.create',
    details: { email, role_id },
  });

  invalidate();

  // Create invite link using request headers if possible, or fall back to localhost
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const inviteLink = `${origin}/accept-invite/${token}`;

  return { success: true, inviteLink };
}

export async function revokeInvitationAction(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Only Owners and Admins can revoke invitations' };
  }

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'invitation.revoke',
    details: { id },
  });

  invalidate();
  return { success: true };
}

export async function deleteInvitationAction(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Only Owners and Admins can delete invitations' };
  }

  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'invitation.delete',
    details: { id },
  });

  invalidate();
  return { success: true };
}
