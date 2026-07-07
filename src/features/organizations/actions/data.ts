'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type MemberProfile = {
  profile_id: string;
  organization_id: string;
  joined_at: string;
  role_id: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    job_title: string | null;
    phone: string | null;
  } | null;
  roles: {
    id: string;
    name: string;
  } | null;
};

export async function getMembers(): Promise<MemberProfile[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return [];

  const { data } = await supabase
    .from('organization_members')
    .select(`
      profile_id,
      organization_id,
      joined_at,
      role_id,
      profiles!organization_members_profile_id_fkey(first_name, last_name, email, job_title, phone),
      roles!organization_members_role_id_fkey(id, name)
    `)
    .eq('organization_id', profile.organization_id)
    .order('joined_at');

  return (data ?? []) as unknown as MemberProfile[];
}

export type OrgProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  job_title: string | null;
  phone: string | null;
  organization_id: string | null;
  onboarding_complete: boolean;
};

export async function getCurrentProfile(): Promise<OrgProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, job_title, phone, organization_id, onboarding_complete')
    .eq('id', user.id)
    .single();

  return data as OrgProfile | null;
}

export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  settings?: {
    industry: string | null;
    company_size: string | null;
    country: string | null;
    timezone: string | null;
  } | null;
};

export async function getOrganization(): Promise<Organization | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return null;

  const { data } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      slug,
      created_at,
      settings:organization_settings(industry, company_size, country, timezone)
    `)
    .eq('id', profile.organization_id)
    .single();

  return data as unknown as Organization | null;
}

export type AuditLog = {
  id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  profile_id: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

export async function getRecentAuditLogs(limit = 10): Promise<AuditLog[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return [];

  const { data } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      details,
      created_at,
      profile_id,
      profiles!audit_logs_profile_id_fkey(first_name, last_name, email)
    `)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as AuditLog[];
}
