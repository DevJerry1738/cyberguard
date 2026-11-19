'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  AssessmentDraftRecord,
  CreateDraftInput,
  SaveDraftInput,
  SaveDraftInputSchema,
  SyncOfflineDraftInput,
} from '../schemas/draft';

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id, roles(name)')
    .eq('profile_id', user.id)
    .maybeSingle();

  const organizationId = membership?.organization_id ?? null;
  const roleName = (membership as any)?.roles?.name ?? null;

  if (organizationId) {
    return { supabase, user, organizationId, roleName };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.organization_id) {
    return { supabase, user, organizationId: profile.organization_id, roleName };
  }

  if (membershipError) {
    const adminSupabase = getAdminSupabaseClient();
    if (adminSupabase) {
      const { data: adminMembership } = await adminSupabase
        .from('organization_members')
        .select('organization_id, roles(name)')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (adminMembership?.organization_id) {
        return {
          supabase,
          user,
          organizationId: adminMembership.organization_id,
          roleName: (adminMembership as any)?.roles?.name ?? null,
        };
      }
    }
  }

  return { supabase, user, organizationId: null, roleName: null };
}

function getAdminSupabaseClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

async function verifySessionAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  userId: string,
  organizationId: string
): Promise<boolean> {
  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('started_by, organization_id, status')
    .eq('id', sessionId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!session) return false;

  if (session.status === 'Completed' || session.status === 'Cancelled' || session.status === 'Archived') {
    return false;
  }

  const effectiveOrgId = session.organization_id ?? organizationId;

  const { data: assignment } = await supabase
    .from('assessment_session_assignments')
    .select('id')
    .eq('session_id', sessionId)
    .eq('profile_id', userId)
    .maybeSingle();

  if (assignment) return true;
  if (session.started_by === userId) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('profile_id', userId)
    .eq('organization_id', effectiveOrgId)
    .maybeSingle();

  return Boolean(member);
}

