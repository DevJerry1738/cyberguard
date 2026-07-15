'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  CreateQuestionSchema,
  CHOICE_BASED_TYPES,
  type AssessmentQuestion,
  type QuestionOption,
  type QuestionsByDomain,
  type CreateQuestionInput,
  type QuestionOptionInput,
} from '../schemas/question';

// ── Helpers ───────────────────────────────────────────────

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

async function assertTemplateDraft(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  templateId: string,
  orgId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data } = await supabase
    .from('assessment_templates')
    .select('status')
    .eq('id', templateId)
    .eq('organization_id', orgId)
    .single();

  if (!data) return { ok: false, error: 'Template not found' };
  if (data.status !== 'Draft') {
    return { ok: false, error: 'Questions can only be edited on Draft templates' };
  }
  return { ok: true };
}

function invalidate(templateId: string) {
  revalidatePath(`/assessments/templates/${templateId}`);
  revalidatePath('/assessments/templates');
}

// ── Queries ───────────────────────────────────────────────

export async function getTemplateQuestions(
  templateId: string
): Promise<QuestionsByDomain[]> {
  const { supabase, organizationId } = await getOrgContext();
  if (!organizationId) return [];

  // Fetch all non-deleted questions for this template
  const { data: questions } = await supabase
    .from('assessment_questions')
    .select('*, options:assessment_question_options(id, label, value, sort_order, created_at, question_id)')
    .eq('template_id', templateId)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  const questionsList = questions ?? [];

  // Fetch the domains assigned to this template (in order)
  const { data: templateDomains } = await supabase
    .from('assessment_template_domains')
    .select('domain_id, sort_order, security_domains(id, name)')
    .eq('template_id', templateId)
    .order('sort_order', { ascending: true });

  const domainMeta = (templateDomains ?? []).map((td: any) => ({
    domain_id: td.domain_id,
    domain_name: td.security_domains?.name ?? 'Unknown Domain',
  }));

  // Group questions by domain, preserving domain order
  const grouped: QuestionsByDomain[] = domainMeta.map(dm => ({
    domain_id: dm.domain_id,
    domain_name: dm.domain_name,
    questions: (questionsList as AssessmentQuestion[])
      .filter(q => q.domain_id === dm.domain_id)
      .map(q => ({
        ...q,
        options: (q.options ?? []).sort((a: QuestionOption, b: QuestionOption) => a.sort_order - b.sort_order),
      })),
  }));

  return grouped;
}

// ── Create ────────────────────────────────────────────────

export async function createAssessmentQuestion(
  templateId: string,
  input: CreateQuestionInput,
  options?: QuestionOptionInput[]
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  const draftCheck = await assertTemplateDraft(supabase, templateId, organizationId);
  if (!draftCheck.ok) return { success: false, error: draftCheck.error };

  const validation = CreateQuestionSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' };
  }

  // Choice-based questions must have at least 2 options
  if (CHOICE_BASED_TYPES.includes(validation.data.question_type)) {
    if (!options || options.length < 2) {
      return { success: false, error: 'Multiple choice and checkbox questions require at least 2 options' };
    }
  }

  // Get highest sort_order in domain
  const { data: maxSortData } = await supabase
    .from('assessment_questions')
    .select('sort_order')
    .eq('template_id', templateId)
    .eq('domain_id', validation.data.domain_id)
    .is('deleted_at', null)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = ((maxSortData?.[0]?.sort_order) ?? -1) + 1;

  const { data: question, error } = await supabase
    .from('assessment_questions')
    .insert({
      organization_id: organizationId,
      template_id: templateId,
      domain_id: validation.data.domain_id,
      question_text: validation.data.question_text,
      help_text: validation.data.help_text,
      question_type: validation.data.question_type,
      is_required: validation.data.is_required,
      weight: validation.data.weight,
      sort_order: nextSortOrder,
      metadata: validation.data.metadata,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Insert options if any
  if (options && options.length > 0) {
    const optionInserts = options.map((opt, idx) => ({
      question_id: question.id,
      label: opt.label,
      value: opt.value,
      sort_order: idx,
    }));

    const { error: optErr } = await supabase
      .from('assessment_question_options')
      .insert(optionInserts);

    if (optErr) {
      // Clean up question on failure
      await supabase.from('assessment_questions').delete().eq('id', question.id);
      return { success: false, error: 'Failed to save options: ' + optErr.message };
    }
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'question.create',
    details: { id: question.id, template_id: templateId, type: validation.data.question_type },
  });

  invalidate(templateId);
  return { success: true, id: question.id };
}

// ── Update ────────────────────────────────────────────────

