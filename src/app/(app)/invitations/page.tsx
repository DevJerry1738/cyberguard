import type { Metadata } from 'next';
import { getInvitations } from '@/features/invitations/actions/invitations';
import { getDepartments } from '@/features/departments/actions/departments';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { UserPlus } from 'lucide-react';
import { InvitationTable } from '@/features/invitations/components/InvitationTable';
import InvitationPageClient from './InvitationPageClient';
import { hasPermission } from '@/features/authorization/guards';
import { PERMISSIONS } from '@/features/authorization/permissions';

export const metadata: Metadata = {
  title: 'Invitations',
  description: "Manage organization invitations.",
};

export const dynamic = 'force-dynamic';

export default async function InvitationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Retrieve user organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  const organizationId = profile?.organization_id ?? null;

  let userRole = 'Member';
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

  // Get active roles in organization
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name')
    .order('name');

  const invitations = await getInvitations();
  const departments = await getDepartments();

  const isAuthorized = organizationId
    ? await hasPermission(supabase, user.id, organizationId, PERMISSIONS.MEMBERS_INVITE)
    : false;

  if (!isAuthorized) {
    return (
      <div className="flex-grow flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-white">Unauthorized Access</h2>
          <p className="text-zinc-400">
            Only Organization Owners and Admins have permission to manage team invitations. Please contact your organization administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full">
      <InvitationPageClient
        invitations={invitations}
        departments={departments}
        roles={roles ?? []}
        userRole={userRole}
      />
    </div>
  );
}
