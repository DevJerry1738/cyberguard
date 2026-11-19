'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const ImportAssessmentPackSchema = z.object({
  packVersionId: z.string().uuid(),
  name: z.string().trim().min(3).max(255),
  description: z.string().trim().max(1000).optional().nullable(),
  templateVersion: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/),
  idempotencyKey: z.string().uuid(),
  domainMappings: z.array(z.object({
    packDomainId: z.string().uuid(),
    securityDomainId: z.string().uuid().nullable(),
    createDomain: z.boolean(),
  })).min(1),
});

export interface ApprovedAssessmentPack {
  id: string;
  packId: string;
  packKey: string;
  name: string;
  description: string | null;
  versionLabel: string;
  sourceName: string;
  sourceReference: string | null;
  usageTerms: string;
  attribution: string | null;
  domains: Array<{
    id: string;
    domainKey: string;
    name: string;
    description: string | null;
    sortOrder: number;
    questionCount: number;
  }>;
}

async function getOrgContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  const organizationId = profile?.organization_id ?? null;
  const { data: membership } = organizationId
    ? await supabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', user.id)
    .eq('organization_id', organizationId)
    .maybeSingle()
    : { data: null };

  const role = membership?.roles && typeof membership.roles === 'object' && 'name' in membership.roles
    ? String(membership.roles.name)
    : 'Employee';

  return { supabase, user, organizationId, role };
}

export async function listApprovedAssessmentPacks(): Promise<ApprovedAssessmentPack[]> {
  const { supabase, organizationId } = await getOrgContext();
  if (!organizationId) return [];

  const { data, error } = await supabase
    .from('assessment_pack_versions')
    .select(`
      id, pack_id, version_label, source_name, source_reference, usage_terms, attribution,
      pack:assessment_packs!inner(id, pack_key, display_name, description),
      domains:assessment_pack_domains(
        id, domain_key, name, description, sort_order,
        questions:assessment_pack_questions(id)
      )
    `)
    .eq('status', 'approved')
    .eq('review_status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list approved assessment packs:', error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    packId: row.pack_id,
    packKey: row.pack?.pack_key ?? '',
    name: row.pack?.display_name ?? 'Assessment pack',
    description: row.pack?.description ?? null,
    versionLabel: row.version_label,
    sourceName: row.source_name,
    sourceReference: row.source_reference,
    usageTerms: row.usage_terms,
    attribution: row.attribution,
    domains: (row.domains ?? []).map((domain: any) => ({
      id: domain.id,
      domainKey: domain.domain_key,
      name: domain.name,
      description: domain.description,
      sortOrder: domain.sort_order,
      questionCount: domain.questions?.length ?? 0,
    })).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
  }));
}

export async function importAssessmentPack(input: unknown): Promise<{
  success: boolean;
  templateId?: string;
  importId?: string;
  replayed?: boolean;
  error?: string;
}> {
  const validation = ImportAssessmentPackSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? 'Invalid pack import request' };
  }

  const { supabase, organizationId, role } = await getOrgContext();
  if (!organizationId) return { success: false, error: 'No organization found' };
  if (!['Owner', 'Admin', 'Security Officer'].includes(role)) {
    return { success: false, error: 'Access denied: insufficient permissions' };
  }
  if (validation.data.domainMappings.some(mapping => mapping.createDomain) && !['Owner', 'Admin'].includes(role)) {
    return { success: false, error: 'Only Owners and Admins can create organization domains during import' };
  }

  const { data, error } = await supabase.rpc('import_assessment_pack', {
    p_pack_version_id: validation.data.packVersionId,
    p_template_name: validation.data.name,
    p_template_description: validation.data.description ?? null,
    p_template_version: validation.data.templateVersion,
    p_domain_mappings: validation.data.domainMappings.map(mapping => ({
      pack_domain_id: mapping.packDomainId,
      security_domain_id: mapping.securityDomainId,
      create_domain: mapping.createDomain,
    })),
    p_idempotency_key: validation.data.idempotencyKey,
  });

  if (error) {
    console.error('Assessment pack import failed:', error);
    return { success: false, error: error.message || 'Pack import failed' };
  }

  const result = data as { success?: boolean; template_id?: string; import_id?: string; replayed?: boolean };
  if (!result?.success || !result.template_id) {
    return { success: false, error: 'Pack import returned an unexpected response' };
  }

  revalidatePath('/assessments/templates');
  revalidatePath('/assessments');
  revalidatePath('/settings/security-domains');

  return {
    success: true,
    templateId: result.template_id,
    importId: result.import_id,
    replayed: result.replayed,
  };
}