export async function updateAssessmentQuestion(
  id: string,
  templateId: string,
  input: Partial<CreateQuestionInput>,
  options?: QuestionOptionInput[]
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  const draftCheck = await assertTemplateDraft(supabase, templateId, organizationId);
  if (!draftCheck.ok) return { success: false, error: draftCheck.error };

  const validation = CreateQuestionSchema.partial().safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' };
  }

  // Re-validate options for choice-based types
  const targetType = input.question_type;
  if (targetType && CHOICE_BASED_TYPES.includes(targetType)) {
    if (!options || options.length < 2) {
      return { success: false, error: 'Multiple choice and checkbox questions require at least 2 options' };
    }
  }

  const { error } = await supabase
    .from('assessment_questions')
    .update({ ...validation.data, updated_by: user.id })
    .eq('id', id)
    .eq('template_id', templateId)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  // Replace options if provided
  if (options !== undefined) {
    await supabase.from('assessment_question_options').delete().eq('question_id', id);

    if (options.length > 0) {
      const optionInserts = options.map((opt, idx) => ({
        question_id: id,
        label: opt.label,
        value: opt.value,
        sort_order: idx,
      }));
      const { error: optErr } = await supabase
        .from('assessment_question_options')
        .insert(optionInserts);
      if (optErr) return { success: false, error: 'Failed to update options: ' + optErr.message };
    }
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'question.update',
    details: { id, template_id: templateId },
  });

  invalidate(templateId);
  return { success: true };
}

// ── Duplicate ─────────────────────────────────────────────

export async function duplicateAssessmentQuestion(
  id: string,
  templateId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  const draftCheck = await assertTemplateDraft(supabase, templateId, organizationId);
  if (!draftCheck.ok) return { success: false, error: draftCheck.error };

  // Fetch source question with options
  const { data: source } = await supabase
    .from('assessment_questions')
    .select('*, options:assessment_question_options(label, value, sort_order)')
    .eq('id', id)
    .single();

  if (!source) return { success: false, error: 'Question not found' };

  // Find next sort_order
  const { data: maxSortData } = await supabase
    .from('assessment_questions')
    .select('sort_order')
    .eq('template_id', templateId)
    .eq('domain_id', source.domain_id)
    .is('deleted_at', null)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = ((maxSortData?.[0]?.sort_order) ?? -1) + 1;

  const { data: copy, error } = await supabase
    .from('assessment_questions')
    .insert({
      organization_id: organizationId,
      template_id: templateId,
      domain_id: source.domain_id,
      question_text: source.question_text + ' (Copy)',
      help_text: source.help_text,
      question_type: source.question_type,
      is_required: source.is_required,
      weight: source.weight,
      sort_order: nextSortOrder,
      metadata: source.metadata,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Copy options
  if (source.options && source.options.length > 0) {
    const optionInserts = source.options.map((opt: any, idx: number) => ({
      question_id: copy.id,
      label: opt.label,
      value: opt.value,
      sort_order: idx,
    }));
    await supabase.from('assessment_question_options').insert(optionInserts);
  }

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'question.duplicate',
    details: { source_id: id, copy_id: copy.id, template_id: templateId },
  });

  invalidate(templateId);
  return { success: true, id: copy.id };
}

// ── Soft Delete ───────────────────────────────────────────

export async function deleteAssessmentQuestion(
  id: string,
  templateId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Access Denied: Only Owners and Admins can delete questions' };
  }

  const draftCheck = await assertTemplateDraft(supabase, templateId, organizationId);
  if (!draftCheck.ok) return { success: false, error: draftCheck.error };

  const { error } = await supabase
    .from('assessment_questions')
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
    action: 'question.delete',
    details: { id, template_id: templateId },
  });

  invalidate(templateId);
  return { success: true };
}

// ── Reorder ───────────────────────────────────────────────

export async function reorderAssessmentQuestions(
  templateId: string,
  items: Array<{ id: string; sort_order: number }>
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  const draftCheck = await assertTemplateDraft(supabase, templateId, organizationId);
  if (!draftCheck.ok) return { success: false, error: draftCheck.error };

  const updates = items.map(item =>
    supabase
      .from('assessment_questions')
      .update({ sort_order: item.sort_order, updated_by: user.id })
      .eq('id', item.id)
      .eq('template_id', templateId)
      .eq('organization_id', organizationId)
  );

  const results = await Promise.all(updates);
  const firstError = results.find(r => r.error)?.error;
  if (firstError) return { success: false, error: firstError.message };

  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'question.reorder',
    details: { template_id: templateId, count: items.length },
  });

  invalidate(templateId);
  return { success: true };
}
