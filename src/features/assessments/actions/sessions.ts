'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  AssessmentSessionSchema,
  type AssessmentSession,
  type AssessmentSessionInput,
} from '../schemas/session';

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
  revalidatePath('/assessments');
  revalidatePath('/dashboard');
}

export async function listAssessmentSessions(filters?: {
  search?: string;
  status?: string;
}): Promise<AssessmentSession[]> {
  const { supabase, organizationId } = await getOrgContext();
  if (!organizationId) return [];

  let query = supabase
    .from('assessment_sessions')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(
      `template_name.ilike.%${filters.search}%,template_framework.ilike.%${filters.search}%`
    );
  }

  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Failed to list assessment sessions:', error);
    return [];
  }

  return (data ?? []) as AssessmentSession[];
}

export async function getAssessmentSession(sessionId: string): Promise<{
  session: AssessmentSession;
  assignments: any[];
} | null> {
  const { supabase, organizationId } = await getOrgContext();
  if (!organizationId) return null;

  const { data: session, error: sessionError } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  if (sessionError || !session) return null;

  const { data: assignments } = await supabase
    .from('assessment_session_assignments')
    .select('*')
    .eq('session_id', sessionId)
    .order('assigned_at', { ascending: false });

  return {
    session: session as AssessmentSession,
    assignments: assignments ?? [],
  };
}

export async function createAssessmentSession(
  templateId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  const { data: template, error: templateError } = await supabase
    .from('assessment_templates')
    .select('id, name, version, framework, status, organization_id')
    .eq('id', templateId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  if (templateError || !template) {
    return { success: false, error: 'Template not found' };
  }

  if (template.status !== 'Active') {
    return { success: false, error: 'Only active templates can be launched into a session' };
  }

  const { data: templateDomains, error: templateDomainsError } = await supabase
    .from('assessment_template_domains')
    .select('domain_id, sort_order, security_domains(name)')
    .eq('template_id', templateId)
    .order('sort_order', { ascending: true });

  const { data: templateQuestions, error: templateQuestionsError } = await supabase
    .from('assessment_questions')
    .select(
      '*, options:assessment_question_options(id, label, value, sort_order, created_at, question_id)'
    )
    .eq('template_id', templateId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (templateDomainsError || templateQuestionsError) {
    return { success: false, error: 'Failed to build the assessment snapshot for this session' };
  }

  const snapshot = {
    id: template.id,
    name: template.name,
    version: template.version,
    framework: template.framework,
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

  const validation = AssessmentSessionSchema.safeParse({
    template_id: template.id,
    template_name: template.name,
    template_version: template.version,
    template_framework: template.framework,
    status: 'In Progress',
    progress_percent: 0,
    started_by: user.id,
    metadata: {},
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' };
  }

  const { data: session, error } = await supabase
    .from('assessment_sessions')
    .insert({
      organization_id: organizationId,
      template_id: template.id,
      template_name: template.name,
      template_version: template.version,
      template_framework: template.framework,
      template_snapshot: snapshot,
      status: 'In Progress',
      progress_percent: 0,
      started_by: user.id,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.session.create',
    details: {
      id: session.id,
      template_id: template.id,
      template_version: template.version,
    },
  });

  invalidate();
  return { success: true, id: session.id };
}

export async function assignUsersToSession(
  sessionId: string,
  profileIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  if (profileIds.length === 0) {
    return { success: false, error: 'At least one user must be assigned' };
  }

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const inserts = profileIds.map(profileId => ({
    organization_id: organizationId,
    session_id: sessionId,
    profile_id: profileId,
    assigned_by: user.id,
    status: 'Assigned',
  }));

  const { error } = await supabase.from('assessment_session_assignments').upsert(inserts, {
    onConflict: 'session_id,profile_id',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.session.assign',
    details: { id: sessionId, profile_ids: profileIds },
  });

  invalidate();
  return { success: true };
}

export async function updateAssessmentSession(
  id: string,
  input: Partial<AssessmentSessionInput>
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  const validation = AssessmentSessionSchema.partial().safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' };
  }

  const { error } = await supabase
    .from('assessment_sessions')
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.session.update',
    details: { id, updates: validation.data },
  });

  invalidate();
  return { success: true };
}

export async function cancelAssessmentSession(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  const { error } = await supabase
    .from('assessment_sessions')
    .update({
      status: 'Cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.session.cancel',
    details: { id },
  });

  invalidate();
  return { success: true };
}

export async function archiveAssessmentSession(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  const { error } = await supabase
    .from('assessment_sessions')
    .update({
      status: 'Archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'assessment.session.archive',
    details: { id },
  });

  invalidate();
  return { success: true };
}

export async function listAssignedAssessments(): Promise<AssessmentSession[]> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return [];

  const { data, error } = await supabase
    .from('assessment_session_assignments')
    .select('session_id')
    .eq('profile_id', user.id)
    .eq('organization_id', organizationId)
    .order('assigned_at', { ascending: false });

  if (error || !data) return [];

  const sessionIds = [...new Set(data.map(item => item.session_id))];
  if (sessionIds.length === 0) return [];

  const { data: sessions, error: sessionsError } = await supabase
    .from('assessment_sessions')
    .select('*')
    .in('id', sessionIds)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (sessionsError) {
    console.error('Failed to list assigned assessments:', sessionsError);
    return [];
  }

  return (sessions ?? []) as AssessmentSession[];
}
