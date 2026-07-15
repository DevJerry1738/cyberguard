'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { AssessmentQuestion, QuestionOption, QuestionsByDomain } from '../schemas/question';
import type { AssessmentSession } from '../schemas/session';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  return { supabase, user, organizationId: profile?.organization_id ?? null };
}

async function getAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  userId: string,
  organizationId: string
) {
  const { data: assignment } = await supabase
    .from('assessment_session_assignments')
    .select('id, status')
    .eq('session_id', sessionId)
    .eq('profile_id', userId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  return assignment;
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
  if (!organizationId) return null;

  const { data: session, error: sessionError } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  if (sessionError || !session) return null;

  const assignment = await getAssignment(supabase, sessionId, user.id, organizationId);
  if (!assignment) return null;

  let snapshot = normalizeSnapshot((session.template_snapshot as Record<string, unknown>) ?? null);

  // Fallback: if snapshot is empty, load from template definition (for sessions created before snapshot capture)
  if (snapshot.questions.length === 0) {
    const { data: templateDomains, error: templateDomainsError } = await supabase
      .from('assessment_template_domains')
      .select('domain_id, sort_order, security_domains(name)')
      .eq('template_id', session.template_id)
      .order('sort_order', { ascending: true });

    const { data: templateQuestions, error: templateQuestionsError } = await supabase
      .from('assessment_questions')
      .select('*, options:assessment_question_options(id, label, value, sort_order, created_at, question_id)')
      .eq('template_id', session.template_id)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

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
          .eq('organization_id', organizationId);
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
  if (!organizationId) return {};

  const assignment = await getAssignment(supabase, sessionId, user.id, organizationId);
  if (!assignment) return {};

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('metadata')
    .eq('id', sessionId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  const fallbackResponses = toResponseMap((session?.metadata as Record<string, unknown> | null)?.responses);

  try {
    const { data: storedResponses } = await supabase
      .from('assessment_responses')
      .select('question_id, response_value')
      .eq('session_id', sessionId)
      .eq('profile_id', user.id)
      .eq('organization_id', organizationId);

    if (!storedResponses || storedResponses.length === 0) {
      return fallbackResponses;
    }

    return storedResponses.reduce<Record<string, unknown>>((acc, item) => {
      acc[item.question_id] = item.response_value;
      return acc;
    }, fallbackResponses);
  } catch {
    return fallbackResponses;
  }
}

export async function saveAssessmentResponse(
  sessionId: string,
  questionId: string,
  value: unknown
): Promise<{ success: boolean; error?: string; savedIn?: 'metadata' | 'responses' }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const assignment = await getAssignment(supabase, sessionId, user.id, organizationId);
  if (!assignment) return { success: false, error: 'You are not assigned to this session' };

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, status, metadata')
    .eq('id', sessionId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  if (!session) return { success: false, error: 'Session not found' };

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

  const { error: updateError } = await supabase
    .from('assessment_sessions')
    .update({
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
      status: 'In Progress',
    })
    .eq('id', sessionId)
    .eq('organization_id', organizationId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.response.save',
    details: { session_id: sessionId, question_id: questionId, storage: 'metadata-fallback' },
  });

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

  const assignment = await getAssignment(supabase, sessionId, user.id, organizationId);
  if (!assignment) return { success: false, error: 'You are not assigned to this session' };

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, metadata, status')
    .eq('id', sessionId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  if (!session) return { success: false, error: 'Session not found' };

  if (session.status === 'Completed' || session.status === 'Cancelled' || session.status === 'Archived') {
    return { success: false, error: 'This session is read-only and cannot be edited' };
  }

  const nextMetadata = {
    ...(session.metadata as Record<string, unknown> | null),
    responses,
    last_saved_at: new Date().toISOString(),
    current_question_id: currentQuestionId ?? (session.metadata as Record<string, unknown> | null)?.current_question_id ?? null,
  };

  const { error } = await supabase
    .from('assessment_sessions')
    .update({
      metadata: nextMetadata,
      status: 'In Progress',
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

  const assignment = await getAssignment(supabase, sessionId, user.id, organizationId);
  if (!assignment) return { success: false, error: 'You are not assigned to this session' };

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

  const assignment = await getAssignment(supabase, sessionId, user.id, organizationId);
  if (!assignment) return { success: false, error: 'You are not assigned to this session' };

  const validation = await validateAssessment(sessionId, responses);
  if (!validation.success) {
    return { success: false, error: 'Required questions must be answered before submission' };
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
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.submitted',
    details: { session_id: sessionId },
  });

  revalidatePath(`/assessments/sessions/${sessionId}/wizard`);
  revalidatePath(`/assessments/sessions/${sessionId}/review`);
  return { success: true };
}
