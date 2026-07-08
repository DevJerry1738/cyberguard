import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { getSecurityDomains } from '@/features/security-domains/actions/security-domains';
import { CreateTemplateWizard } from '@/features/assessments/components/CreateTemplateWizard';

export const metadata: Metadata = {
  title: 'Create Assessment Template',
  description: 'Design and configure a compliance blueprint.',
};

export default async function NewTemplatePage() {
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

  // Only Owners, Admins, and Security Officers can create templates
  if (!['Owner', 'Admin', 'Security Officer'].includes(userRole)) {
    redirect('/403');
  }

  // Fetch active domains to select from in the wizard
  const domains = await getSecurityDomains(false);

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader
        title="Create Assessment Blueprint"
        description="Build a reusable framework by selecting security domains and metadata."
      />
      <CreateTemplateWizard domains={domains} />
    </div>
  );
}
