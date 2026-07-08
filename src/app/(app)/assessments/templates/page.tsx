import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { listAssessmentTemplates } from '@/features/assessments/actions/templates';
import { TemplatesDashboard } from '@/features/assessments/components/TemplatesDashboard';

export const metadata: Metadata = {
  title: 'Assessment Templates',
  description: 'Manage and version organization compliance blueprint templates.',
};

interface TemplatesPageProps {
  searchParams: Promise<{
    search?: string;
    framework?: string;
    status?: string;
  }>;
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) {
    redirect('/onboarding');
  }

  // Get user role
  const { data: membership } = await supabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', user.id)
    .eq('organization_id', profile.organization_id)
    .single();

  const userRole = (membership?.roles as any)?.name || 'Employee';

  // RBAC verification: Employees cannot access templates dashboard
  if (userRole === 'Employee') {
    redirect('/403');
  }

  // Next.js 15: Await searchParams before reading
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const framework = resolvedParams.framework || '';
  const status = resolvedParams.status || '';

  // Fetch templates using server action
  const templates = await listAssessmentTemplates({
    search,
    framework,
    status,
  });

  // Query domain counts for each template to display on cards/tables
  const templatesWithCount = await Promise.all(
    templates.map(async (tmpl) => {
      const { count } = await supabase
        .from('assessment_template_domains')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', tmpl.id);
      return {
        ...tmpl,
        domain_count: count ?? 0,
      };
    })
  );

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Assessment Templates"
          description="Build, maintain, duplicate, version, and activate compliance blueprints for security audits."
        />
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-surface-850 flex gap-6 text-sm font-medium pb-px">
        <Link
          href="/assessments"
          className="text-slate-400 hover:text-white pb-3 transition-colors"
        >
          Active Assessments
        </Link>
        <Link
          href="/assessments/templates"
          className="text-brand-400 border-b-2 border-brand-500 pb-3 transition-all font-semibold"
        >
          Templates Blueprints
        </Link>
      </div>

      <TemplatesDashboard initialTemplates={templatesWithCount} userRole={userRole} />
    </div>
  );
}

import Link from 'next/link';
