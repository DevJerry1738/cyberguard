'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  AssessmentTemplateSchema,
  type AssessmentTemplate,
  type AssessmentTemplateInput,
} from '../schemas/template';

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
  revalidatePath('/assessments/templates');
  revalidatePath('/assessments');
  revalidatePath('/dashboard');
}

// ─── Actions ──────────────────────────────────────────────

export async function listAssessmentTemplates(filters?: {
  search?: string;
  framework?: string;
  status?: string;
}): Promise<AssessmentTemplate[]> {
  const { supabase, organizationId } = await getOrgContext();
  if (!organizationId) return [];

  let query = supabase
    .from('assessment_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters?.framework && filters.framework !== 'All') {
    query = query.eq('framework', filters.framework);
  }
  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Failed to list templates:', error);
    return [];
  }

  return (data ?? []) as AssessmentTemplate[];
}

export async function getAssessmentTemplate(
  id: string
): Promise<{ template: AssessmentTemplate; domains: any[]; history: AssessmentTemplate[] } | null> {
  const { supabase, organizationId } = await getOrgContext();
  if (!organizationId) return null;

  // 1. Get Template
  const { data: template, error } = await supabase
    .from('assessment_templates')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  if (error || !template) return null;

  // 2. Get Assigned Domains
  const { data: templateDomains } = await supabase
    .from('assessment_template_domains')
    .select('sort_order, security_domains(*)')
    .eq('template_id', id)
    .order('sort_order', { ascending: true });

  const domains = (templateDomains ?? [])
    .map((td: any) => ({
      ...td.security_domains,
      sort_order: td.sort_order,
    }))
    .filter(d => d.id && !d.deleted_at);

  // 3. Get Version Family History
  const familyId = template.root_template_id || template.id;
  const { data: history } = await supabase
    .from('assessment_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .or(`id.eq.${familyId},root_template_id.eq.${familyId}`)
    .order('created_at', { ascending: false });

  return {
    template: template as AssessmentTemplate,
    domains,
    history: (history ?? []) as AssessmentTemplate[],
  };
}

export async function createAssessmentTemplate(
  input: AssessmentTemplateInput,
  domainIds: string[]
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  // Validate input
  const validation = AssessmentTemplateSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' };
  }

  if (domainIds.length === 0) {
    return { success: false, error: 'At least one security domain is required' };
  }

  // Insert template
  const { data: template, error } = await supabase
    .from('assessment_templates')
    .insert({
      organization_id: organizationId,
      name: validation.data.name,
      description: validation.data.description,
      framework: validation.data.framework,
      version: validation.data.version,
      status: 'Draft',
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A template with this name and version already exists' };
    }
    return { success: false, error: error.message };
  }

  // Insert domains
  const domainInserts = domainIds.map((domainId, index) => ({
    template_id: template.id,
    domain_id: domainId,
    sort_order: index,
  }));

  const { error: domainError } = await supabase
    .from('assessment_template_domains')
    .insert(domainInserts);

  if (domainError) {
    // Clean up template to avoid partial records
    await supabase.from('assessment_templates').delete().eq('id', template.id);
    return { success: false, error: 'Failed to assign domains: ' + domainError.message };
  }

  // Audit logging
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'template.create',
    details: { id: template.id, name: template.name, version: template.version },
  });

  invalidate();
  return { success: true, id: template.id };
}

export async function updateDraftTemplate(
  id: string,
  input: Partial<AssessmentTemplateInput>
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  // Fetch current template status
  const { data: current } = await supabase
    .from('assessment_templates')
    .select('status')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();

  if (!current) return { success: false, error: 'Template not found' };
  if (current.status !== 'Draft') {
    return { success: false, error: 'Only Draft templates can be edited directly' };
  }

  // Validate changes
  const name = input.name;
  const description = input.description;
  const framework = input.framework;
  const version = input.version;

  const validation = AssessmentTemplateSchema.partial().safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' };
  }

  const { error } = await supabase
    .from('assessment_templates')
    .update({
      ...validation.data,
      updated_by: user.id,
    })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A template with this name and version already exists' };
    }
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'template.update',
    details: { id, updates: validation.data },
  });

  invalidate();
  revalidatePath(`/assessments/templates/${id}`);
  return { success: true };
}

export async function duplicateTemplate(
  id: string,
  newVersion: string,
  newName?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  // Retrieve source template
  const { data: source } = await supabase
    .from('assessment_templates')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();

  if (!source) return { success: false, error: 'Source template not found' };

  // Validate new version
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/.test(newVersion)) {
    return { success: false, error: 'Version must be a valid semantic version (e.g. 1.1.0)' };
  }

  // Insert duplicated template
  const parentId = source.id;
  const rootId = source.root_template_id || source.id;

  const { data: duplicate, error } = await supabase
    .from('assessment_templates')
    .insert({
      organization_id: organizationId,
      name: newName?.trim() || source.name,
      description: source.description,
      framework: source.framework,
      version: newVersion,
      status: 'Draft',
      parent_template_id: parentId,
      root_template_id: rootId,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A template with this name and version already exists' };
    }
    return { success: false, error: error.message };
  }

  // Copy domains
  const { data: sourceDomains } = await supabase
    .from('assessment_template_domains')
    .select('domain_id, sort_order')
    .eq('template_id', id);

  if (sourceDomains && sourceDomains.length > 0) {
    const domainInserts = sourceDomains.map(sd => ({
      template_id: duplicate.id,
      domain_id: sd.domain_id,
      sort_order: sd.sort_order,
    }));

    const { error: domainError } = await supabase
      .from('assessment_template_domains')
      .insert(domainInserts);

    if (domainError) {
      console.error('Failed to duplicate template domains:', domainError);
    }
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'template.duplicate',
    details: { source_id: id, duplicate_id: duplicate.id, version: newVersion },
  });

  invalidate();
  return { success: true, id: duplicate.id };
}

