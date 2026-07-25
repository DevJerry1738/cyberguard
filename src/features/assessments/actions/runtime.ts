'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { AssessmentQuestion, QuestionOption, QuestionsByDomain } from '../schemas/question';
import type { AssessmentSession } from '../schemas/session';

/**
 * Calculates the answered-required percentage directly from a snapshot JSON
 * and a responses map — no extra DB round-trips, no risk of returning stale 0%.
 */
function calcProgressFromSnapshot(
  snapshot: Record<string, unknown> | null | undefined,
  responses: Record<string, unknown>
): number {
  const rawQuestions = Array.isArray(snapshot?.questions) ? (snapshot!.questions as Array<Record<string, unknown>>) : [];
  if (rawQuestions.length === 0) return 0;

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

export interface AssessmentRuntimeSnapshot {
  id: string;
  name: string;
  version: string;
  framework: string;
  domains: Array<{
    domain_id: string;
    domain_name: string;
    sort_order: number;
  }>;
  questions: AssessmentQuestion[];
}

export interface AssessmentRuntime {
  session: AssessmentSession;
  snapshot: AssessmentRuntimeSnapshot;
  groups: QuestionsByDomain[];
}

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('profile_id', user.id)
    .maybeSingle();

  const organizationId = membership?.organization_id ?? null;
  if (organizationId) {
    return { supabase, user, organizationId };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.organization_id) {
    return { supabase, user, organizationId: profile.organization_id };
  }

  if (membershipError) {
    const adminSupabase = getAdminSupabaseClient();
    if (adminSupabase) {
      const { data: adminMembership } = await adminSupabase
        .from('organization_members')
        .select('organization_id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (adminMembership?.organization_id) {
        return { supabase, user, organizationId: adminMembership.organization_id };
      }

      const { data: adminProfile } = await adminSupabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (adminProfile?.organization_id) {
        return { supabase, user, organizationId: adminProfile.organization_id };
      }
    }
  }

  return { supabase, user, organizationId: null };
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

async function getAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  userId: string,
  organizationId: string
) {
  let query = supabase
    .from('assessment_session_assignments')
    .select('id, status')
    .eq('session_id', sessionId)
    .eq('profile_id', userId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data: assignment } = await query.maybeSingle();

  return assignment;
}

async function canAccessSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  organizationId: string,
  sessionId: string
): Promise<boolean> {
  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('started_by, organization_id')
    .eq('id', sessionId)
    .is('deleted_at', null)
    .maybeSingle();

  const effectiveOrgId = session?.organization_id ?? organizationId;

  const assignment = await getAssignment(supabase, sessionId, userId, effectiveOrgId);
  if (assignment) return true;

  if (session?.started_by === userId) return true;

  if (!effectiveOrgId) return false;

  const { data, error } = await supabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', userId)
    .eq('organization_id', effectiveOrgId)
    .maybeSingle();

  if (!error && data) {
    return true;
  }

  const adminSupabase = getAdminSupabaseClient();
  if (!adminSupabase) return false;

  const { data: adminMembership, error: adminError } = await adminSupabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', userId)
    .eq('organization_id', effectiveOrgId)
    .maybeSingle();

  return !adminError && Boolean(adminMembership);
}

async function getSessionRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  organizationId: string,
  sessionId: string
): Promise<{ session: AssessmentSession | null; organizationId: string | null }> {
  const { data: session, error } = await supabase
    .from('assessment_sessions')
    .select('id, organization_id, status, metadata, template_id, template_name, template_version, template_framework, template_snapshot, started_by, progress_percent, started_at, completed_at, due_at, created_at, updated_at, deleted_at, deleted_by')
    .eq('id', sessionId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !session) {
    const adminSupabase = getAdminSupabaseClient();
    if (adminSupabase) {
      const { data: adminSession, error: adminError } = await adminSupabase
        .from('assessment_sessions')
        .select('id, organization_id, status, metadata, template_id, template_name, template_version, template_framework, template_snapshot, started_by, progress_percent, started_at, completed_at, due_at, created_at, updated_at, deleted_at, deleted_by')
        .eq('id', sessionId)
        .is('deleted_at', null)
        .maybeSingle();

      if (!adminError && adminSession) {
        return { session: adminSession as AssessmentSession, organizationId: adminSession.organization_id ?? organizationId };
      }
    }

    return { session: null, organizationId: null };
  }

  const effectiveOrganizationId = session.organization_id ?? organizationId;
  return { session: session as AssessmentSession, organizationId: effectiveOrganizationId };
}

