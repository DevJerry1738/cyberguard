import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ClipboardList } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Assessments',
  description: 'Run and manage compliance assessments.',
};

export default async function AssessmentsPage() {
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

  // Fetch user role to determine template blueprint tab visibility
  const { data: membership } = await supabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', user.id)
    .eq('organization_id', profile.organization_id)
    .single();

  const userRole = (membership?.roles as any)?.name || 'Employee';
  const showTemplatesTab = userRole !== 'Employee';

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader
        title="Assessments"
        description="Run compliance and security assessments across your organization."
      />

      {/* Tabs Menu */}
      <div className="border-b border-surface-850 flex gap-6 text-sm font-medium pb-px">
        <Link
          href="/assessments"
          className="text-brand-400 border-b-2 border-brand-500 pb-3 transition-all font-semibold"
        >
          Active Assessments
        </Link>
        {showTemplatesTab && (
          <Link
            href="/assessments/templates"
            className="text-slate-400 hover:text-white pb-3 transition-colors"
          >
            Templates Blueprints
          </Link>
        )}
      </div>

      <EmptyState
        icon={ClipboardList}
        title="Assessments coming soon"
        description="In the next sprint, you'll be able to run GDPR, ISO 27001, and custom compliance assessments across your departments using your published templates."
      />
    </div>
  );
}
