'use client';

import React from 'react';
import { UserPlus, Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { InvitationTable } from '@/features/invitations/components/InvitationTable';
import { InviteMemberDialog } from '@/features/invitations/components/InviteMemberDialog';
import type { InvitationWithMeta } from '@/types/invitations';
import { useRouter } from 'next/navigation';

interface InvitationPageClientProps {
  invitations: InvitationWithMeta[];
  departments: any[];
  roles: any[];
  userRole: string;
}

export default function InvitationPageClient({ invitations, departments, roles, userRole }: InvitationPageClientProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Invitations"
        description="Invite and onboard new members to your organization."
      >
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm"
        >
          <Plus className="h-4 w-4" />
          Invite Member
        </button>
      </PageHeader>

      {invitations.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No pending invitations"
          description="Send an invitation link to new team members so they can register and join your organization."
        >
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm hover:shadow-glow-md"
          >
            <Plus className="h-4 w-4" />
            Invite Member
          </button>
        </EmptyState>
      ) : (
        <InvitationTable invitations={invitations} userRole={userRole} />
      )}

      <InviteMemberDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        departments={departments}
        roles={roles}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