function normalizeOptions(options: unknown): QuestionOption[] {
  if (!Array.isArray(options)) return [];
  return [...options]
    .map(option => option as QuestionOption)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function normalizeSnapshot(snapshot: Record<string, unknown> | null | undefined): AssessmentRuntimeSnapshot {
  const rawDomains = Array.isArray(snapshot?.domains) ? snapshot.domains : [];
  const rawQuestions = Array.isArray(snapshot?.questions) ? snapshot.questions : [];

  const domains = (rawDomains as Array<Record<string, unknown>>)
    .map(domain => ({
      domain_id: String(domain.domain_id ?? ''),
      domain_name: String(domain.domain_name ?? 'Unknown Domain'),
      sort_order: Number(domain.sort_order ?? 0),
    }))
    .filter(domain => domain.domain_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const questions = (rawQuestions as Array<Record<string, unknown>>).map(question => ({
    ...(question as unknown as AssessmentQuestion),
    options: normalizeOptions(question.options),
  })) as AssessmentQuestion[];

  return {
    id: String(snapshot?.id ?? ''),
    name: String(snapshot?.name ?? ''),
    version: String(snapshot?.version ?? ''),
    framework: String(snapshot?.framework ?? ''),
    domains,
    questions: questions.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  };
}

function buildGroups(snapshot: AssessmentRuntimeSnapshot): QuestionsByDomain[] {
  return snapshot.domains.map(domain => ({
    domain_id: domain.domain_id,
    domain_name: domain.domain_name,
    questions: snapshot.questions.filter(question => question.domain_id === domain.domain_id),
  }));
}

function toResponseMap(responses: unknown): Record<string, unknown> {
  if (!responses || typeof responses !== 'object' || Array.isArray(responses)) {
    return {};
  }

  return responses as Record<string, unknown>;
}

function hasResponseValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export async function getAssessmentRuntime(sessionId: string): Promise<AssessmentRuntime | null> {
  const { supabase, user, organizationId } = await getOrgContext();

  const { session, organizationId: sessionOrgId } = await getSessionRecord(supabase, user.id, organizationId ?? '', sessionId);

  if (!session) return null;

  const effectiveOrgId = sessionOrgId ?? organizationId ?? '';

  const hasAccess = await canAccessSession(supabase, user.id, effectiveOrgId, sessionId);
  if (!hasAccess && user.id !== session.started_by) return null;

  let snapshot = normalizeSnapshot((session.template_snapshot as Record<string, unknown>) ?? null);

  // Fallback: if snapshot is empty, load from template definition (for sessions created before snapshot capture)
  if (snapshot.questions.length === 0) {
    const { data: templateDomains, error: templateDomainsError } = await supabase
      .from('assessment_template_domains')
      .select('domain_id, sort_order, security_domains(name)')
      .eq('template_id', session.template_id)
      .order('sort_order', { ascending: true });

    let templateQuestionsQuery = supabase
      .from('assessment_questions')
      .select('*, options:assessment_question_options(id, label, value, sort_order, created_at, question_id)')
      .eq('template_id', session.template_id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    if (effectiveOrgId) {
      templateQuestionsQuery = templateQuestionsQuery.eq('organization_id', effectiveOrgId);
    }

    const { data: templateQuestions, error: templateQuestionsError } = await templateQuestionsQuery;

    if (!templateDomainsError && !templateQuestionsError) {
      snapshot = {
        id: session.template_id,
        name: session.template_name,
        version: session.template_version,
        framework: session.template_framework,
        domains: (templateDomains ?? []).map((domain: any) => ({
          domain_id: domain.domain_id,
          domain_name: domain.security_domains?.name ?? 'Unknown Domain',
          sort_order: domain.sort_order,
        })),
        questions: (templateQuestions ?? []).map((question: any) => ({
          id: question.id,
          organization_id: question.organization_id,
          template_id: question.template_id,
          domain_id: question.domain_id,
          question_text: question.question_text,
          help_text: question.help_text,
          question_type: question.question_type,
          is_required: question.is_required,
          weight: question.weight,
          sort_order: question.sort_order,
          metadata: question.metadata ?? {},
          created_by: question.created_by,
          updated_by: question.updated_by,
          created_at: question.created_at,
          updated_at: question.updated_at,
          deleted_at: question.deleted_at,
          deleted_by: question.deleted_by,
          options: (question.options ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
        })),
      };

      // Optionally update the session with the filled snapshot for future loads
      try {
        await supabase
          .from('assessment_sessions')
          .update({ template_snapshot: snapshot, updated_at: new Date().toISOString() })
          .eq('id', sessionId)
          .eq('organization_id', effectiveOrgId);
      } catch {
        // Ignore errors from the update; the snapshot is still loaded for this request
      }
    }
  }

  const groups = buildGroups(snapshot);

  return {
    session: session as AssessmentSession,
    snapshot,
    groups,
  };
}

export async function getAssessmentResponses(sessionId: string): Promise<Record<string, unknown>> {
  const { supabase, user, organizationId } = await getOrgContext();

  const { session, organizationId: sessionOrgId } = await getSessionRecord(supabase, user.id, organizationId ?? '', sessionId);
  if (!session) return {};

  const effectiveOrgId = sessionOrgId ?? organizationId ?? '';
  const hasAccess = await canAccessSession(supabase, user.id, effectiveOrgId, sessionId);
  if (!hasAccess) return {};

  const fallbackResponses = toResponseMap((session?.metadata as Record<string, unknown> | null)?.responses);

  let draftResponses: Record<string, unknown> = {};
  try {
    const { data: draft } = await supabase
      .from('assessment_drafts')
      .select('responses')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (draft?.responses) {
      draftResponses = toResponseMap(draft.responses);
    }
  } catch {
    // Ignore draft query errors
  }

  const baseResponses = { ...fallbackResponses, ...draftResponses };

  try {
    let responsesQuery = supabase
      .from('assessment_responses')
      .select('question_id, response_value')
      .eq('session_id', sessionId)
      .eq('profile_id', user.id);

    if (effectiveOrgId) {
      responsesQuery = responsesQuery.eq('organization_id', effectiveOrgId);
    }

    const { data: storedResponses } = await responsesQuery;

    if (!storedResponses || storedResponses.length === 0) {
      return baseResponses;
    }

    return storedResponses.reduce<Record<string, unknown>>((acc, item) => {
      acc[item.question_id] = item.response_value;
      return acc;
    }, baseResponses);
  } catch {
    return baseResponses;
  }
}

export async function saveAssessmentResponse(
  sessionId: string,
  questionId: string,
  value: unknown
): Promise<{ success: boolean; error?: string; savedIn?: 'metadata' | 'responses' }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const hasAccess = await canAccessSession(supabase, user.id, organizationId, sessionId);
  if (!hasAccess) return { success: false, error: 'You are not assigned to this session' };

  const { session, organizationId: sessionOrgId } = await getSessionRecord(supabase, user.id, organizationId, sessionId);

  if (!session || !sessionOrgId) return { success: false, error: 'Session not found' };

  if (session.status === 'Completed' || session.status === 'Cancelled' || session.status === 'Archived') {
    return { success: false, error: 'This session is read-only and cannot be edited' };
  }

  try {
    const { error } = await supabase.from('assessment_responses').upsert(
      {
        organization_id: organizationId,
        session_id: sessionId,
        profile_id: user.id,
        question_id: questionId,
        response_value: value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id,question_id' }
    );

    if (!error) {
      await supabase.from('audit_logs').insert({
        organization_id: organizationId,
        profile_id: user.id,
        action: 'assessment.response.save',
        details: { session_id: sessionId, question_id: questionId },
      });

      // Build an up-to-date responses map from the DB so progress is accurate.
      // We include the just-saved answer explicitly to avoid any read-after-write lag.
      const { data: existingRows } = await supabase
        .from('assessment_responses')
        .select('question_id, response_value')
        .eq('session_id', sessionId);

      const dbResponses: Record<string, unknown> = {};
      for (const row of existingRows ?? []) {
        dbResponses[row.question_id] = row.response_value;
      }
      // Ensure the answer we just saved is reflected even if read-after-write is lagging
      dbResponses[questionId] = value;

      const percentage = calcProgressFromSnapshot(
        session.template_snapshot as Record<string, unknown>,
        dbResponses
      );

      await supabase
        .from('assessment_sessions')
        .update({
          progress_percent: percentage,
          status: 'In Progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('organization_id', sessionOrgId);

      revalidatePath('/assessments');
      revalidatePath(`/assessments/sessions/${sessionId}/wizard`);
      return { success: true, savedIn: 'responses' };
    }
  } catch {
    // Fall back to session metadata storage if the response table is not available yet.
  }

  const sessionMetadata = (session.metadata as Record<string, unknown> | null) ?? {};
  const existingResponses = toResponseMap(sessionMetadata.responses);
  const nextMetadata = {
    ...sessionMetadata,
    responses: {
      ...existingResponses,
      [questionId]: value,
    },
  };

  // Use the snapshot already on the session record — no extra DB call that could fail or race.
  const percentage = calcProgressFromSnapshot(
    session.template_snapshot as Record<string, unknown>,
    nextMetadata.responses as Record<string, unknown>
  );

  const { error: updateError } = await supabase
    .from('assessment_sessions')
    .update({
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
      status: 'In Progress',
      progress_percent: percentage,
    })
    .eq('id', sessionId)
    .eq('organization_id', sessionOrgId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.response.save',
    details: { session_id: sessionId, question_id: questionId, storage: 'metadata-fallback' },
  });

  revalidatePath('/assessments');
  revalidatePath(`/assessments/sessions/${sessionId}/wizard`);
  return { success: true, savedIn: 'metadata' };
}

export async function saveDraft(
  sessionId: string,
  responses: Record<string, unknown>,
  currentQuestionId?: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const hasAccess = await canAccessSession(supabase, user.id, organizationId, sessionId);
  if (!hasAccess) return { success: false, error: 'You are not assigned to this session' };

  const { session, organizationId: sessionOrgId } = await getSessionRecord(supabase, user.id, organizationId, sessionId);

  if (!session || !sessionOrgId) return { success: false, error: 'Session not found' };

  if (session.status === 'Completed' || session.status === 'Cancelled' || session.status === 'Archived') {
    return { success: false, error: 'This session is read-only and cannot be edited' };
  }

  const nextMetadata = {
    ...(session.metadata as Record<string, unknown> | null),
    responses,
    last_saved_at: new Date().toISOString(),
    current_question_id: currentQuestionId ?? (session.metadata as Record<string, unknown> | null)?.current_question_id ?? null,
  };

  // Compute progress directly from the snapshot stored on the session record.
  // Avoids calling getAssessmentRuntime() again (extra round-trip that can race and return 0).
  const percentage = calcProgressFromSnapshot(
    session.template_snapshot as Record<string, unknown>,
    responses
  );

  const { error } = await supabase
    .from('assessment_sessions')
    .update({
      metadata: nextMetadata,
      status: 'In Progress',
      progress_percent: percentage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.draft.save',
    details: { session_id: sessionId, response_count: Object.keys(responses).length },
  });

  revalidatePath('/assessments');
  revalidatePath(`/assessments/sessions/${sessionId}/wizard`);
  return { success: true };
}

export async function validateAssessment(
  sessionId: string,
  responses: Record<string, unknown>
): Promise<{ success: boolean; missing: string[]; error?: string }> {
  const runtime = await getAssessmentRuntime(sessionId);
  if (!runtime) return { success: false, missing: [], error: 'Session not found' };

  const missing = runtime.groups.flatMap(group =>
    group.questions
      .filter(question => question.is_required && !hasResponseValue(responses[question.id]))
      .map(question => question.id)
  );

  return { success: missing.length === 0, missing };
}

export async function getProgress(sessionId: string): Promise<{
  totalRequired: number;
  answeredRequired: number;
  percentage: number;
}> {
  const runtime = await getAssessmentRuntime(sessionId);
  if (!runtime) {
    return { totalRequired: 0, answeredRequired: 0, percentage: 0 };
  }

  const responses = await getAssessmentResponses(sessionId);
  const requiredQuestions = runtime.groups.flatMap(group => group.questions.filter(question => question.is_required));
  const answeredRequired = requiredQuestions.filter(question => hasResponseValue(responses[question.id])).length;

  return {
    totalRequired: requiredQuestions.length,
    answeredRequired,
    percentage: requiredQuestions.length === 0 ? 0 : Math.round((answeredRequired / requiredQuestions.length) * 100),
  };
}

export async function resumeAssessment(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const { session, organizationId: sessionOrgId } = await getSessionRecord(supabase, user.id, organizationId, sessionId);
  if (!session || !sessionOrgId) return { success: false, error: 'Session not found' };

  const hasAccess = await canAccessSession(supabase, user.id, sessionOrgId, sessionId);
  if (!hasAccess) return { success: false, error: 'You are not assigned to this session' };

  const { error } = await supabase
    .from('assessment_sessions')
    .update({
      status: 'In Progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.resume',
    details: { session_id: sessionId },
  });

  revalidatePath(`/assessments/sessions/${sessionId}/wizard`);
  return { success: true };
}

export async function submitAssessment(
  sessionId: string,
  responses: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const { session, organizationId: sessionOrgId } = await getSessionRecord(supabase, user.id, organizationId, sessionId);
  if (!session || !sessionOrgId) return { success: false, error: 'Session not found' };

  const hasAccess = await canAccessSession(supabase, user.id, sessionOrgId, sessionId);
  if (!hasAccess) return { success: false, error: 'You are not assigned to this session' };

  const validation = await validateAssessment(sessionId, responses);
  if (!validation.success) {
    return { success: false, error: 'Required questions must be answered before submission' };
  }

  // Upsert all responses into assessment_responses table
  const responseInserts = Object.entries(responses).map(([questionId, value]) => ({
    organization_id: sessionOrgId,
    session_id: sessionId,
    profile_id: user.id,
    question_id: questionId,
    response_value: value,
    updated_at: new Date().toISOString(),
  }));

  if (responseInserts.length > 0) {
    try {
      await supabase.from('assessment_responses').upsert(responseInserts, {
        onConflict: 'session_id,question_id',
      });
    } catch {
      // Ignore if table issues occur
    }
  }

  // Delete active draft from assessment_drafts
  try {
    await supabase.from('assessment_drafts').delete().eq('session_id', sessionId).eq('user_id', user.id);
  } catch {
    // Ignore draft deletion errors
  }

  const { error } = await supabase
    .from('assessment_sessions')
    .update({
      status: 'Completed',
      progress_percent: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        responses,
        last_saved_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      },
    })
    .eq('id', sessionId)
    .eq('organization_id', sessionOrgId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.submitted',
    details: { session_id: sessionId },
  });

  revalidatePath('/assessments');
  revalidatePath('/dashboard');
  revalidatePath(`/assessments/sessions/${sessionId}`);
  revalidatePath(`/assessments/sessions/${sessionId}/wizard`);
  revalidatePath(`/assessments/sessions/${sessionId}/review`);
  revalidatePath(`/assessments/sessions/${sessionId}/complete`);
  return { success: true };
}