function calcProgress(
  snapshot: Record<string, unknown> | null | undefined,
  responses: Record<string, unknown>
): number {
  const rawQuestions = Array.isArray(snapshot?.questions)
    ? (snapshot!.questions as Array<Record<string, unknown>>)
    : [];

  if (rawQuestions.length === 0) {
    const answeredCount = Object.values(responses).filter(v => {
      if (v === undefined || v === null) return false;
      if (typeof v === 'string') return v.trim().length > 0;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length;
    return answeredCount > 0 ? 100 : 0;
  }

  const requiredQuestions = rawQuestions.filter(q => q.is_required === true);
  const targetQuestions = requiredQuestions.length > 0 ? requiredQuestions : rawQuestions;

  const answered = targetQuestions.filter(q => {
    const id = String(q.id ?? '');
    const v = responses[id];
    if (v === undefined || v === null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;

  return Math.round((answered / targetQuestions.length) * 100);
}

/**
 * Fetch existing assessment draft for the current user and session
 */
export async function getAssessmentDraft(
  sessionId: string
): Promise<{ success: boolean; draft?: AssessmentDraftRecord | null; error?: string }> {
  try {
    const { supabase, user, organizationId } = await getOrgContext();
    if (!organizationId) return { success: false, error: 'No organization found' };

    const { data: draft, error } = await supabase
      .from('assessment_drafts')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, draft: draft as AssessmentDraftRecord | null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve draft' };
  }
}

/**
 * Create a new draft for an assessment session
 */
export async function createAssessmentDraft(
  input: CreateDraftInput
): Promise<{ success: boolean; draft?: AssessmentDraftRecord; error?: string }> {
  try {
    const { supabase, user, organizationId } = await getOrgContext();
    if (!organizationId) return { success: false, error: 'No organization found' };

    const canAccess = await verifySessionAssignment(supabase, input.sessionId, user.id, organizationId);
    if (!canAccess) return { success: false, error: 'Not authorized for this assessment session' };

    const responses = input.responses ?? {};
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('template_snapshot')
      .eq('id', input.sessionId)
      .maybeSingle();

    const progress = calcProgress(session?.template_snapshot as Record<string, unknown>, responses);

    const { data: draft, error } = await supabase
      .from('assessment_drafts')
      .insert({
        session_id: input.sessionId,
        user_id: user.id,
        organization_id: organizationId,
        responses,
        current_domain: input.currentDomain ?? null,
        current_question: input.currentQuestion ?? null,
        progress,
        version: 1,
        last_saved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      profile_id: user.id,
      action: 'assessment.draft.created',
      details: { session_id: input.sessionId, draft_id: draft.id },
    });

    return { success: true, draft: draft as AssessmentDraftRecord };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create draft' };
  }
}

/**
 * Save draft (supports auto-save, manual save, and optimistic concurrency version checking)
 */
export async function saveAssessmentDraft(
  input: SaveDraftInput,
  isAutoSave: boolean = false
): Promise<{
  success: boolean;
  draft?: AssessmentDraftRecord;
  conflict?: boolean;
  serverDraft?: AssessmentDraftRecord;
  error?: string;
}> {
  try {
    const validation = SaveDraftInputSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.message };
    }

    const { supabase, user, organizationId, roleName } = await getOrgContext();
    if (!organizationId) return { success: false, error: 'No organization found' };

    const canAccess = await verifySessionAssignment(supabase, input.sessionId, user.id, organizationId);
    if (!canAccess) return { success: false, error: 'Not authorized or assessment is completed/cancelled' };

    const { data: existingDraft } = await supabase
      .from('assessment_drafts')
      .select('*')
      .eq('session_id', input.sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingDraft) {
      const createRes = await createAssessmentDraft({
        sessionId: input.sessionId,
        responses: input.responses,
        currentDomain: input.currentDomain,
        currentQuestion: input.currentQuestion,
      });
      return createRes;
    }

    const currentServerDraft = existingDraft as AssessmentDraftRecord;

    // Check optimistic concurrency: version mismatch
    if (
      typeof input.version === 'number' &&
      input.version !== currentServerDraft.version &&
      !input.forceOverwrite
    ) {
      // Audit log conflict detection
      await supabase.from('audit_logs').insert({
        organization_id: organizationId,
        profile_id: user.id,
        action: 'assessment.draft.conflict_detected',
        details: {
          session_id: input.sessionId,
          client_version: input.version,
          server_version: currentServerDraft.version,
        },
      });

      return {
        success: false,
        conflict: true,
        serverDraft: currentServerDraft,
        error: 'Conflict detected: A newer version of this draft exists.',
      };
    }

    // Force overwrite permission check: only Owner or Admin, or if user is owner of draft
    if (input.forceOverwrite) {
      const isOwnerOrAdmin = roleName === 'Owner' || roleName === 'Admin';
      const isDraftOwner = currentServerDraft.user_id === user.id;

      if (!isOwnerOrAdmin && !isDraftOwner) {
        return {
          success: false,
          error: 'Unauthorized: You do not have permission to force overwrite this draft.',
        };
      }
    }

    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('template_snapshot')
      .eq('id', input.sessionId)
      .maybeSingle();

    const newProgress = calcProgress(session?.template_snapshot as Record<string, unknown>, input.responses);
    const nextVersion = currentServerDraft.version + 1;
    const lastSavedAt = new Date().toISOString();

    const { data: updatedDraft, error: updateError } = await supabase
      .from('assessment_drafts')
      .update({
        responses: input.responses,
        current_domain: input.currentDomain ?? currentServerDraft.current_domain,
        current_question: input.currentQuestion ?? currentServerDraft.current_question,
        progress: newProgress,
        version: nextVersion,
        last_saved_at: lastSavedAt,
        updated_at: lastSavedAt,
      })
      .eq('id', currentServerDraft.id)
      .eq('version', currentServerDraft.version)
      .select()
      .maybeSingle();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    if (!updatedDraft) {
      const { data: latestDraft } = await supabase
        .from('assessment_drafts')
        .select('*')
        .eq('id', currentServerDraft.id)
        .maybeSingle();

      if (latestDraft) {
        await supabase.from('audit_logs').insert({
          organization_id: organizationId,
          profile_id: user.id,
          action: 'assessment.draft.conflict_detected',
          details: {
            session_id: input.sessionId,
            client_version: input.version,
            server_version: latestDraft.version,
          },
        });

        return {
          success: false,
          conflict: true,
          serverDraft: latestDraft as AssessmentDraftRecord,
          error: 'Conflict detected: A newer version of this draft exists.',
        };
      }

      return { success: false, error: 'Draft was removed before it could be saved.' };
    }

    // Also sync progress back to assessment_sessions table for compatibility.
    // Use admin client so RLS never silently blocks the progress_percent update.
    const adminClientForSync = getAdminSupabaseClient();
    const syncClient = adminClientForSync ?? supabase;
    await syncClient
      .from('assessment_sessions')
      .update({
        progress_percent: newProgress,
        status: 'In Progress',
        updated_at: lastSavedAt,
      })
      .eq('id', input.sessionId);

    // Audit log save event
    const action = input.forceOverwrite
      ? 'assessment.draft.conflict_resolved'
      : isAutoSave
      ? 'assessment.draft.auto_saved'
      : 'assessment.draft.manual_saved';

    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      profile_id: user.id,
      action,
      details: {
        session_id: input.sessionId,
        draft_id: currentServerDraft.id,
        version: nextVersion,
        progress: newProgress,
      },
    });

    revalidatePath('/assessments');
    revalidatePath('/dashboard');
    revalidatePath(`/assessments/sessions/${input.sessionId}/wizard`);
    return { success: true, draft: updatedDraft as AssessmentDraftRecord };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save draft' };
  }
}

/**
 * Resume assessment session from draft
 */
export async function resumeAssessmentDraft(
  sessionId: string
): Promise<{ success: boolean; draft?: AssessmentDraftRecord | null; error?: string }> {
  try {
    const { supabase, user, organizationId } = await getOrgContext();
    if (!organizationId) return { success: false, error: 'No organization found' };

    const { data: draft, error } = await supabase
      .from('assessment_drafts')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !draft) {
      return { success: false, error: 'No active draft found to resume' };
    }

    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      profile_id: user.id,
      action: 'assessment.draft.resumed',
      details: { session_id: sessionId, draft_id: draft.id },
    });

    revalidatePath(`/assessments/sessions/${sessionId}/wizard`);
    return { success: true, draft: draft as AssessmentDraftRecord };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to resume draft' };
  }
}

