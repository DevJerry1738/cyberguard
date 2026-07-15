import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { getAssessmentTemplate } from '@/features/assessments/actions/templates';
import { getSecurityDomains } from '@/features/security-domains/actions/security-domains';
import { getTemplateQuestions } from '@/features/assessments/actions/questions';
import { TemplateDetailView } from '@/features/assessments/components/TemplateDetailView';

export const metadata: Metadata = {
  title: 'Template Details',
  description: 'View compliance template details and lineage.',
};

interface TemplateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
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

  // Employees are denied view access to template details
  if (userRole === 'Employee') {
    redirect('/403');
  }

  // Next.js 15: Await page params before usage
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Retrieve template and version family history
  const data = await getAssessmentTemplate(id);
  if (!data) {
    notFound();
  }

  // Fetch all active domains so that draft templates can select them
  const allAvailableDomains = await getSecurityDomains(false);

  // Fetch template questions
  const questions = await getTemplateQuestions(id);

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader
        title="Template Blueprint Details"
        description="Review version lineage, assign security domains, and control publication lifecycle."
      />
      <TemplateDetailView
        template={data.template}
        domains={data.domains}
        allAvailableDomains={allAvailableDomains}
        history={data.history}
        userRole={userRole}
        questions={questions}
      />
    </div>
  );
}
