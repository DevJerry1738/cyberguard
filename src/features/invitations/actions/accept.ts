'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { validateInvitationToken } from './invitations';

export async function acceptInvitationAction(token: string, password: string): Promise<{ success: boolean; error?: string }> {
  // 1. Validate invitation token first
  const validation = await validateInvitationToken(token);
  if (!validation.success || !validation.invitation) {
    return { success: false, error: validation.error || 'Invalid or expired invitation token' };
  }

  const { email, organization_id, role_id, department_id } = validation.invitation;

  // 2. Use service-role client to create the auth user with email already confirmed
  //    This allows the invited user to log in immediately without email verification
  const admin = createAdminClient();

  const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (signUpError || !authData.user) {
    return { success: false, error: signUpError?.message || 'Failed to create account' };
  }

  const userId = authData.user.id;

  // 3. Service-role client already created, use it for all DB writes

  // 4. Upsert profile — handles the case where the trigger hasn't fired yet
  //    or has already inserted a row (onConflict: 'id' = safe merge)
  const { error: profileError } = await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        organization_id,
        onboarding_complete: true,
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.error('[acceptInvitation] profile upsert failed:', profileError);
    return { success: false, error: `Profile setup failed: ${profileError.message}` };
  }

  // 5. Insert organization member record
  const { error: memberError } = await admin
    .from('organization_members')
    .insert({
      organization_id,
      profile_id: userId,
      role_id,
    });

  if (memberError) {
    console.error('[acceptInvitation] organization_members insert failed:', memberError);
    return { success: false, error: `Member setup failed: ${memberError.message}` };
  }

  // 6. Associate with department if one was specified
  if (department_id) {
    const { data: dept } = await admin
      .from('departments')
      .select('id')
      .eq('id', department_id)
      .eq('organization_id', organization_id)
      .is('deleted_at', null)
      .single();

    if (dept) {
      await admin
        .from('profiles')
        .update({ department_id })
        .eq('id', userId);
    }
  }

  // 7. Mark invitation as accepted (one-time use)
  const { error: inviteUpdateError } = await admin
    .from('invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('token', token);

  if (inviteUpdateError) {
    console.error('[acceptInvitation] invitation update failed:', inviteUpdateError);
    return { success: false, error: `Invitation finalisation failed: ${inviteUpdateError.message}` };
  }

  // 8. Audit log
  await admin.from('audit_logs').insert({
    organization_id,
    profile_id: userId,
    action: 'invitation.accept',
    details: { email },
  });

  // 9. Invalidate Next.js cache so /members and /invitations update immediately
  revalidatePath('/members');
  revalidatePath('/invitations');

  return { success: true };
}
