import type { Metadata } from 'next';
import { getSecurityDomains, reorderSecurityDomainsAction } from '@/features/security-domains/actions/security-domains';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Shield } from 'lucide-react';
import CreateDomainModal from '@/features/security-domains/components/CreateDomainModal';
import { SecurityDomainsList } from '@/features/security-domains/components/SecurityDomainsList';
import { PERMISSIONS } from '@/features/authorization/permissions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Security Domains',
  description: 'Manage security domains for assessments.',
};

export const dynamic = 'force-dynamic';

export default async function SecurityDomainsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Retrieve user organization membership and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  const organizationId = profile?.organization_id;
  let userRole = 'Employee';

  if (organizationId) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('roles(name)')
      .eq('profile_id', user.id)
      .eq('organization_id', organizationId)
      .single();
    if (membership?.roles && typeof membership.roles === 'object' && 'name' in membership.roles) {
      userRole = membership.roles.name as string;
    }
  }

  // Permission check
  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select('permission')
    .eq('role', userRole);

  const hasAccess = !rolePerms || rolePerms.some(p => p.permission === PERMISSIONS.SECURITY_DOMAINS_VIEW);
  if (!hasAccess) {
    redirect('/403');
  }

  // Fetch all non-deleted domains
  const domains = await getSecurityDomains(true);

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Security Domains"
        description="Organize assessment questions into reusable cybersecurity domains shared across assessment templates."
      >
        <CreateDomainModal />
      </PageHeader>

      {domains.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No security domains yet"
          description="Create your first security domain to start organizing assessment questions."
        >
          <CreateDomainModal variant="cta" />
        </EmptyState>
      ) : (
        <div className="mt-8">
          <SecurityDomainsList domains={domains} userRole={userRole} />
        </div>
      )}
    </div>
  );
}