/**
 * Discard draft
 */
export async function discardAssessmentDraft(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user, organizationId } = await getOrgContext();
    if (!organizationId) return { success: false, error: 'No organization found' };

    const { data: draft } = await supabase
      .from('assessment_drafts')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!draft) {
      return { success: true };
    }

    const { error } = await supabase
      .from('assessment_drafts')
      .delete()
      .eq('id', draft.id);

    if (error) return { success: false, error: error.message };

    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      profile_id: user.id,
      action: 'assessment.draft.discarded',
      details: { session_id: sessionId, draft_id: draft.id },
    });

    revalidatePath(`/assessments/sessions/${sessionId}/wizard`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to discard draft' };
  }
}

/**
 * Synchronize offline draft changes when reconnecting
 */
export async function syncOfflineDraft(
  input: SyncOfflineDraftInput
): Promise<{
  success: boolean;
  draft?: AssessmentDraftRecord;
  conflict?: boolean;
  serverDraft?: AssessmentDraftRecord;
  error?: string;
}> {
  try {
    const { supabase, user, organizationId } = await getOrgContext();
    if (!organizationId) return { success: false, error: 'No organization found' };

    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      profile_id: user.id,
      action: 'assessment.draft.offline_sync_started',
      details: { session_id: input.sessionId, client_version: input.clientVersion },
    });

    const res = await saveAssessmentDraft(
      {
        sessionId: input.sessionId,
        responses: input.responses,
        currentDomain: input.currentDomain,
        currentQuestion: input.currentQuestion,
        version: input.clientVersion,
      },
      false
    );

    if (res.success) {
      await supabase.from('audit_logs').insert({
        organization_id: organizationId,
        profile_id: user.id,
        action: 'assessment.draft.offline_sync_completed',
        details: { session_id: input.sessionId, new_version: res.draft?.version },
      });
    } else if (res.conflict) {
      await supabase.from('audit_logs').insert({
        organization_id: organizationId,
        profile_id: user.id,
        action: 'assessment.draft.offline_sync_failed',
        details: { session_id: input.sessionId, reason: 'conflict' },
      });
    } else {
      await supabase.from('audit_logs').insert({
        organization_id: organizationId,
        profile_id: user.id,
        action: 'assessment.draft.offline_sync_failed',
        details: { session_id: input.sessionId, reason: res.error },
      });
    }

    return res;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to sync offline draft' };
  }
}