export async function activateTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Access Denied: Only Owners and Admins can activate templates' };
  }

  // Get template details
  const { data: template } = await supabase
    .from('assessment_templates')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();

  if (!template) return { success: false, error: 'Template not found' };
  if (template.status !== 'Draft') {
    return { success: false, error: 'Only Draft templates can be activated' };
  }

  // Verify it has at least one domain
  const { count } = await supabase
    .from('assessment_template_domains')
    .select('*', { count: 'exact', head: true })
    .eq('template_id', id);

  if (!count || count === 0) {
    return { success: false, error: 'Template must have at least one security domain before activation' };
  }

  const familyId = template.root_template_id || template.id;

  // Transaction-like flow:
  // 1. Archive the currently Active template in the same family
  const { error: deactivateError } = await supabase
    .from('assessment_templates')
    .update({
      status: 'Archived',
      archived_at: new Date().toISOString(),
      archived_by: user.id,
      updated_by: user.id,
    })
    .eq('organization_id', organizationId)
    .eq('status', 'Active')
    .or(`id.eq.${familyId},root_template_id.eq.${familyId}`);

  if (deactivateError) {
    return { success: false, error: 'Failed to deactivate previous active template: ' + deactivateError.message };
  }

  // 2. Activate the target template
  const { error: activateError } = await supabase
    .from('assessment_templates')
    .update({
      status: 'Active',
      updated_by: user.id,
    })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (activateError) {
    return { success: false, error: 'Failed to activate template: ' + activateError.message };
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'template.activate',
    details: { id },
  });

  invalidate();
  revalidatePath(`/assessments/templates/${id}`);
  return { success: true };
}

export async function archiveTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Access Denied: Only Owners and Admins can archive templates' };
  }

  // Get template details
  const { data: template } = await supabase
    .from('assessment_templates')
    .select('status')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();

  if (!template) return { success: false, error: 'Template not found' };
  if (template.status !== 'Active') {
    return { success: false, error: 'Only Active templates can be archived directly' };
  }

  const { error } = await supabase
    .from('assessment_templates')
    .update({
      status: 'Archived',
      archived_at: new Date().toISOString(),
      archived_by: user.id,
      updated_by: user.id,
    })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  // Audit log
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'template.archive',
    details: { id },
  });

  invalidate();
  revalidatePath(`/assessments/templates/${id}`);
  return { success: true };
}

export async function deleteTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (role !== 'Owner') {
    return { success: false, error: 'Access Denied: Only the Owner can delete templates' };
  }

  // Soft delete
  const { error } = await supabase
    .from('assessment_templates')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) return { success: false, error: error.message };

  // Audit log
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'template.delete',
    details: { id },
  });

  invalidate();
  return { success: true };
}

export async function assignDomainsToTemplate(
  templateId: string,
  domainIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  // Check template
  const { data: template } = await supabase
    .from('assessment_templates')
    .select('status')
    .eq('id', templateId)
    .eq('organization_id', organizationId)
    .single();

  if (!template) return { success: false, error: 'Template not found' };
  if (template.status !== 'Draft') {
    return { success: false, error: 'Only Draft templates can have domains assigned' };
  }

  // Remove current domains
  const { error: deleteError } = await supabase
    .from('assessment_template_domains')
    .delete()
    .eq('template_id', templateId);

  if (deleteError) return { success: false, error: deleteError.message };

  if (domainIds.length === 0) {
    invalidate();
    revalidatePath(`/assessments/templates/${templateId}`);
    return { success: true };
  }

  // Insert new domains
  const domainInserts = domainIds.map((domainId, index) => ({
    template_id: templateId,
    domain_id: domainId,
    sort_order: index,
  }));

  const { error: insertError } = await supabase
    .from('assessment_template_domains')
    .insert(domainInserts);

  if (insertError) return { success: false, error: insertError.message };

  // Audit log
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'template.domains_assigned',
    details: { templateId, count: domainIds.length },
  });

  invalidate();
  revalidatePath(`/assessments/templates/${templateId}`);
  return { success: true };
}

export async function reorderTemplateDomains(
  templateId: string,
  orderedDomainIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, organizationId } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };

  const role = await getUserRole(supabase, user.id, organizationId);
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access Denied: Insufficient permissions' };
  }

  // Check template
  const { data: template } = await supabase
    .from('assessment_templates')
    .select('status')
    .eq('id', templateId)
    .eq('organization_id', organizationId)
    .single();

  if (!template) return { success: false, error: 'Template not found' };
  if (template.status !== 'Draft') {
    return { success: false, error: 'Only Draft templates can be reordered' };
  }

  // Update sort order
  const updates = orderedDomainIds.map((domainId, index) =>
    supabase
      .from('assessment_template_domains')
      .update({ sort_order: index })
      .eq('template_id', templateId)
      .eq('domain_id', domainId)
  );

  const results = await Promise.all(updates);
  const hasError = results.some(r => r.error);

  if (hasError) {
    return { success: false, error: 'Failed to reorder one or more domains' };
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    profile_id: user.id,
    action: 'template.domains_reordered',
    details: { templateId, count: orderedDomainIds.length },
  });

  invalidate();
  revalidatePath(`/assessments/templates/${templateId}`);
  return { success: true };
}
